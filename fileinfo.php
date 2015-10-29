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

if (verify($_POST['id']) && verify($_POST['owner_id']) && verify($_POST['uid'])) {
	try {
		$slothMusic = new slothMusic();

		$data = array(
			'id' => (int) $_POST['id'],
			'owner_id' => (int) $_POST['owner_id'],
			'uid' => (int) $_POST['uid'],
		);

		$DBH = new PDO('mysql:host=famed.mysql.ukraine.com.ua;dbname=famed_sloth', 'famed_sloth', '6kgwqg54', array(PDO::MYSQL_ATTR_INIT_COMMAND => 'SET NAMES \'UTF8\''));

		if ($DBH) {
			$slothMusic->connect = $DBH;
			echo $slothMusic->execute($data);
		} else {
			$get_data = $this->get_data($data['owner_id'], $data['id']);

			echo $slothMusic->send($slothMusic->kbps($get_data->url, $get_data->duration));
		}
	} catch (PDOException $e) {
		echo $slothMusic->send(0);
	}
}

?>