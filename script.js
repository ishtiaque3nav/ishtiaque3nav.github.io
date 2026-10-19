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

/* Historical counter retained for future reconciliation:
   https://counterapi.com/api/ishtiaque3nav.github.io/view/portfolio-home
   Do not reset this identifier or combine its unverified total with new page views. */
