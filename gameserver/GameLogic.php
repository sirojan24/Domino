<?php
	print(json_decode('{"commandType": "movedCard", "clientId": 4, "GameID": 4, "cardValues": [3,3]}'));
	function getCardsForPlayers($noOfPlayers){
		$cardsForPlayers = array();
		if($noOfPlayers < 2 || $noOfPlayers > 4){
			//need to return an error msg
			return false;
		}else if($noOfPlayers ==3){
			$randomizedCards = randomGen(1, 27);
			$cardsForPlayers[1] = array_slice($randomizedCards, 0, 9);
			$cardsForPlayers[2] = array_slice($randomizedCards, 9, 9);
			$cardsForPlayers[3] = array_slice($randomizedCards, 18, 9);
		}else{
			$randomizedCards = randomGen(0, 27);
			$cardsForPlayers[1] = array_slice($randomizedCards, 0, 7);
			$cardsForPlayers[2] = array_slice($randomizedCards, 7, 7);
			$cardsForPlayers[3] = array_slice($randomizedCards, 14, 7);
			$cardsForPlayers[4] = array_slice($randomizedCards, 21, 7);
		}
		return $cardsForPlayers;	
	}
	
	function randomGen($min, $max) {
		$numbers = range($min, $max);
		shuffle($numbers);
		return $numbers;
	}
 ?>