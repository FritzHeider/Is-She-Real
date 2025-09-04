
export function ensureGeoShim(){
  if(typeof window.geoLocationStorage === "undefined"){
    window.geoLocationStorage = {
      async get(){ try{ const raw = localStorage.getItem('isshereal:geo'); return raw ? JSON.parse(raw) : null; } catch { return null; } },
      async set(o){ try{ localStorage.setItem('isshereal:geo', JSON.stringify(o)); } catch {} },
      async clear(){ try{ localStorage.removeItem('isshereal:geo'); } catch {} }
    };
  }
}
export async function enableGeo(){
  if(!('geolocation' in navigator)){ alert('Geolocation unsupported'); return; }
  return new Promise((resolve)=>{
    navigator.geolocation.getCurrentPosition(async(pos)=>{
      const ctx = { coords:{ lat:+pos.coords.latitude.toFixed(5), lon:+pos.coords.longitude.toFixed(5) },
                    tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown',
                    locale:navigator.language||'en', ts:Date.now() };
      await window.geoLocationStorage.set(ctx);
      updateViewerChips(ctx);
      resolve(ctx);
    }, async(err)=>{
      const ctx = { tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown', locale:navigator.language||'en', denied:true, ts:Date.now() };
      await window.geoLocationStorage.set(ctx);
      updateViewerChips(ctx);
      resolve(ctx);
    }, { timeout:6000, maximumAge:600000 });
  });
}
export async function getViewerContext(){
  const saved = await window.geoLocationStorage.get();
  if(saved){ updateViewerChips(saved); return saved; }
  const ctx = { tz:Intl.DateTimeFormat().resolvedOptions().timeZone||'unknown', locale:navigator.language||'en' };
  updateViewerChips(ctx);
  return ctx;
}
export function updateViewerChips(ctx){
  const tz = ctx?.tz || Intl.DateTimeFormat().resolvedOptions().timeZone || 'unknown';
  const loc = ctx?.locale || navigator.language || 'en';
  const coords = ctx?.coords ? `${ctx.coords.lat},${ctx.coords.lon}` : (ctx?.denied?'denied':'off');
  document.getElementById('geoChip').textContent = `Location: ${coords}`;
  document.getElementById('tzChip').textContent = `TZ: ${tz}`;
  document.getElementById('localeChip').textContent = `Locale: ${loc}`;
}
