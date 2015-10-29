<?php

session_start();

/**
 * Download audio from url.
 * @author Dmitry Pavlov <dmitrypavlov.design@gmail.com>
 * @license https://raw.github.com/ifamed/slothMusic/master/LICENSE
 */

set_time_limit(10);

require 'class/slothmusic.class.php';

if (verify($_GET['o']) && verify($_GET['i'])) {
	$data = array(
		'owner_id' => (string) $_GET['o'],
		'id' => (string) $_GET['i'],
	);
	$slothMusic = new slothMusic();
	$slothMusic->download($data['owner_id'], $data['id']);
}

?>