import {createGame,resetGame,startTurn,cycleCard,clearSelection,resetCards,attack,isWin,isLose,nextEnemy} from "./game.js";
import {render,setResult,setLog,showEnd,hideEnd,showDamage,showEnemyHit,showEnemyAttack} from "./ui.js";

const state=createGame();
function newGame(){
  hideEnd(); setLog("<strong>START</strong>　コアの数字に近づけよう。");
  resetGame(state); render(state);
}
document.getElementById("hand").addEventListener("click",e=>{
  const card=e.target.closest(".card"); if(!card)return;
  cycleCard(state,Number(card.dataset.index)); render(state);
});
document.getElementById("clear").addEventListener("click",()=>{clearSelection(state);render(state);});
document.getElementById("resetCards").addEventListener("click",()=>{if(resetCards(state)){setResult(state,"新しいカードになった！");setLog("カードをリセットした。もう一度コアをねらおう。");render(state);}});
document.getElementById("attack").addEventListener("click",()=>{
  const outcome=attack(state);
  if(outcome.type==="none")return;
  if(outcome.type==="break"){showDamage("break");showEnemyHit();setLog("<strong>CORE BREAK!</strong>　"+outcome.message);}
  else if(outcome.type==="hit"){showDamage("hit",outcome.damage);showEnemyHit();setLog("<strong>"+outcome.damage+"ダメージ！</strong>　"+outcome.message);}
  else setLog("<strong>こうげきしっぱい</strong>　"+outcome.message);
  setResult(state,"けいさんのこたえは "+outcome.total+"。 "+outcome.result);
  render(state);
  if(isLose(state)){setTimeout(()=>showEnd(false),550);return;}
  state.locked=true; render(state);
  const enemyTurn=outcome.enemyAttack;
  const enemyDefeated=isWin(state);
  if(enemyDefeated){
    setTimeout(()=>{
      state.locked=false;
      nextEnemy(state);
      setLog("<strong>つぎのナビアン！</strong>　"+state.monster[0]+" があらわれた。");
      render(state);
    },1500);
    return;
  }
  if(enemyTurn){
    setTimeout(()=>{
      showEnemyAttack();
      setLog("<strong>こうげき！</strong>　敵のこうげきで 3ダメージ。");
      render(state);
      if(isLose(state)){setTimeout(()=>showEnd(false),500);return;}
      setTimeout(()=>{state.locked=false;startTurn(state);render(state);},650);
    },650);
  }else{
    setTimeout(()=>{state.locked=false;startTurn(state);render(state);},650);
  }
});
document.getElementById("restart").addEventListener("click",newGame);
document.getElementById("modalRestart").addEventListener("click",newGame);
newGame();