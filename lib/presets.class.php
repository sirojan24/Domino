<?php
/**
 * Presets class
 * generates some presets for different portions of the site.
 */
 
class presets {
  
  var $active = '';

  /**
   * generates the items inside the top navbar
   */
  function GenerateNavbar() {
      global $set, $user;
      $var = array();
      $var[] = array("item" ,
                      array("href" => $set->url,
                            "name" => "Home",
                            "class" => $this->isActive("home")),
                      "id" => "home");
	  
	  $userlistName = "Find Friends";
	  if($user->group->type == 3) // we make it visible for admins only
		$userlistName = "Users";
		
      $var[] = array("item",
                      array("href" => $set->url."/users_list.php",
                            "name" => "Find Friends",
                            "class" => $this->isActive("userslist")),
                      "id" => "userslist");

      //$var[] = array("item",
        //              array("href" => $set->url."/contact.php",
        //                    "name" => "Contact",
        //                    "class" => $this->isActive("contact")),
        //              "id" => "contact");
    
      if($user->group->type == 3) // we make it visible for admins only
      $var[] = array("item",
                      array("href" => $set->url."/admin",
                            "name" => "Admin Panel",
                            "class" => $this->isActive("adminpanel")),
                      "id" => "adminpanel");

		$friendRequests = $user->getFriendRequestsUserids();
		$notifications = array(); 
		
		$unseenRequest = 0;
		foreach($friendRequests as $request) {
			$sender = $user->grabData($request->senderid);
			if(!$request->seen){
				$unseenRequest++;
			} 
			array_push($notifications, 
				array("href" => $set->url."/profile.php?u=".$request->senderid,
                      "name" => "<i class=\"icon-user\"></i> Friend request from ".$sender->display_name,
                      "class" => 0)
			);
		}
		
		if(count($friendRequests) == 0){
			array_push($notifications, 
				array("href" => '',
                      "name" => "No Friend Requests",
                      "class" => 0)
			);
		}
		
		$var[] = array("dropdown",
                      $notifications,
                      "class" => 0,
                      "style" => 0,
                      "name" => "Friend Requests (".$unseenRequest.")",
                      "id" => "notificatons");
					  
		// keep this always the last one or edit hrader.php:8
		$var[] = array("dropdown",
                      array(  array("href" => $set->url."/profile.php?u=".$user->data->userid,
                                       "name" => "<i class=\"icon-user\"></i> My Profile",
                                       "class" => 0),
                              array("href" => $set->url."/user.php",
                                       "name" => "<i class=\"icon-cog\"></i> Account settings",
                                       "class" => 0),
                              array("href" => $set->url."/privacy.php",
                                       "name" => "<i class=\"icon-lock\"></i> Privacy settings",
                                       "class" => 0),

                              array("href" => $set->url."/logout.php",
                                         "name" => "LogOut",
                                         "class" => 0),
                          ),
                      "class" => 0,
                      "style" => 0,
                      "name" => $user->filter->username,
                      "id" => "user");
					  
      return $var;
  }

  function setActive($id) {
    $this->active = $id;
  }

  function isActive($id) {
    if($id == $this->active)
      return "active";
    return 0;
  }

}
