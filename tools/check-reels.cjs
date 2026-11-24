/* Run with node tools/check-reels.cjs. The game scripts run in browser order with a stub DOM.
   These checks cover payoff scheduling and match results without browser dependencies. */
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const readGameFile=file=>fs.readFileSync(path.join(__dirname,'..',file),'utf8');
const assert=require('node:assert/strict');
const {webcrypto}=require('node:crypto');
const elements=new Map();
class Element {
 constructor(){Object.assign(this,{classList:{add(){},remove(){},toggle(){},contains(){return false}},style:{setProperty(){},removeProperty(){}},dataset:{},innerHTML:'',textContent:'',value:''})}
 appendChild(x){return x} append(){} remove(){} addEventListener(){} removeEventListener(){} setAttribute(){} getAttribute(){return ''} querySelector(){return null} querySelectorAll(){return []}
}
const element=id=>{if(!elements.has(id))elements.set(id,new Element());return elements.get(id)};
const win={console,crypto:webcrypto,document:{
 head:element('head'),body:element('body'),documentElement:element('html'),createElement:()=>new Element(),getElementById:element,
 querySelector:s=>s.startsWith('#')&&!s.includes(' ')?element(s.slice(1)):null,querySelectorAll:()=>[],addEventListener(){},removeEventListener(){},
},localStorage:{getItem(){return null},setItem(){},removeItem(){}},location:{search:'',hash:'',href:'http://localhost/',hostname:'localhost'},
 navigator:{},matchMedia:()=>({matches:true,addEventListener(){},addListener(){}}),addEventListener(){},removeEventListener(){},
 setTimeout:(f,n)=>setTimeout(f,Math.min(n,3)),clearTimeout,setInterval:()=>0,clearInterval,requestAnimationFrame:f=>setTimeout(f,1),
 Image:class {},MutationObserver:class {observe(){} disconnect(){}},URL,URLSearchParams,fetch:async()=>({ok:false}),history:{pushState(){},replaceState(){}},TextEncoder,performance};
win.window=win;win.self=win;
vm.createContext(win);
const js=(s,file)=>vm.runInContext(s,win,{filename:file||'test'});
const page=readGameFile('index.html');
for(const [,attrs,body] of page.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)){
 if(attrs.includes('type="module"'))continue;
 const src=attrs.match(/src="([^"]+)"/)?.[1];
 const script=src?readGameFile(src):body;
 const traced=src==='matchshow.js'?script.replace(/(function msPlay\(pages[^)]*\)\{)/,
  '$1 window.reelTimeline?.push(...pages.map(page=>page.t||""));'):script;
 js(traced,src||'index-inline');
}
js(`   window.reelFixture = (k, story, kind, type, stip='std', ppv=false) => {
    newGame('Tester','Rival','normal');
    S.phase='season';
    S.week=ppv?Number(Object.keys(PPVS)[0]):1;
    const [A,B,C,D,E,F]=Object.values(S.w).filter(w=>w.g==='M').slice(0,6);
    for(const w of [A,B,C,D,E,F])Object.assign(w,{own:'p',ring:85,mic:85,mor:80,fat:0,inj:0});
    const {id:a}=A,{id:b}=B,{id:c}=C;
    const sides=type==='triple'?[[a],[b],[c]]:type==='tag'?[[a,b],[D.id,E.id]]:[[a],[b]];
    const match={type,stip,sides,winner:0};
    const promo={a:b,b:a,type:'rally'};
    const arc={k,sl:story,id:'test-arc',a,b,c,stage:'pay',have:3,need:3,st:[4,4,4],payFrom:0,end:100};
    S.arcs=k?[arc]:[];
    if(k==='faith'){S.teams=[{id:'test-faction',n:'The Test Faction',type:'faction',m:[a,b,c]}];arc.f='test-faction';arc.fn=S.teams[0].n}
    if(k==='voice'){A.pop=45;B.pop=80;promo.a=a;promo.b=b;promo.type='callout'}
    if(k==='lastchase'){const title=Object.values(S.titles).find(t=>t.kind==='singles'&&t.g===A.g);title.holders=[b];match.title=title.id;match.winner=1}
    if(k==='sellout'){B.pop=60;A.al='f'}
    if(k==='invasion')S.week=FD_WEEK;
    const d=kind==='promo'?promo:match;
    S.card={p:[{k:kind,d}],ai:[]};
    window.reelTest={a,b,c,D,E,F,arc,match,promo,d,kind};
    return reelTest;
   };
   window.startTestReel=()=>{
    const {kind,match,d}=reelTest,sh=curShow();
    LIVE=true;
    LQ={items:[kind==='promo'?{kind:'promo',i:0}:{kind:'seg',m:match,n:1,main:true}],
     k:-1,show:sh.name,ppv:sh.ppv,crowd:50,hr:0,quiet:[]};
    liveNext();
   };
`);
js(`SFX=null;openModal=(html)=>{window.modal=html};closeModal=()=>{};
`);
const list=js(`({
 arcs:Object.keys(ARCS).length, scenes:Object.keys(ARC_REEL).length,
 missingArcs:Object.keys(ARCS).filter(k=>!ARC_REEL[k]),
 stips:Object.keys(STIPS).length, missingStips:Object.keys(STIPS).filter(k=>!BLOOD_REEL[k]),
 styleFilters:MEV.filter(e=>[e,...e.ch].some(c=>c.sty||c.bsty||c.nsty)).map(e=>e.id)
})`);
console.log(`${list.scenes}/${list.arcs} arc scripts and ${list.stips} stipulations checked.`);
assert.equal(list.missingArcs.length,0);
assert.equal(list.missingStips.length,0);
assert.equal(list.styleFilters.length,0);
const cases=[
 ['sellout','corp','match','singles','std',false,[['sign',0,false],['refuse',0,false]]],
 ['wedding','married','match','triple','std',false,[['split',0,false],['throuple',0,true]]],
 ['faith','religion','promo','singles','std',false,[['convert',0,false],['out',0,false]]],
 ['goodwill','souffle','match','tag','std',false,[['ruse',1,false],['real',0,false]]],
 ['war','flags','match','singles','street',false,[['war',0,false],['peace',0,true]]],
 ['lastchase','hangup','match','singles','std',true,[['champ',0,false],['fall',1,false]]],
 ['invasion','brigade','match','singles','std',true,[['knife',0,false],['peace',0,false]]]
];
function fixture(args){return js('reelFixture(...'+JSON.stringify(args)+')')}
const fixtureName=role=>js(`S.w[reelTest[${JSON.stringify(role)}]].name`);
for(const row of cases){
 const [k,...rest]=row.slice(0,6), options=row[6];
 for(const [key,winner,nc] of options){
  const t=fixture([k,...rest]);
  assert.equal(js(`hrPlan(S.card.p,curShow().ppv,'p').get(reelTest.d)`),'arc',k);
  assert(js(`hrScene({main:true},reelTest.d,reelTest.kind,'arc',curShow().ppv).decision['${key}']`),k);
  js(`arcApplyDecision(reelTest.arc,'${key}',${t.kind==='match'?'reelTest.match':'null'})`);
  assert.equal(t.match.winner,winner,k);
  assert.equal(!!t.match.nc,nc,k);
  assert(js(`arcPayoffFor(reelTest.kind,reelTest.d,true)`),k);
 }
}
console.log('All fourteen decision results and their payoff predicates passed.');

const wait=()=>new Promise(r=>setTimeout(r,6));
js(`openModal=(html)=>{window.modal=html;document.getElementById('sdlow').innerHTML=''};tcCard=()=>'';window.foPose=()=>{};
 window.reelTimeline=[];
`);
async function drive(target,isMatch){
 let decisionSheets=0;
 js('startTestReel()');
 for(let i=0;i<100;i++){
  await wait();
  const modal=win.modal||'', low=element('sdlow').innerHTML;
  if(isMatch?modal.includes('class="msres"'):js('!!PS?.done'))return decisionSheets;
  const choice=[...(modal+low).matchAll(/<button class="choice[^"]*" onclick="(msPick|psChoose)\((\d+)\)"[^>]*>(.*?)<\/button>/gs)];
  if(pickReelChoice(choice,target))continue;
  if(modal.includes('class="mhd"')&&modal.includes('the decision'))decisionSheets++;
  if(low.includes('id="sdbox"'))js(isMatch?'msTap()':'sdTap()');
 }
 throw new Error('Live reel did not finish: '+(win.modal||'').slice(0,500)+' '+element('sdlow').innerHTML.slice(0,500));
}
function pickReelChoice(choices,target){
 const choice=choices.find(row=>row[3].includes(target))||choices[0];
 if(!choice)return false;
 js(choice[1]+'('+choice[2]+')');
 return true;
}
(async()=>{
 fixture(['wedding','married','match','triple']);
 assert.equal(await drive('form a throuple',true),0);
 assert.equal(js('reelTest.arc.choice'),'throuple');
 assert(win.modal.includes('No contest'));
 fixture(['faith','religion','promo','singles']);
 assert.equal(await drive('Kick',false),0);
 assert.equal(js('reelTest.arc.choice'),'out');
 fixture(['voice','taxidermy','promo','singles']);
 assert.equal(await drive('none',false),0);
 assert.equal(js('reelTest.promo.res.oks.length'),2);
 fixture(['lastchase','hangup','match','singles','std',true]);
 assert.equal(await drive('Retire as champion',true),0);
 assert.equal(js('reelTest.match.winner'),0);
 fixture(['sellout','corp','match','singles','std',true]);
 const plan=js(`(()=>{
  const {a,b,c,D,E,match}=reelTest;
  const opener={type:'singles',sides:[[D.id],[b]],winner:0};
  match.sides=[[a],[D.id]];
  const main={type:'singles',sides:[[c],[E.id]],winner:0};
  S.heat[key(D.id,b)]=85;S.heat[key(c,E.id)]=85;
  const card=[opener,match,main].map(d=>({k:'match',d}));
  const plan=hrPlan(card,true,'p');
  return [plan.get(main),plan.get(match),plan.has(opener),hrPlan(card,true,'ai').size];
 })()`);
 assert.deepEqual(Array.from(plan),['blood','arc',false,1]);
 assert(js(`(()=>{
  const {match,a,b}=reelTest;
  match._hrArc=1;match.stip='ladder';
  const r={A:S.w[a],B:S.w[b],V:S.w[a],O:S.w[b]};
  const options=evChoices({id:'sit:business',ch:SIT.business.ch},match,r);
  return options.length===1&&options[0].tip==='Keeps the booked result';
 })()`));
 const bloodSetup=`const {a,b,match}=reelTest;match.stip='street';match.bo=true;S.heat[key(a,b)]=85;
 S.fh[key(a,b)]=[{seg:'Week one',n:'A disputed finish started it.'}];`;
 for(const [action,target,nc,winner,unsettled] of [
  ['clean','Settle it decisively',false,0,false],
  ['flip','Give the decisive win to',false,1,false],
  ['dirty','Let the finish be stolen',false,0,true],
  ['nc','Let it break down',true,0,false]
 ]){
  fixture([null,null,'match','singles']);
  js('{'+bloodSetup+'}');
  await drive(target,true);
  assert.equal(js('reelTest.match.winner'),winner,action);
  assert.equal(js('!!reelTest.match.nc'),nc,action);
  assert.equal(js('!!reelTest.match.ev.feudUnsettled'),unsettled,action);
  const heat=js(`(()=>{const m=reelTest.match,ctx={ppv:false,pos:'me',name:'TV',worked:new Set()};applyMatch(m,rateMatch(m,ctx),ctx,[]);return heatOf(reelTest.a,reelTest.b)})()`);
  assert.equal(heat,(unsettled||nc)?77:0,action);
 }
 fixture(['wedding','married','match','triple']);
 js('{'+bloodSetup+'}');
 /* v487: an arc payoff that is also a blood feud plays as the arc reel, so its decision is the reel's climax */
 assert.equal(js("hrPlan(S.card.p,false,'p').get(reelTest.match)"),'arc');
 fixture([null,null,'match','singles']);
 js('{'+bloodSetup+';hrAuto(S.card.p,"ai",curShow())}');
 assert(js('reelTest.match.ev?.notes.some(n=>n.includes("Heat"))'));
 console.log('Live match and promo flows, fallback decision, rival reel and four feud resolution paths passed.');
 fixture(['gauntlet','father','match','singles']);
 const fatherNames=js(`(()=>{
  const {a,b,D,E,arc,match}=reelTest;
  const title=Object.values(S.titles).find(t=>t.kind==='singles'&&t.g===S.w[a].g);
  title.holders=[b];match.title=title.id;
  const main={type:'singles',sides:[[D.id],[E.id]],winner:0};
  match.bo=true;S.heat[key(a,b)]=90;
  const card=[{k:'match',d:match},{k:'match',d:main}];
  if(hrPlan(card,false,'p').get(match)!=='arc')throw Error('The reveal must get the live slot on an undercard or overlapping feud');
  const choices=arcFatherChoices(arc);
  if(new Set(choices).size!==2||choices.includes(a)||arc.father)throw Error('The reveal must start with two unrevealed candidates');
  if(choices.join()!==arcFatherChoices(arc).join())throw Error('The candidates changed while the scene was open');
  window.reelTimeline=[];
  return choices.map(id=>S.w[id].name)
 })()`);
 await drive(fatherNames[1],true);
 assert.equal(js('S.w[reelTest.arc.father].name'),fatherNames[1]);
 assert(js(`reelTimeline.findIndex(t=>t.includes('counts three'))<reelTimeline.findIndex(t=>t.includes('An envelope'))`));
 assert(js(`reelTimeline.some(t=>t.includes(${JSON.stringify(fatherNames[1]+' is ')} )&&t.includes('father'))`));
 assert(js(`(()=>{
  const {arc,match}=reelTest;const notes=[];
  arcPost(arcMatchPre(match,{pos:'me'}),4,notes);
  return S.arcLog.at(-1).father===arc.father&&notes.some(t=>t.includes('revealed as'));
 })()`));

 fixture([null,null,'match','singles','iquit',true]);
 js('{const {a,b}=reelTest;S.heat[key(a,b)]=85;window.reelTimeline=[];}');
 await drive('Let the finish be stolen',true);
 const disputed=js('reelTimeline.find(t=>t.includes("mic cuts out"))');
 assert(disputed&&disputed.includes(fixtureName('a')+' says “I quit” first'));
 assert(disputed.includes(fixtureName('b')+' says it into the working mic'));
 assert(js('reelTest.match.winner===0&&reelTest.match.ev.feudUnsettled&&reelTest.match._hrFinal'));

 fixture(['stakes','custody','match','singles','std',true]);
 assert(!js("arcPayoffFor('match',reelTest.match,true)"));
 js("reelTest.match.stip='ladder'");
 assert(js("arcPayoffFor('match',reelTest.match,true)"));
 assert(js(`hrFill(hrScene({main:true},reelTest.match,'match','arc',true),hrFinishText(reelTest.match),reelTest.match).includes('unhooks the custody papers')`));

 fixture(['tap','hell','match','tag','sub']);
 const submission=js(`(()=>{
  const {a,b,D,E,match}=reelTest;
  match.sides=[[a,D.id],[b,E.id]];match.pin=E.id;
  const reel=hrScene({main:true},match,'match','arc',false);
  return [hrBeat(reel,reel.fin,match).calls[0].ok,hrFill(reel,hrFinishText(match),match),E.name,S.w[b].name];
 })()`);
 assert(submission[0].startsWith(submission[2]));
 assert(submission[1].startsWith(submission[2]+' finally taps out'));
 assert(!submission[1].includes(submission[3]));

 fixture(['faceturn',null,'match','singles']);
 const save=js(`(()=>{
  const {arc,match,a,b,D}=reelTest;
  arc.v=1;match.sides=[[b],[D.id]];match.ri={x:a,t:D.id,k:'save',turn:true};
  const reel=hrScene({main:true},match,'match','arc',false);
  return reel.afterBell&&hrBeat(reel,reel.heat,match).setup.includes(D.name);
 })()`);
 assert(save);

 fixture(['retire',null,'match','singles']);
 js("reelTest.match.nc=true");
 assert(!js("arcPayoffFor('match',reelTest.match,true)"));
 fixture(['breakup',null,'promo','singles']);
 assert(js(`(()=>{
  reelTest.arc.v=1;
  const reel=hrScene({main:true},reelTest.promo,'promo','arc',false);
  return !hrBeat(reel,reel.fin).calls[0].ok.includes('matching colors')&&hrArcAfter(reel)[0].includes('done taking bookings');
 })()`));
 fixture([null,null,'match','triple']);
 assert(js(`(()=>{
  const {a,b,c,match}=reelTest;
  match.bo=true;S.heat[key(b,c)]=85;
  const reel=hrScene({main:true},match,'match','blood',false);
  return hrBloodOptions(match,reel).filter(o=>o.key.startsWith('flip:')).length===2;
 })()`));
 console.log('Father reveal, audio dispute, cast, stakes, bell order, retirement, breakup and three-way feud checks passed.');
 const checked=js(`(()=>{
  const all=Object.keys(STIPS);
  for(const stip of all){
   const ppv=!!STIPS[stip].ppv;
   const type=STIPS[stip].mt?.[0]||(stip==='bng'?'trios':'singles');
   const {a,b,c,D,E,F,match}=reelFixture(null,null,'match',type,stip,ppv);
   if(type==='trios')match.sides=[[a,c,D.id],[b,E.id,F.id]];
   if(type==='tag')match.sides=[[a,D.id],[b,E.id]];
   S.heat[key(a,b)]=85;
   match.bo=!ppv;
   const reel=hrScene({},match,'match','blood',ppv);
   const fail=message=>{throw Error(stip+': '+message)};
   const {calls}=hrBeat(reel,reel.heat,match);
   for(const call of calls){
    if(!call.ok||!call.no||call.ok===call.no)fail('missing distinct hit and miss');
    if(/\\{[A-Z]/.test(call.ok+call.no))fail('unfilled heat role');
   }
   for(const action of ['clean','flip:1','dirty','nc']){
    const m={...match};
    const line=hrFill(reel,hrBloodFinish(m,reel,action),m);
    if(!line||/\\{[A-Z]/.test(line))fail('unfilled finish role');
    if(m.winner!==(action==='flip:1'?1:0))fail('wrong booked side');
    if(!!m.nc!==(action==='nc'))fail('wrong no-contest result');
    if(!!m.ev?.feudUnsettled!==(action==='dirty'))fail('wrong feud outcome flag');
    if(action==='clean'||action==='flip:1'){
     if(!line.endsWith(hrFill(reel,hrFinishText(m),m)))fail('stipulation finish was replaced');
    }
    if(action==='dirty'&&line!==hrFill(reel,BLOOD_DIRTY[stip],m))fail('dispute changed');
    if(action==='nc'&&!line.endsWith('No contest.'))fail('no-contest result missing');
   }
  }
  return all.length;
 })()`);
 assert.equal(checked,list.stips);
 console.log('Heat hits, misses, and four finish paths checked for all '+checked+' blood-feud stipulations.');
})().catch(e=>{console.error(e);process.exitCode=1});
