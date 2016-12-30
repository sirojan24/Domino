<?php
class Game {

	/**
	 * Stores the object of the mysql class
	 * @var object 
	*/
	var $db; 
	/**
	 * stores the user data without any filter
	 * @var object
	*/
	var $data;

	function __construct($db) {
		$this->db = $db;
		$this->data = new stdClass();
	}
	/**
	 * grabs the data about the user
	 * @param  integer $userid the id to grab data for
	 * @return object         data about the specified id
	 */
	function grabData($gameID) {
		$this->data = $this->db->getRow("SELECT * FROM `".MLS_PREFIX."games` WHERE `id` = ?i", $gameID);
	}
	
	function getAvailableGame($catogory){
		if($catogory == 'public'){
			//there should be only one started game at a time
			$startedGame = $this->db->getRow("SELECT * FROM `".MLS_PREFIX."games` WHERE `status` = \"started\"");
			if(!$startedGame){
				$request_data = array(
					"catogory" => "public",
					"status" => "started"
				);
				$this->db->query("INSERT INTO `".MLS_PREFIX."games` SET ?u", $request_data);
				$startedGame = $this->db->getRow("SELECT * FROM `".MLS_PREFIX."games` WHERE `status` = \"started\"");
			}
			return $startedGame;
		}
	}
	
	function markGameAsPlaying($gameID){
		global $db;
		$db->query("UPDATE `".MLS_PREFIX."games` SET `status` = \"playing\" WHERE `id`=\"$gameID\"");
	}
	
	function markGameAsStopped($gameID){
		global $db;
		$db->query("UPDATE `".MLS_PREFIX."games` SET `status` = \"stopped\" WHERE `id`=\"$gameID\"");
	}
	
	function markGameAsSecondStageStarted($gameID){
		global $db;
		$db->query("UPDATE `".MLS_PREFIX."games` SET `status` = \"second_stage_started\" WHERE `id`=\"$gameID\"");
	}
}



