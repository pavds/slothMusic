<?php
set_time_limit(300);
ob_implicit_flush(true);

require 'class/fileinfo.class.php';

if (verify($_GET['u']) && verify($_GET['a']) && verify($_GET['t'])) {
	$data = array(
		'url' => (string) $_GET['u'],
		'artist' => (string) $_GET['a'],
		'title' => (string) $_GET['t'],
	);
	header('Content-type: application/x-file-to-save');
	header('Content-Disposition: attachment; filename="' . $data['artist'] . ' — ' . $data['title'] . '.mp3"');
	readfile($data['url']);
}

?>