<?php

session_start();

require 'class/Curl.php';
require 'class/CaseInsensitiveArray.php';

use \Curl\Curl;

class slothMusic {

	// Данные приложения и пользователя
	protected $app = array(
		'id' => '5083406',
		'secret' => 'ArJmgOsWyGrE5D2F1Lln',
		'scope' => 'audio,status',
		'redirect_uri' => 'http://music.pavlovdmitry.com',
		'v' => '5.37',
		'code' => null,
		'access_token' => null,
	);
	// Ссылка на соединение с MySQL
	protected $connect;
	// Curl соеденение
	protected $curl;

	/**
	 *
	 * @param resource MySQL $connect
	 */
	public function __construct($connect = false) {
		if ($connect) {
			$this->connect = $connect;
		}

		$this->curl = new Curl();
		$this->curl->setOpt(CURLOPT_SSL_VERIFYPEER, false);
		$this->curl->setOpt(CURLOPT_SSL_VERIFYHOST, false);
		$this->curl->setOpt(CURLOPT_FOLLOWLOCATION, true);
	}

	/**
	 *
	 * @param integer $id id аудиописи
	 * @param array $data массив данных аудиозаписи (id, url, duration, uid)
	 * @return integer
	 */
	public function execute($data) {
		if ($this->check($data['id'])) {
			return $this->send($this->get($data['id']));
		} else {
			$this->app['access_token'] = $data['access_token'];
			$kbps = $this->kbps($this->get_url($data['owner_id'], $data['id']), $data['duration']);

			if ($kbps == 0) {
				$kbps = $this->kbps($this->get_url($data['owner_id'], $data['id']), $data['duration']);
			}

			if ($kbps > 0) {
				$this->save($data['id'], $kbps, $data['uid']);
			}

			return $this->send($kbps);
		}
	}

	/**
	 *
	 * @param integer $id id аудиозаписи
	 * @return integer есть ли в БД аудиозапись
	 */
	public function check($id) {
		$DBH = $this->connect;
		$STH = $DBH->prepare('SELECT id FROM audio WHERE id=:id');
		$STH->execute(array('id' => $id));
		return (int) $STH->rowCount();
	}

	/**
	 *
	 * @param integer $id id аудиозаписи
	 * @return integer битрейт аудиозаписи
	 */
	public function get($id) {
		$DBH = $this->connect;
		$STH = $DBH->prepare('SELECT kbps FROM audio WHERE id=:id');
		$STH->bindParam(':id', $id, PDO::PARAM_INT, 1);
		$STH->execute();
		$data = $STH->fetch(PDO::FETCH_ASSOC);
		return (int) $data['kbps'];
	}

	/**
	 *
	 * @param integer $id id аудиозаписи
	 * @param integer $bytes размер в байтах
	 * @param integer $kbps битрейт
	 * @param integer $uid id пользователя
	 * @return bool получилось ли добавить в БД
	 */
	public function save($id, $kbps, $uid) {
		$DBH = $this->connect;
		$STH = $DBH->prepare('INSERT INTO audio (id, kbps, uid) value (:id, :kbps, :uid)');
		return (bool) $STH->execute(array('id' => $id, 'kbps' => $kbps, 'uid' => $uid));
	}

	/**
	 *
	 * @param integer $kbps битрейт
	 * @return object битрейт аудиозаписи
	 */
	public function send($kbps) {
		$data = array('kbps' => $kbps);
		return json_encode($data);
	}

	/**
	 *
	 * @param string $url url аудиозаписи
	 * @return integer размер файла в байтах
	 */
	public function filesize($url) {
		$fp = fopen($url, 'r');
		$meta = stream_get_meta_data($fp);
		fclose($fp);
		foreach ($meta['wrapper_data'] as $contentLength) {
			if (stristr($contentLength, 'content-length')) {
				$contentLength = explode(':', $contentLength);
				return (int) trim($contentLength[1]);
			}
		}
	}

	/**
	 *
	 * @param string $url url аудиозаписи
	 * @param integer $duration длительность аудиозаписи
	 * @return integer битрейт аудиозаписи
	 */
	public function kbps($url, $duration) {
		$bytes = $this->filesize($url);
		$kbps = ceil((round($bytes / 128) / $duration) / 16) * 16;
		return (int) $kbps;
	}

	/**
	 *
	 * @param string $url url аудиозаписи
	 * @param string $filename название аудиозаписи
	 * @return file аудиозапись
	 */
	public function download($url, $filename) {
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename="' . basename($filename) . '.mp3";');
		ob_end_flush();
		@readfile($url);
		exit;
	}

	/**
	 *
	 * авторизация приложения
	 */
	public function auth_code() {
		header('Location: https://oauth.vk.com/authorize?client_id=' . $this->app['id'] . '&display=page&scope=' . $this->app['scope'] . '&redirect_uri=' . $this->app['redirect_uri'] . '&response_type=code&v=' . $this->app['v']);
	}

	/**
	 *
	 * @return string $access_token после авторизации
	 */
	public function access_token() {
		$this->app['code'] = (string) $_GET['code'];
		$this->curl->get('https://oauth.vk.com/access_token', array(
			'client_id' => $this->app['id'],
			'client_secret' => $this->app['secret'],
			'redirect_uri' => $this->app['redirect_uri'],
			'code' => $this->app['code'],
			'v' => $this->app['v'],
		));
		$this->app['access_token'] = $this->curl->response->access_token;
		return (string) $this->app['access_token'];
	}

	/**
	 * @param integer $owner_id id владельца аудиозаписи
	 * @param integer $id id аудиозаписи
	 * @return string $access_token
	 */
	public function get_url($owner_id, $id) {
		if (empty($this->app['access_token'])) {
			$this->app['access_token'] = $_SESSION['access_token'];
		}
		$this->curl->get('https://api.vk.com/method/audio.getById', array(
			'audios' => $owner_id . '_' . $id,
			'v' => $this->app['v'],
			'access_token' => $this->app['access_token'],
		));
		return (string) $this->curl->response->response[0]->url;
	}
}

/*
// Функция проверки переменных
 */
function verify($var) {
	if (isset($var) && !empty($var)) {
		return true;
	} else {
		return false;
	}
}

?>