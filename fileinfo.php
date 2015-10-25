<?php

/**
 * Receive bit rate the audio file via url.
 * @author Dmitry Pavlov <dmitrypavlov.design@gmail.com>
 * @license https://raw.github.com/ifamed/slothMusic/master/LICENSE
 */

session_start();
set_time_limit(5);
header('Content-Type: application/json');

require 'class/slothmusic.class.php';

if (verify($_POST['id']) && verify($_POST['duration']) && verify($_POST['owner_id']) && verify($_POST['access_token']) && verify($_POST['uid'])) {
	try {
		$slothMusic = new slothMusic();

		$data = array(
			'id' => (int) $_POST['id'],
			'duration' => (int) $_POST['duration'],
			'owner_id' => (int) $_POST['owner_id'],
			'uid' => (int) $_POST['uid'],
			'access_token' => (string) $_POST['access_token'],
		);

		$DBH = new PDO('mysql:host=famed.mysql.ukraine.com.ua;dbname=famed_sloth', 'famed_sloth', '6kgwqg54', array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES \'UTF8\''));

		if ($DBH) {
			$slothMusic->connect = $DBH;
			echo $slothMusic->execute($data);
		} else {
			echo $slothMusic->send($slothMusic->kbps($this->get_url($data['owner_id'], $data['id']), $data['duration']));
		}
	} catch (PDOException $e) {
		echo $slothMusic->send(0);
	}
}

?>