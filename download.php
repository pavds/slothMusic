<?php

/**
 * The download audio from url.
 * @author Dmitry Pavlov <dmitrypavlov.design@gmail.com>
 * @license https://raw.github.com/ifamed/slothMusic/master/LICENSE MIT
 */

set_time_limit(10);

require 'class/slothmusic.class.php';

if (verify($_GET['u']) && verify($_GET['a']) && verify($_GET['t'])) {
	$data = array(
		'url' => (string) $_GET['u'],
		'artist' => (string) $_GET['a'],
		'title' => (string) $_GET['t'],
	);
	$slothMusic = new slothMusic();
	$slothMusic->download($data['url'], $data['artist'] . ' — ' . $data['title']);
}

?>