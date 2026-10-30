/* Tony Khan Simulator — suggested tag teams (v227).
   When you keep pairing the same wrestlers in tag or trios matches without making them a team, or an unnamed pairing wins
   tag or trios gold, the game suggests making it official — with a name ready to edit. Suggestions show in the weekly
   briefing (Front office) and on the Front office's Tag teams & factions card. "Not a team" drops a suggestion; a title
   win can still bring it back once.
   State: S.tsug = {c:{key:times teamed}, l:[{k,ids,why,at}], no:[keys dismissed]}.
   Loaded after the main script and attention.js; hooks in by wrapping globals. */
'use strict';
(function(){
const TS_N=3; /* the third match together brings up a suggestion */
const TS=()=>{S.tsug=S.tsug||{c:{},l:[],no:[]};S.tsug.c=S.tsug.c||{};S.tsug.l=S.tsug.l||[];S.tsug.no=S.tsug.no||[];return S.tsug};
/* v257: in a league each GM keeps their own suggestions (private, like their Performance Center). The phone that airs the week
   counts every brand's pairings, each into that GM's own list; it used to count only its own, and every GM shared one list */
const TSb=b=>{if(b==='p'||typeof ON!=='function'||!ON()||!S.priv)return TS();const P=S.priv[b]=S.priv[b]||{};const t=P.tsug=P.tsug||{};t.c=t.c||{};t.l=t.l||[];t.no=t.no||[];return t};
const ownerOf=sd=>{const o=S.w[sd[0]]&&S.w[sd[0]].own;return o&&sd.every(id=>S.w[id]&&S.w[id].own===o)?o:null};
const kOf=ids=>ids.slice().sort().join('|');
const mine=id=>S.w[id]&&S.w[id].own==='p';
const LN=w=>w.name.split(' ').slice(-1)[0];
const names=ids=>{const n=ids.map(id=>S.w[id]?S.w[id].name:'?');return n.length>2?n.slice(0,-1).join(', ')+' and '+n[n.length-1]:n.join(' and ')};
/* already a set team (or a team that contains all of them) — nothing to suggest */
const named=ids=>(S.teams||[]).some(t=>t.type==='team'&&ids.every(id=>t.m.includes(id))&&t.m.length<=ids.length+1);

/* ---------- a name to start from ---------- */
const ADJ={f:['Electric','Golden','Unbreakable','Hometown','Rising','Lucky','Midnight','Fearless','Brightside','Good Time'],
 h:['Hostile','Ruthless','Velvet','Crooked','Cold-Blooded','Privileged','Vicious','Dirty Money','Smug','Iron Fist'],
 x:['Odd Couple','Uneasy','Mismatched','Wildcard','Unlikely','Volatile']};
const NOUN={fl:['Flight Crew','Air Raid','Daredevils','Skyline'],te:['Technicians','Craft','Grappling Guild','Fundamentals'],
 br:['Bruisers','Wrecking Crew','Brawl Club','Scrappers'],pw:['Heavy Hitters','Giants','Demolition Squad','Big Rigs'],
 sh:['Showstoppers','Headliners','Spectacle','Main Attraction'],any:['Connection','Express','Alliance','Collective','Syndicate','Outfit']};
function nameIdeas(ids){const ws=ids.map(id=>S.w[id]).filter(Boolean);const r=seeded('tsug|'+kOf(ids));const pk=l=>l[Math.floor(r()*l.length)];
 const al=ws.every(w=>w.al==='f')?'f':ws.every(w=>w.al==='h')?'h':'x';const st=ws.every(w=>w.st===ws[0].st)?ws[0].st:null;
 const taken=new Set((S.teams||[]).map(t=>t.n.toLowerCase()));const out=[];const add=n=>{if(n&&!taken.has(n.toLowerCase())&&!out.includes(n))out.push(n)};
 for(let i=0;i<8&&out.length<3;i++)add(`The ${pk(ADJ[al])} ${pk(st?NOUN[st].concat(NOUN.any):NOUN.any)}`);
 add(ws.slice().sort((a,b)=>b.pop-a.pop).map(LN).join(' & '));return out}

/* ---------- what's waiting ---------- */
function live(){if(!S||!S.tsug)return [];const T=TS();
 T.l=T.l.filter(s=>s.ids.every(mine)&&!named(s.ids));return T.l}
window.tsList=live;
function suggest(ids,why,notes,t,b){const T=TSb(b||'p');const k=kOf(ids);
 if(named(ids))return;const ex=T.l.find(s=>s.k===k);
 if(ex){if(why==='gold'&&ex.why!=='gold'){ex.why='gold';ex.t=t;ex.at=AW();notes.push(`🤝 ${names(ids)} won the ${t} titles without a team name. Their suggested team is waiting in the Front office.`)}return}
 if(why!=='gold'&&T.no.includes(k))return;
 T.no=T.no.filter(x=>x!==k);T.l.push({k,ids:ids.slice(),why,t:t||null,at:AW()});
 notes.push(why==='gold'?`🤝 ${names(ids)} won the ${t} titles without a team name. There's a suggested name waiting in the Front office.`
  :`🤝 ${names(ids)} have teamed up ${T.c[k]} times. Make it official? There's a suggested name waiting in the Front office.`)}

/* ---------- counting pairings after each match ---------- */
const _apply=window.applyMatch;
window.applyMatch=function(m,res,ctx,notes){const out=_apply.apply(this,arguments);
 try{const per=MT[m.type]&&MT[m.type].per;if(m.nc!==true&&(per===2||per===3)&&!m.tour){
  m.sides.forEach((sd,si)=>{const b=sd.length>1&&ownerOf(sd);if(!b||(b!=='p'&&!(typeof ON==='function'&&ON()))||named(sd))return;const T=TSb(b);const k=kOf(sd);T.c[k]=(T.c[k]||0)+1;
   const t=m.title&&S.titles[m.title];
   if(t&&si===m.winner&&t.won===AW()&&t.holders.length===sd.length&&sd.every(id=>t.holders.includes(id)))suggest(sd,'gold',notes,t.n,b);
   else if(T.c[k]>=TS_N)suggest(sd,'pair',notes,null,b)})}}catch(e){console.warn(e)}
 return out};

/* ---------- making it official ---------- */
let TSK=null;
window.tsOpen=function(k){if(typeof mpLocked==='function'&&mpLocked())return;const s=live().find(x=>x.k===k);if(!s)return toast('That team is no longer available.');
 TSK=k;const ideas=nameIdeas(s.ids);TE={id:null,n:ideas[0]||'',type:'team',m:s.ids.slice(),keep:[],ideas};renderTeam()};
window.tsNo=function(k){const T=TS();T.l=T.l.filter(s=>s.k!==k);if(!T.no.includes(k))T.no.push(k);save();render()};
const _render=window.renderTeam;
window.renderTeam=function(){_render.apply(this,arguments);
 if(!TE||!TE.ideas||!TE.ideas.length)return;const inp=document.getElementById('tmName');if(!inp)return;
 const d=document.createElement('div');d.className='chips';d.style.marginTop='6px';d.style.flexWrap='wrap';
 d.innerHTML=`<span class="muted tiny" style="align-self:center;margin-right:4px">Ideas:</span>`+TE.ideas.map((n,i)=>`<button type="button" class="chip ${TE.n===n?'on':''}" onclick="tsIdea(${i})">${esc(n)}</button>`).join('');
 inp.after(d);
 /* the suggested members first, so it's clear who's in it */
 const tl=document.querySelector('#modal .tmlist');if(tl)[...tl.querySelectorAll('.tmrow.on')].reverse().forEach(r=>tl.prepend(r))};
window.tsIdea=function(i){if(!TE||!TE.ideas)return;TE.n=TE.ideas[i];renderTeam()};
const _saveT=window.saveTeam;
window.saveTeam=function(){const k=TE&&TE.ideas?TSK:null;const ids=TE&&TE.m.slice();_saveT.apply(this,arguments);
 if(k&&!TE&&S.tsug){S.tsug.l=S.tsug.l.filter(s=>s.k!==k&&s.k!==kOf(ids));TSK=null;save();render()}};

/* ---------- where it shows ---------- */
function why(s){const T=TS();return s.why==='gold'?`Won the ${esc(s.t||'tag')} titles together`:`Teamed up ${T.c[s.k]||TS_N} times`}
function rowB(s,close){const c=close?'closeModal();':'';return `<div class="brow" style="margin-bottom:10px"><b>${esc(names(s.ids))}</b><br><span class="muted tiny">${why(s)} · suggested name: ${esc(nameIdeas(s.ids)[0]||'')}</span><div class="row" style="gap:6px;margin-top:6px"><button class="mini" onclick="${c}tsOpen('${s.k}')">Name the team</button><button class="mini ghost" onclick="${c}tsNo('${s.k}')">Not a team</button></div></div>`}
const _brief=window.briefItems;
window.briefItems=function(){const out=_brief.apply(this,arguments);
 try{const l=live();if(l.length)out.push({i:'🤝',t:l.length>1?'Teams in the making':'A team in the making',rows:l.map(s=>rowB(s,true))})}catch(e){console.warn(e)}
 return out};
const _office=window.officeView;
window.officeView=function(){let h=_office.apply(this,arguments);
 try{const l=live();if(l.length){const at='<button class="btn sec" onclick="openTeam()">';const i=h.indexOf(at);
  if(i>=0)h=h.slice(0,i)+`<div class="muted tiny" style="margin:4px 0 6px">Suggested — they keep teaming up:</div>`+l.map(s=>rowB(s,false)).join('')+h.slice(i)}}catch(e){console.warn(e)}
 return h};
})();
