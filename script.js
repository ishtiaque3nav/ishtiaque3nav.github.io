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

/* Visitor counter: approximate unique visitors, starting when installed.
   Uses CounterAPI's approximate unique modifier; this sends no API key and
   avoids a second counted request on reloads within a 30-minute tab session. */
async function updateVisitorCounter(){
 const number=document.getElementById('visitor-count');
 const note=document.getElementById('visitor-count-note');
 if(!number||!note)return;
 const storageKey='ian-portfolio-counter-last-visit';
 let recentVisit=false;
 try{
  const last=Number(sessionStorage.getItem(storageKey));
  recentVisit=Number.isFinite(last)&&last>0&&Date.now()-last<30*60*1000;
 }catch{}
 const url=new URL('https://counterapi.com/api/ishtiaque3nav.github.io/view/portfolio-home');
 url.searchParams.set('unique','true');
 if(recentVisit)url.searchParams.set('readOnly','true');
 try{
  const response=await fetch(url.toString(),{cache:'no-store',signal:AbortSignal.timeout(10000),referrerPolicy:'strict-origin-when-cross-origin'});
  if(!response.ok)throw new Error('Counter unavailable');
  const data=await response.json();
  const raw=data&&data.value;
  if(!(typeof raw==='number'&&Number.isSafeInteger(raw))&&!(typeof raw==='string'&&/^\d+$/.test(raw)))throw new Error('Invalid count');
  const count=Number(raw);
  if(!Number.isSafeInteger(count)||count<0)throw new Error('Invalid count');
  number.textContent=count.toLocaleString('en-US');
  note.textContent='Estimated distinct visitors · Since Oct 2026';
  if(!recentVisit){try{sessionStorage.setItem(storageKey,String(Date.now()))}catch{}}
 }catch{
  note.textContent='Count temporarily unavailable · Since Oct 2026';
 }
}
updateVisitorCounter();
