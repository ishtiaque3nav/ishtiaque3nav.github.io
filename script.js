const menu=document.getElementById('menu');const nav=document.getElementById('navigation');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false')}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');menu.focus()}});
document.getElementById('year').textContent=new Date().getFullYear();

async function updateScholarMetrics(){
 const status=document.getElementById('scholar-status');
 try{
  const response=await fetch('./api/scholar.json',{cache:'no-store',signal:AbortSignal.timeout(18000)});
  if(!response.ok)throw new Error('Unavailable');
  const data=await response.json();
  const values=[data.citations,data.hIndex,data.i10Index];
  const verifiedAt=Date.parse(data.updatedAt);
  if(!values.every(v=>Number.isSafeInteger(v)&&v>=0)||!Number.isFinite(verifiedAt)||verifiedAt>Date.now()+5*60*1000)throw new Error('Invalid data');
  ['scholar-citations','scholar-h-index','scholar-i10-index'].forEach((id,i)=>document.getElementById(id).textContent=values[i].toLocaleString('en-US'));
  const date=new Date(verifiedAt).toLocaleString('en-US',{month:'short',day:'numeric',year:'numeric',hour:'numeric',minute:'2-digit',timeZoneName:'short'});
  const hoursSince=(Date.now()-verifiedAt)/3600000;
  const label=data.lastAttemptOk!==true?'Automatic daily sync awaiting first successful run':hoursSince>48?'Automatic daily update delayed · Showing last verified counts':'Daily automatic verification · All-time counts';
  status.textContent=`Last verified ${date} · ${label}`;
 }catch{
  status.textContent='Latest citation data unavailable · Showing October 15, 2026 baseline';
 }
}
updateScholarMetrics();
setInterval(()=>{if(!document.hidden)updateScholarMetrics()},15*60*1000);

/* Preserve original CounterAPI identity and last verified local count; no resets. */
async function updateVisitorCounter(){
 const number=document.getElementById('visitor-count'),note=document.getElementById('visitor-count-note');
 if(!number||!note)return;
 const key='ian-portfolio-counter-last-verified',visitKey='ian-portfolio-counter-last-visit';
 const valid=v=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0?v:typeof v==='string'&&/^\d+$/.test(v)&&Number.isSafeInteger(Number(v))?Number(v):null;
 let saved=null;
 try{
  const x=JSON.parse(localStorage.getItem(key)||'null'),n=valid(x&&x.count);
  if(n!==null&&Number.isFinite(Date.parse(x.at))){saved={count:n,at:x.at};number.textContent=n.toLocaleString('en-US');note.textContent='Last verified on this device · '+new Date(x.at).toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});}
 }catch{}
 let recent=false;
 try{const last=Number(sessionStorage.getItem(visitKey));recent=last>0&&Date.now()-last<30*60*1000;}catch{}
 const url=new URL('https://counterapi.com/api/ishtiaque3nav.github.io/view/portfolio-home');
 url.searchParams.set('unique','true');
 if(recent)url.searchParams.set('readOnly','true');
 try{
  const response=await fetch(url.toString(),{cache:'no-store',signal:AbortSignal.timeout(10000),referrerPolicy:'strict-origin-when-cross-origin'});
  if(!response.ok)throw Error('Counter service unavailable');
  const data=await response.json(),n=valid(data&&data.value);
  if(n===null)throw Error('Invalid counter data');
  number.textContent=n.toLocaleString('en-US');
  note.textContent='Estimated distinct visitors · Since Oct 2026';
  try{localStorage.setItem(key,JSON.stringify({count:n,at:new Date().toISOString()}));if(!recent)sessionStorage.setItem(visitKey,String(Date.now()));}catch{}
 }catch{
  if(saved){note.textContent='Last verified on this device · Live service temporarily unavailable';}
  else{number.textContent='—';note.textContent='Visitor service unavailable · Historical count remains at provider';}
 }
}
updateVisitorCounter();
