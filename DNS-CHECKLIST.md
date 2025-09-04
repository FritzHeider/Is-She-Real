
# DNS Checklist for issHereal.com (Cloudflare Pages)

## If your DNS is on Cloudflare (recommended)
- No manual DNS changes required when you add a Custom Domain in Pages. Cloudflare creates CNAME(s) automatically.

## If your DNS is elsewhere (Namecheap, GoDaddy, etc.)
1. In Cloudflare Pages, after adding `isshereal.com`, note the target hostname (e.g., `your-project.pages.dev`).
2. In your registrar DNS panel, create **CNAME**:
   - Name: `@` (root) or `www` (preferred)
   - Value: `<your-project>.pages.dev`
   - TTL: Auto
3. If using `www` as canonical:
   - Set `isshereal.com` (root) → **ALIAS/ANAME** to `<your-project>.pages.dev` if supported,
   - or create a 301 redirect from root to `www.isshereal.com` using registrar forwarding.
4. Wait for DNS propagation; Pages will issue a certificate automatically.

## Recommended Project/Repo Names
- Cloudflare Pages project: `isshereal`
- GitLab repo: `isshereal`
