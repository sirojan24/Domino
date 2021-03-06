<?php

include 'inc/init.php';

if(!isset($_GET["u"]) || !($u = $db->getRow("SELECT * FROM `".MLS_PREFIX."users` WHERE `userid`= ?i", $_GET["u"]))){
	$page->error = "User doesn't exists or it was deleted !";
	$u = new stdClass();
	$u->username = 'Guest';
}

if(isset($_GET["request"])){
	if (!$user->isFriendRequestSent($u->userid) && !$user->isFriendRequestCome($u->userid) && $user->exists($_GET["request"])){
		$user->sendFriendRequest($_GET["request"]);
	}
}

if(isset($_GET["accept_request"]) && $_GET["accept_request"] == true){
	$user->acceptFriendRequest($_GET["u"]);
}

if(isset($_GET["remove_friend"]) && $_GET["remove_friend"] == true){
	$user->removeFriend($_GET["u"]);
}

if(isset($_GET["remove_friend_request"]) && $_GET["remove_friend_request"] == true){
	$user->removeFriendRequest($_GET["u"]);
}

$page->title = "Profile of ". $options->html($u->username);


include 'header.php';


if(isset($page->error)) 
  $options->fError($page->error);



$show_actions = ''; // holds the actions links




if($user->group->canban && $user->hasPrivilege($u->userid) && ($user->data->userid != $u->userid))
	$show_actions .= "<li><a href='$set->url/mod.php?act=ban&id=$u->userid'><i class='icon-ban-circle'></i> ".($u->banned ? "Un" : "")."Ban ".$options->html($u->username)."</a></li>";



if($user->group->canhideavt && $user->hasPrivilege($u->userid))
	$show_actions .= "<li><a href='$set->url/mod.php?act=avt&id=$u->userid'><i class='icon-eye-close'></i> ".($u->showavt ? "Hide" : "Show")." avatar</a></li>";


if(($user->data->userid == $u->userid) || ($user->group->canedit && $user->hasPrivilege($u->userid))){
	$show_actions .= "<li><a href='$set->url/user.php?id=$u->userid'><i class='icon-pencil'></i> Edit profile</a></li>";
}

if($user->isAdmin() && $user->data->userid != $u->userid)
	$show_actions .="<li><a href='$set->url/mod.php?act=del&id=$u->userid'><i class='icon-trash'></i> Delete ".$options->html($u->username)."</li>";


$tooltip = ''; // holds the tooltip data
$addFriendButton = '';
if($user->data->userid == $u->userid) {
	$tooltip = " rel='tooltip' title='change avatar'";
}
else
{
	if($user->group->type != 3) { // we make it invisible for admins only
		if(!$user->isFriend($u->userid)){
			if ($user->isFriendRequestSent($u->userid)){
				$addFriendButton = "<div class='btn-group'>
									<a class='btn btn-info dropdown-toggle' data-toggle='dropdown'>Friend Request Sent <span class='caret'></span></a>
									<ul class='dropdown-menu'>
										<li>
											<a href='$set->url/profile.php?u=$u->userid&remove_friend_request=true'>
												<i class='icon-ban-circle'></i> Remove Friend Request
											</a>
										</li>
									</ul>
								</div>";
			} else if ($user->isFriendRequestCome($u->userid)){
				$addFriendButton = "<a href='$set->url/profile.php?u=$u->userid&accept_request=true' class='btn btn-primary'>Accept Friend Request</a>";
			} else {
				$addFriendButton = "<a href='$set->url/profile.php?u=$u->userid&request=$u->userid' class='btn btn-primary'>Add as Friend</a>";
			}
		}
		else {
			$addFriendButton = "<div class='btn-group'>
									<a class='btn btn-success dropdown-toggle' data-toggle='dropdown'>Friends <span class='caret'></span></a>
									<ul class='dropdown-menu'>
										<li>
											<a href='$set->url/profile.php?u=$u->userid&remove_friend=true'>
												<i class='icon-ban-circle'></i> Remove Friend
											</a>
										</li>
									</ul>
								</div>";
		}
	}
}


// show data based on privacy
$extra_details = '';


$privacy  = $db->getRow("SELECT * FROM `".MLS_PREFIX."privacy` WHERE `userid` = ?i", $u->userid);
$group  = $db->getRow("SELECT * FROM `".MLS_PREFIX."groups` WHERE `groupid` = ?i", $u->groupid);

if($privacy->email == 1 || $user->isAdmin())
	$extra_details .= "<b>Email:</b> ". $options->html($u->email)."<br/>";





echo "<div class='container'>
	<h3 class='pull-left'>Profile of ".$options->html($u->username)."</h3>";

if($show_actions != '')
echo "<div class='btn-group pull-right'>
  		<a class='btn dropdown-toggle' data-toggle='dropdown' href='#'>
    		Actions
    		<span class='caret'></span>
  		</a>
  		<ul class='dropdown-menu'>

  			$show_actions
  		
  		</ul>
  	</div>";

echo "  	
  	<div class='clearfix'></div>
	<hr>
	<div class='row'>	
		<div class='span3'>
			<a href='http://gravatar.com'$tooltip>
				<img src='".$user->getAvatar($u->userid, 240)."' width='240' class='img-polaroid' alt='".$options->html($u->username)."'>
			</a>
			<div style='text-align:center;'><b>".$user->showName($u->userid)." (".$options->html($u->username).") </b></div>
		</div>
		<div class='span7 well' style='margin:10px;'> 
			
				<b>Rank:</b> ".$options->html($group->name)."<br/>
				<b>Last seen:</b> ".$options->tsince($u->lastactive)."<br/>
				$extra_details
			
			<div class='pull-right'>
				$addFriendButton
			</div>
		</div>

	</div>
</div>";


include 'footer.php';