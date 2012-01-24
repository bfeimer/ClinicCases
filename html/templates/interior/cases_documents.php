<?php if (!isset($update)){echo <<<TOOLS

<div class="user_display ui-widget ui-widget-content ui-corner-bottom user_widget" tabindex="1">

</div>

<div class="case_detail_panel_tools">

	<div class="case_detail_panel_tools_left"><img src="html/ico/house.png"> Home /<span class="path_display"></span></div>

	<div class="case_detail_panel_tools_right">
TOOLS;

		if ($_SESSION['permissions']['documents_modify'] == '1')
		{
			echo "<button class='doc_new_folder'>New Folder</button>";
		}

		if ($_SESSION['permissions']['documents_upload'])
		{
			echo "<button class='doc_upload'>Upload</button>";
		}

echo <<<TOOLS
	</div>

</div>

<div class = "case_detail_panel_casenotes">

TOOLS;
}
?>

	<?php

	foreach ($folders as $folder)

		{
			if (strrchr($folder['folder'],'/'))
			{$folder_name = substr(strrchr($folder['folder'],'/'),1);}
			else
			{$folder_name = $folder['folder'];}
			echo "<div class='doc_item folder' path='$folder[folder]'><a target='_new' href='#'><img src='html/ico/folder.png'><p>$folder_name</p></a></div>";
		}


	foreach ($documents as $document)

		{
			$icon = get_icon($document['type']);
			$user = username_to_fullname($dbh,$document['username']);
			$date = extract_date_time($document['date_modified']);

			echo "<div id='doc_$document[id]' class='doc_item doc'><a target='_new' href='$document[url]'><img src='$icon'><p>$document[name]</p></a></div>";
			echo "<div class='doc_properties' tabindex='1'><h3><img src='$icon'>$document[name]</h3>
			<hr />
			<p><label>Type</label>     $document[type]</p>
			<p><label>Uploaded:</label>     $date</p>
			<p><label>Uploaded By:</label>     $user</p>
			</div>";
		}

	?>


<?php if (!isset($update))
		{ echo "</div>";}
?>