
			<li class="slide closed"><a>Currently Assigned:</a></label></li>
	<?php

	foreach ($refresh_users_data as $user)
		
		{
			$thumbnail = thumbify($user->picture_url);
			
			if ($user->user_case_status == "active")
			{
			echo "<li class = 'active'><span><img id='imgid_" . $user->case_id . "_" . $user->username  . "' src='$thumbnail'></span></li>";
			}
			
			else
			
			{
			echo "<li class = 'inactive'><span><img id='imgid_" . $user->case_id . "_" . $user->username  . "' src='$thumbnail'></span></li>";			
			}
		
		
		}
		
		if ($_SESSION['permissions']['assign_cases'] = "1")
		{ echo "<li><span></span><img class='user_add_button' id='add_button_" . $user->case_id . "' src='people/tn_add_user.png'></span></li>";}
		?>