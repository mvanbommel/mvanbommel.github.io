/*********************** 
Initialize Classes
************************/
class Card {
  constructor(suit, rank, value) {
    this.suit = suit;
    this.rank = rank;
    this.value = value;
    this.id = this.rank + "_of_" + this.suit
  }
}

class Deck {
  constructor() {
      this.cards = [];    

      const suits = ['clubs', 'diamonds', 'hearts', 'spades'];
     const ranks = ['ace', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'jack', 'queen', 'king'];
      const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; 

      for (let i = 0; i < suits.length; i++) {
        for (let j = 0; j < ranks.length; j++) {
            this.cards.push(new Card(suits[i], ranks[j], values[j]));
        }
    }
  }
  shuffleDeck() {
      for (let i = this.cards.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
      }
      return(this.cards)
  }

  dealCards(size) {
    let hand = this.cards.splice(0, size);
    return hand;
  }
}

class Player {
  constructor(name, player) {
    this.name = name;
    this.cards = [];
    this.score = 0;
    this.playedCard = new PlayedCard(blankCard, "");
    this.playedCardDisplay = document.getElementById(player + "Played");
    this.handDisplay = document.getElementById(player + "Hand");
  }
}

class PlayedCard {
  constructor(card, face) {
    this.card = card;
    this.face = face;
  }
}

/* Update display when screen size changes */
const nativeCardHeight = 72.6;
const nativeCardWidth = 50;

let screenWidth = window.screen.availWidth;
let screenHeight = window.screen.availHeight;

window.onresize = function() {
  screenWidth = window.screen.availWidth;
  screenHeight = window.screen.availHeight;
  displayGame();
}


/*********************** 
Functions 
************************/
/* Display Functions */
function displayCard(card, face, displayElement) {

  const cardElements = document.getElementsByClassName("cards");

  const li = document.createElement("li");
  const image = document.createElement("img");

  if (face === "up") {
    image.onclick = function() {
      playCard(image);
    }

    image.src = "images/cards/" + card.id + ".svg";
    image.alt = card.id;
  } else {
    image.src = "images/cards/card_back.svg";
    image.alt = "card_back";
  }
 
  /* If screen width and height are greater than mins, scale up card size to at most 1.5x */
  if (screenWidth > 320 && screenHeight > 630) {
    let dimensionMultiplier = Math.min(1.5, screenWidth / 320, screenHeight / 630);
    image.height = dimensionMultiplier * nativeCardHeight + 20;
    image.width = dimensionMultiplier * nativeCardWidth;
  } else {
    image.height = nativeCardHeight + 20;
    image.width = nativeCardWidth;
  }

  /* Set cards class height */
  for (let element of cardElements) {
    element.style.height = image.height + 20 + "px";
  }
  
  displayElement.append(li);

  li.append(image);
}

function displayPlayerOneHand() {
  playerOne.handDisplay.textContent = "";
  playerOne.cards.forEach(card => displayCard(card, "up", playerOne.handDisplay))
}

function displayPlayerTwoHand() {
  playerTwo.handDisplay.textContent = "";
  playerTwo.cards.forEach(card => displayCard(card, "down", playerTwo.handDisplay));
}

function displayPlayedCard(player) {
  if (player.playedCard.card.rank != "") {
    player.playedCardDisplay.textContent = "";
    displayCard(player.playedCard.card, player.playedCard.face, player.playedCardDisplay,);
  }
}

function displayAction() {
  actionDisplay.textContent = actions[gameState];
}

function relationshipButtonVisibility(status) {
  relationshipButtons.style.visibility = status;
}

function displayComparison(guess, truth) {
  let message = "";

  if (guess === truth) {
    if (guess === "equal") {
      message = "Correct. +5 points";
    } else{
      message = "Correct. +1 point";
    }
  } else {
    message = "Incorrect.";
  }

  actionDisplay.textContent = message;
}

function displayGame() {
  displayPlayerOneHand();
  displayPlayerTwoHand();

  displayPlayedCard(playerOne);
  displayPlayedCard(playerTwo);
  
  scoreDisplay.textContent = "(You) " + playerOne.score.toString() + " - " + playerTwo.score.toString() + " (CPU)";
  
  displayAction();

  if (gameState === 2) {
    relationshipButtonVisibility("visible");
  } else {
    relationshipButtonVisibility("hidden");
  }

}


/* Game Functions */
function startGame() {
  gameState = 1;

  deck = new Deck;
  playerOne = new Player("You", "playerOne");
  playerTwo = new Player("Computer", "playerTwo");

  deck.shuffleDeck();

  playerOne.cards = deck.dealCards(5);
  playerTwo.cards = deck.dealCards(5);

  displayGame();
}

function computerPlaysCard(face) {
  playerTwo.playedCard.card = playerTwo.cards[Math.floor(Math.random() * playerTwo.cards.length)];
  playerTwo.playedCard.face = face;

  /* Remove card from hand */
  playerTwo.cards = playerTwo.cards.filter(c => c.id != playerTwo.playedCard.card.id);

  if (face === "down") {
    gameState = 2;
  } else if (face === "up") {
    gameState = 3;
  }

  displayGame();
}

function computerGuessesRelationship() {

  const faceUpValue = playerTwo.playedCard.card.value;

  const higherOptions = Array(13 - faceUpValue).fill("higher");
  const lowerOptions = Array(faceUpValue - 1).fill("lower");
  const equalOptions = ["equal"];

  const guessOptions = equalOptions.concat(higherOptions, lowerOptions);

  const guess = guessOptions[Math.floor(Math.random() * guessOptions.length)];

  return(guess)
}

async function playCard(cardImage) {
  
  if (gameState === 1 || gameState === 3) {

    const playedCard = playerOne.cards.filter(c => c.id === cardImage.alt)[0];
    playerOne.playedCard.card = playedCard;

    /* Remove card from hand */
    playerOne.cards = playerOne.cards.filter(c => c.id != cardImage.alt);

    if (gameState === 1) {
      playerOne.playedCard.face = "up";

      displayPlayerOneHand();
      displayPlayedCard(playerOne);

      gameState = 0;
      displayAction();

      await sleep(1000 / gameSpeed);
      computerPlaysCard("down");

    } else if (gameState === 3) {
      
      playerOne.playedCard.face = "down";

      displayPlayerOneHand();
      displayPlayedCard(playerOne);

      gameState = 0;
      displayAction();

      await sleep(1000 / gameSpeed);

      let guess = computerGuessesRelationship();

      actionDisplay.textContent = "Opponent guesses " + guess;

      await sleep(1000 / gameSpeed);

      playerOne.playedCard.face = "up";
      displayPlayedCard(playerOne);

      await sleep(1000 / gameSpeed);

      const truth = compareCards(playerTwo.playedCard.card, playerOne.playedCard.card);

      displayComparison(guess, truth);

      await sleep(1000 / gameSpeed);

      changeScore(playerTwo, playerOne, guess, truth);

      gameState = 1;

      endTurn();
    }

    displayGame();
  }
}

async function guessRelationship(relationshipButton) {
  if (gameState === 2) {
    
    gameState = 0;
    displayAction();
    relationshipButtonVisibility("hidden");

    const guess = relationshipButton.id;

    await sleep(1000 / gameSpeed);

    playerTwo.playedCard.face = "up";
    displayGame();

    await sleep(1000 / gameSpeed);

    const truth = compareCards(playerOne.playedCard.card, playerTwo.playedCard.card);

    displayComparison(guess, truth);

    changeScore(playerOne, playerTwo, guess, truth);

    await sleep(1000 / gameSpeed);

    endTurn();
    displayGame();

    await sleep(1000 / gameSpeed);

    /* Only play card if gameState is 0, otherwise game has ended */
    if (gameState === 0) {
      computerPlaysCard("up");
    }


    displayGame();
  }
}

function changeScore(guesser, player, guess, truth) {
  if (guess === truth) {
      if (guess === "equal") {
        guesser.score += 5;
      } else {
        guesser.score += 1;
      }
    } else {
      player.score += 1;    
    }
}

function compareCards(guesserCard, playerCard) {
  if (playerCard.value > guesserCard.value) {
    return "higher";
  } else if (playerCard.value < guesserCard.value) {
    return "lower";
  } else {
    return "equal";
  }
}

function resetPlayedCards() {
  playerOne.playedCard = new PlayedCard(blankCard, "");
  playerTwo.playedCard = new PlayedCard(blankCard, "");

  playerOne.playedCardDisplay.textContent = "";
  playerTwo.playedCardDisplay.textContent = "";
}

async function endTurn() {
  resetPlayedCards();

  if (playerOne.cards.length === 0) {
    deck = new Deck;
    deck.shuffleDeck();

    playerOne.cards = deck.dealCards(5);
    playerTwo.cards = deck.dealCards(5);
  }

  if (Math.max(playerOne.score, playerTwo.score) >= winningScore) {
    if (playerOne.score >= winningScore) {
      playerWins++;
      gameState = 4; 
    } else if (playerTwo.score >= winningScore) {
      playerLosses--;
      gameState = 5;
    }
    gameOutcomeDisplay.textContent = actions[gameState];
    displayGame();

    await sleep(1000 / gameSpeed);

    backToGameButton.style.display = "none";
    gameOutcomeDisplay.style.display = "block";

    recordDisplay.textContent = playerWins + "-" + playerLosses;
    openModal();

  }
}

/* Modal Functions */
function openModal() {
  mask.style.visibility = "visible";
  mask.style.opacity = "1";

  modal.style.display = "block";
}

function closeModal() {
  mask.style.visibility = "hidden";
  mask.style.opacity = "0";

  modal.style.display = "none";
}

/* Utility Functions */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}


/*********************** 
Initialize Objects
************************/
const blankCard = new Card("", "", "");

let actions = [
  "...",
  "Choose a card to play face up.",
  "Opponent's card is:",
  "Choose a card to play face down.",
  "YOU WIN!",
  "YOU LOSE!"
]

let playerWins = 0;
let playerLosses = 0;

let gameState = 1;

let winningScore = 11;
let gameSpeed = 1;

let deck = new Deck;
let playerOne = new Player("You", "playerOne");
let playerTwo = new Player("Computer", "playerTwo");


/* Game Elements */
const scoreDisplay = document.getElementById("score");
const actionDisplay = document.querySelector("div.action p");

/** @type {HTMLElement} */
const relationshipButtons = document.getElementById("relationshipButtons");

const higherButton = document.getElementById("higher");
const equalButton = document.getElementById("equal");
const lowerButton = document.getElementById("lower");

higherButton.onclick = function() {
  guessRelationship(higherButton);
}
equalButton.onclick = function() {
  guessRelationship(equalButton);
}
lowerButton.onclick = function() {
  guessRelationship(lowerButton);
}

/* Modal Elements */
const modal = document.getElementById("modal");
const mask = document.getElementById("mask");

const gameOutcomeDisplay = document.getElementById("gameOutcome");
const recordDisplay = document.getElementById("record");


const modalButton = document.getElementById("modalButton");
modalButton.onclick = function() {
  openModal();
};


const settingsTab = document.getElementById("settingsTab");
const instructionsTab = document.getElementById("instructionsTab");

const settingsTabButton = document.getElementById("settingsTabButton");
const instructionsTabButton = document.getElementById("instructionsTabButton");

settingsTabButton.onclick = function() {
  settingsTabButton.classList.add("active");
  instructionsTabButton.classList.remove("active");

  settingsTab.style.display = "block";
  instructionsTab.style.display = "none";
}

instructionsTabButton.onclick = function() {
  settingsTabButton.classList.remove("active");
  instructionsTabButton.classList.add("active");

  settingsTab.style.display = "none";
  instructionsTab.style.display = "block";
}


const startNewGameButton = document.getElementById("startNewGameButton")
const backToGameButton = document.getElementById("backToGameButton")
startNewGameButton.onclick = function() {
  startGame();

  closeModal();

  gameOutcomeDisplay.style.display = "none";
  backToGameButton.style.display = "block";
}
backToGameButton.onclick = function() {
  closeModal();
}

const quickGameButton = document.getElementById("quickGameButton");
const halfGameButton = document.getElementById("halfGameButton");
const fullGameButton = document.getElementById("fullGameButton");

quickGameButton.onclick = function() {
  winningScore = 5; 

  quickGameButton.classList.add("active");
  halfGameButton.classList.remove("active");
  fullGameButton.classList.remove("active");
}

halfGameButton.onclick = function() {
  winningScore = 11; 
  
  quickGameButton.classList.remove("active");
  halfGameButton.classList.add("active");
  fullGameButton.classList.remove("active");
}

fullGameButton.onclick = function() {
  winningScore = 21; 
  
  quickGameButton.classList.remove("active");
  halfGameButton.classList.remove("active");
  fullGameButton.classList.add("active");
}

const gameSpeedRange = document.getElementById("gameSpeedRange");
gameSpeedRange.onchange = function() {
  gameSpeed = gameSpeedRange.value;
}

/* Display Game */
displayGame();