
import { $, escapeHtml } from './utils.js';
import { ensureGeoShim, enableGeo, getViewerContext } from './geo.js';
import { CONFIG } from './config.js';
import { classifyInput, fetchWebsiteReadable, fetchGitHubUser, fetchGitHubEvents, fetchRedditUser } from './fetchers.js';
import { flag, combine, verdictLabel, scoreWebsite, cadenceHeuristic } from './scoring.js';

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
    let res, score, signals=[];
    const viewer = await getViewerContext();

    if(parsed.kind === 'website'){
      const text = await fetchWebsiteReadable(parsed.url);
      const r = scoreWebsite(text, parsed.url, viewer);
      score = r.score; signals = r.signals;
      res = { type:'website', snapshotBytes: text.length };
    } else if(parsed.kind === 'github' || (parsed.kind==='guess' && /[a-z0-9-]{1,39}/i.test(parsed.handle||''))){
      const handle = parsed.handle || raw.replace(/^@/,'');
      const gh = await fetchGitHubUser(handle);
      signals.push(flag(true,8,'GitHub profile','ok'));
      // Cadence heuristic using public events
      try{
        const events = await fetchGitHubEvents(handle);
        const cad = cadenceHeuristic(events, viewer.tz);
        signals.push(flag(cad.ok, 6, 'Posting cadence (local day)', cad.note));
      }catch(e){
        signals.push(flag(false,2,'Posting cadence','events fetch failed'));
      }
      score = combine(signals);
      res = { type:'github', id: gh.id, login: gh.login };
    } else if(parsed.kind === 'reddit' || (parsed.kind==='guess' && /\w{2,}/.test(parsed.handle||''))){
      const rd = await fetchRedditUser(parsed.handle || raw.replace(/^@/,''));
      signals.push(flag(true,6,'Reddit profile','ok'));
      score = combine(signals);
      res = { type:'reddit', name: rd?.data?.name };
    } else if(parsed.kind==='empty'){
      throw new Error('Enter a URL or handle.');
    } else {
      throw new Error('Unsupported input. Try a full URL, a GitHub user (gh:NAME), or Reddit (reddit:@NAME).');
    }

    renderSignals(signals); setGauge(score); setVerdict(score);
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

  ensureGeoShim();
}
