import {currentCalc} from "./game.js";

let audioCtx;
function playSfx(type){
  try{
    audioCtx=audioCtx||new (window.AudioContext||window.webkitAudioContext)();
    if(audioCtx.state==="suspended")audioCtx.resume();
    const now=audioCtx.currentTime;
    const o=audioCtx.createOscillator(),g=audioCtx.createGain();
    o.connect(g);g.connect(audioCtx.destination);
    if(type==="break"){
      o.type="sawtooth";o.frequency.setValueAtTime(120,now);o.frequency.exponentialRampToValueAtTime(760,now+.18);o.frequency.exponentialRampToValueAtTime(90,now+.75);
      g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(.22,now+.025);g.gain.exponentialRampToValueAtTime(.001,now+.8);o.start(now);o.stop(now+.82);
    }else{
      o.type="square";o.frequency.setValueAtTime(180,now);o.frequency.exponentialRampToValueAtTime(80,now+.16);
      g.gain.setValueAtTime(.001,now);g.gain.exponentialRampToValueAtTime(.12,now+.01);g.gain.exponentialRampToValueAtTime(.001,now+.18);o.start(now);o.stop(now+.2);
    }
  }catch(e){}
}

export function render(state){
  document.getElementById("core").textContent=state.core;
  const enemyMax=(state.difficulty==="easy"?25:state.difficulty==="hard"?35:30);
  document.getElementById("enemyHpText").textContent=state.enemyHP+" / "+enemyMax;
  const defeated=document.getElementById("defeated");
  if(defeated) defeated.textContent=state.defeated+"体";
  document.getElementById("playerHpText").textContent=state.playerHP+" / 20";
  document.getElementById("enemyHp").style.width=Math.max(0,state.enemyHP/enemyMax*100)+"%";
  document.getElementById("playerHp").style.width=Math.max(0,state.playerHP/20*100)+"%";
  if(state.monster){
    const img=document.getElementById("monsterImg");
    img.src=state.monster[1]; img.alt=state.monster[0];
    document.getElementById("monsterName").textContent=state.monster[0];
    const tags={easy:"NAVIAN",normal:"EVO NAVI",hard:"BOSS NAVI"};
    const tag=document.querySelector(".enemy-tag");
    if(tag)tag.textContent=tags[state.difficulty]||"NAVIAN";
  }
  const hand=document.getElementById("hand"); hand.innerHTML="";
  state.hand.forEach((value,i)=>{
    const s=state.selected.find(x=>x.i===i);
    const card=document.createElement("button");
    card.className="card"+(s?(s.sign===1?" selected-plus":" selected-minus"):"");
    card.type="button"; card.dataset.index=i;
    card.innerHTML='<div class="op"><span class="badge">'+(s?(s.sign===1?"＋":"−"):"・")+'</span><span class="state">'+(s?"使用":"未使用")+'</span></div><div class="num">'+value+"</div>";
    hand.appendChild(card);
  });
  updateExpression(state);
  document.getElementById("attack").disabled=state.selected.length===0||state.locked;
  const reset=document.getElementById("resetCards");
  if(reset){reset.disabled=!state.resetAvailable||state.locked;reset.textContent=state.resetAvailable?"カードをリセット":"カードリセット済み";}
}
export function updateExpression(state){
  const expression=document.getElementById("expression"),result=document.getElementById("result");
  if(!state.selected.length){expression.textContent="カードをえらぼう";return;}
  const expr=state.selected.map((s,i)=>{
    const n=state.hand[s.i]; if(i===0)return String(n);
    return (s.sign===1?"＋":"−")+n;
  }).join("");
  const total=currentCalc(state);
  expression.textContent=expr+" ＝"+(state.lastTotal!==null?total:"");
  result.textContent=state.lastTotal!==null?result.textContent:"";
}
export function showDamage(type,damage=0){
  const fx=document.getElementById("damageFx"),text=document.getElementById("damageText");
  if(!fx||!text)return;
  fx.className="damage-fx "+(type==="break"?"core":type==="enemy"?"enemy":"normal");
  playSfx(type);
  text.textContent=type==="break"?"CORE BREAK!":"−"+damage;
  void fx.offsetWidth;
  fx.classList.add("show");
  setTimeout(()=>{fx.className="damage-fx";},1500);
}
export function showEnemyHit(){
  const img=document.getElementById("monsterImg");
  if(!img)return;
  img.classList.remove("enemy-hit");
  void img.offsetWidth;
  img.classList.add("enemy-hit");
}
export function showEnemyCharge(current=1,max=3){
  const img=document.getElementById("monsterImg");
  const label=document.getElementById("enemyTurnLabel");
  if(img){img.classList.remove("enemy-charge");void img.offsetWidth;img.classList.add("enemy-charge");}
  if(label){label.textContent="ちからをためている…  "+current+" / "+max;label.className="enemy-turn-label charging";}
}
export function showEnemyAttack(damage=3){
  const img=document.getElementById("monsterImg");
  const label=document.getElementById("enemyTurnLabel");
  if(!img)return;
  img.classList.remove("enemy-attack");
  void img.offsetWidth;
  img.classList.add("enemy-attack");
  if(label){label.textContent="こうげき！";label.className="enemy-turn-label attacking";}
  showDamage("enemy",damage);
  const hp=document.querySelector(".player");
  if(hp){hp.classList.remove("player-damaged");void hp.offsetWidth;hp.classList.add("player-damaged");}
}
export function clearEnemyTurn(){
  const label=document.getElementById("enemyTurnLabel");
  if(label){label.textContent="";label.className="enemy-turn-label";}
  const img=document.getElementById("monsterImg");
  if(img){img.classList.remove("enemy-charge","enemy-attack");}
}

export function setResult(state,message){document.getElementById("result").textContent=message;}
export function setLog(html){document.getElementById("log").innerHTML=html;}
export function showEnd(win){
  document.getElementById("modalTitle").textContent=win?"WIN":"LOSE";
  document.getElementById("modalText").textContent=win?"コアをねらって、敵を倒した！":"HPが0になった。もう一度挑戦しよう。";
  document.getElementById("overlay").classList.add("show");
}
export function hideEnd(){document.getElementById("overlay").classList.remove("show");}