<?php

/**
 * Receive bit rate the audio file via url.
 * @author Dmitry Pavlov <dmitrypavlov.design@gmail.com>
 * @license https://raw.github.com/ifamed/slothMusic/master/LICENSE MIT
 */

set_time_limit(10);
header('Content-Type: application/json');

require 'class/slothmusic.class.php';

if (verify($_POST['id']) && verify($_POST['url']) && verify($_POST['duration']) && verify($_POST['uid'])) {
	$data = array(
		'id' => (int) $_POST['id'],
		'url' => (string) $_POST['url'],
		'duration' => (int) $_POST['duration'],
		'uid' => (int) $_POST['uid'],
	);
	try {
		$DBH = new PDO('mysql:host=famed.mysql.ukraine.com.ua;dbname=famed_sloth', 'famed_sloth', '6kgwqg54', array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES \'UTF8\''));
		$slothMusic = new slothMusic($DBH);
		echo $slothMusic->execute($data);
		$DBH = null;
	} catch (PDOException $e) {
		$slothMusic = new slothMusic();
		echo $slothMusic->send($slothMusic->kbps($data['url'], $data['duration']));
	}
}

?>