<?php

session_start();

require 'class/Curl.php';
use \Curl\Curl;

class slothMusic {

	protected $client = array( // данные приложения и пользователя
		'id' => '5083406',
		'secret' => 'ArJmgOsWyGrE5D2F1Lln',
		'scope' => 'audio',
		'redirect_uri' => 'http://music.pavlovdmitry.com',
		'v' => '5.37',
		'code' => null,
		'access_token' => null,
	);
	protected $connect; // ссылка на соединение с MySQL

	/**
	 *
	 * @param resource MySQL $connect
	 */
	public function __construct($connect = false) {
		if ($connect) {
			$this->connect = $connect;
		}

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
			$this->client['access_token'] = $data['access_token'];
			$kbps = $this->kbps($this->get_url($data['owner_id'], $data['id']), $data['duration']);

			return $this->send($kbps);

			if ($kbps > 0) {
				$this->save($data['id'], $data['bytes'], $data['kbps'], $data['uid']);
			}
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
	public function save($id, $bytes, $kbps, $uid) {
		$DBH = $this->connect;
		$STH = $DBH->prepare('INSERT INTO audio (id, bytes, kbps, uid) value (:id, :bytes, :kbps, :uid)');
		return (bool) $STH->execute(array('id' => $id, 'bytes' => $bytes, 'kbps' => $kbps, 'uid' => $uid));
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
		header('Content-type: application/force-download');
		header('Content-Disposition: attachment; filename="' . basename($filename) . '.mp3"');
		readfile($url);
		exit;
	}

	/**
	 *
	 * авторизация приложения
	 */
	public function auth_code() {
		header('Location: https://oauth.vk.com/authorize?client_id=' . $this->client['id'] . '&display=page&scope=' . $this->client['scope'] . '&redirect_uri=' . $this->client['redirect_uri'] . '&response_type=code&v=' . $this->client['v']);
	}

	/**
	 *
	 * @return string $access_token после авторизации
	 */
	public function access_token() {
		$this->client['code'] = (string) $_GET['code'];
		$curl = new Curl();
		$curl->setOpt('CURLOPT_SSL_VERIFYPEER', 0);
		$curl->setOpt('CURLOPT_SSL_VERIFYHOST', 0);
		$curl->setOpt('CURLOPT_FOLLOWLOCATION', 1);
		$curl->get('https://oauth.vk.com/access_token', array(
			'client_id' => $this->client['id'],
			'client_secret' => $this->client['secret'],
			'redirect_uri' => $this->client['redirect_uri'],
			'code' => $this->client['code'],
			'v' => $this->client['v'],
		));
		$this->client['access_token'] = $curl->response->access_token;
		return (string) $this->client['access_token'];
	}

	/**
	 * @param integer $owner_id id владельца аудиозаписи
	 * @param integer $id id аудиозаписи
	 * @return string $access_token
	 */
	public function get_url($owner_id, $id) {
		if (empty($this->client['access_token'])) {
			$this->client['access_token'] = $_SESSION['access_token'];
		}
		$curl = new Curl();
		$curl->get('https://api.vk.com/method/audio.getById', array(
			'audios' => $owner_id . '_' . $id,
			'v' => $this->client['v'],
			'access_token' => $this->client['access_token'],
		));
		return (string) $curl->response->response[0]->url;
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