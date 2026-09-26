import {DIFFICULTIES,PLAYER_MAX,DEFAULT_DIFFICULTY} from "./constants.js";
import {getMonsterPool} from "./monsters.js";

const rnd=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

// ===== コアバトル: 逆算方式によるコア&手札生成 =====
// 生成した手札から、実際のゲームルールで成立するコアを逆算する。
// ・使用枚数は3枚または4枚
// ・＋/−の組み合わせには−を最低1つ含める
// ・コアは15〜30
// ・完成した4枚の手札で、1〜2枚だけでもコアに届いてしまう場合は作り直す

function randomCard() {
  return Math.floor(Math.random() * 9) + 1;
}

// cards に対して + / − の全パターンを試す。
// 最初のカードは + として扱う。
// （ゲーム中も最初に選んだカードは必ず + になる）
function allSignedResults(cards) {
  const n = cards.length;
  const results = [];
  if (n === 0) return results;

  const totalPatterns = 1 << (n - 1);

  for (let pattern = 0; pattern < totalPatterns; pattern++) {
    let value = cards[0];
    let minusCount = 0;

    for (let i = 1; i < n; i++) {
      const isMinus = (pattern >> (i - 1)) & 1;
      if (isMinus) {
        value -= cards[i];
        minusCount++;
      } else {
        value += cards[i];
      }
    }

    if (value >= 0) {
      results.push({ value, minusCount });
    }
  }

  return results;
}

// 4枚の手札について、1〜4枚使用時の全組み合わせを調べる。
// 4枚なら合計40パターン程度。
function allPossibleResults(cards) {
  const n = cards.length;
  const results = [];

  for (let subsetMask = 1; subsetMask < (1 << n); subsetMask++) {
    const subset = [];
    for (let i = 0; i < n; i++) {
      if ((subsetMask >> i) & 1) subset.push(cards[i]);
    }

    const signed = allSignedResults(subset);
    for (const r of signed) {
      results.push({
        value: r.value,
        cardCount: subset.length,
        minusCount: r.minusCount
      });
    }
  }

  return results;
}

function hasAccidentalMatch(results, core) {
  return results.some(
    (r) => r.cardCount <= 2 && r.value === core
  );
}

function hasValidSolution(results, core) {
  return results.some(
    (r) =>
      r.value === core &&
      r.cardCount >= 3 &&
      r.minusCount >= 1
  );
}

function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// コアと4枚の手札を、条件を満たすまで生成する。
export function generateCoreAndHand() {
  const MAX_ATTEMPTS = 500;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    // ① 3枚または4枚を選ぶ
    const useCount = Math.random() < 0.5 ? 3 : 4;

    // ② 1〜9から引く
    const usedCards = Array.from(
      { length: useCount },
      () => randomCard()
    );

    // ③ −を最低1つ含む組み合わせだけを候補にする
    const signedResults = allSignedResults(usedCards).filter(
      (r) => r.minusCount >= 1
    );

    // ④ 15〜30の範囲からコアを選ぶ
    const validCoreCandidates = signedResults.filter(
      (r) => r.value >= 15 && r.value <= 30
    );

    if (validCoreCandidates.length === 0) continue;

    const core =
      validCoreCandidates[
        Math.floor(Math.random() * validCoreCandidates.length)
      ].value;

    // ⑤ 残りのカードをランダム補充して4枚にする
    const hand = [...usedCards];
    while (hand.length < 4) hand.push(randomCard());
    shuffle(hand);

    // ⑥ 完成した4枚を全探索
    const allResults = allPossibleResults(hand);

    // 1〜2枚で偶然コアに届くなら、この手札は不採用
    if (hasAccidentalMatch(allResults, core)) continue;

    // 3枚以上・−1回以上の正解が実際に存在するか最終確認
    if (!hasValidSolution(allResults, core)) continue;

    return { core, hand };
  }

  console.warn("コア生成: 規定回数内で条件を満たせなかったため再試行します");
  return generateCoreAndHand();
}
mport {DIFFICULTIES,PLAYER_MAX,DEFAULT_DIFFICULTY} from "./constants.js";
import {getMonsterPool} from "./monsters.js";

const rnd=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

function dealHand(){
  const hand=Array.from({length:4},()=>rnd(1,9));
  // 4枚のうち、必ず1枚は8か9にする
  if(!hand.some(n=>n===8||n===9)){
    hand[rnd(0,3)]=rnd(8,9);
  }
  return hand;
}

export function createGame(){
  return {difficulty:DEFAULT_DIFFICULTY,enemyHP:0,playerHP:PLAYER_MAX,core:0,hand:[],selected:[],locked:false,monster:null,resetAvailable:true,lastTotal:null,enemyCharge:0,defeated:0};
}
export function setDifficulty(state,key){
  if(!DIFFICULTIES[key])return false;
  state.difficulty=key;
  return true;
}
function enemySettings(state){return DIFFICULTIES[state.difficulty]||DIFFICULTIES[DEFAULT_DIFFICULTY];}
export function resetGame(state){
  state.enemyHP=enemySettings(state).enemyHP; state.playerHP=PLAYER_MAX; state.locked=false; state.enemyCharge=0; state.defeated=0;
  const pool=getMonsterPool(state.difficulty); state.monster=pool[rnd(0,pool.length-1)];
  startTurn(state);
}
export function startTurn(state){
  if(state.locked)return;
  state.core=rnd(CORE_MIN,CORE_MAX);
  state.hand=dealHand();
  state.selected=[];
  state.resetAvailable=true;
  state.lastTotal=null;
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
export function resetCards(state){
  if(state.locked||!state.resetAvailable)return false;
  state.hand=dealHand();
  state.selected=[];
  state.resetAvailable=false;
  state.lastTotal=null;
  return true;
}
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

export function nextEnemy(state){
  state.enemyHP=enemySettings(state).enemyHP;
  state.defeated++;
  state.enemyCharge=0;
  const pool=getMonsterPool(state.difficulty); state.monster=pool[rnd(0,pool.length-1)];
  startTurn(state);
}

export function attack(state){
  if(state.locked||state.selected.length===0)return {type:"none"};
  const total=currentCalc(state),used=state.selected.length;
  state.lastTotal=total;
  if(total<0){
    const enemyDamage=enemySettings(state).enemyDamage;
    state.playerHP=Math.max(0,state.playerHP-enemyDamage);
    return {type:"fail",message:"こたえが0みまんになった。",result:"こうげきしっぱい",total,enemyAttack:true,enemyDamage};
  }
  if(total>state.core){
    const enemyDamage=enemySettings(state).enemyDamage;
    state.playerHP=Math.max(0,state.playerHP-enemyDamage);
    return {type:"fail",message:"コアを "+(total-state.core)+" こえた！",result:"こうげきしっぱい",total,enemyAttack:true,enemyDamage};
  }
  const diff=state.core-total;
  if(diff===0){
    state.enemyHP=0;
    return {type:"break",message:"コアにぴったり！",result:"30ダメージ",total};
  }
  if(diff>10){
    const enemyDamage=enemySettings(state).enemyDamage;
    state.playerHP=Math.max(0,state.playerHP-enemyDamage);
    return {type:"fail",message:"コアからとおすぎた。",result:"こうげきしっぱい",total,enemyAttack:true,enemyDamage};
  }
  const dmg=baseDamage(diff)+bonus(used);
  state.enemyHP=Math.max(0,state.enemyHP-dmg);
  state.enemyCharge++;
  const enemyAttack=state.enemyCharge>=enemySettings(state).enemyAttackEvery;
  if(enemyAttack){
    state.enemyCharge=0;
    state.playerHP=Math.max(0,state.playerHP-enemySettings(state).enemyDamage);
  }
  return {type:"hit",damage:dmg,diff,used,message:"コアとの差は "+diff+"。",result:"ダメージ "+dmg+"（"+used+"枚）",total,enemyAttack,enemyDamage:enemyAttack?enemySettings(state).enemyDamage:0,enemyCharge:state.enemyCharge,enemyAttackEvery:enemySettings(state).enemyAttackEvery};
}
export function isWin(state){return state.enemyHP<=0;}
export function isLose(state){return state.playerHP<=0;}