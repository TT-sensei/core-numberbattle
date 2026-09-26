import {ENEMY_MAX,PLAYER_MAX,CORE_MIN,CORE_MAX} from "./constants.js";
import {NAVIAN_MONSTERS} from "./monsters.js";

const rnd=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

export function createGame(){
  return {enemyHP:ENEMY_MAX,playerHP:PLAYER_MAX,core:0,hand:[],selected:[],locked:false,monster:null};
}
export function resetGame(state){
  state.enemyHP=ENEMY_MAX; state.playerHP=PLAYER_MAX; state.locked=false;
  state.monster=NAVIAN_MONSTERS[rnd(0,NAVIAN_MONSTERS.length-1)];
  startTurn(state);
}
export function startTurn(state){
  if(state.locked)return;
  state.core=rnd(CORE_MIN,CORE_MAX);
  state.hand=Array.from({length:4},()=>rnd(1,9));
  state.selected=[];
}
export function cycleCard(state,i){
  if(state.locked)return;
  const found=state.selected.find(x=>x.i===i);
  if(!found){state.selected.push({i,sign:1});}
  else if(found.sign===1){
    if(state.selected[0].i!==i)found.sign=-1;
    else state.selected=state.selected.filter(x=>x.i!==i);
  }else state.selected=state.selected.filter(x=>x.i!==i);
}
export function clearSelection(state){if(!state.locked)state.selected=[];}
export function currentCalc(state){
  return state.selected.reduce((sum,s)=>sum+state.hand[s.i]*s.sign,0);
}
function baseDamage(diff){
  if(diff<=2)return 5;
  if(diff<=4)return 4;
  if(diff<=6)return 3;
  if(diff<=8)return 2;
  if(diff<=10)return 1;
  return 0;
}
function bonus(n){if(n>=4)return 2;if(n>=3)return 1;return 0;}

export function attack(state){
  if(state.locked||state.selected.length===0)return {type:"none"};
  const total=currentCalc(state),used=state.selected.length;
  if(total<0){
    state.playerHP=Math.max(0,state.playerHP-3);
    return {type:"fail",message:"答えが0未満になった。",result:"0未満にはできません"};
  }
  if(total>state.core){
    state.playerHP=Math.max(0,state.playerHP-3);
    return {type:"fail",message:"コアを "+(total-state.core)+" 超えた！",result:"攻撃失敗"};
  }
  const diff=state.core-total;
  if(diff===0){
    state.enemyHP=0;
    return {type:"break",message:"コアを完全にとらえた！",result:"30ダメージ"};
  }
  if(diff>10){
    state.playerHP=Math.max(0,state.playerHP-3);
    return {type:"fail",message:"コアから遠すぎた。",result:"ダメージ 0"};
  }
  const dmg=baseDamage(diff)+bonus(used);
  state.enemyHP=Math.max(0,state.enemyHP-dmg);
  return {type:"hit",damage:dmg,diff,used,message:"コアとの差は "+diff+"。",result:"ダメージ "+dmg+"（"+used+"枚）"};
}
export function isWin(state){return state.enemyHP<=0;}
export function isLose(state){return state.playerHP<=0;}