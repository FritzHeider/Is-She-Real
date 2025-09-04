
export function flag(ok, weight, label, note){ return { ok:Boolean(ok), weight:Number(weight)||1, label, note }; }
export function combine(signals){ const total=signals.reduce((a,s)=>a+s.weight,0)||1; const good=signals.reduce((a,s)=>a+(s.ok?s.weight:0),0); return Math.round(100*good/total); }
export function verdictLabel(score){
  if(score>=75) return { label:'Likely Human', cls:'ok', hint:'Rich signals & plausible history' };
  if(score>=45) return { label:'Inconclusive', cls:'warn', hint:'Mixed signals; needs manual review' };
  return { label:'Likely Clickbait/Bot', cls:'bad', hint:'Sparse signals or red flags' };
}

export function scoreWebsite(text, sourceUrl, viewerCtx){
  const signals=[]; const lower=text.toLowerCase(); const length=text.length;
  signals.push(flag(length>1200,10,'Content volume',length+' chars'));
  const emailMatch=/[\w.+-]+@[\w-]+\.[\w.-]+/g.test(text);
  signals.push(flag(emailMatch,7,'Contact found',emailMatch?'email present':'no contact email'));
  const hasAbout=/(about|contact|privacy|terms)/i.test(text);
  signals.push(flag(hasAbout,6,'Site pages',hasAbout?'about/contact present':'no policy pages'));
  try{ const host=new URL(sourceUrl).hostname; const tld=host.split('.').pop(); const risky=new Set(['xyz','click','info','top','live','cam','rest']); signals.push(flag(!risky.has(tld),3,'Domain TLD','.'+tld)); }catch{}
  const year=new Date().getFullYear();
  const recentMention=new RegExp(String(year)).test(text)||new RegExp(String(year-1)).test(text);
  signals.push(flag(recentMention,4,'Recency mention',recentMention?'recent year on page':'no recent date'));
  try {
    const m = text.match(/<\s*html[^>]*lang\s*=\s*"([a-zA-Z-]{2,8})"/i);
    if(m){
      const pageLang = m[1].toLowerCase().slice(0,2);
      const viewerLang = String(viewerCtx?.locale||navigator.language||'en').slice(0,2).toLowerCase();
      signals.push(flag(pageLang===viewerLang, 3, 'Locale alignment', pageLang===viewerLang? `lang=${pageLang}`:`page=${pageLang} vs you=${viewerLang}`));
    }
  } catch {}
  const score=combine(signals); return { score, signals };
}
