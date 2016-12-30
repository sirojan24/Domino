<?php
	include "../inc/init.php";
	if(!$user->islg()){
		header("Location: ../");
		exit;
	}
?>
<!DOCTYPE html>
<html>
	<head>
		<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"></script>
		<script src="fancywebsocket.js"></script>
		<script src="http://code.jquery.com/jquery-1.7.2.min.js"></script>
		<script src="http://code.jquery.com/ui/1.8.21/jquery-ui.min.js"></script>
		<script type="text/javascript" src="js/game.js"></script>
		<script src="jquery.ui.touch-punch.min.js"></script>
		<link href="http://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.3/css/base/jquery.ui.all.css" rel="stylesheet">
		<link href="http://cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.2/css/lightness/jquery-ui-1.10.2.custom.min.css" rel="stylesheet">
		<link rel="stylesheet" type="text/css" href="css/game.css"/>
<?php
	echo 	'<script>
				var data = {
					"userid":'.$user->data->userid.',
					"password":'.'"'.$user->data->password.'",
				};
			</script>';
?>
	</head>
	<body>
		<div class="background"></div>
		<div id="playerScore1" class="score-board player-score-board"></div>
		<div id="topScore1" class="score-board top-score-board"></div>
		<div id="leftScore1" class="score-board left-score-board"></div>
		<div id="rightScore1" class="score-board right-score-board"></div>
		
		<div id="playerBoard" class="player-board current-player-board"></div>
		<div id="leftPlayerBoard" class="player-board left-player-board"></div>
		<div id="topPlayerBoard" class="player-board top-player-board"></div>
		<div id="rightPlayerBoard" class="player-board right-player-board"></div>
		
		<div class="table-container" id="container"></div>
		
		<div class="background front" id="backgroundFront"></div>
		<p class="connected-msg" id="connectedMsg">No people connected!!</p>
		<button class="restart-btn" onclick="javascript: restartGame()" id="restartBtn">Continue >></button>
	</body>
</html>