const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

function numberValue(id, label = 'number') {
  const n = Number($(id).value);
  if (!Number.isFinite(n)) throw new Error(`Enter a valid ${label}.`);
  return n;
}
function integerValue(id, label = 'integer') {
  const n = numberValue(id, label);
  if (!Number.isInteger(n)) throw new Error(`Enter a whole ${label}.`);
  return n;
}
function setResult(id, answer, detail = '', error = false) {
  const box = $(id);
  box.classList.toggle('error', error);
  $('.answer', box).textContent = answer;
  const d = $('.detail', box);
  if (d) d.textContent = detail;
}
function protect(fn, resultId) {
  try { fn(); }
  catch (e) { setResult(resultId, e.message || 'Something went wrong.', '', true); }
}

// Load readable source previews from the repository itself.
$$('.source-loader').forEach(async pre => {
  try {
    const r = await fetch(pre.dataset.source);
    if (!r.ok) throw new Error('source unavailable');
    const text = await r.text();
    pre.textContent = text.length > 4200 ? text.slice(0, 4200) + '\n…' : text;
  } catch { pre.textContent = 'Source preview could not be loaded.'; }
});

// Sidebar and mobile jump navigation.
const navLinks = $$('#side-nav a');
const mobile = $('#mobile-nav');
navLinks.forEach(a => {
  const o = document.createElement('option');
  o.value = a.getAttribute('href');
  o.textContent = a.textContent.replace(/^\s*[—\d]+\s*/, '').trim();
  mobile.appendChild(o);
});
mobile.addEventListener('change', () => { location.hash = mobile.value; });
const observed = $$('[data-section]');
const observer = new IntersectionObserver(entries => {
  const visible = entries.filter(e => e.isIntersecting).sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
  if (!visible) return;
  navLinks.forEach(a => a.classList.toggle('active', a.dataset.target === visible.target.id));
  mobile.value = '#' + visible.target.id;
}, { rootMargin: '-18% 0px -68% 0px', threshold: [0, .1, .3] });
observed.forEach(s => observer.observe(s));

// 01 COW
const cowFragments = {
  '+': 'ADD: move values through the tape and accumulate the second into the first.',
  '-': 'SUBTRACT: decrement one stored value while consuming the other.',
  '*': 'MULTIPLY: repeated addition, built from the same tiny command vocabulary.',
  '/': 'DIVIDE: repeated subtraction; the browser companion returns ordinary quotient arithmetic.'
};
function runCow() {
  const a = numberValue('#cow-a'), b = numberValue('#cow-b'), op = $('#cow-op').value;
  if (op === '/' && b === 0) throw new Error('A cow cannot divide by zero.');
  const value = op === '+' ? a+b : op === '-' ? a-b : op === '*' ? a*b : a/b;
  $('#cow-fragment').textContent = cowFragments[op];
  setResult('#cow-result', String(Number.isInteger(value) ? value : Number(value.toFixed(8))), `${a} ${op === '*' ? '×' : op === '/' ? '÷' : op} ${b}`);
}
$('#cow-run').addEventListener('click', () => protect(runCow, '#cow-result'));
$('#cow-op').addEventListener('change', runCow);

// 02 Whitespace
function parseMMDDYYYY(raw) {
  const s = String(raw).trim();
  if (!/^\d{8}$/.test(s)) throw new Error('Use exactly eight digits: MMDDYYYY.');
  const m = +s.slice(0,2), d = +s.slice(2,4), y = +s.slice(4);
  const date = new Date(Date.UTC(y, m-1, d));
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== m-1 || date.getUTCDate() !== d) throw new Error('That is not a valid Gregorian date.');
  return {m,d,y,date};
}
function runWhitespace() {
  const {m,d,y,date} = parseMMDDYYYY($('#ws-date').value);
  const mode = $('#ws-mode').value;
  const names = ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'];
  const pretty = new Intl.DateTimeFormat('en-US',{month:'long',day:'numeric',year:'numeric',timeZone:'UTC'}).format(date);
  if (mode === 'weekday') setResult('#ws-result', names[date.getUTCDay()], pretty);
  else if (mode === 'dayofyear') {
    const start = Date.UTC(y,0,1), day = Math.floor((date.getTime()-start)/86400000)+1;
    setResult('#ws-result', `Day ${day}`, pretty);
  } else {
    const leap = y%4===0 && (y%100!==0 || y%400===0);
    setResult('#ws-result', leap ? 'LEAP YEAR' : 'COMMON YEAR', String(y));
  }
}
$('#ws-run').addEventListener('click', () => protect(runWhitespace, '#ws-result'));
$('#ws-reveal').addEventListener('click', () => {
  const vis = $('#ws-visible'), empty = $('#ws-empty'), btn = $('#ws-reveal');
  const showing = !vis.hidden;
  vis.hidden = showing;
  empty.hidden = !showing;
  btn.textContent = showing ? 'Reveal generated whitespace' : 'Hide revealed whitespace';
});

// 03 Piet
const mixMap = {
  'red|red':['RED','#d54a45'], 'yellow|yellow':['YELLOW','#e2c84c'], 'blue|blue':['BLUE','#4d69ad'],
  'red|yellow':['ORANGE','#df8b43'], 'yellow|red':['ORANGE','#df8b43'],
  'red|blue':['PURPLE','#77549b'], 'blue|red':['PURPLE','#77549b'],
  'yellow|blue':['GREEN','#5f8a59'], 'blue|yellow':['GREEN','#5f8a59']
};
function runPiet() {
  const a=$('#piet-a').value,b=$('#piet-b').value,[name,color]=mixMap[`${a}|${b}`];
  $('#piet-answer').textContent=name; $('#piet-detail').textContent=`${a} + ${b}`; $('#piet-swatch').style.background=color;
}
$('#piet-run').addEventListener('click', runPiet); runPiet();

// 04 Hexagony
function runHex() {
  const n = integerValue('#hex-n','n'); if(n<1) throw new Error('Use n ≥ 1.');
  const mode = $('#hex-mode').value;
  const v = mode==='centered' ? 3*n*(n-1)+1 : n*(2*n-1);
  const detail = mode==='centered' ? `H₍${n}₎ = 3(${n})(${n-1}) + 1` : `H₍${n}₎ = ${n}(2·${n} − 1)`;
  setResult('#hex-result', String(v), detail);
}
$('#hex-run').addEventListener('click',()=>protect(runHex,'#hex-result'));

// 05 ArnoldC
function runArnold(){
  const n=integerValue('#arnold-start','starting number'); if(n<1||n>20) throw new Error('Choose a starting number from 1 to 20.');
  const nums=Array.from({length:n},(_,i)=>n-i).join(' · ');
  setResult('#arnold-result',nums,$('#arnold-line').value);
}
$('#arnold-run').addEventListener('click',()=>protect(runArnold,'#arnold-result'));

// 06 Beatnik / Scrabble
const scrabble = Object.fromEntries(Object.entries({
  'AEILNORSTU':1,'DG':2,'BCMP':3,'FHVWY':4,'K':5,'JX':8,'QZ':10
}).flatMap(([letters,score])=>[...letters].map(c=>[c,score])));
function runBeatnik(){
  const text=$('#beatnik-word').value.toUpperCase();
  const letters=[...text].filter(c=>/[A-Z]/.test(c)); if(!letters.length) throw new Error('Enter at least one letter.');
  const parts=letters.map(c=>`${c}=${scrabble[c]||0}`); const total=letters.reduce((s,c)=>s+(scrabble[c]||0),0);
  $('#beatnik-answer').textContent=`${total} point${total===1?'':'s'}`; $('#beatnik-breakdown').textContent=parts.join(' · ');
}
$('#beatnik-run').addEventListener('click',()=>protect(runBeatnik,'#beatnik .result'));

// 07 Chef
function runChef(){
  const batches=integerValue('#chef-batches','batch count'), per=integerValue('#chef-per','cookies per batch'), eaten=integerValue('#chef-eaten','taste-test count');
  if(batches<0||per<0||eaten<0) throw new Error('Cookie quantities cannot be negative.');
  const baked=batches*per, left=Math.max(0,baked-eaten);
  $('#chef-answer').textContent=`${left} cookie${left===1?'':'s'} left`; $('#chef-detail').textContent=`${baked} baked − ${Math.min(eaten,baked)} taste-tested`;
}
$('#chef-run').addEventListener('click',()=>protect(runChef,'#chef .result'));

// 08 Shakespeare
function runSPL(){
  const a=numberValue('#spl-a'),b=numberValue('#spl-b'),op=$('#spl-op').value;
  const ok=op==='>'?a>b:op==='<'?a<b:a===b;
  $('#spl-answer').textContent=ok?'TO BE.':'NOT TO BE.';
  const words=op==='>'?'is greater than':op==='<'?'is less than':'is equal to';
  $('#spl-detail').textContent=`Romeo (${a}) ${words} Juliet (${b}): ${ok?'true':'false'}.`;
}
$('#spl-run').addEventListener('click',()=>protect(runSPL,'#shakespeare .result'));

// 09 LOLCODE
function runLOL(){
  const age=numberValue('#lol-age','cat age'); if(age<0) throw new Error('Cat age cannot be negative.');
  const method=$('#lol-method').value; let human;
  if(method==='simple') human=age*7;
  else if(age<=1) human=15*age; else if(age<=2) human=15+(age-1)*9; else human=24+(age-2)*4;
  $('#lol-answer').textContent=`${Number(human.toFixed(1))} human years`;
  $('#lol-detail').textContent=method==='simple'?'simple ×7 approximation':'life-stage estimate: 15, then 9, then about 4/year';
}
$('#lol-run').addEventListener('click',()=>protect(runLOL,'#lolcode .result'));

// 10 Rockstar RPS
let rpsMove=null;
$$('#rps-buttons button').forEach(b=>b.addEventListener('click',()=>{
  rpsMove=b.dataset.move; $$('#rps-buttons button').forEach(x=>x.classList.toggle('selected',x===b));
}));
$('#rps-run').addEventListener('click',()=>{
  if(!rpsMove){$('#rps-answer').textContent='Choose a move first.';return;}
  const moves=['rock','paper','scissors'], cpu=moves[Math.floor(Math.random()*3)];
  const win=(rpsMove==='rock'&&cpu==='scissors')||(rpsMove==='paper'&&cpu==='rock')||(rpsMove==='scissors'&&cpu==='paper');
  const tie=rpsMove===cpu;
  $('#rps-answer').textContent=tie?'ENCORE — TIE.':win?'YOU WIN 🤘':'ROCKSTAR WINS.';
  $('#rps-detail').textContent=`You: ${rpsMove.toUpperCase()} · Rockstar: ${cpu.toUpperCase()}`;
});

// 11 INTERCAL
function roman(n){
  if(!Number.isInteger(n)||n<1||n>3999) return null;
  const pairs=[[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
  let out=''; for(const [v,s] of pairs){while(n>=v){out+=s;n-=v}} return out;
}
function runIntercal(){
  const a=numberValue('#inter-a'),b=numberValue('#inter-b'),op=$('#inter-op').value;
  if(op==='/'&&b===0) throw new Error('PLEASE do not divide by zero.');
  let v=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:a/b;
  if(Math.abs(v)>1e9) throw new Error('PLEASE choose smaller values.');
  const fmt=$('#inter-format').value, rounded=Number(v.toFixed(8)), r=roman(rounded);
  let shown=String(rounded);
  if(fmt==='roman') shown=r||'Roman output requires an integer from 1 to 3999';
  if(fmt==='both') shown=r?`${rounded} / ${r}`:`${rounded} / (no Roman form)`;
  $('#inter-answer').textContent=shown; $('#inter-detail').textContent='THANK YOU FOR YOUR COOPERATION.';
}
$('#inter-run').addEventListener('click',()=>protect(runIntercal,'#intercal .result'));

// 12 Ook!
function runOok(){
  const apes=integerValue('#ook-apes','ape count'),rate=integerValue('#ook-rate','banana rate'),days=integerValue('#ook-days','day count');
  if(apes<0||rate<0||days<0) throw new Error('Banana quantities cannot be negative.');
  const total=apes*rate*days; $('#ook-answer').textContent=`${total} banana${total===1?'':'s'}`; $('#ook-detail').textContent=`${apes} × ${rate} × ${days}`;
}
$('#ook-run').addEventListener('click',()=>protect(runOok,'#ook .result'));

// 13 Chicken
function runChicken(){
  const c=integerValue('#chick-count','chicken count'),rate=numberValue('#chick-rate','egg rate'),days=integerValue('#chick-days','day count');
  if(c<0||rate<0||days<0) throw new Error('Egg production cannot be negative.');
  const exact=c*rate*days; $('#chick-answer').textContent=`≈ ${Math.round(exact)} eggs`; $('#chick-detail').textContent=`${c} × ${rate} × ${days} = ${Number(exact.toFixed(2))}`;
}
$('#chick-run').addEventListener('click',()=>protect(runChicken,'#chicken .result'));

// 14 Malbolge
function runMal(){
  const n=integerValue('#mal-start','starting number'), base=Number($('#mal-base').value); if(n<1||n>25) throw new Error('Choose a start from 1 to 25.');
  const vals=Array.from({length:n},(_,i)=>(n-i).toString(base).toUpperCase());
  $('#mal-answer').textContent=vals.join(' · '); $('#mal-detail').textContent=`then: ${(0).toString(base).toUpperCase()}`;
}
$('#mal-run').addEventListener('click',()=>protect(runMal,'#malbolge .result'));

// 15 JSFuck
function jsfuckInteger(n){
  if(n===0) return '+[]';
  const one='(+!+[])';
  return Array.from({length:n},()=>one).join('+');
}
function runJSFuck(){
  const expr=$('#jsf-expr').value.trim();
  if(!/^[0-9+\-*/%().\s]+$/.test(expr)) throw new Error('Use only numbers, parentheses, +, −, ×, ÷, or %.');
  let value;
  try { value=Function(`"use strict";return (${expr})`)(); } catch { throw new Error('That expression could not be evaluated.'); }
  if(!Number.isFinite(value)) throw new Error('The result must be finite.');
  if(!Number.isInteger(value)||value<0||value>60) throw new Error('For this generator, use an expression with an integer result from 0 to 60.');
  $('#jsf-answer').textContent=String(value); $('#jsf-code').textContent=jsfuckInteger(value);
}
$('#jsf-run').addEventListener('click',()=>protect(runJSFuck,'#jsfuck .result'));
runJSFuck();

// 16 Befunge maze
const mazeRows=[
  '#########',
  '#S#     #',
  '# # ### #',
  '# #   # #',
  '# ### # #',
  '#     #G#',
  '#########'
];
let mazePos={r:1,c:1};
function renderMaze(){
  const box=$('#maze'); box.innerHTML='';
  mazeRows.forEach((row,r)=>[...row].forEach((ch,c)=>{
    const d=document.createElement('div'); d.className='maze-cell';
    if(ch==='#') d.classList.add('wall'); if(ch==='G') d.classList.add('goal');
    if(mazePos.r===r&&mazePos.c===c){d.classList.add('player');d.textContent='@';}
    else if(ch==='G') d.textContent='G'; else if(ch==='S') d.textContent='S';
    box.appendChild(d);
  }));
}
function moveMaze(dir){
  const delta={up:[-1,0],down:[1,0],left:[0,-1],right:[0,1]}[dir];
  const nr=mazePos.r+delta[0],nc=mazePos.c+delta[1];
  if(mazeRows[nr][nc]==='#'){ $('#maze-detail').textContent='Wall. Choose another direction.'; return; }
  mazePos={r:nr,c:nc}; renderMaze();
  if(mazeRows[nr][nc]==='G'){ $('#maze-answer').textContent='EXIT FOUND.'; $('#maze-detail').textContent='You navigated the two-dimensional program maze.'; }
  else { $('#maze-answer').textContent='Keep going.'; $('#maze-detail').textContent=`Position: row ${nr}, column ${nc}`; }
}
$$('.maze-controls button').forEach(b=>b.addEventListener('click',()=>moveMaze(b.dataset.dir)));
$('#maze-reset').addEventListener('click',()=>{mazePos={r:1,c:1};renderMaze();$('#maze-answer').textContent='Find the exit.';$('#maze-detail').textContent='The source language itself is spatial, so this companion is too.';});
renderMaze();

// 17 Brainfuck Caesar companion
function shiftText(text, shift){
  return [...text].map(ch=>{
    const code=ch.codePointAt(0); let base=null;
    if(code>=65&&code<=90) base=65; else if(code>=97&&code<=122) base=97; else return ch;
    return String.fromCodePoint(base+((code-base+shift)%26+26)%26);
  }).join('');
}
function runBF(){
  const msg=$('#bf-message').value, raw=integerValue('#bf-shift','shift'); if(raw<0||raw>25) throw new Error('Choose a shift from 0 to 25.');
  const mode=$('#bf-mode').value, s=mode==='encode'?raw:-raw, result=shiftText(msg,s);
  $('#bf-answer').textContent=result||'(empty message)';
  const signs=(mode==='encode'?'+':'-').repeat(raw); $('#bf-fragment').textContent=`,${signs}.`;
  $('#bf-detail').textContent=`One-character version: ,${signs}.`;
}
$('#bf-run').addEventListener('click',()=>protect(runBF,'#brainfuck .result'));
$('#bf-mode').addEventListener('change',()=>{$('#bf-run').textContent=$('#bf-mode').value==='encode'?'ENCODE':'DECODE';});
runBF();

// 18 AHHH
function runAhhh(){
  const n=numberValue('#ahhh-n'),op=$('#ahhh-op').value,v=op==='square'?n*n:n*n*n;
  $('#ahhh-answer').textContent=String(Number(v.toFixed(8))); $('#ahhh-detail').textContent=op==='square'?`${n}²`:`${n}³`;
}
$('#ahhh-run').addEventListener('click',()=>protect(runAhhh,'#ahhh .result'));

// 19 HQ9+
let hqAccumulator=0;
function bottlesPreview(){
  const lines=[]; for(let n=99;n>=96;n--) lines.push(`${n} bottles of beer on the wall, ${n} bottles of beer…`);
  lines.push('…'); return lines.join('\n');
}
$('#hq-run').addEventListener('click',()=>{
  const c=$('#hq-command').value;
  if(c==='H'){ $('#hq-answer').textContent='Hello, world!'; $('#hq-detail').textContent='H has one job.'; }
  else if(c==='Q'){ $('#hq-answer').textContent='9'; $('#hq-detail').textContent='Q prints this program\'s source. The source file here is simply: 9'; }
  else if(c==='9'){ $('#hq-answer').textContent='99 Bottles'; $('#hq-detail').textContent=bottlesPreview(); }
  else { hqAccumulator++; $('#hq-answer').textContent=`Accumulator = ${hqAccumulator}`; $('#hq-detail').textContent='+ increments the accumulator and prints nothing in the language itself.'; }
});

// MOON interpreter
const moonExamples={
  countdown:{src:'🌒🌒🌒🌒🌒\n🪐\n⭐🌘\n☄️',input:''},
  addition:{src:'📡🚀📡🛸\n🪐\n🌘🚀🌒🛸\n☄️\n🚀⭐',input:'7 35'},
  triple:{src:'📡\n🚀🌑\n🛸🪐🌘🚀🌒🌒🌒🛸☄️\n🚀⭐',input:'14'}
};
const moonAllowed=new Set(['🌒','🌘','🌑','🚀','🛸','🌕','⭐','📡','🪐','☄']);
let moonState=null;
function tokenizeMoon(src){
  const tokens=Array.from(src.replace(/\uFE0F/g,'')).filter(ch=>! /\s/u.test(ch));
  for(const t of tokens) if(!moonAllowed.has(t)) throw new Error(`EARTHLY SYMBOL DETECTED: ${t}`);
  return tokens;
}
function compileMoon(src,input){
  const tokens=tokenizeMoon(src),match=new Map(),stack=[];
  tokens.forEach((t,i)=>{if(t==='🪐')stack.push(i);else if(t==='☄'){if(!stack.length)throw new Error('DEORBIT LOST IN SPACE: unmatched ☄️');const j=stack.pop();match.set(i,j);match.set(j,i);}});
  if(stack.length) throw new Error('ORBIT LOST IN SPACE: unmatched 🪐');
  const inputs=input.trim()?input.trim().split(/\s+/).map(Number):[];
  return {tokens,match,inputs,ip:0,p:0,mem:[0],inputIndex:0,output:'',steps:0,done:false};
}
function moonStep(state){
  if(state.done) return state;
  if(state.ip>=state.tokens.length){state.done=true;return state;}
  if(++state.steps>250000) throw new Error('MISSION ABORTED: execution limit exceeded.');
  const x=state.tokens[state.ip];
  if(x==='🌒')state.mem[state.p]=(state.mem[state.p]+1)&255;
  else if(x==='🌘')state.mem[state.p]=(state.mem[state.p]+255)&255;
  else if(x==='🌑')state.mem[state.p]=0;
  else if(x==='🚀'){state.p++;if(state.mem[state.p]===undefined)state.mem[state.p]=0;}
  else if(x==='🛸'){if(state.p===0)throw new Error('ASTRONAUT ATTEMPTED TO LEAVE THE KNOWN UNIVERSE.');state.p--;}
  else if(x==='🌕')state.output+=String.fromCodePoint(state.mem[state.p]);
  else if(x==='⭐')state.output+=String(state.mem[state.p]);
  else if(x==='📡'){
    const v=state.inputs[state.inputIndex++]; if(!Number.isInteger(v)||v<0||v>255)throw new Error('📡 NO VALID SIGNAL RECEIVED (use integers 0–255).'); state.mem[state.p]=v;
  }
  else if(x==='🪐'&&state.mem[state.p]===0)state.ip=state.match.get(state.ip);
  else if(x==='☄'&&state.mem[state.p]!==0)state.ip=state.match.get(state.ip);
  state.ip++;
  if(state.ip>=state.tokens.length)state.done=true;
  return state;
}
function renderMoon(){
  const s=moonState; if(!s){$('#moon-output').textContent='';$('#moon-ip').textContent='';$('#moon-memory').innerHTML='';return;}
  $('#moon-output').textContent=s.output || '(no output yet)';
  const next=s.done?'mission complete':`next: ${s.tokens[s.ip]} · instruction ${s.ip+1}/${s.tokens.length}`;
  $('#moon-ip').textContent=`${next} · ${s.steps} step${s.steps===1?'':'s'}`;
  const mem=$('#moon-memory'); mem.innerHTML='';
  s.mem.slice(0,12).forEach((v,i)=>{const d=document.createElement('div');d.className='planet'+(i===s.p?' active':'');d.textContent=`${i}: ${v}${i===s.p?' 👨‍🚀':''}`;mem.appendChild(d);});
}
function loadMoonExample(){
  const ex=moonExamples[$('#moon-example').value]; $('#moon-source').value=ex.src; $('#moon-input').value=ex.input; moonState=null; renderMoon();
}
function resetMoonState(){moonState=compileMoon($('#moon-source').value,$('#moon-input').value);renderMoon();}
$('#moon-example').addEventListener('change',loadMoonExample);
$('#moon-reset').addEventListener('click',()=>{loadMoonExample();resetMoonState();});
$('#moon-step').addEventListener('click',()=>{try{if(!moonState)resetMoonState();moonStep(moonState);renderMoon();}catch(e){$('#moon-output').textContent='🌑 MOON ERROR\n'+e.message;}});
$('#moon-run').addEventListener('click',()=>{try{resetMoonState();while(!moonState.done)moonStep(moonState);renderMoon();}catch(e){$('#moon-output').textContent='🌑 MOON ERROR\n'+e.message;}});
$('#moon-source').addEventListener('input',()=>{moonState=null;renderMoon();});
$('#moon-input').addEventListener('input',()=>{moonState=null;renderMoon();});
loadMoonExample(); resetMoonState();


// -----------------------------------------------------------------------------
// Live source views
// The controls on the right are also the source generator. These views reset on
// refresh; nothing is stored in the browser.
// -----------------------------------------------------------------------------
function putSource(id, text) {
  const el = $(id);
  if (el) el.textContent = text;
}
function watchSource(ids, fn) {
  ids.forEach(id => {
    const el = $(id);
    if (!el) return;
    el.addEventListener('input', fn);
    el.addEventListener('change', fn);
  });
}
function safeNumber(id, fallback = 0) {
  const n = Number($(id)?.value);
  return Number.isFinite(n) ? n : fallback;
}
function safeInt(id, fallback = 0) { return Math.trunc(safeNumber(id, fallback)); }

function sourceCow() {
  const a=safeNumber('#cow-a'), b=safeNumber('#cow-b'), op=$('#cow-op').value;
  if (op==='/' && b===0) { putSource('#cow-source-view','[[ division by zero ]]'); return; }
  const v=op==='+'?a+b:op==='-'?a-b:op==='*'?a*b:a/b;
  const symbol=op==='*'?'×':op==='/'?'÷':op;
  if (!Number.isInteger(v) || Math.abs(v)>500) {
    putSource('#cow-source-view',`[[ ${a} ${symbol} ${b} = ${Number(v.toFixed(6))} ]]\n\noom\nmoO\noom\n\n[[ browser companion handles this non-small-integer case ]]`);
    return;
  }
  const steps=(v>=0?'MoO ':'MOo ').repeat(Math.abs(v)).trim();
  putSource('#cow-source-view',`[[ ${a} ${symbol} ${b} = ${v} ]]\nOOO\n${steps}${steps?'\n':''}OOM`);
}

function wsPushNumber(n){
  const sign=n<0?'\t':' ';
  const bits=Math.abs(n).toString(2).replace(/0/g,' ').replace(/1/g,'\t');
  return '  '+sign+bits+'\n';
}
const WS_OUT_CHAR='\t\n  ';
function whitespaceProgramFor(text){
  return [...text].map(ch=>wsPushNumber(ch.codePointAt(0))+WS_OUT_CHAR).join('');
}
function whitespaceCurrentText(){
  try{
    const {y,date}=parseMMDDYYYY($('#ws-date').value), mode=$('#ws-mode').value;
    if(mode==='weekday') return ['SUNDAY','MONDAY','TUESDAY','WEDNESDAY','THURSDAY','FRIDAY','SATURDAY'][date.getUTCDay()];
    if(mode==='dayofyear') return `DAY ${Math.floor((date.getTime()-Date.UTC(y,0,1))/86400000)+1}`;
    return (y%4===0&&(y%100!==0||y%400===0))?'LEAP YEAR':'COMMON YEAR';
  }catch{return 'INVALID DATE';}
}
function sourceWhitespace(){
  const raw=whitespaceProgramFor(whitespaceCurrentText());
  $('#ws-visible').textContent=raw.replace(/ /g,'·').replace(/\t/g,'⇥').replace(/\n/g,'↵\n');
}

const pietBase={red:'#ff0000',yellow:'#ffff00',blue:'#0000ff',orange:'#ff8a00',purple:'#800080',green:'#00a050'};
const pietLight={red:'#ffc0c0',yellow:'#ffffc0',blue:'#c0c0ff',orange:'#ffd5a0',purple:'#d7b7e8',green:'#bce6c6'};
const pietDark={red:'#c00000',yellow:'#c0c000',blue:'#0000c0',orange:'#bd5d00',purple:'#5b1b68',green:'#006f38'};
function sourcePiet(){
  const a=$('#piet-a').value,b=$('#piet-b').value,[name]=mixMap[`${a}|${b}`],c=name.toLowerCase();
  const grid=$('#piet-grid'); grid.innerHTML='';
  const N=12;
  for(let r=0;r<N;r++) for(let col=0;col<N;col++){
    const d=document.createElement('span'); d.className='piet-codel';
    let color='#fff';
    if(r===0||col===0||r===N-1||col===N-1) color='#111';
    else if(r<=4 && col<=4) color=((r+col)%3===0?pietLight[a]:(r+col)%3===1?pietBase[a]:pietDark[a]);
    else if(r<=4 && col>=7) color=((r+col)%3===0?pietLight[b]:(r+col)%3===1?pietBase[b]:pietDark[b]);
    else if(r>=7 && col>=3 && col<=8) color=((r+col)%3===0?pietLight[c]:(r+col)%3===1?pietBase[c]:pietDark[c]);
    else if((r===5||r===6) && col>1 && col<10) color=(col%2?'#fff':'#000');
    else color=((r*3+col)%5===0?'#000':'#fff');
    d.style.background=color; grid.appendChild(d);
  }
  grid.setAttribute('aria-label',`${a} and ${b} flowing through a compact square codel grid toward ${c}`);
}

function sourceHexagony(){
  const n=Math.max(1,safeInt('#hex-n',1)), centered=$('#hex-mode').value==='centered';
  const core=centered?`3 ${n} ${n-1} * * 1 +`:`${n} 2 ${n} * 1 - *`;
  putSource('#hexagony-source-view',`        . . .\n      . ${centered?'C':'H'} . .\n    . ${n} . . .\n  . ${core} .\n    . . . . .\n      . O @ .\n        . . .`);
}
function sourceArnold(){
  const n=Math.max(1,Math.min(20,safeInt('#arnold-start',5))), line=$('#arnold-line').value;
  putSource('#arnoldc-source-view',`IT'S SHOWTIME\nHEY CHRISTMAS TREE n\nYOU SET US UP ${n}\nHEY CHRISTMAS TREE running\nYOU SET US UP @NO PROBLEMO\nSTICK AROUND running\nTALK TO THE HAND n\nGET TO THE CHOPPER n\nHERE IS MY INVITATION n\nGET DOWN 1\nENOUGH TALK\nGET TO THE CHOPPER running\nHERE IS MY INVITATION n\nLET OFF SOME STEAM BENNET 0\nENOUGH TALK\nCHILL\nTALK TO THE HAND "${line}"\nYOU HAVE BEEN TERMINATED`);
}
function sourceBeatnik(){
  const text=$('#beatnik-word').value.toUpperCase(), letters=[...text].filter(c=>/[A-Z]/.test(c));
  const lines=letters.map(c=>`${c.padEnd(2)} ${String(scrabble[c]||0).padStart(2)} points`);
  const total=letters.reduce((s,c)=>s+(scrabble[c]||0),0);
  putSource('#beatnik-source-view',`current phrase\n──────────────\n${text||'(empty)'}\n\nScrabble-valued words drive Beatnik opcodes.\nThis live view exposes the current score map:\n\n${lines.join('\n')}\n──────────────\nTOTAL ${total}`);
}
function sourceChef(){
  const batches=Math.max(0,safeInt('#chef-batches')), per=Math.max(0,safeInt('#chef-per')), eaten=Math.max(0,safeInt('#chef-eaten'));
  putSource('#chef-source-view',`Current Cookie Batch.\n\nIngredients.\n${per} g cookies per batch\n${batches} g batches\n${eaten} g taste tested\n\nMethod.\nPut batches into mixing bowl.\nCombine cookies per batch into mixing bowl.\nRemove taste tested from mixing bowl.\nPour contents of the mixing bowl into the baking dish.\n\nServes 1.`);
}
function sourceShakespeare(){
  const a=safeNumber('#spl-a'),b=safeNumber('#spl-b'),op=$('#spl-op').value,words=op==='>'?'greater than':op==='<'?'less than':'equal to';
  putSource('#shakespeare-source-view',`To Be or Not To Be.\n\nRomeo, whose present value is ${a}.\nJuliet, whose present value is ${b}.\n\nAct I: The Comparison.\nScene I: The Question.\n\n[Enter Romeo and Juliet]\n\nRomeo:\nAm I ${words} you?\n\nJuliet:\nLet the truth of that comparison decide whether we are to be.`);
}
function sourceLOL(){
  const age=Math.max(0,safeNumber('#lol-age')),method=$('#lol-method').value;
  if(method==='simple') putSource('#lolcode-source-view',`HAI 1.2\nI HAS A AGE ITZ ${age}\nI HAS A HUMAN ITZ PRODUKT OF AGE AN 7\nVISIBLE "APPROX HUMAN YEARS: " HUMAN\nKTHXBYE`);
  else {
    let human=age<=1?15*age:age<=2?15+(age-1)*9:24+(age-2)*4;
    putSource('#lolcode-source-view',`HAI 1.2\nBTW staged life-age choice from the controls\nI HAS A AGE ITZ ${age}\nI HAS A HUMAN ITZ ${Number(human.toFixed(1))}\nVISIBLE "STAGED HUMAN YEARS: " HUMAN\nKTHXBYE`);
  }
}
function sourceRockstar(){
  const move=rpsMove||'choose a move';
  putSource('#rockstar-source-view',`The Crowd is waiting\nMy move is ${move}\nThe rival is mysterious\n\nListen to my move\nListen to the rival\n\nIf my move is the rival\nShout "ENCORE"\n\nOtherwise\nShout the winner\n\n(current browser round: ${move})`);
}
function sourceIntercal(){
  const a=safeNumber('#inter-a'),b=safeNumber('#inter-b'),op=$('#inter-op').value,fmt=$('#inter-format').value;
  putSource('#intercal-source-view',`PLEASE NOTE CURRENT VALUES: ${a} ${op} ${b}\nPLEASE NOTE OUTPUT MODE: ${fmt.toUpperCase()}\n\nPLEASE DO :1 <- #${Math.trunc(Math.abs(a))}\nDO :2 <- #${Math.trunc(Math.abs(b))}\nPLEASE DO READ OUT :1\nDO READ OUT :2\nDO GIVE UP\n\nINTERCAL is intentionally perverse; this view tracks the current choices while the reference file shows the original Roman-numeral experiment.`);
}
function sourceOok(){
  const apes=Math.max(0,safeInt('#ook-apes')),rate=Math.max(0,safeInt('#ook-rate')),days=Math.max(0,safeInt('#ook-days'));
  putSource('#ook-source-view',`Ook! Ook?   [apes = ${apes}]\nOok. Ook.   [bananas / ape / day = ${rate}]\nOok! Ook!   [days = ${days}]\n\nOok. Ook? Ook. Ook? Ook! Ook.\nOok! Ook? Ook. Ook! Ook! Ook.\n\nCurrent total: ${apes*rate*days} bananas\n\nThe bracketed values are the live companion settings; the reference file contains the original Ook! program.`);
}
function sourceChicken(){
  const c=Math.max(0,safeInt('#chick-count')),rate=Math.max(0,safeNumber('#chick-rate')),days=Math.max(0,safeInt('#chick-days'));
  const rows=Math.max(1,Math.min(8,c));
  putSource('#chicken-source-view',`current flock: ${c}\nrate: ${rate}\ndays: ${days}\n\n${Array.from({length:rows},(_,i)=>'chicken '.repeat((i%6)+1).trim()).join('\n')}\n\n≈ ${Math.round(c*rate*days)} eggs`);
}
let malbolgeReference="(=BA#9\"=<;:3y7x54-21q/p-,+*)\"!h%B0/.\n~P<\n<:(8&\n66#\"!~}|{zyxwvu\ngJ%\n";
function sourceMalbolge(){
  const n=Math.max(1,Math.min(25,safeInt('#mal-start',9))),base=Number($('#mal-base').value);
  putSource('#malbolge-source-view',`[browser companion: start ${n}, base ${base}]\n\n${malbolgeReference}\n\nMalbolge source is self-modifying; the reference program itself stays fixed while the companion settings above update.`);
}
function sourceJSFuck(){
  let expr=$('#jsf-expr').value.trim();
  try{
    if(!/^[0-9+\-*/%().\s]+$/.test(expr)) throw 0;
    const v=Function(`"use strict";return (${expr})`)();
    if(Number.isInteger(v)&&v>=0&&v<=60) putSource('#jsfuck-source-view',jsfuckInteger(v));
    else putSource('#jsfuck-source-view','// generated source appears for an integer result from 0 to 60');
  }catch{putSource('#jsfuck-source-view','// enter a valid small arithmetic expression');}
}
function sourceBefunge(){
  const rows=mazeRows.map((row,r)=>[...row].map((ch,c)=>mazePos.r===r&&mazePos.c===c?'@':ch).join(''));
  putSource('#befunge-source-view',rows.join('\n'));
}
function bfPrintProgram(text){
  let cur=0,out='';
  for(const ch of [...text]){
    const target=ch.codePointAt(0); let delta=target-cur;
    if(delta>0) out+='+'.repeat(delta); else out+='-'.repeat(-delta);
    out+='.'; cur=target;
  }
  return out;
}
function sourceBrainfuck(){
  const msg=$('#bf-message').value,raw=Math.max(0,Math.min(25,safeInt('#bf-shift',3))),mode=$('#bf-mode').value;
  const result=shiftText(msg,mode==='encode'?raw:-raw);
  putSource('#brainfuck-source-view',bfPrintProgram(result));
}
function sourceAHHH(){
  const n=safeNumber('#ahhh-n'),op=$('#ahhh-op').value;
  const count=Math.max(1,Math.min(24,Math.abs(Math.trunc(n))));
  putSource('#ahhh-source-view',`${'A'.repeat(op==='cube'?3:2)}${'H'.repeat(count)}\n${'a'.repeat(op==='cube'?3:2)}${'h'.repeat(Math.max(1,Math.floor(count/2)))}\n\n[current choice: ${op}(${n})]`);
}
function sourceHQ(){ putSource('#hq9plus-source-view',$('#hq-command').value); }

function initLiveSources(){
  const entries=[
    [['#cow-a','#cow-b','#cow-op'],sourceCow],
    [['#ws-date','#ws-mode'],sourceWhitespace],
    [['#piet-a','#piet-b'],sourcePiet],
    [['#hex-n','#hex-mode'],sourceHexagony],
    [['#arnold-start','#arnold-line'],sourceArnold],
    [['#beatnik-word'],sourceBeatnik],
    [['#chef-batches','#chef-per','#chef-eaten'],sourceChef],
    [['#spl-a','#spl-op','#spl-b'],sourceShakespeare],
    [['#lol-age','#lol-method'],sourceLOL],
    [[],sourceRockstar],
    [['#inter-a','#inter-op','#inter-b','#inter-format'],sourceIntercal],
    [['#ook-apes','#ook-rate','#ook-days'],sourceOok],
    [['#chick-count','#chick-rate','#chick-days'],sourceChicken],
    [['#mal-start','#mal-base'],sourceMalbolge],
    [['#jsf-expr'],sourceJSFuck],
    [[],sourceBefunge],
    [['#bf-message','#bf-shift','#bf-mode'],sourceBrainfuck],
    [['#ahhh-n','#ahhh-op'],sourceAHHH],
    [['#hq-command'],sourceHQ]
  ];
  entries.forEach(([ids,fn])=>{watchSource(ids,fn);fn();});
  $$('#rps-buttons button').forEach(b=>b.addEventListener('click',sourceRockstar));
  $$('.maze-controls button').forEach(b=>b.addEventListener('click',sourceBefunge));
  $('#maze-reset').addEventListener('click',sourceBefunge);
  $('#cow-run').addEventListener('click',sourceCow);
  $('#ws-run').addEventListener('click',sourceWhitespace);
  $('#piet-run').addEventListener('click',sourcePiet);
  $('#hex-run').addEventListener('click',sourceHexagony);
  $('#arnold-run').addEventListener('click',sourceArnold);
  $('#beatnik-run').addEventListener('click',sourceBeatnik);
  $('#chef-run').addEventListener('click',sourceChef);
  $('#spl-run').addEventListener('click',sourceShakespeare);
  $('#lol-run').addEventListener('click',sourceLOL);
  $('#inter-run').addEventListener('click',sourceIntercal);
  $('#ook-run').addEventListener('click',sourceOok);
  $('#chick-run').addEventListener('click',sourceChicken);
  $('#mal-run').addEventListener('click',sourceMalbolge);
  $('#jsf-run').addEventListener('click',sourceJSFuck);
  $('#bf-run').addEventListener('click',sourceBrainfuck);
  $('#ahhh-run').addEventListener('click',sourceAHHH);
  $('#hq-run').addEventListener('click',sourceHQ);
}
initLiveSources();
