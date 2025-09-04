
import { CONFIG } from './config.js';

export function classifyInput(raw){
  const s = raw.trim();
  if(!s) return { kind:'empty' };
  const isUrl = /^(https?:\/\/)/i.test(s) || /\.[a-z]{2,}$/i.test(s);
  if(isUrl){
    try{
      const u = new URL(s.startsWith('http')? s : 'https://'+s);
      const host = u.hostname.toLowerCase();
      if(host.includes('github.com')) return { kind:'github', url:u.href, handle:u.pathname.split('/').filter(Boolean)[0]||null };
      if(host.includes('reddit.com')){
        const parts = u.pathname.split('/').filter(Boolean);
        const idx = parts.findIndex(p => ['u','user'].includes(p));
        const handle = idx>=0 ? parts[idx+1] : null;
        return { kind:'reddit', url:u.href, handle };
      }
      return { kind:'website', url:u.href };
    }catch(e){ return { kind:'unknown', error:e.message } }
  }
  if(s.startsWith('@')) return { kind:'guess', handle:s.slice(1) };
  if(/^reddit:@/i.test(s)) return { kind:'reddit', handle:s.split('@')[1] };
  if(/^gh:/i.test(s)) return { kind:'github', handle:s.split(':')[1] };
  return { kind:'guess', handle:s };
}

export async function fetchWebsiteReadable(url){
  if(CONFIG.API_BASE){
    const r = await fetch(`${CONFIG.API_BASE}/fetch?url=${encodeURIComponent(url)}`);
    if(!r.ok) throw new Error('API fetch failed');
    const j = await r.json();
    return j.text || '';
  }
  const normalized = url.startsWith('http') ? url : 'https://' + url;
  const target = 'https://r.jina.ai/' + normalized;
  const res = await fetch(target, { headers:{ 'Accept':'text/html, text/plain;q=0.9' } });
  if(!res.ok) throw new Error('Snapshot fetch failed: '+res.status);
  return await res.text();
}

export async function fetchGitHubUser(handle){
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}`);
  if(!res.ok) throw new Error('GitHub user not found / API blocked');
  return await res.json();
}
export async function fetchGitHubEvents(handle){
  const res = await fetch(`https://api.github.com/users/${encodeURIComponent(handle)}/events/public`);
  if(!res.ok) throw new Error('GitHub events fetch failed');
  return await res.json();
}

export async function fetchRedditUser(handle){
  const res = await fetch(`https://www.reddit.com/user/${encodeURIComponent(handle)}/about.json`, { headers:{ 'Accept':'application/json' } });
  if(!res.ok) throw new Error('Reddit user not found / CORS blocked');
  return await res.json();
}
