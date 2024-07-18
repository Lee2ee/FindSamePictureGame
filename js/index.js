const CARD_IMG = [
  "bear",
  "camel",
  "cat",
  "chick",
  "chicken",
  "cockroach",
  "cow",
  "dolphin",
  "elephant",
  "fish",
  "frog",
  "horse",
  "kitty",
  "koala",
  "monkey",
  "penguin",
  "pig",
  "porcupine",
  "puffer-fish",
  "rabbit",
  "rat-head",
  "shell",
  "snail",
  "snake",
  "squid",
  "tiger",
  "whale",
];

const BOARD_SIZE = 24;

let stage = 1;
let time = 100;
let timer = 0;
let isFlip = false; // 카드 뒤집기 가능 여부
let cardDeck = [];

const gameBoard = document.getElementsByClassName("game__board")[0];
const cardBack = document.getElementsByClassName("card__back");
const cardFront = document.getElementsByClassName("card__front");

//카드 덱 생성
function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

function getRandom(max, min) {
  return parseInt(Math.random() * (max - min)) + min;
}

function makeCardDeck() {
  let randomNumberArr = [];
  for (let i = 0; i < BOARD_SIZE / 2; i++) {
    let randomNumber = getRandom(CARD_IMG.length, 0); //(27, 0)

    //중복검사
    //randomNumberArr 안에 랜덤 값이 없으면 추가
    //randomNumberArr 안에 랜덤 값이 없으면 i - 1
    if (randomNumberArr.indexOf(randomNumber) === -1) {
      randomNumberArr.push(randomNumber);
    } else {
      i--;
    }
  }
  //카드는 2장씩 필요하기 때문에 복사
  //...은 배열을 풀어서 복사
  randomNumberArr.push(...randomNumberArr);

  //카드 섞기
  let shuffleArr = shuffle(randomNumberArr);

  //섞은 값으로 세팅
  for (let i = 0; i < BOARD_SIZE; i++) {
    cardDeck.push({
      card: CARD_IMG[shuffleArr[i]],
      isOpen: false,
      isMatch: false,
    });
  }
  return cardDeck;
}

//생성한 덱을 화면에 세팅
function settingCardDeck() {
  for (let i = 0; i < BOARD_SIZE; i++) {
    gameBoard.innerHTML =
      gameBoard.innerHTML +
      `
        <div class="card" data-id = "${i}" data-card="${cardDeck[i].card}">
          <div class="card__back"></div>
          <div class="card__front"></div> 
        </div>
      `;
    cardFront[i].style.backgroundImage = `url('img/card-pack/${cardDeck[i].card}.png')`;
  }
}

//최초 1회 전체 카드를 보여줌
function hideCardDeck() {
  for (let i = 0; i < cardDeck.length; i++) {
    cardBack[i].style.transform = "rotateY(0deg)";
    cardFront[i].style.transform = "rotateY(-180deg)";
  }

  setTimeout(() => {
    isFlip = true;
    startTimer();
  }, 100);
}

function showCardDeck() {
  let cnt = 0;
  let showCardPromise = new Promise((resolve, reject) => {
    let showCardTimer = setInterval(() => {
      cardBack[cnt].style.transform = "rotateY(180deg)";
      cardFront[cnt++].style.transform = "rotateY(0deg)";
      if (cnt === cardDeck.length) {
        clearInterval(showCardTimer);
        resolve();
      }
    }, 100);
  });
  showCardPromise.then(() => {
    setTimeout(() => {
      //카드 숨기기
      hideCardDeck();
    }, 1000);
  });
}

function startTimer() {
  timer = setInterval(() => {
    playerTime.innerHTML = --time;
    if (time === 0) {
      clearInterval(timer);
      stopGame();
    }
  }, 1000);
}

gameBoard.addEventListener("click", function (e) {
  if (!isFlip) return;

  //클릭한 것이 카드인가
  if (e.target.parentNode.className === "card") {
    let clickCardId = e.target.parentNode.dataset.id;
    if (cardDeck[clickCardId].isOpen === false) {
      openCard(clickCardId);
    }
  }
});

function openCard(id) {
  cardBack[id].style.transform = "rotateY(180deg)";
  cardFront[id].style.transform = "rotateY(0deg)";

  //다시 뒤집는거 방지
  cardDeck[id].isOpen = true;

  //선택한 카드가 첫번째 카드인지 두번째 카드인지 판단
  let openCardIndexArr = getOpenCardArr(id);

  //두번째의 선택인 경우 카드 일치 여부를 확인
  //일치 여부 확인 전가지는 카드 뒤집기 불가능
  if (openCardIndexArr.length === 2) {
    isFlip = false;
    checkCardMatch(openCardIndexArr);
  }
}

function checkCardMatch(indexArr) {
  let firstCard = cardDeck[indexArr[0]];
  let secondCard = cardDeck[indexArr[1]];

  if (firstCard.card === secondCard.card) {
    //카드 일치 처리
    firstCard.isMatch = true;
    secondCard.isMatch = true;
    matchCard();
  } else {
    //카드 불일치 처리
    firstCard.isOpen = false;
    secondCard.isOpen = false;
    closeCard(indexArr);
  }
}

//카드 일치 처리
function matchCard() {
  if (checkClear() === true) {
    clearStage();
    return;
  }

  setTimeout(() => {
    isFlip = true;
  }, 100);
}

//카드 불일치 처리
function closeCard(indexArr) {
  setTimeout(() => {
    for (let i = 0; i < indexArr.length; i++) {
      cardBack[indexArr[i]].style.transform = "rotateY(0deg)";
      cardFront[indexArr[i]].style.transform = "rotateY(-180deg)";
    }
    isFlip = true;
  }, 800);
}

//스테이지 클리어
function clearStage() {}

//모든 카드를 다 찾았는지 확인
function checkClear() {
  let isClear = true;
  cardDeck.forEach((ele) => {
    if (ele.isMatch === false) {
      isClear = false;
      return;
    }
  });
}

function getOpenCardArr(id) {
  let openCardIndexArr = [];
  //반복문을 돌면서 isOpen이 true, isMatch가 false인 카드의 인덱스를 배열에 저장
  cardDeck.forEach((ele, idx) => {
    if (ele.isOpen === false || ele.isMatch === true) {
      return;
    }
    openCardIndexArr.push(idx);
  });
  return openCardIndexArr;
}

//미완성
function showGameResult() {}

function stopGame() {
  showGameResult();
}

function startGame() {
  //1. 카드 덱 생성
  makeCardDeck();
  //2. 생성한 덱을 화면에 세팅
  settingCardDeck();
  //3. 최초 1회 전체 카드를 보여줌
  showCardDeck();
}

const playerTime = document.getElementById("player-time");
const playerStage = document.getElementById("player-stage");
window.onload = function () {
  playerTime.innerHTML = time;
  playerStage.innerHTML = stage;
  startGame();
};
