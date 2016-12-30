var noOfPlayers = 4;
var gameId = -1;
var currentPlayerId = -1;
var cardPlayingTurnPlayerId = -2;
var cardMovedClientId = -3;
var remainingCardsArray = [];
var currentPlayer;
var leftPlayer;
var topPlayer;
var rightPlayer;
var currentPlayerScore = 0;
var leftPlayerScore = 0;
var rightPlayerScore = 0;
var topPlayerScore = 0;
var gameStage = 1;
var playerIDs = [];
var playersArray = [];
var lastGameWinner = -4;

var GameTable = {
	container: null,
	firstPointContainer: [],
	secondPointContainer: [],
	initailPointContainer: null,
	draggedCardId: -1,
	isFirstPointContainerFilled: false,
	isSecondPointContainerFilled: false,
	isInitialPointFilled: false,
	refresh: function(){
		this.container = null;
		this.firstPointContainer = [];
		this.secondPointContainer = [];
		this.initailPointContainer = null;
		this.isFirstPointContainerFilled = false;
		this.isSecondPointContainerFilled = false;
		this.isInitialPointFilled = false;
		this.firstPointDirection = {
			direction: "left",
			count: 0
		};
		this.secondPointDirection = {
			direction: "right",
			count: 0
		};
		this.prevFirstPointDirection = {
			direction: "left",
			count: 0
		};
		this.prevSecondPointDirection = {
			direction: "right",
			count: 0
		};
	},
	firstPointDirection: {
		direction: "left",
		count: 0
	},
	secondPointDirection: {
		direction: "right",
		count: 0
	},
	prevFirstPointDirection: {
		direction: "left",
		count: 0
	},
	prevSecondPointDirection: {
		direction: "right",
		count: 0
	},
	currentFirstPointContainerId: 1,
	currentSecondPointContainerId: 1,
	initiate: function (type) {
		this.container = $("#container");
		this.container.html("");
		return this.drawInitialContainer(type);
	},
	drawInitialContainer: function (type, allowdrop = true) {
		this.removeDroppableOptions();
		this.container.append("<div class='first-card-container-" + type + "' data-position='" + type + "' data-point='initial' id='initialCardContainer'></div>");
		this.firstPointContainer.push($("#initialCardContainer"));
		this.secondPointContainer.push($("#initialCardContainer"));
		$("#initialCardContainer").droppable({
            drop: function( event, ui ) {
				$("#" + event.target.id).droppable('disable');
				
				var data = GameTable.draggedCardId;
	
				var firstValue = $("#" + data).data("firstvalue");
				var secondValue = $("#" + data).data("secondvalue");
				
				Game.insertCard(firstValue, secondValue, event.target.id);
				
				$("#" + data).remove();
				var point = $("#" + event.target.id).data("point");
				
				Server.send( 'message', '{"commandType": "movedCard", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ', "cardValues": [' + firstValue + ', ' + secondValue + '], "containerPosition": "' + point + '"}' );
				
				for(var i = 0; i < playerIDs.length; i++){
					var player = playerIDs[i];
					if(player == currentPlayerId){
						cardPlayingTurnPlayerId = playerIDs[(i+1)%noOfPlayers];
					}
				}
				cardMovedClientId = currentPlayerId;
				currentPlayer.highlightPossibleCards();
				var isCardRemaining = currentPlayer.isAnyCardRemaining();
				if(isCardRemaining == false){
					Server.send( 'message', '{"commandType": "gameOver", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ',"type": 2}' );
					currentPlayerScore++;
					currentPlayer.displayScore(currentPlayerScore);
					showMessage("You won the game!!!");
					lastGameWinner = currentPlayerId;
				}
            }
        });
		return "initialCardContainer";
	},
	drawNextFirstPointContainer: function (type, allowdrop = true) {
		this.removeDroppableOptions();
		this.currentFirstPointContainerId++;
		if (this.firstPointDirection.direction == "up") {
			type = this.containerPosition.vertical;
		}
		this.container.append("<div class='card-container-" + type + "' data-point='first' data-position='" + type + "' data-direction='" + this.firstPointDirection.direction + "' data-count='" + this.firstPointDirection.count + "' id='firstPointCardContainer" + this.currentFirstPointContainerId + "'></div>");
		var previousContainer = this.firstPointContainer[this.firstPointContainer.length - 1];
		this.firstPointContainer.push($("#firstPointCardContainer" + this.currentFirstPointContainerId));
		
		$("#firstPointCardContainer" + this.currentFirstPointContainerId).droppable({
            drop: function( event, ui ) {
				$("#" + event.target.id).droppable('disable');
				
				var data = GameTable.draggedCardId;
	
				var firstValue = $("#" + data).data("firstvalue");
				var secondValue = $("#" + data).data("secondvalue");
				
				Game.insertCard(firstValue, secondValue, event.target.id);
				
				$("#" + data).remove();
				var point = $("#" + event.target.id).data("point");
				
				Server.send( 'message', '{"commandType": "movedCard", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ', "cardValues": [' + firstValue + ', ' + secondValue + '], "containerPosition": "' + point + '"}' );
				
				for(var i = 0; i < playerIDs.length; i++){
					var player = playerIDs[i];
					if(player == currentPlayerId){
						cardPlayingTurnPlayerId = playerIDs[(i+1)%noOfPlayers];
					}
				}
				cardMovedClientId = currentPlayerId;
				currentPlayer.highlightPossibleCards();
				var isCardRemaining = currentPlayer.isAnyCardRemaining();
				if(isCardRemaining == false){
					Server.send( 'message', '{"commandType": "gameOver", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ',"type": 2}' );
					currentPlayerScore++;
					currentPlayer.displayScore(currentPlayerScore);
					showMessage("You won the game!!!");
					lastGameWinner = currentPlayerId;
				}
            }
        });
		
		this.placeContainer(previousContainer, this.firstPointContainer[this.firstPointContainer.length - 1], this.firstPointDirection, type);
		this.prevFirstPointDirection = this.firstPointDirection;
		this.firstPointDirection = this.getDirection(this.firstPointDirection, this.firstPointContainer[this.firstPointContainer.length - 1], this.container);
		return "firstPointCardContainer" + this.currentFirstPointContainerId;
	},
	drawNextSecondPointContainer: function (type, allowdrop = true) {
		this.removeDroppableOptions();
		this.currentSecondPointContainerId++;
		if (this.secondPointDirection.direction == "down") {
			type = this.containerPosition.vertical;
		}
		this.container.append("<div class='card-container-" + type + "' data-point='second' data-position='" + type + "' data-direction='" + this.secondPointDirection.direction + "' data-count='" + this.secondPointDirection.count + "' id='secondPointCardContainer" + this.currentSecondPointContainerId + "'></div>");
		var previousContainer = this.secondPointContainer[this.secondPointContainer.length - 1];
		this.secondPointContainer.push($("#secondPointCardContainer" + this.currentSecondPointContainerId));
		$("#secondPointCardContainer" + this.currentSecondPointContainerId).droppable({
            drop: function( event, ui ) {
				$("#" + event.target.id).droppable('disable');
				
				var data = GameTable.draggedCardId;
	
				var firstValue = $("#" + data).data("firstvalue");
				var secondValue = $("#" + data).data("secondvalue");
				
				Game.insertCard(firstValue, secondValue, event.target.id);
				
				$("#" + data).remove();
				var point = $("#" + event.target.id).data("point");
				
				Server.send( 'message', '{"commandType": "movedCard", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ', "cardValues": [' + firstValue + ', ' + secondValue + '], "containerPosition": "' + point + '"}' );
				
				for(var i = 0; i < playerIDs.length; i++){
					var player = playerIDs[i];
					if(player == currentPlayerId){
						cardPlayingTurnPlayerId = playerIDs[(i+1)%noOfPlayers];
					}
				}
				cardMovedClientId = currentPlayerId;
				currentPlayer.highlightPossibleCards();
				var isCardRemaining = currentPlayer.isAnyCardRemaining();
				if(isCardRemaining == false){
					Server.send( 'message', '{"commandType": "gameOver", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ',"type": 2}' );
					currentPlayerScore++;
					currentPlayer.displayScore(currentPlayerScore);
					showMessage("You won the game!!!");
					lastGameWinner = currentPlayerId;
				}
            }
        });
		
		this.placeContainer(previousContainer, this.secondPointContainer[this.secondPointContainer.length - 1], this.secondPointDirection, type);
		this.prevSecondPointDirection = this.secondPointDirection;
		this.secondPointDirection = this.getDirection(this.secondPointDirection, this.secondPointContainer[this.secondPointContainer.length - 1], this.container);
		return "secondPointCardContainer" + this.currentSecondPointContainerId;
	},
	removeDroppableOptions: function(){
		for(var i = 0; i < this.secondPointContainer.length; i++){
			var element = this.secondPointContainer[i];
			if (element.children().length > 0) {
				this.secondPointContainer[i].droppable("disable");
			}
		}
		for(var i = 0; i < this.firstPointContainer.length; i++){
			var element = this.firstPointContainer[i];
			if (element.children().length > 0) {
				this.firstPointContainer[i].droppable("disable");
			}
		}
	},
	placeContainer: function(previousContainer, currentContainer, direction, type){
		direction = direction.direction;
		var position = previousContainer.position();
		if(previousContainer.data("direction") == "up" && previousContainer.data("count") === 2){
			position.top = position.top - 20;
		}
		if(previousContainer.data("direction") == "down" && previousContainer.data("count") === 2){
			position.top = position.top + 20;
		}
		currentContainer.css("top", position.top);
		if (type === this.containerPosition.vertical) {
			if(previousContainer.data("position") == this.containerPosition.vertical){
				if (direction == "left") {
					currentContainer.css("left", position.left - 41);
				} else if (direction == "right") {
					currentContainer.css("left", position.left + 41);
				} else if (direction == "up") {
					currentContainer.css("left", position.left);
					currentContainer.css("top", position.top - 81);
				} else if (direction == "down") {
					currentContainer.css("left", position.left);
					currentContainer.css("top", position.top + 81);
				}
			} else {
				if (direction == "left") {
					currentContainer.css("left", position.left - 61);
				} else if (direction == "right") {
					currentContainer.css("left", position.left + 61);
				} else if (direction == "up") {
					currentContainer.css("left", position.left - 20);
					currentContainer.css("top", position.top - 61);
				} else if (direction == "down") {
					currentContainer.css("left", position.left + 20);
					currentContainer.css("top", position.top + 61);
				}
			}
		} else {
			if(previousContainer.data("position") == this.containerPosition.vertical){
				if (direction == "left") {
					currentContainer.css("left", position.left - 61);
				} else if (direction == "right") {
					currentContainer.css("left", position.left + 61);
				}
			} else {
				if (direction == "left") {
					currentContainer.css("left", position.left - 81);
				} else if (direction == "right") {
					currentContainer.css("left", position.left + 81);
				}
			}
		}
	},
	removePossibleCardContainers: function(){
		if(this.isFirstPointContainerFilled === false){
			if (this.firstPointContainer.length > 0) {
				var container = this.firstPointContainer.pop();
				container.remove();
				this.isFirstPointContainerFilled = true;
				this.firstPointDirection = this.prevFirstPointDirection;
			}
		}
		
		if(GameTable.isSecondPointContainerFilled === false){
			if (this.secondPointContainer.length > 0) {
				var container = this.secondPointContainer.pop();
				container.remove();
				this.isSecondPointContainerFilled = true;
				this.secondPointDirection = this.prevSecondPointDirection;
			}
		}
	},
	getDirection: function(currentDirection, cardContainer, mainContainer) {
		if(currentDirection.direction == "up"){
			if(currentDirection.count == 1){
				return {
					direction: "up",
					count: 2
				};
			}else{
				return {
					direction: "right",
					count: 0
				};
			}
		} else if(currentDirection.direction == "down"){
			if(currentDirection.count == 1){
				return {
					direction: "down",
					count: 2
				};
			}else{
				return {
					direction: "left",
					count: 0
				};
			}
		} else if(currentDirection.direction == "left" && cardContainer.position().left < 85){
			return {
				direction: "up",
				count: 1
			};
		} else if (currentDirection.direction == "right" && (cardContainer.position().left + 85 > mainContainer.width())) {
			return {
				direction: "down",
				count: 1
			};
		} else {
			return currentDirection;
		}
	},
	containerPosition: {
		vertical: "vertical",
		horizontal: "horizontal"
	}
};

var Card = {
	cardNo: 1,
	appendBlankCard(container, type){
		return this.appendCard(container, type, 0, 0, false, true);
	},
	appendCard: function(container, type, firstValue, secondValue, draggable = true, isBlankCard = false){
		if(type == "vertical"){
			type = "horizontal";
		}else{
			type = "vertical";
		}
		container.append("<div class='card card-" + type + "' id='card" + this.cardNo + "' data-firstvalue='" + firstValue + "' data-secondValue='" + secondValue + "' draggable='" + draggable + "'></div>");
		
		$("#card" + this.cardNo).append("<div class='child-container left-child-container-" + type + "' id='leftCardContainer" + this.cardNo + "'></div>");
		$("#leftCardContainer" + this.cardNo).append("<div class='circle-container' id='leftCircleContainer" + this.cardNo + "'></div>");
		this.appendCardNo($("#leftCircleContainer" + this.cardNo), type, firstValue);
		if(isBlankCard == false){
			$("#card" + this.cardNo).append("<div class='seperator seperator-" + type + "'></div>");
		}
		$("#card" + this.cardNo).append("<div class='child-container right-child-container-" + type + "' id='rightCardContainer" + this.cardNo + "'></div>");
		$("#rightCardContainer" + this.cardNo).append("<div class='circle-container' id='rightCircleContainer" + this.cardNo + "'></div>");
		this.appendCardNo($("#rightCircleContainer" + this.cardNo), type, secondValue);
		this.cardNo++;
		return "card" + (this.cardNo - 1);
	},
	appendCardNo: function(container, type, value){
		switch(value){
			case 6:
				container.append("<div class='circle circle7-" + type + "'></div>");
				container.append("<div class='circle circle6-" + type + "'></div>");
				container.append("<div class='circle circle5-" + type + "'></div>");
				container.append("<div class='circle circle4-" + type + "'></div>");
				container.append("<div class='circle circle3-" + type + "'></div>");
				container.append("<div class='circle circle2-" + type + "'></div>");
				break;
			case 5:
				container.append("<div class='circle circle7-" + type + "'></div>");
				container.append("<div class='circle circle1-" + type + "'></div>");
				container.append("<div class='circle circle5-" + type + "'></div>");
				container.append("<div class='circle circle4-" + type + "'></div>");
				container.append("<div class='circle circle2-" + type + "'></div>");
				break;
			case 4:
				container.append("<div class='circle circle7-" + type + "'></div>");
				container.append("<div class='circle circle5-" + type + "'></div>");
				container.append("<div class='circle circle4-" + type + "'></div>");
				container.append("<div class='circle circle2-" + type + "'></div>");
				break;
			case 3:
				container.append("<div class='circle circle7-" + type + "'></div>");
				container.append("<div class='circle circle1-" + type + "'></div>");
				container.append("<div class='circle circle2-" + type + "'></div>");
				break;
			case 2:
				container.append("<div class='circle circle7-" + type + "'></div>");
				container.append("<div class='circle circle2-" + type + "'></div>");
				break;
			case 1:
				container.append("<div class='circle circle1-" + type + "'></div>");
				break;
		}
	}
};

var Game = {
	initialCard: null,
	firstPointCards: [],
	secondPointCards: [],
	refresh: function(){
		this.initialCard = null;
		this.firstPointCards = [];
		this.secondPointCards = [];
	},
	getNewCardDetails: function(newCardDetails, cardContainerPosition) {
		if(cardContainerPosition !== null){
			return {
				containerOrientation: cardContainerPosition
			};
		}
		
		if(newCardDetails.firstValue === newCardDetails.secondValue){
			return {
				containerOrientation: "vertical"
			};
		} else {
			return {
				containerOrientation: "horizontal"
			};
		}
	},
	drawPosibleCardContainers: function(firstValue, secondValue, stage){
		if(cardPlayingTurnPlayerId !== currentPlayerId){
			return;
		}
		var cardDetails = this.getNewCardDetails({firstValue: firstValue, secondValue: secondValue}, null);
		if(GameTable.isInitialPointFilled === false){
			if(GameTable.initailPointContainer != null){
				GameTable.initailPointContainer.remove();
				GameTable.initailPointContainer == null;
			}
			if(stage == 1 && firstValue == 6 && secondValue == 6){
				GameTable.initiate(cardDetails.containerOrientation);
			} else if(stage > 1) {
				GameTable.initiate(cardDetails.containerOrientation);
			}
		} else {
			if(this.firstPointCards.length <= 0 && this.secondPointCards.length <= 0){
				if (this.initialCard.firstValue == firstValue || this.initialCard.firstValue == secondValue) {
					GameTable.drawNextFirstPointContainer(cardDetails.containerOrientation);
					GameTable.isFirstPointContainerFilled = false;
				}
				
				if (this.initialCard.secondValue == secondValue || this.initialCard.secondValue == firstValue) {
					GameTable.drawNextSecondPointContainer(cardDetails.containerOrientation);
					GameTable.isSecondPointContainerFilled = false;
				}
			} else {
				if(this.firstPointCards.length > 0){
					var prevCardDetails = this.firstPointCards[this.firstPointCards.length - 1];
					if (prevCardDetails.allowValue == firstValue || prevCardDetails.allowValue == secondValue) {
						GameTable.drawNextFirstPointContainer(cardDetails.containerOrientation);
						GameTable.isFirstPointContainerFilled = false;
					}
				} else {
					if (this.initialCard.firstValue == firstValue || this.initialCard.firstValue == secondValue) {
						GameTable.drawNextFirstPointContainer(cardDetails.containerOrientation);
						GameTable.isFirstPointContainerFilled = false;
					}
				}
				
				if(this.secondPointCards.length > 0){
					var prevCardDetails = this.secondPointCards[this.secondPointCards.length - 1];
					if (prevCardDetails.allowValue == firstValue || prevCardDetails.allowValue == secondValue) {
						GameTable.drawNextSecondPointContainer(cardDetails.containerOrientation);
						GameTable.isSecondPointContainerFilled = false;
					}
				} else {
					if (this.initialCard.secondValue == secondValue || this.initialCard.secondValue == firstValue) {
						GameTable.drawNextSecondPointContainer(cardDetails.containerOrientation);
						GameTable.isSecondPointContainerFilled = false;
					}
				}
			}
		}
	},
	insertCard: function(firstValue, secondValue, containerId){
		var cardDetails = Game.getNewCardDetails({firstValue: firstValue, secondValue: secondValue}, $("#" + containerId).data("position"));
	
		var id;
		if (GameTable.isInitialPointFilled === false) {
			GameTable.isInitialPointFilled = true;
			GameTable.isFirstPointContainerFilled = true;
			GameTable.isSecondPointContainerFilled = true;
			Game.initialCard = {firstValue: firstValue, secondValue: secondValue, firstAllowValue: firstValue, secondAllowValue: secondValue};
			id = Card.appendCard($('body'), cardDetails.containerOrientation, firstValue, secondValue, false);
		} else {
			var prevCardAllowValue = -1;
			var allowValue = -1;
			
			if($("#" + containerId).data("point") == "first"){
				GameTable.isFirstPointContainerFilled = true;
				var prevAllowValue = -1;
				if (Game.firstPointCards.length > 0) {
					prevCardAllowValue = Game.firstPointCards[Game.firstPointCards.length - 1].allowValue;
				} else {
					prevCardAllowValue = Game.initialCard.firstAllowValue;
				}
				
				if (prevCardAllowValue == firstValue) {
					allowValue = secondValue;
				} else {
					allowValue = firstValue;
				}
				
				Game.firstPointCards.push({firstValue: firstValue, secondValue: secondValue, allowValue: allowValue});
				
			} else if ($("#" + containerId).data("point") == "second") {
				GameTable.isSecondPointContainerFilled = true;
				
				if (Game.secondPointCards.length > 0) {
					prevCardAllowValue = Game.secondPointCards[Game.secondPointCards.length - 1].allowValue;
				} else {
					prevCardAllowValue = Game.initialCard.secondAllowValue;
				}
				
				if (prevCardAllowValue == firstValue) {
					allowValue = secondValue;
				} else {
					allowValue = firstValue;
				}
				Game.secondPointCards.push({firstValue: firstValue, secondValue: secondValue, allowValue: allowValue});
			}
			
			if($("#" + containerId).data("direction") == "left"){
				if (allowValue == firstValue){
					id = Card.appendCard($('body'), cardDetails.containerOrientation, firstValue, secondValue, false);
				} else {
					id = Card.appendCard($('body'), cardDetails.containerOrientation, secondValue, firstValue, false);
				}
			} else if ($("#" + containerId).data("direction") == "right") {
				if (allowValue == firstValue){
					id = Card.appendCard($('body'), cardDetails.containerOrientation, secondValue, firstValue, false);
				} else {
					id = Card.appendCard($('body'), cardDetails.containerOrientation, firstValue, secondValue, false);
				}
			} else if ($("#" + containerId).data("direction") == "up") {
				if (allowValue == firstValue){
					id = Card.appendCard($('body'), cardDetails.containerOrientation, firstValue, secondValue, false);
				} else {
					id = Card.appendCard($('body'), cardDetails.containerOrientation, secondValue, firstValue, false);
				}
			} else if ($("#" + containerId).data("direction") == "down") {
				if (allowValue == firstValue){
					id = Card.appendCard($('body'), cardDetails.containerOrientation, secondValue, firstValue, false);
				} else {
					id = Card.appendCard($('body'), cardDetails.containerOrientation, firstValue, secondValue, false);
				}
			}
		}
		
		$("#" + containerId).append(document.getElementById(id));
		$("#" + containerId).data("allowdrop", false);
		
		GameTable.removePossibleCardContainers();
	}
};

function PlayerTable(playerBoardContainer, scoreBoardContainer) {
	var boardCardContainerNo = 1;
	var scoreBoardContainer = scoreBoardContainer;
	var playerBoardContainer = playerBoardContainer;
	var cardContainers = [];
	var cardIds = [];
	var clientId;
	var playerPosition;
	
	$("#" + playerBoardContainer).append("<table id='table" + playerBoardContainer + "'></table>");
	$("#table" + playerBoardContainer).append("<tr id='tr" + playerBoardContainer + "'></tr>");
	$("#" + scoreBoardContainer).html("<center>Score: 0</center>");
	
	this.addBlankCard = function(){
		this.addCard(0, 0, true);
	}
	
	this.highlightBoard = function(cardAvailable){
		if(cardAvailable == true){
			$("#" + playerBoardContainer).css("background-color", "#04ad04");
		} else {
			$("#" + playerBoardContainer).css("background-color", "#c10505");
		}
	}
	
	this.displayScore = function(newScore) {
		$("#" + scoreBoardContainer).html("<center>Score: " + newScore + "</center>");
	}
	
	this.addCard = function(firstValue, secondValue, isBlankCard = false){
		$("#tr" + playerBoardContainer).append("<td id='td" + playerBoardContainer + boardCardContainerNo + "'></td>");
		$("#td" + playerBoardContainer + boardCardContainerNo).append("<div class='player-board-card-container' id='playerBoardCardContainer" + playerBoardContainer + boardCardContainerNo + "'></div>");
		if(isBlankCard == false){
			cardIds.push(Card.appendCard($("#playerBoardCardContainer" + playerBoardContainer + boardCardContainerNo), "vertical", firstValue, secondValue));
		} else {
			cardIds.push(Card.appendBlankCard($("#playerBoardCardContainer" + playerBoardContainer + boardCardContainerNo), "vertical"));
		}
		cardContainers.push($("#playerBoardCardContainer" + playerBoardContainer + boardCardContainerNo));
		boardCardContainerNo++;
	};
	
	this.highlightInitialCard = function(){
		for (var i = 0; i < cardContainers.length; i++) {
			var element = cardContainers[i];
			if (element.children().length > 0) {
				var card = element.find( $(".card") );
				card.css("top", 0);
				if (GameTable.isInitialPointFilled === false){
					if(gameStage == 1 && (card.data("firstvalue")==6 && card.data("secondvalue")==6)){
						card.css("top", -10);
						card.draggable({
							drag: function( event, ui ) {
								GameTable.draggedCardId = event.target.id;
								
								GameTable.removePossibleCardContainers();
								var firstValue = $("#" + event.target.id).data("firstvalue");
								var secondValue = $("#" + event.target.id).data("secondvalue");
								Game.drawPosibleCardContainers(firstValue, secondValue, gameStage);
							},
							stop: function(event, ui){
								$("#" + event.target.id).css("left", 0);
								$("#" + event.target.id).css("top", -10);
							}
						});
						card.draggable("enable");
					}
				}
			}
		}
	};
	
	this.highlightPossibleCards = function(){
		var returnFlag = false;
		for (var i = 0; i < cardContainers.length; i++) {
			var element = cardContainers[i];
			if (element.children().length > 0) {
				var card = element.find( $(".card") );
				card.css("top", 0);
				card.draggable("disable");
			}
		}
		
		if(cardPlayingTurnPlayerId !== currentPlayerId){
			return returnFlag;
		}
		var allowValues = [];
		if(Game.firstPointCards.length <= 0 && Game.secondPointCards.length <= 0){
			allowValues.push(Game.initialCard.firstValue);
			allowValues.push(Game.initialCard.secondValue);
		} else {
			if(Game.firstPointCards.length > 0){
				var prevCardDetails = Game.firstPointCards[Game.firstPointCards.length - 1];
				allowValues.push(prevCardDetails.allowValue);
			} else {
				allowValues.push(Game.initialCard.firstValue);
			}
				
			if(Game.secondPointCards.length > 0){
				var prevCardDetails = Game.secondPointCards[Game.secondPointCards.length - 1];
				allowValues.push(prevCardDetails.allowValue);
			} else {
				allowValues.push(Game.initialCard.secondValue);
			}
		}
		
		for (var i = 0; i < cardContainers.length; i++) {
			var element = cardContainers[i];
			if (element.children().length > 0) {
				var card = element.find( $(".card") );
				if(jQuery.inArray( card.data("firstvalue"), allowValues ) > -1 || jQuery.inArray( card.data("secondvalue"), allowValues ) > -1){
					card.css("top", -10);
					card.draggable({
						drag: function( event, ui ) {
							GameTable.draggedCardId = event.target.id;
								
							GameTable.removePossibleCardContainers();
							var firstValue = $("#" + event.target.id).data("firstvalue");
							var secondValue = $("#" + event.target.id).data("secondvalue");
							Game.drawPosibleCardContainers(firstValue, secondValue, gameStage);
						},
						stop: function(event, ui){
							$("#" + event.target.id).css("left", 0);
							$("#" + event.target.id).css("top", -10);
						}
					});
					card.draggable("enable");
					returnFlag = true;
				}
			}
		}
		
		return returnFlag;
	};
	
	this.makeAllCardsDraggable = function(){
		for (var i = 0; i < cardContainers.length; i++) {
			var element = cardContainers[i];
			if (element.children().length > 0) {
				var card = element.find( $(".card") );
				$("#" + event.target.id).css("top", -10);
				card.draggable({
					drag: function( event, ui ) {
						GameTable.draggedCardId = event.target.id;
								
						GameTable.removePossibleCardContainers();
						var firstValue = $("#" + event.target.id).data("firstvalue");
						var secondValue = $("#" + event.target.id).data("secondvalue");
						Game.drawPosibleCardContainers(firstValue, secondValue, gameStage);
					},
					stop: function(event, ui){
						$("#" + event.target.id).css("left", 0);
						$("#" + event.target.id).css("top", -10);
					}
				});
				card.draggable("enable");
				returnFlag = true;
			}
		}
	}
	
	this.isAnyCardRemaining = function(){
		for (var i = 0; i < cardContainers.length; i++) {
			var element = cardContainers[i];
			if (element.children().length > 0) {
				return true;
			}
		}
		return false;
	}
	
	this.getAllCardsValues = function(){
		var values = [];
		for (var i = 0; i < cardContainers.length; i++) {
			var element = cardContainers[i];
			if (element.children().length > 0) {
				var card = element.find( $(".card") );
				var secondValue = card.data("secondvalue");
				var firstvalue = card.data("firstvalue");
				values.push([firstvalue, secondValue]);
			}
		}
		return values;
	}
	
	this.removeAllCards = function(){
		var values = [];
		for (var i = 0; i < cardContainers.length; i++) {
			var element = cardContainers[i].parent();
			element.remove();
		}
		return values;
	}
	
	this.getLastCardId = function(){
		return cardIds.pop();
	}
};

function restartGame(){
	GameTable.refresh();
	Game.refresh();
	$("#container").html("");
	$("#leftPlayerBoard").html("");
	$("#topPlayerBoard").html("");
	$("#rightPlayerBoard").html("");
	$("#playerBoard").html("");
	startGame();
	$("#restartBtn").hide();
}

function startGame(){
	//currentPlayerId = -1;
	cardPlayingTurnPlayerId = -2;
	cardMovedClientId = -3;
	remainingCardsArray = [];
	gameStage++;
	playerIDs = [];
	
	leftPlayer = assignBlankCardsToBoard("leftPlayerBoard", "leftScore1", 7);
	topPlayer = assignBlankCardsToBoard("topPlayerBoard", "topScore1", 7);
	rightPlayer = assignBlankCardsToBoard("rightPlayerBoard", "rightScore1", 7);
	
	leftPlayer.playerPosition = "left";
	topPlayer.playerPosition = "top";
	rightPlayer.playerPosition = "right";
	
	leftPlayer.displayScore(leftPlayerScore);
	topPlayer.displayScore(topPlayerScore);
	rightPlayer.displayScore(rightPlayerScore);
	
	playersArray = [];
	playersArray.push(leftPlayer);
	playersArray.push(topPlayer);
	playersArray.push(rightPlayer);
	
	Server.send( 'message', '{"commandType": "joinGame", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ', "userid": ' + data.userid + '}' );
	console.log("join game gameid: " + gameId);
}

function assignBlankCardsToBoard(boardId, scoreId, noOfCards){
	var table = new PlayerTable(boardId, scoreId);
	for (var i = 0; i < noOfCards; i++ ){
		table.addBlankCard();
	}
	return table;
}

function log( text ) {
	console.log(text);
}

function send( text ) {
	Server.send( 'message', text );
}

var Server;
$( document ).ready(function() {	
	leftPlayer = assignBlankCardsToBoard("leftPlayerBoard", "leftScore1", 7);
	topPlayer = assignBlankCardsToBoard("topPlayerBoard", "topScore1", 7);
	rightPlayer = assignBlankCardsToBoard("rightPlayerBoard", "rightScore1", 7);
	
	leftPlayer.playerPosition = "left";
	topPlayer.playerPosition = "top";
	rightPlayer.playerPosition = "right";
	
	playersArray.push(leftPlayer);
	playersArray.push(topPlayer);
	playersArray.push(rightPlayer);
	
	log('Connecting...');
	Server = new FancyWebSocket('ws://127.0.0.1:9300');

	//Let the user know we're connected
	Server.bind('open', function() {
		log( "Connected." );
		//send joingame command
		Server.send( 'message', '{"commandType": "initJoinGame", "userid": ' + data.userid + ', "password": "' + data.password + '", "GameID": 0}' );
	});

	//OH NOES! Disconnection occurred.
	Server.bind('close', function( data ) {
		log( "Disconnected." );
	});

	//Log any messages sent from server
	Server.bind('message', function( payload ) {
		log( payload );
		var serverMessage = jQuery.parseJSON(payload);
		switch(serverMessage.commandType){
			case "memberJoin":
				gameId = serverMessage.gameID;
				playerIDs = serverMessage.clientIDs.split(",");
				if(currentPlayerId == -1){
					currentPlayerId = playerIDs[playerIDs.length - 1];
				}
				var connectedMembers = serverMessage.membersNo;
				if (connectedMembers < noOfPlayers) {
					$("#connectedMsg").html(connectedMembers + " people connected!!");
				} else {
					$("#connectedMsg").html("Game starting...");
				}
				break;
			case "CardAllocation":
				var cards = serverMessage.cards;
				stackCurrentPlayerTableCards(cards);
				var arrayIndex = $.inArray(currentPlayerId, playerIDs);
				currentPlayer.clientId = currentPlayerId;
				rightPlayer.clientId = playerIDs[(arrayIndex + 1)%noOfPlayers];
				topPlayer.clientId = playerIDs[(arrayIndex + 2)%noOfPlayers];
				leftPlayer.clientId = playerIDs[(arrayIndex + 3)%noOfPlayers];
				$("#backgroundFront").hide();
				$("#connectedMsg").hide();
				break;
			case "movedCard":
				cardMovedClientId = serverMessage.clientId;
				for(var i = 0; i < playersArray.length; i++){
					var player = playersArray[i];
					if(player.clientId == cardMovedClientId){
						var containerPosition = serverMessage.containerPosition;
						var cardValues = serverMessage.cardValues;
						var cardDetails = Game.getNewCardDetails({firstValue: cardValues[0], secondValue: cardValues[1]}, null);
						if(containerPosition === "initial"){
							var id = GameTable.initiate(cardDetails.containerOrientation);
						} else if (containerPosition === "first") {
							var id = GameTable.drawNextFirstPointContainer(cardDetails.containerOrientation);
						} else if (containerPosition === "second") {
							var id = GameTable.drawNextSecondPointContainer(cardDetails.containerOrientation);
						}
						Game.insertCard(cardValues[0], cardValues[1], id);
						$("#" + player.getLastCardId()).remove();
					}
				}
				for(var i = 0; i < playerIDs.length; i++){
					var player = playerIDs[i];
					if(player == cardMovedClientId){
						cardPlayingTurnPlayerId = playerIDs[(i+1)%noOfPlayers];
					}
				}
				
				var isCardAvailable = currentPlayer.highlightPossibleCards();
				if(!isCardAvailable && cardPlayingTurnPlayerId == currentPlayerId){
					Server.send( 'message', '{"commandType": "emptyMove", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + '}' );
				}
				break;
			case "emptyMove":	//if there is no card to put then client send emptyMove command
				var cardEmptyMovedClientId = serverMessage.clientId;
				for(var i = 0; i < playerIDs.length; i++){
					var player = playerIDs[i];
					if(player == cardEmptyMovedClientId){
						cardPlayingTurnPlayerId = playerIDs[(i+1)%noOfPlayers];
					}
				}
				var isCardAvailable = currentPlayer.highlightPossibleCards();
				if(!isCardAvailable && cardPlayingTurnPlayerId == currentPlayerId){
					//if this client is the last card moved person then there is no card to put. finish the game.
					if(cardMovedClientId == currentPlayerId){
						showMessage("Gameover...");
						Server.send( 'message', '{"commandType": "gameOver", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ', "type": 1}' );
						var remainingCardsValue = currentPlayer.getAllCardsValues();
						//get current player remaining cards 
						remainingCardsArray.push({remainingCardsValue:remainingCardsValue, clientId: currentPlayerId});
						Server.send( 'message', '{"commandType": "remainingCards", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ', "type": 1, "remainingCards": "' + JSON.stringify(remainingCardsValue) + '"}' );
					} else {
						Server.send( 'message', '{"commandType": "emptyMove", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + '}' );
					}
				}
				break;
			case "gameOver":
				var gameOverType = serverMessage.type;
				var announcedClientId = serverMessage.clientId;
				if(gameOverType == 1){
					var remainingCardsValue = currentPlayer.getAllCardsValues();
					//get current player remaining cards 
					remainingCardsArray.push({remainingCardsValue:remainingCardsValue, clientId: currentPlayerId});
					Server.send( 'message', '{"commandType": "remainingCards", "clientId": ' + currentPlayerId + ', "GameID": ' + gameId + ', "type": 1, "remainingCards": "' + JSON.stringify(remainingCardsValue) + '"}' );
					showMessage("Gameover...");
				} else if(gameOverType == 2){
					showMessage(announcedClientId + " won the game!!!");
					for(var i = 0; i < playersArray.length; i++){
						var player = playersArray[i];
						if(player.clientId == announcedClientId){
							var score = 0;
							if(player.playerPosition == "left"){
								score = leftPlayerScore++;
							}
							if(player.playerPosition == "top"){
								score = topPlayerScore++;
							}
							if(player.playerPosition == "right"){
								score = rightPlayerScore++;
							}
							player.displayScore(score);
						}
					}
				}
					
				break;
			case "remainingCards":
				var announcedClientId = serverMessage.clientId;
				var remainingCards = jQuery.parseJSON(serverMessage.remainingCards);
				remainingCardsArray.push({remainingCardsValue: remainingCards, clientId: announcedClientId});
				
				var player;
				if(rightPlayer.clientId == announcedClientId){
					player = rightPlayer;
				}
				if(topPlayer.clientId == announcedClientId){
					player = topPlayer;
				}
				if(leftPlayer.clientId == announcedClientId){
					player = leftPlayer;
				}
				player.removeAllCards();
				for(var i = 0; i < remainingCards.length; i++){
					var card = remainingCards[i];
					player.addCard(card[0], card[1]);
				}
				if(remainingCardsArray.length == noOfPlayers){
					var minCardValue = 13;
					var wonClientId = -1;
					for(var j = 0; j < remainingCardsArray.length; j++){
						var tempRemainingCard = remainingCardsArray[j].remainingCardsValue;
						if(tempRemainingCard.length > 0){
							for(var i = 0; i < tempRemainingCard.length; i++){
								var card = tempRemainingCard[i];
								if(minCardValue > (card[0] + card[1])){
									minCardValue = card[0] + card[1];
									wonClientId = remainingCardsArray[j].clientId;
									lastGameWinner = wonClientId;
								}
							}
						} else {
							wonClientId = remainingCardsArray[j].clientId;
							lastGameWinner = wonClientId;
							break;
						}
					}
					if(wonClientId == currentPlayerId){
						showMessage("You won the game!!!");
						currentPlayerScore++;
						currentPlayer.displayScore(currentPlayerScore);
					} else {
						showMessage(wonClientId + " won the game!!!");
						
						for(var i = 0; i < playersArray.length; i++){
							var player = playersArray[i];
							if(player.clientId == wonClientId){
								var score = 0;
								if(player.playerPosition == "left"){
									score = leftPlayerScore++;
								}
								if(player.playerPosition == "top"){
									score = topPlayerScore++;
								}
								if(player.playerPosition == "right"){
									score = rightPlayerScore++;
								}
								player.displayScore(score);
							}
						}
					}
				}
				break;
			case "GameTerminated":
				Server.disconnect();
				showMessage("Game teminated");
				$("#restartBtn").hide();
				break;
		}
	});

	Server.connect();
	
});

function showMessage(message){
	$("#backgroundFront").show();
	$("#connectedMsg").show();
	$("#connectedMsg").html(message);
	$("#restartBtn").show();
}

var cardList = [[0,0],[0,1],[0,2],[0,3],[0,4],[0,5],[0,6],
				[1,1],[1,2],[1,3],[1,4],[1,5],[1,6],
				[2,2],[2,3],[2,4],[2,5],[2,6],
				[3,3],[3,4],[3,5],[3,6],
				[4,4],[4,5],[4,6],
				[5,5],[5,6],
				[6,6]];
function stackCurrentPlayerTableCards(cards){
	currentPlayer = new PlayerTable("playerBoard", "playerScore1");
	currentPlayer.displayScore(currentPlayerScore);
	
	for(var i = 0; i < cards.length; i++){
		var cardNo = cards[i];
		currentPlayer.addCard(cardList[cardNo][0],cardList[cardNo][1]);
		if(gameStage == 1 && (cardList[cardNo][0] == 6 && cardList[cardNo][1] == 6)){
			cardPlayingTurnPlayerId = currentPlayerId;
			currentPlayer.highlightInitialCard();
		} if(gameStage > 1 && lastGameWinner == currentPlayerId) {
			cardPlayingTurnPlayerId = currentPlayerId;
		}
	}
	
	if(gameStage > 1 && lastGameWinner == currentPlayerId) {
		cardPlayingTurnPlayerId = currentPlayerId;
		currentPlayer.makeAllCardsDraggable();
	}
}