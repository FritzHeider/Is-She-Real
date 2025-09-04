import { $, escapeHtml, setText } from './utils.js';
import { ensureGeoShim, enableGeo, getViewerContext } from './geo.js';
import { CONFIG } from './config.js';
import { classifyInput, fetchWebsiteReadable, socialInstagram, socialFacebook, socialTikTok } from './fetchers.js';
import { flag, combine, verdictLabel, scoreWebsite } from './scoring.js';

function renderSignals(signals){
  const host = document.getElementById('signals'); host.innerHTML='';
  signals.forEach(s=>{
    const el = document.createElement('div'); el.className = 'sig';
    el.innerHTML = `<div style="width:10px;height:10px;margin-top:6px;border-radius:999px;background:${s.ok?'#16a34a':'#dc2626'}"></div>
                    <div style="flex:1"><b>${escapeHtml(s.label)}</b><div class='muted'>${escapeHtml(s.note||'')}</div></div>
                    <span class='badge'>w=${s.weight}</span>`;
    host.appendChild(el);
  });
}
function setGauge(score){
  const circumference = 2*Math.PI*52; const dash = circumference*(score/100);
  const meter = document.getElementById('meter');
  meter.setAttribute('stroke-dasharray',circumference.toFixed(2));
  meter.setAttribute('stroke-dashoffset',(circumference-dash).toFixed(2));
  const color = score>=75?'#16a34a':score>=45?'#b45309':'#dc2626';
  meter.setAttribute('stroke',color);
  document.getElementById('scoreText').textContent = String(score);
}
function setVerdict(score){
  const v = verdictLabel(score);
  setText('verdict', v.label);
  setText('verdictNote', v.hint);
  const pills = document.getElementById('verdictPills'); pills.innerHTML = '';
  const pill = document.createElement('span'); pill.className = `pill ${v.cls}`; pill.textContent = `Confidence: ${score}/100`; pills.appendChild(pill);
  setText('scoreHint', 'confidence');
}

export async function analyze(raw){
  const parsed = classifyInput(raw);
  const out = { target: raw, parsed };

  document.getElementById('signals').innerHTML='';
  setText('verdict','Working…'); setText('verdictNote','Collecting public signals');
  setText('scoreText','…'); setText('scoreHint','running');
  const meter=document.getElementById('meter'); meter.setAttribute('stroke','#64748b'); meter.setAttribute('stroke-dasharray','0 1');

  try{
    let score, signals=[];
    const viewer = await getViewerContext();

    if(parsed.kind === 'website'){
      const text = await fetchWebsiteReadable(parsed.url);
      const r = scoreWebsite(text, parsed.url, viewer);
      score = r.score; signals = r.signals;
    } else {
      // Non-website: leave core scoring minimal. Social-specific calls are manual via Social Enrichment section.
      score = 50; signals = [flag(true,5,'Parsed input', parsed.kind)];
    }

    renderSignals(signals); setGauge(score); setVerdict(score);
    out.result = { score, signals, meta: parsed };
    localStorage.setItem('isshereal:last', JSON.stringify(out));
    return out;
  }catch(err){
    console.error(err);
    setGauge(0); setText('verdict','Inconclusive'); setText('verdictNote', err?.message || 'Unknown error');
    setText('scoreHint', 'error');
    return out;
  }
}

function renderSocial(platform, data){
  const host = document.getElementById('socialOut');
  const card = document.createElement('div');
  card.className = 'card';
  const pretty = JSON.stringify(data, null, 2).slice(0, 4000);
  card.innerHTML = `<div class="section-title">${platform}</div><pre>${escapeHtml(pretty)}</pre>`;
  host.prepend(card);
}

export function wireUp(){
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('analyzeBtn').addEventListener('click', async ()=>{
    const v = document.getElementById('input').value.trim();
    if(!v) return document.getElementById('input').focus();
    await analyze(v);
  });
  document.getElementById('demoBtn').addEventListener('click', ()=>{
    const demos=['https://github.com/torvalds','gh:octocat','reddit:@spez','https://example.com','https://instagram.com/instagram','https://www.tiktok.com/@scout2015','https://facebook.com/natgeo'];
    document.getElementById('input').value = demos[Math.floor(Math.random()*demos.length)];
  });
  document.getElementById('exportBtn').addEventListener('click', ()=>{
    try{
      const last = JSON.parse(localStorage.getItem('isshereal:last')||'null');
      if(!last) return alert('Run a check first.');
      const blob = new Blob([JSON.stringify(last,null,2)], {type:'application/json'});
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'isshereal-report.json'; a.click(); URL.revokeObjectURL(a.href);
    }catch(e){ alert('Export failed: '+e.message) }
  });
  document.getElementById('geoBtn').addEventListener('click', enableGeo);

  // API toggle
  const apiUrl = document.getElementById('apiUrl');
  const apiStatus = document.getElementById('apiStatus');
  const saveApi = document.getElementById('saveApi');
  apiUrl.value = localStorage.getItem('isshereal:api') || '';
  apiStatus.textContent = apiUrl.value ? `API: on` : `API: off`;
  saveApi.addEventListener('click', ()=>{
    const v = apiUrl.value.trim();
    if(v){ localStorage.setItem('isshereal:api', v); apiStatus.textContent='API: on'; alert('API enabled'); }
    else { localStorage.removeItem('isshereal:api'); apiStatus.textContent='API: off'; alert('API disabled'); }
  });

  // Social buttons
  document.getElementById('igBtn').addEventListener('click', async ()=>{
    if(!localStorage.getItem('isshereal:api')) return alert('Enable API first');
    const raw = document.getElementById('igId').value.trim();
    const payload = /^\d+$/.test(raw) ? { user_id: raw } : { username: raw };
    const j = await socialInstagram(payload);
    renderSocial('Instagram', j);
  });
  document.getElementById('fbBtn').addEventListener('click', async ()=>{
    if(!localStorage.getItem('isshereal:api')) return alert('Enable API first');
    const raw = document.getElementById('fbId').value.trim();
    const payload = /^\d+$/.test(raw) ? { page_id: raw } : { username: raw };
    const j = await socialFacebook(payload);
    renderSocial('Facebook', j);
  });
  document.getElementById('ttBtn').addEventListener('click', async ()=>{
    if(!localStorage.getItem('isshereal:api')) return alert('Enable API first');
    const raw = document.getElementById('ttUser').value.trim();
    const j = await socialTikTok({ username: raw });
    renderSocial('TikTok', j);
  });

  ensureGeoShim();
  getViewerContext();
}
