import {createGame,resetGame,startTurn,cycleCard,clearSelection,resetCards,attack,isWin,isLose} from "./game.js";
import {render,setResult,setLog,showEnd,hideEnd,showDamage} from "./ui.js";

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
  if(outcome.type==="break"){showDamage("break");setLog("<strong>CORE BREAK!</strong>　"+outcome.message);}
  else if(outcome.type==="hit"){showDamage("hit",outcome.damage);setLog("<strong>"+outcome.damage+"ダメージ！</strong>　"+outcome.message);}
  else setLog("<strong>こうげきしっぱい</strong>　"+outcome.message);
  setResult(state,"けいさんのこたえは "+outcome.total+"。 "+outcome.result);
  render(state);
  if(isWin(state)){setTimeout(()=>showEnd(true),1500);return;}
  if(isLose(state)){showEnd(false);return;}
  state.locked=true; render(state);
  setTimeout(()=>{state.locked=false;startTurn(state);render(state);},650);
});
document.getElementById("restart").addEventListener("click",newGame);
document.getElementById("modalRestart").addEventListener("click",newGame);
newGame();