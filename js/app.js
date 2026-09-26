import {createGame,resetGame,startTurn,cycleCard,clearSelection,resetCards,attack,isWin,isLose,nextEnemy,setDifficulty} from "./game.js";
import {render,setResult,setLog,showEnd,hideEnd,showDamage,showEnemyHit,showEnemyAttack} from "./ui.js";

const state=createGame();
const startScreen=document.getElementById("startScreen");
const gameScreen=document.getElementById("gameScreen");
const difficultyButtons=[...document.querySelectorAll("#difficultyButtons button")];
const startButton=document.getElementById("startButton");
const bestRecord=document.getElementById("bestRecord");
const RECORD_KEY="core-numberbattle-best";
function getBest(key){try{return Number(JSON.parse(localStorage.getItem(RECORD_KEY)||"{}")[key]||0)}catch(e){return 0}}
function updateStartRecord(){if(bestRecord)bestRecord.textContent=getBest(document.querySelector("#difficultyButtons button.active")?.dataset.difficulty||"normal")+"体";}
function saveBest(){const key=state.difficulty;if(state.defeated<=getBest(key))return;try{const data=JSON.parse(localStorage.getItem(RECORD_KEY)||"{}");data[key]=state.defeated;localStorage.setItem(RECORD_KEY,JSON.stringify(data));}catch(e){} updateStartRecord();}
function showStart(){
  hideEnd();
  startScreen.classList.add("show");
  updateStartRecord();
  gameScreen.classList.remove("show");
}
function setBattleBackground(){
  const sets={easy:["grassland.webp","forest.webp","riverbank.webp"],normal:["ruins.webp","cave.webp","training-ground.webp"],hard:["volcano.webp","sea.webp","sky-island.webp"]};
  const pool=sets[state.difficulty]||sets.normal;
  const file=pool[Math.floor(Math.random()*pool.length)];
  document.getElementById("battleBg").style.backgroundImage=`url("https://tt-sensei.github.io/navi-character-/assets/web/fantasy/backgrounds/${file}")`;
}
function startBattle(){
  const active=difficultyButtons.find(b=>b.classList.contains("active"));
  setDifficulty(state,active?.dataset.difficulty||"normal");
  resetGame(state);
  setBattleBackground();
  startScreen.classList.remove("show");
  gameScreen.classList.add("show");
  setLog("<strong>START</strong>　"+active.textContent+"でバトルスタート。");
  render(state);
}
difficultyButtons.forEach(button=>button.addEventListener("click",()=>{
  difficultyButtons.forEach(b=>b.classList.remove("active"));
  button.classList.add("active");
  updateStartRecord();
}));
if(startButton)startButton.addEventListener("click",startBattle);
function newGame(){ showStart(); }
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
      saveBest();
      setBattleBackground();
      setLog("<strong>つぎのナビアン！</strong>　"+state.monster[0]+" があらわれた。");
      render(state);
    },1500);
    return;
  }
  if(enemyTurn){
    setTimeout(()=>{
      showEnemyAttack();
      setLog("<strong>こうげき！</strong>　敵のこうげきで "+outcome.enemyDamage+"ダメージ。");
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
showStart();