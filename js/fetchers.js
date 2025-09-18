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
      // social URLs
      if(host.includes('instagram.com')){
        const parts = u.pathname.split('/').filter(Boolean);
        return { kind:'instagram', username: parts[0] || null, url: u.href };
      }
      if(host.includes('facebook.com')){
        const parts = u.pathname.split('/').filter(Boolean);
        return { kind:'facebook', username: parts[0] || null, url: u.href };
      }
      if(host.includes('tiktok.com')){
        const parts = u.pathname.split('/').filter(Boolean);
        const at = parts.find(p => p.startsWith('@'));
        return { kind:'tiktok', username: at ? at.slice(1) : parts[0] || null, url: u.href };
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

export async function socialInstagram({ user_id, username }){
  if(!CONFIG.API_BASE) throw new Error('API_BASE not set');
  const qs = user_id ? `user_id=${encodeURIComponent(user_id)}` : `username=${encodeURIComponent(username||'')}`;
  const r = await fetch(`${CONFIG.API_BASE}/social/instagram?${qs}`);
  return await r.json();
}
export async function socialFacebook({ page_id, username }){
  if(!CONFIG.API_BASE) throw new Error('API_BASE not set');
  const qs = page_id ? `page_id=${encodeURIComponent(page_id)}` : `username=${encodeURIComponent(username||'')}`;
  const r = await fetch(`${CONFIG.API_BASE}/social/facebook?${qs}`);
  return await r.json();
}
export async function socialTikTok({ username }){
  if(!CONFIG.API_BASE) throw new Error('API_BASE not set');
  const r = await fetch(`${CONFIG.API_BASE}/social/tiktok?username=${encodeURIComponent(username||'')}`);
  return await r.json();
}

export async function detectImage({ file, url }){
  if(!CONFIG.API_BASE) throw new Error('API_BASE not set');
  const form = new FormData();
  const trimmedUrl = typeof url === 'string' ? url.trim() : '';
  if(file) form.append('file', file);
  if(trimmedUrl) form.append('url', trimmedUrl);
  const res = await fetch(`${CONFIG.API_BASE}/detect/image`, { method:'POST', body: form });
  let data;
  try{ data = await res.json(); }catch{ data = null; }
  if(!res.ok){
    const detail = data?.detail || data?.error || 'Image analysis failed';
    throw new Error(detail);
  }
  return data;
}
