export const $ = (sel) => document.querySelector(sel);
export const escapeHtml = (s) => String(s).replace(/[&<>\"']/g, m => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\\\"":"&quot;","'":"&#39;" }[m]));
export const sleep = (ms) => new Promise(r => setTimeout(r, ms));
export const setText = (id, txt) => { const el=document.getElementById(id); if(el) el.textContent = txt; };
