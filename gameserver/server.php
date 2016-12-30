<?php
// prevent the server from timing out
set_time_limit(0);

const USER_LOGS = 'players.log'; 
//error_log("exists!", 3, USER_LOGS);
include "../inc/init.php";
include "../lib/game.class.php";

// include the web sockets server script (the server is started at the far bottom of this file)
require 'class.PHPWebSocket.php';
define("NO_OF_PLAYERS", 4);
$GameID = 1;
$GameClients = array();
$cards;
$connectedPlayer = 0;
$gameUserIDs = array();

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

// when a client sends data to the server
function wsOnMessage($clientID, $message, $messageLength, $binary) {
	global $user;
	global $Server;
	global $GameClients;
	global $gameUserIDs;
	
	$ip = long2ip( $Server->wsClients[$clientID][6] );

	// check if message length is 0
	if ($messageLength == 0) {
		$Server->wsClose($clientID);
		return;
	}
			
	$command = json_decode($message) -> commandType;
	$currentGameId = json_decode($message) -> GameID;
	switch($command){
		case "gameOver":
		case "remainingCards":
		case "emptyMove":
		case "movedCard":
			foreach ( $GameClients[$currentGameId] as $client ) {
				if($client !== $clientID){
					$Server->wsSend($client, $message);
				}
			}
			break;
		case "initJoinGame":
			$userid = json_decode($message) -> userid;
			$password = json_decode($message) -> password;
			if($user -> existsAccount($userid, $password)){
				joinGame ($clientID, $userid, -1);
			}
			break;
		case "joinGame":
			$userid = json_decode($message) -> userid;
			if(count($gameUserIDs[$currentGameId]) == 4){
				$gameUserIDs[$currentGameId] = array();
			}
			joinGame ($clientID, $userid, $currentGameId);
			break;
	}
}

// when a client connects
function wsOnOpen($clientID){
	//error_log("clientId $clientID connected.".PHP_EOL, 3, USER_LOGS);
}

function joinGame ($clientID, $userID, $GameID){
	global $Server;
	global $db;
	//global $GameID;
	global $GameClients;
	$palyerNoInGame = 1;
	global $cards;
	global $connectedPlayer;
	global $gameUserIDs;
	$connectedPlayer++;
	$gameStage = -1;
	
	$ip = long2ip( $Server->wsClients[$clientID][6] );

	$Server->log( "$ip ($clientID) has connected." );

	$game = new Game($db);
	if($GameID == -1){
		$GameID = $game->getAvailableGame('public')->id;
		$gameStage = 1;
	} else {
		$game->markGameAsSecondStageStarted($GameID);
	}
	error_log("game exist ".array_key_exists($GameID, $gameUserIDs).PHP_EOL, 3, USER_LOGS);
	if(array_key_exists($GameID, $gameUserIDs)){
		foreach ( $gameUserIDs[$GameID] as $tempUserID ) {
			if($tempUserID == $userID){
				//send memberjoin to newly refreshed client
				$memberFullJsonMsg = '{"commandType": "memberJoin","clientIDs" : "';
				for($i=0; $i < count($GameClients[$GameID]); $i++){
					$memberFullJsonMsg .= $GameClients[$GameID][$i];
					if($i != count($GameClients[$GameID]) - 1){
						$memberFullJsonMsg .= ',';
					}
				}
				$memberFullJsonMsg .= '", "gameID" : '.$GameID.'}';
				$Server->wsSend($clientID, $memberFullJsonMsg);
				return;
			}
		}
	}
	else {
		$gameUserIDs[$GameID] = array();
	}
	error_log("joined userid :- $userID, gameid :- $GameID".count($gameUserIDs[$GameID]).PHP_EOL, 3, USER_LOGS);
	array_push($gameUserIDs[$GameID], $userID);
	if(count($gameUserIDs[$GameID]) == 4){
		$game->markGameAsPlaying($GameID);
	}
	
	if(!array_key_exists($GameID, $GameClients)){
		$palyerNoInGame = 1;
		$GameClients[$GameID] = array();
		$cards = getCardsForPlayers(NO_OF_PLAYERS);
	}
	
	if($gameStage == 1){
		array_push($GameClients[$GameID], $clientID);
	}
	
	//Send a join notice to everyone but the person who joined
	foreach ( $GameClients[$GameID] as $client ) {
		$memberFullJsonMsg = '{"commandType": "memberJoin","clientIDs" : "';
		for($i=0; $i < count($GameClients[$GameID]); $i++){
			$memberFullJsonMsg .= $GameClients[$GameID][$i];
			if($i != count($GameClients[$GameID]) - 1){
				$memberFullJsonMsg .= ',';
			}
		}
		$memberFullJsonMsg .= '", "gameID" : '.$GameID.', "membersNo" : '.count($gameUserIDs[$GameID]).'}';
		$Server->wsSend($client, $memberFullJsonMsg);
		
		if(count($gameUserIDs[$GameID]) == 4){
			$Server->wsSend($client, '{"commandType": "CardAllocation","cards":'.json_encode($cards[$palyerNoInGame]).'}');
			$palyerNoInGame++;
		}
	}	
}

// when a client closes or lost connection
function wsOnClose($clientID, $status) {
	global $Server;
	global $GameClients;
	global $db;
	$ip = long2ip( $Server->wsClients[$clientID][6] );

	$Server->log( "$ip ($clientID) has disconnected." );

	$tempGameClientIds = array();
	$gameid = 0;
	foreach($GameClients as $tempGameId => $tempGameClientsArray) {
		if(in_array($clientID, $tempGameClientsArray)){
			$gameid = $tempGameId;
			$game = new Game($db);
			$game->markGameAsStopped($tempGameId);
			foreach ( $tempGameClientsArray as $client ) {
				if($clientID !== $client){
					//$Server->wsSend($client, '{"commandType": "GameTerminated","gameID":'.$tempGameId.'}');
					array_push($tempGameClientIds, $client);
				}
			}
		}
	}
	if($gameid != 0){
		unset($GameClients[$gameid]);
	}
	//Send a user left notice to everyone in the room
	foreach ( $Server->wsClients as $id => $client ){
		if(in_array($id, $tempGameClientIds)){
			$Server->wsSend($id, '{"commandType": "GameTerminated"'.'}');
		}
	}
}

// start the server
$Server = new PHPWebSocket();
$Server->bind('message', 'wsOnMessage');
$Server->bind('open', 'wsOnOpen');
$Server->bind('close', 'wsOnClose');
// for other computers to connect, you will probably need to change this to your LAN IP or external IP,
// alternatively use: gethostbyaddr(gethostbyname($_SERVER['SERVER_NAME']))
$Server->wsStartServer('127.0.0.1', 9300);

?>