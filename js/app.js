
import { $, escapeHtml } from './utils.js';
import { ensureGeoShim, enableGeo, getViewerContext, updateViewerChips } from './geo.js';
import { classifyInput, fetchWebsiteReadable, fetchGitHubUser, fetchRedditUser } from './fetchers.js';
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
  document.getElementById('verdict').textContent = v.label;
  document.getElementById('verdictNote').textContent = v.hint;
  const pills = document.getElementById('verdictPills'); pills.innerHTML = '';
  const pill = document.createElement('span'); pill.className = `pill ${v.cls}`; pill.textContent = `Confidence: ${score}/100`; pills.appendChild(pill);
  document.getElementById('scoreHint').textContent = 'confidence';
}

export async function analyze(raw){
  const parsed = classifyInput(raw);
  const out = { target: raw, parsed };

  document.getElementById('signals').innerHTML='';
  document.getElementById('verdict').textContent='Working…';
  document.getElementById('verdictNote').textContent='Collecting public signals';
  document.getElementById('scoreText').textContent='…';
  document.getElementById('scoreHint').textContent='running';
  const meter=document.getElementById('meter'); meter.setAttribute('stroke','#64748b'); meter.setAttribute('stroke-dasharray','0 1');

  try{
    let res, score, signals;
    const viewer = await getViewerContext();

    if(parsed.kind === 'website'){
      const text = await fetchWebsiteReadable(parsed.url);
      const r = scoreWebsite(text, parsed.url, viewer);
      renderSignals(r.signals); setGauge(r.score); setVerdict(r.score);
      res = { type:'website', snapshotBytes: text.length };
      score = r.score; signals = r.signals;
    } else if(parsed.kind === 'github' || (parsed.kind==='guess' && /[a-z0-9-]{1,39}/i.test(parsed.handle||''))){
      const gh = await fetchGitHubUser(parsed.handle || raw.replace(/^@/,''));
      renderSignals([flag(true,10,'GitHub response','ok')]); setGauge(65); setVerdict(65);
      res = { type:'github', id: gh.id, login: gh.login }; score = 65;
    } else if(parsed.kind === 'reddit' || (parsed.kind==='guess' && /\w{2,}/.test(parsed.handle||''))){
      const rd = await fetchRedditUser(parsed.handle || raw.replace(/^@/,''));
      renderSignals([flag(true,8,'Reddit response','ok')]); setGauge(55); setVerdict(55);
      res = { type:'reddit', name: rd?.data?.name }; score = 55;
    } else if(parsed.kind==='empty'){
      throw new Error('Enter a URL or handle.');
    } else {
      throw new Error('Unsupported input. Try a full URL, a GitHub user (gh:NAME), or Reddit (reddit:@NAME).');
    }

    out.result = { score, signals, meta: res };
    localStorage.setItem('isshereal:last', JSON.stringify(out));
    return out;

  }catch(err){
    console.error(err);
    setGauge(0);
    document.getElementById('verdict').textContent='Inconclusive';
    document.getElementById('verdictNote').textContent=(err&&err.message?err.message:'Unknown error');
    document.getElementById('scoreHint').textContent='error';
    return out;
  }
}

export function wireUp(){
  document.getElementById('year').textContent = new Date().getFullYear();
  document.getElementById('analyzeBtn').addEventListener('click', async ()=>{
    const v = document.getElementById('input').value.trim();
    if(!v) return document.getElementById('input').focus();
    await analyze(v);
  });
  document.getElementById('demoBtn').addEventListener('click', ()=>{
    const demos=['https://github.com/torvalds','gh:octocat','reddit:@spez','https://example.com'];
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
  ensureGeoShim();
  getViewerContext();
}
