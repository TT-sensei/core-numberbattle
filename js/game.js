import {DIFFICULTIES,PLAYER_MAX,DEFAULT_DIFFICULTY} from "./constants.js";
import {getMonsterPool} from "./monsters.js";

const rnd=(min,max)=>Math.floor(Math.random()*(max-min+1))+min;

// ===== コアバトル: パターン先決め方式によるコア&手札生成 =====
// ① 今回の符号パターンを先に抽選（プレイヤーには見せない）
// ② そのパターンで15〜30に収まるカードを生成
// ③ 4枚未満ならランダム補充
// ④ 完成した4枚を全探索し、1〜2枚で偶然Coreに一致したら作り直す
//
// pattern は生成専用。UIには返さない。

const CORE_PATTERNS = [
  { name:"3枚 ++-", cardCount:3, signs:[1,1,-1], weight:25 },
  { name:"3枚 +-+", cardCount:3, signs:[1,-1,1], weight:20 },
  { name:"4枚 +++-", cardCount:4, signs:[1,1,1,-1], weight:20 },
  { name:"4枚 ++--", cardCount:4, signs:[1,1,-1,-1], weight:15 },
  { name:"4枚 +-+-", cardCount:4, signs:[1,-1,1,-1], weight:10 },
  { name:"4枚 +--+", cardCount:4, signs:[1,-1,-1,1], weight:5 },
  { name:"全部たす", cardCount:4, signs:[1,1,1,1], weight:5 }
];

function pickWeightedPattern(){
  const total=CORE_PATTERNS.reduce((sum,p)=>sum+p.weight,0);
  let r=Math.random()*total;
  for(const pattern of CORE_PATTERNS){
    if(r<pattern.weight)return pattern;
    r-=pattern.weight;
  }
  return CORE_PATTERNS[CORE_PATTERNS.length-1];
}

function randomCard(){
  return Math.floor(Math.random()*9)+1;
}

function shuffle(array){
  for(let i=array.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [array[i],array[j]]=[array[j],array[i]];
  }
}

// 完成した4枚について、1〜4枚の全組み合わせ×全符号を列挙。
// 「1〜2枚でCoreを作れてしまうか」の判定に使う。
function allPossibleResults(hand){
  const n=hand.length;
  const results=[];

  for(let subsetMask=1;subsetMask<(1<<n);subsetMask++){
    const subset=[];
    for(let i=0;i<n;i++){
      if((subsetMask>>i)&1)subset.push(hand[i]);
    }

    const m=subset.length;
    for(let signPattern=0;signPattern<(1<<m);signPattern++){
      let value=0;
      for(let i=0;i<m;i++){
        value+=((signPattern>>i)&1)?-subset[i]:subset[i];
      }
      if(value>=0){
        results.push({value,cardCount:m});
      }
    }
  }

  return results;
}

function hasAccidentalMatch(results,core){
  return results.some(r=>r.cardCount<=2&&r.value===core);
}

function generateCoreAndHand(){
  const MAX_OUTER_ATTEMPTS=200;
  const MAX_CARD_ATTEMPTS=50;

  for(let outer=0;outer<MAX_OUTER_ATTEMPTS;outer++){
    // ① まず「今回の解き方」を決める
    const pattern=pickWeightedPattern();

    // ② そのパターンでCore 15〜30になるカードを生成
    let usedCards=null;
    let core=null;

    for(let inner=0;inner<MAX_CARD_ATTEMPTS;inner++){
      const cards=Array.from(
        {length:pattern.cardCount},
        ()=>randomCard()
      );

      let value=0;
      for(let i=0;i<pattern.cardCount;i++){
        value+=cards[i]*pattern.signs[i];
      }

      if(value>=15&&value<=30){
        usedCards=cards;
        core=value;
        break;
      }
    }

    if(usedCards===null)continue;

    // ③ 3枚パターンなら4枚目をランダム補充
    const hand=[...usedCards];
    while(hand.length<4)hand.push(randomCard());
    shuffle(hand);

    // ④ 1〜2枚だけでCoreに偶然一致する手札は不採用
    const allResults=allPossibleResults(hand);
    if(hasAccidentalMatch(allResults,core))continue;

    return {core,hand};
  }

  console.warn("コア生成: 規定回数内で条件を満たせなかったため再試行します");
  return generateCoreAndHand();
}
export function createGame(){
  return {
    difficulty:DEFAULT_DIFFICULTY,
    enemyHP:0,
    playerHP:PLAYER_MAX,
    core:0,
    hand:[],
    selected:[],
    locked:false,
    monster:null,
    resetAvailable:true,
    lastTotal:null,
    enemyCharge:0,
    defeated:0
  };
}

export function setDifficulty(state,key){
  if(!DIFFICULTIES[key])return false;
  state.difficulty=key;
  return true;
}

function enemySettings(state){
  return DIFFICULTIES[state.difficulty]||DIFFICULTIES[DEFAULT_DIFFICULTY];
}

export function resetGame(state){
  state.enemyHP=enemySettings(state).enemyHP;
  state.playerHP=PLAYER_MAX;
  state.locked=false;
  state.enemyCharge=0;
  state.defeated=0;

  const pool=getMonsterPool(state.difficulty);
  state.monster=pool[rnd(0,pool.length-1)];

  startTurn(state);
}

export function startTurn(state){
  if(state.locked)return;

  const puzzle=generateCoreAndHand();
  state.core=puzzle.core;
  state.hand=puzzle.hand;
  state.selected=[];
  state.resetAvailable=true;
  state.lastTotal=null;
}

export function cycleCard(state,i){
  if(state.locked)return;

  const found=state.selected.find(x=>x.i===i);
  if(!found){
    state.selected.push({i,sign:1});
  }else if(found.sign===1){
    if(state.selected[0].i!==i)found.sign=-1;
    else state.selected=state.selected.filter(x=>x.i!==i);
  }else{
    state.selected=state.selected.filter(x=>x.i!==i);
  }
}

export function clearSelection(state){
  if(!state.locked)state.selected=[];
}

export function resetCards(state){
  if(state.locked||!state.resetAvailable)return false;

  const puzzle=generateCoreAndHand();
  state.core=puzzle.core;
  state.hand=puzzle.hand;
  state.selected=[];
  state.resetAvailable=false;
  state.lastTotal=null;
  return true;
}

export function currentCalc(state){
  return state.selected.reduce(
    (sum,s)=>sum+state.hand[s.i]*s.sign,
    0
  );
}

function baseDamage(diff){
  if(diff<=2)return 5;
  if(diff<=4)return 4;
  if(diff<=6)return 3;
  if(diff<=8)return 2;
  if(diff<=10)return 1;
  return 0;
}

function bonus(n){
  if(n>=4)return 2;
  if(n>=3)return 1;
  return 0;
}

export function nextEnemy(state){
  state.enemyHP=enemySettings(state).enemyHP;
  state.defeated++;
  state.enemyCharge=0;

  const pool=getMonsterPool(state.difficulty);
  state.monster=pool[rnd(0,pool.length-1)];

  startTurn(state);
}

export function attack(state){
  if(state.locked||state.selected.length===0)return {type:"none"};

  const total=currentCalc(state);
  const used=state.selected.length;
  state.lastTotal=total;

  if(total<0){
    const enemyDamage=enemySettings(state).enemyDamage;
    state.playerHP=Math.max(0,state.playerHP-enemyDamage);
    return {
      type:"fail",
      message:"こたえが0みまんになった。",
      result:"こうげきしっぱい",
      total,
      enemyAttack:true,
      enemyDamage
    };
  }

  if(total>state.core){
    const enemyDamage=enemySettings(state).enemyDamage;
    state.playerHP=Math.max(0,state.playerHP-enemyDamage);
    return {
      type:"fail",
      message:"コアを "+(total-state.core)+" こえた！",
      result:"こうげきしっぱい",
      total,
      enemyAttack:true,
      enemyDamage
    };
  }

  const diff=state.core-total;

  if(diff===0){
    state.enemyHP=0;
    return {
      type:"break",
      message:"コアにぴったり！",
      result:"30ダメージ",
      total
    };
  }

  if(diff>10){
    const enemyDamage=enemySettings(state).enemyDamage;
    state.playerHP=Math.max(0,state.playerHP-enemyDamage);
    return {
      type:"fail",
      message:"コアからとおすぎた。",
      result:"こうげきしっぱい",
      total,
      enemyAttack:true,
      enemyDamage
    };
  }

  const dmg=baseDamage(diff)+bonus(used);
  state.enemyHP=Math.max(0,state.enemyHP-dmg);
  state.enemyCharge++;

  const enemyAttack=
    state.enemyCharge>=enemySettings(state).enemyAttackEvery;

  if(enemyAttack){
    state.enemyCharge=0;
    state.playerHP=Math.max(
      0,
      state.playerHP-enemySettings(state).enemyDamage
    );
  }

  return {
    type:"hit",
    damage:dmg,
    diff,
    used,
    message:"コアとの差は "+diff+"。",
    result:"ダメージ "+dmg+"（"+used+"枚）",
    total,
    enemyAttack,
    enemyDamage:enemyAttack?enemySettings(state).enemyDamage:0,
    enemyCharge:state.enemyCharge,
    enemyAttackEvery:enemySettings(state).enemyAttackEvery
  };
}

export function isWin(state){
  return state.enemyHP<=0;
}

export function isLose(state){
  return state.playerHP<=0;
}