import {currentCalc} from "./game.js";

export function render(state){
  document.getElementById("core").textContent=state.core;
  document.getElementById("enemyHpText").textContent=state.enemyHP+" / 30";
  document.getElementById("playerHpText").textContent=state.playerHP+" / 20";
  document.getElementById("enemyHp").style.width=Math.max(0,state.enemyHP/30*100)+"%";
  document.getElementById("playerHp").style.width=Math.max(0,state.playerHP/20*100)+"%";
  if(state.monster){
    const img=document.getElementById("monsterImg");
    img.src=state.monster[1]; img.alt=state.monster[0];
    document.getElementById("monsterName").textContent=state.monster[0];
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
}
export function updateExpression(state){
  const expression=document.getElementById("expression"),result=document.getElementById("result");
  if(!state.selected.length){expression.textContent="カードをえらぼう";return;}
  const expr=state.selected.map((s,i)=>{
    const n=state.hand[s.i]; if(i===0)return String(n);
    return (s.sign===1?"＋":"−")+n;
  }).join("");
  const total=currentCalc(state);
  expression.textContent=expr+" ＝";
  result.textContent=total<0?"0未満にはできません":"コアまであと "+Math.abs(state.core-total);
}
export function showDamage(type,damage=0){
  const fx=document.getElementById("damageFx"),text=document.getElementById("damageText");
  if(!fx||!text)return;
  fx.className="damage-fx "+(type==="break"?"core":"normal");
  text.textContent=type==="break"?"CORE BREAK!":"−"+damage;
  void fx.offsetWidth;
  fx.classList.add("show");
  setTimeout(()=>{fx.className="damage-fx";},950);
}
export function setResult(state,message){
  document.getElementById("result").textContent=message;
}
export function setLog(html){document.getElementById("log").innerHTML=html;}
export function showEnd(win){
  document.getElementById("modalTitle").textContent=win?"WIN":"LOSE";
  document.getElementById("modalText").textContent=win?"コアをねらって、敵を倒した！":"HPが0になった。もう一度挑戦しよう。";
  document.getElementById("overlay").classList.add("show");
}
export function hideEnd(){document.getElementById("overlay").classList.remove("show");}