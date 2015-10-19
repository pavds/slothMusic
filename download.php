<?php

session_start();

/**
 * Download audio from url.
 * @author Dmitry Pavlov <dmitrypavlov.design@gmail.com>
 * @license https://raw.github.com/ifamed/slothMusic/master/LICENSE
 */

set_time_limit(10);

require 'class/slothmusic.class.php';

if (verify($_GET['o']) && verify($_GET['i']) && verify($_GET['a']) && verify($_GET['t'])) {
	$data = array(
		'owner_id' => (string) $_GET['o'],
		'id' => (string) $_GET['i'],
		'artist' => (string) $_GET['a'],
		'title' => (string) $_GET['t'],
	);
	$slothMusic = new slothMusic();
	$slothMusic->download($slothMusic->get_url($data['owner_id'], $data['id']), $data['artist'] . ' — ' . $data['title']);
}

?>