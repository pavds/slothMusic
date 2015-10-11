<?php

class slothMusic {
	// Ссылка на соединение с MySQL
	protected $connect;

	/**
	 *
	 * @param resource MySQL $connect
	 */
	public function __construct($connect) {
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
			$kbps = $this->kbps($data['url'], $data['duration']);
			if ($kbps <= 0) {
				$kbps = $this->kbps($data['url'], $data['duration']);
			}

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
		header('Content-type: application/x-file-to-save');
		header('Content-Disposition: attachment; filename="' . $filename . '.mp3"');
		readfile($url);
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