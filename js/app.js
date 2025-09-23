import { escapeHtml, setText } from './utils.js';
import { ensureGeoShim, enableGeo, getViewerContext } from './geo.js';
import { CONFIG } from './config.js';
import { classifyInput, fetchWebsiteReadable, socialInstagram, socialFacebook, socialTikTok, detectImage } from './fetchers.js';
import { flag, verdictLabel, scoreWebsite } from './scoring.js';

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
  const pill = document.createElement('span'); pill.className = `pill ${v.cls}`; pill.textContent = `Confidence: ${score}/100`;
  pills.appendChild(pill);
  setText('scoreHint', 'confidence');
}

function imageVerdict(score){
  if(score >= 70) return { label:'Likely Synthetic', note:'High reconstruction differences or generator metadata detected.', cls:'bad' };
  if(score >= 40) return { label:'Needs Review', note:'Mixed indicators; inspect manually before trusting the image.', cls:'warn' };
  return { label:'Likely Authentic', note:'Low compression differences and no suspicious metadata found.', cls:'ok' };
}

function renderImageResult(data){
  const container = document.getElementById('imageResult');
  if(!container) return;
  if(!data){ container.textContent='No analysis yet.'; return; }
  const percent = Math.round((data.fake_score||0)*100);
  const elaPercent = ((data.mean_ela||0)*100).toFixed(1);
  const verdict = imageVerdict(percent);
  const meta = data.metadata_info||{};
  const suspicious = Array.isArray(meta.suspicious_tags) ? meta.suspicious_tags : [];
  const suspiciousHtml = suspicious.length
    ? `<ul class="meta-list">${suspicious.map(tag=>`<li><strong>${escapeHtml(tag.tag||String(tag.tag_id||'tag'))}</strong>: ${escapeHtml(tag.value||'')}</li>`).join('')}</ul>`
    : `<div class="muted">No generator-related metadata tags detected.</div>`;
  const barCls = percent >= 70 ? 'bad' : percent >= 40 ? 'warn' : 'ok';
  container.innerHTML = `
    <div class="image-score-head">
      <div>
        <div class="image-score-value">${percent}/100 fake likelihood</div>
        <div class="muted">${escapeHtml(verdict.note)}</div>
      </div>
      <span class="pill ${barCls}">${escapeHtml(verdict.label)}</span>
    </div>
    <div class="image-score-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent}">
      <span class="${barCls}" style="width:${percent}%"></span>
    </div>
    <div class="image-meta-row">
      <span class="badge">${meta.has_exif ? 'EXIF metadata present' : 'No EXIF metadata'}</span>
      <span class="badge">Suspicious tags: ${suspicious.length}</span>
      <span class="badge">Mean ELA: ${elaPercent}%</span>
    </div>
    <div>
      <strong>Metadata review</strong>
      ${suspiciousHtml}
    </div>
    ${data.ela_preview ? `<div class="ela-preview"><div class="muted">ELA heatmap (bright regions can indicate edits)</div><img src="${data.ela_preview}" alt="Error level analysis heatmap"/></div>` : ''}
  `;
}

function setupImageDetector(){
  const dropzone = document.getElementById('imageDropzone');
  const fileInput = document.getElementById('imageFile');
  const urlInput = document.getElementById('imageUrl');
  const analyzeBtn = document.getElementById('imageAnalyzeBtn');
  const clearBtn = document.getElementById('imageClearBtn');
  const preview = document.getElementById('imagePreview');
  const apiNote = document.getElementById('imageApiNote');
  const acceptedTypes = new Set(['image/jpeg','image/png','image/webp']);
  if(!dropzone || !fileInput || !urlInput || !analyzeBtn || !preview) return { setEnabled: ()=>{} };
  const resultDiv = document.getElementById('imageResult');

  function resetPreview(){
    preview.removeAttribute('src');
    preview.style.display='none';
    dropzone.classList.remove('has-image');
  }
  function showPreview(file){
    if(!file){ resetPreview(); return; }
    const typeOk = !file.type || acceptedTypes.has(file.type);
    if(!typeOk){ alert('Unsupported image type. Use JPG, PNG or WebP.'); fileInput.value=''; return; }
    if(file.size && file.size > 6*1024*1024){ alert('Image is larger than 6 MB. Choose a smaller file.'); return; }
    const reader = new FileReader();
    reader.onload = ()=>{ preview.src = reader.result; preview.style.display='block'; dropzone.classList.add('has-image'); };
    reader.readAsDataURL(file);
  }
  function preventDefaults(e){ e.preventDefault(); e.stopPropagation(); }

  ['dragenter','dragover'].forEach(evt=>{
    dropzone.addEventListener(evt, e=>{ preventDefaults(e); dropzone.classList.add('hover'); });
  });
  ['dragleave','drop'].forEach(evt=>{
    dropzone.addEventListener(evt, e=>{ preventDefaults(e); dropzone.classList.remove('hover'); });
  });
  dropzone.addEventListener('click', ()=> fileInput.click());
  dropzone.addEventListener('keydown', e=>{ if(e.key==='Enter'||e.key===' '){ e.preventDefault(); fileInput.click(); }});
  dropzone.addEventListener('drop', e=>{
    if(!e.dataTransfer?.files?.length) return;
    fileInput.files = e.dataTransfer.files;
    showPreview(fileInput.files[0]);
  });
  fileInput.addEventListener('change', ()=> showPreview(fileInput.files[0]));
  clearBtn?.addEventListener('click', ()=>{
    fileInput.value=''; urlInput.value=''; resetPreview();
    resultDiv.innerHTML='';
    localStorage.removeItem('isshereal:image:last');
  });

  analyzeBtn.addEventListener('click', async ()=>{
    if(analyzeBtn.disabled){ return; }
    if(!CONFIG.API_BASE){ resultDiv.textContent='Enable the API to analyze images.'; return; }
    const file = fileInput.files[0] || null;
    const url = urlInput.value.trim();
    if(!file && !url){ resultDiv.textContent='Add an image file or direct URL to analyze.'; return; }
    resultDiv.innerHTML = '<span class="muted">Analyzing image…</span>';
    try{
      const data = await detectImage({ file, url });
      renderImageResult(data);
      const stored = { data, preview: preview.src || null, url, ts: Date.now() };
      localStorage.setItem('isshereal:image:last', JSON.stringify(stored));
    }catch(err){
      console.error(err);
      resultDiv.textContent = `Error: ${err?.message || 'Image analysis failed'}`;
    }
  });

  try{
    const saved = JSON.parse(localStorage.getItem('isshereal:image:last')||'null');
    if(saved?.preview){ preview.src = saved.preview; preview.style.display='block'; dropzone.classList.add('has-image'); }
    if(saved?.url){ urlInput.value = saved.url; }
    if(saved?.data){ renderImageResult(saved.data); }
  }catch{}

  return {
    setEnabled(enabled, url){
      analyzeBtn.disabled = !enabled;
      analyzeBtn.setAttribute('aria-disabled', enabled ? 'false' : 'true');
      if(apiNote){
        apiNote.textContent = enabled
          ? `Images will be sent to ${url || 'the configured API'} for analysis.`
          : 'Enter the detector API URL above to enable image analysis.';
      }
    }
  };
}

export async function analyze(raw){
  const parsed = classifyInput(raw);
  const out = { target: raw, parsed };
  const trace = document.getElementById('trace');
  if(trace) trace.textContent = JSON.stringify({ target: raw, status: 'running' }, null, 2);

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
      score = 50; signals = [flag(true,5,'Parsed input', parsed.kind)];
    }

    renderSignals(signals); setGauge(score); setVerdict(score);
    out.result = { score, signals, meta: parsed };
    localStorage.setItem('isshereal:last', JSON.stringify(out));
    if(trace) trace.textContent = JSON.stringify(out, null, 2);
    return out;
  }catch(err){
    console.error(err);
    setGauge(0); setText('verdict','Inconclusive'); setText('verdictNote', err?.message || 'Unknown error');
    setText('scoreHint', 'error');
    if(trace) trace.textContent = JSON.stringify({ target: raw, error: err?.message || 'unknown' }, null, 2);
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
  const detectorUi = setupImageDetector();

  const navToggle = document.getElementById('navToggle');
  const siteNav = document.getElementById('siteNav');
  if(navToggle && siteNav){
    navToggle.addEventListener('click', ()=>{
      const expanded = navToggle.getAttribute('aria-expanded') === 'true';
      const next = !expanded;
      navToggle.setAttribute('aria-expanded', String(next));
      siteNav.classList.toggle('open', next);
    });
    siteNav.querySelectorAll('a').forEach(link=>{
      link.addEventListener('click', ()=>{
        siteNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded','false');
      });
    });
  }

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
  const apiStatusDetail = document.getElementById('apiStatusDetail');
  const saveApi = document.getElementById('saveApi');
  const storedApi = localStorage.getItem('isshereal:api') || '';
  apiUrl.value = storedApi;

  const applyApi = (url)=>{
    CONFIG.API_BASE = url;
    const statusText = url ? 'API online' : 'API offline';
    if(apiStatus){
      apiStatus.textContent = statusText;
      apiStatus.classList.toggle('online', Boolean(url));
      apiStatus.classList.toggle('offline', !url);
    }
    if(apiStatusDetail){
      apiStatusDetail.textContent = statusText;
    }
    detectorUi.setEnabled(Boolean(url), url);
  };
  applyApi(storedApi);

  saveApi.addEventListener('click', ()=>{
    const v = apiUrl.value.trim();
    if(v){
      localStorage.setItem('isshereal:api', v);
      applyApi(v);
      alert('API enabled');
    } else {
      localStorage.removeItem('isshereal:api');
      applyApi('');
      alert('API disabled');
    }
  });

  // Social buttons
  document.getElementById('igBtn').addEventListener('click', async ()=>{
    if(!CONFIG.API_BASE) return alert('Enable API first');
    const raw = document.getElementById('igId').value.trim();
    const payload = /^\d+$/.test(raw) ? { user_id: raw } : { username: raw };
    const j = await socialInstagram(payload);
    renderSocial('Instagram', j);
  });
  document.getElementById('fbBtn').addEventListener('click', async ()=>{
    if(!CONFIG.API_BASE) return alert('Enable API first');
    const raw = document.getElementById('fbId').value.trim();
    const payload = /^\d+$/.test(raw) ? { page_id: raw } : { username: raw };
    const j = await socialFacebook(payload);
    renderSocial('Facebook', j);
  });
  document.getElementById('ttBtn').addEventListener('click', async ()=>{
    if(!CONFIG.API_BASE) return alert('Enable API first');
    const raw = document.getElementById('ttUser').value.trim();
    const j = await socialTikTok({ username: raw });
    renderSocial('TikTok', j);
  });

  ensureGeoShim();
  getViewerContext();

  const revealEls = document.querySelectorAll('.reveal');
  if(revealEls.length){
    if('IntersectionObserver' in window){
      const observer = new IntersectionObserver((entries)=>{
        entries.forEach(entry=>{
          if(entry.isIntersecting){
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.2 });
      revealEls.forEach(el=>observer.observe(el));
    } else {
      revealEls.forEach(el=>el.classList.add('visible'));
    }
  }
}
