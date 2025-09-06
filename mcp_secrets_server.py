#!/usr/bin/env python3
# mcp_secrets_server.py
# A lightweight MCP server (JSON-RPC over stdio) for managing API secrets and returning provider instructions.
# Safe-by-default: no network calls; writes .env atomically; returns hard-coded, vetted instruction text.

import os, sys, json, tempfile, shutil, time
from typing import Dict, Any, List

# ---- MCP plumbing (very small JSON-RPC loop over stdio) ---------------------
STDIN = sys.stdin
STDOUT = sys.stdout

def jwrite(obj: Dict[str, Any]):
    STDOUT.write(json.dumps(obj, separators=(",", ":")) + "\n")
    STDOUT.flush()

def jread() -> Dict[str, Any]:
    line = STDIN.readline()
    if not line:
        sys.exit(0)
    return json.loads(line)

# ---- Helpers ----------------------------------------------------------------
REQUIRED_MAP = {
    "instagram": ["IG_ACCESS_TOKEN"],
    "facebook":  ["FB_ACCESS_TOKEN"],
    "tiktok":    ["TT_ACCESS_TOKEN"],
    "whois":     ["WHOIS_API_KEY"],
    "abuseipdb": ["ABUSEIPDB_API_KEY"],
    "github":    ["GH_TOKEN"],
    "server":    ["API_KEY"],  # optional but enforced when you ask for it
}

INSTRUCTION_TEXT = {
    "instagram": """Instagram (IG_ACCESS_TOKEN)
1) Create a Meta Developer app and add the Instagram product.
2) Connect your IG Business/Creator account in the app.
3) Generate a short-lived token in the app’s Instagram section, then exchange it for a long-lived token (60 days).
   Keep the long-lived token server-side only.
""",
    "facebook": """Facebook (FB_ACCESS_TOKEN)
1) Create a Meta app.
2) Open Graph API Explorer, Generate Access Token, approve scopes.
3) For Page work, exchange User token for Page token. Keep tokens server-side and rotate periodically.
""",
    "tiktok": """TikTok (TT_ACCESS_TOKEN)
1) Create a TikTok developer account and app; get client_key/client_secret.
2) Run OAuth: send user to TikTok auth URL; receive ?code on your redirect.
3) Exchange code for access_token (24h) + refresh_token (365d) on your backend. Store securely and refresh automatically.
""",
    "whois": """WHOIS (WHOIS_API_KEY)
1) Sign up with a WHOIS API provider (e.g., WhoisXML API).
2) Get your API key from your dashboard/My Products. Store server-side only.
""",
    "abuseipdb": """AbuseIPDB (ABUSEIPDB_API_KEY)
1) Create an account at abuseipdb.com.
2) Copy the API key from Account → API Settings. Treat it like a password.
""",
    "github": """GitHub (GH_TOKEN)
1) GitHub → Settings → Developer settings → Personal access tokens.
2) Prefer fine-grained tokens; otherwise Tokens (classic). Scope minimally (e.g., repo).
3) Copy once, store in secrets manager; never commit.
""",
    "server": """Generic API_KEY (X-API-Key)
1) Generate a strong random: `openssl rand -hex 32`
2) Put it in your server env and require the `X-API-Key` header from clients.
""",
}

def _atomic_write(path: str, content: str):
    os.makedirs(os.path.dirname(path) or ".", exist_ok=True)
    fd, tmp = tempfile.mkstemp(prefix=".env.tmp.")
    with os.fdopen(fd, "w") as f:
        f.write(content)
        f.flush()
        os.fsync(f.fileno())
    shutil.move(tmp, path)

def _load_env(path: str) -> Dict[str, str]:
    data = {}
    if not os.path.exists(path):
        return data
    with open(path, "r", encoding="utf-8") as f:
        for line in f:
            s = line.strip()
            if not s or s.startswith("#") or "=" not in s:
                continue
            k, v = s.split("=", 1)
            data[k.strip()] = v.strip()
    return data

def _dump_env(env: Dict[str, str]) -> str:
    lines = ["# Managed by mcp-secrets-server", f"# Last-Updated={int(time.time())}"]
    for k in sorted(env.keys()):
        lines.append(f"{k}={env[k]}")
    return "\n".join(lines) + "\n"

def make_template_block(include_server_key: bool = True) -> str:
    rows = [
        "# Platform tokens (DO NOT commit real values)",
        "IG_ACCESS_TOKEN=",
        "FB_ACCESS_TOKEN=",
        "TT_ACCESS_TOKEN=",
        "",
        "# Optional extras",
        "WHOIS_API_KEY=",
        "ABUSEIPDB_API_KEY=",
        "GH_TOKEN=",
        "API_KEY=" if include_server_key else "# API_KEY=",
        "",
        "# Server behavior",
        "TIMEOUT_S=6.0",
        "CORS_ORIGINS=*",
        "",
    ]
    return "\n".join(rows)

# ---- MCP tool impls ---------------------------------------------------------
def list_tools() -> List[Dict[str, Any]]:
    return [
        {
            "name": "secrets.template",
            "description": "Return a .env template block for IG/FB/TT/WHOIS/AbuseIPDB/GitHub (+ optional API_KEY).",
            "input_schema": {"type": "object", "properties": {"include_server_key": {"type": "boolean"}}, "required": []},
        },
        {
            "name": "secrets.instructions",
            "description": "Get step-by-step instructions for obtaining tokens/keys for a provider.",
            "input_schema": {"type": "object", "properties": {"provider": {"type": "string"}}, "required": ["provider"]},
        },
        {
            "name": "secrets.write_env",
            "description": "Atomically write or update .env with provided entries (server-only).",
            "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "entries": {"type": "object"}}, "required": ["path", "entries"]},
        },
        {
            "name": "secrets.check_env",
            "description": "Check that required variables for a provider exist and are non-empty in the given .env.",
            "input_schema": {"type": "object", "properties": {"path": {"type": "string"}, "provider": {"type": "string"}}, "required": ["path", "provider"]},
        },
    ]

def call_tool(name: str, args: Dict[str, Any]) -> Dict[str, Any]:
    if name == "secrets.template":
        block = make_template_block(bool(args.get("include_server_key", True)))
        return {"ok": True, "template": block}

    if name == "secrets.instructions":
        provider = args["provider"].lower()
        if provider not in INSTRUCTION_TEXT:
            return {"ok": False, "error": f"Unknown provider '{provider}'. Valid: {list(INSTRUCTION_TEXT.keys())}"}
        return {"ok": True, "provider": provider, "instructions": INSTRUCTION_TEXT[provider]}

    if name == "secrets.write_env":
        path = args["path"]
        entries: Dict[str, str] = args["entries"] or {}
        current = _load_env(path)
        for k, v in entries.items():
            current[str(k)] = str(v)
        _atomic_write(path, _dump_env(current))
        return {"ok": True, "path": path, "written_keys": sorted(entries.keys())}

    if name == "secrets.check_env":
        path = args["path"]
        provider = args["provider"].lower()
        want = REQUIRED_MAP.get(provider)
        if not want:
            return {"ok": False, "error": f"Unknown provider '{provider}'."}
        envd = _load_env(path)
        missing = [k for k in want if not envd.get(k)]
        return {"ok": True, "provider": provider, "missing": missing, "present": [k for k in want if k in envd and envd[k]]}

    return {"ok": False, "error": f"Unknown tool '{name}'"}

# ---- JSON-RPC request loop --------------------------------------------------
def handle(req: Dict[str, Any]) -> Dict[str, Any]:
    rid = req.get("id")
    method = req.get("method")
    if method == "initialize":
        return {"jsonrpc": "2.0", "id": rid, "result": {"protocolVersion": "2024-11-05", "serverInfo": {"name": "mcp-secrets-server", "version": "0.1.0"}}}
    if method == "tools/list":
        return {"jsonrpc": "2.0", "id": rid, "result": {"tools": list_tools()}}
    if method == "tools/call":
        p = req.get("params", {})
        name = p.get("name")
        args = p.get("arguments", {}) or {}
        res = call_tool(name, args)
        return {"jsonrpc": "2.0", "id": rid, "result": {"content": [{"type": "text", "text": json.dumps(res)}]}}
    # graceful default
    return {"jsonrpc": "2.0", "id": rid, "error": {"code": -32601, "message": "Method not found"}}

def main():
    # Simple line-delimited JSON-RPC over stdio
    while True:
        req = jread()
        resp = handle(req)
        jwrite(resp)

if __name__ == "__main__":
    main()