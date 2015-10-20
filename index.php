<?php

session_start();
require 'class/slothmusic.class.php';

$slothMusic = new slothMusic();

if (!verify($_GET['code']) && !verify($_SESSION['access_token'])) {
	// Получение временного кода
	$slothMusic->auth_code();
} else if (verify($_GET['code']) && !verify($_SESSION['access_token'])) {
	// Получение access_token для авторизации
	$_SESSION = array(
		'access_token' => $slothMusic->access_token(),
	);
}

?>
<!DOCTYPE html>
<html>
<head>
	<meta charset="utf-8">
	<title>slothMusic</title>
	<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
	<meta http-equiv="x-ua-compatible" content="ie=edge">
	<meta name="description" content="Слушай музыку из VK.com, на любом устройстве.">
	<meta property="og:title" content="slothMusic" />
	<meta property="og:description" content="Слушай музыку из VK.com, на любом устройстве." />
	<meta property="og:image" content="favicon/favicon_512.png" />
	<meta name="msapplication-TileColor" content="#ECF0F1">
	<meta name="msapplication-TileImage" content="/favicon/favicon_128.png">
	<link rel="icon" type="image/svg+xml" href="favicon/favicon.svg">
	<link rel="icon" href="favicon/favicon_16.png" sizes="16x16" type="image/png">
	<link rel="icon" href="favicon/favicon_24.png" sizes="24x24" type="image/png">
	<link rel="icon" href="favicon/favicon_32.png" sizes="32x32" type="image/png">
	<link rel="icon" href="favicon/favicon_64.png" sizes="64x64" type="image/png">
	<link rel="icon" href="favicon/favicon_128.png" sizes="128x128" type="image/png">
	<link rel="icon" href="favicon/favicon_256.png" sizes="256x256" type="image/png">
	<link rel="icon" href="favicon/favicon_512.png" sizes="512x512" type="image/png">
	<link rel="apple-touch-icon" href="favicon/favicon_16.png" sizes="16x16" type="image/png">
	<link rel="apple-touch-icon" href="favicon/favicon_24.png" sizes="24x24" type="image/png">
	<link rel="apple-touch-icon" href="favicon/favicon_32.png" sizes="32x32" type="image/png">
	<link rel="apple-touch-icon" href="favicon/favicon_64.png" sizes="64x64" type="image/png">
	<link rel="apple-touch-icon" href="favicon/favicon_128.png" sizes="128x128" type="image/png">
	<link rel="apple-touch-icon" href="favicon/favicon_256.png" sizes="256x256" type="image/png">
	<link rel="apple-touch-icon" href="favicon/favicon_512.png" sizes="512x512" type="image/png">
	<link rel="apple-touch-icon-precomposed" href="favicon/favicon_128.png">

	<link rel="stylesheet" href="css/slothMusic.css">

	<?php if (verify($_SESSION['access_token'])): ?>
		<script>var access_token = '<?php echo $_SESSION['access_token'];?>';</script>
	<?php endif;?>
</head>
<body>
	<!-- fork me -->
	<div class="fork-me">
		<a target="_blank" href="https://github.com/ifamed/slothMusic" title="Fork Me"></a>
	</div>
	<!-- /fork me -->

	<!-- load -->
	<div id="load" class="load">
		<i class="load-spinner"></i>
	</div>
	<!-- /load -->

	<!-- vk auth -->
	<div class="vk">
		<div class="container">
			<div id="vk-auth" class="vk-auth" type="button"></div>
		</div>
	</div>
	<!-- /vk auth -->

	<!-- captcha -->
	<div class="ml ca" id="ml-ca-container" tabindex="-1" role="dialog" aria-labelledby="ml-ca-title">
		<div class="ml-dialog" role="document">
			<div class="ml-content">
				<form id="ml-ca-form">
					<div class="ml-header">
						<h4 class="ml-title" id="ml-ca-title">Требуется Captcha</h4>
					</div>
					<div class="ml-body">
						<div class="ca-img">
							<img id="ml-ca-img">
						</div>
						<div class="form-group">
							<input type="text" class="form-control" id="ml-ca-key" placeholder="Введите код" required>
							<input type="hidden" id="ml-ca-sid" required>
						</div>
					</div>
					<div class="ml-footer">
						<button type="button" class="btn btn-default" data-dismiss="modal">Закрыть</button>
						<button type="submit" class="btn btn-primary">Отправить</button>
					</div>
				</form>
			</div>
		</div>
	</div>
	<!-- /captcha -->

	<!-- player -->
	<div class="plr" data-authorized="false">
		<div class="container">
			<div class="plr-cls">
				<div class="plr-cls-prev">
					<i id="plr-cls-prev"></i>
				</div>
				<div class="plr-cls-title">
					<h1 id="plr-cls-title"></h1>
				</div>
				<div class="plr-cls-next">
					<i id="plr-cls-next"></i>
				</div>
			</div>
			<div class="plr-audio">
				<div class="plr-audio-container">
					<audio id="plr-audio" autobuffer="auto" controls autoplay></audio>
				</div>
			</div>
		</div>
		<div class="plr-cover">
			<img id="plr-cover">
		</div>
	</div>
	<!-- /player -->

	<!--controls -->
	<div class="cls" data-authorized="false">
		<div class="container">
			<div class="cls-container">
				<i id="cls-ld-user" class="cls-user" data-placement="bottom" data-toggle="popover" title="Плейлист пользователя" data-content="Аудиозаписи авторизированного пользователя."></i>
				<i id="cls-ld-popular" class="cls-popular" data-placement="bottom" data-toggle="popover" title="Популярные аудиозаписи" data-content="Популярные аудиозаписи Вконтакте."></i>
				<i id="cls-ld-recommendations" class="cls-recommendations" data-placement="bottom" data-toggle="popover" title="Рекомендуемые аудиозаписи" data-content="Рекомендуемые аудиозаписи пользователя. Исходя из его аудиозаписей."></i>
				<i id="cls-pl-st-shuffle" class="cls-shuffle" data-placement="bottom" data-toggle="popover" title="Перемешать плейлист" data-content="Перемешать аудиозаписи в плейлисте (рандомно)."></i>
				<i id="cls-pl-st-alphabetically" class="cls-alphabetically" data-placement="bottom" data-toggle="popover" title="Сортировка по алфавиту" data-content="Сортировка аудиозаписей в плейлисте по алфавиту и наоборот."></i>
				<i id="cls-plr-rw-backward" class="cls-backward" data-placement="bottom" data-toggle="popover" title="Перемотать назад" data-content="Перемотать на 10 секунд назад."></i>
				<i id="cls-plr-rw-forward" class="cls-forward" data-placement="bottom" data-toggle="popover" title="Перемотать вперед" data-content="Перемотать на 10 секунд вперед."></i>
				<i id="cls-pl-dl-mode" class="cls-download" data-placement="bottom" data-toggle="popover" title="Режим загрузки" data-content="При нажатии на активный режим загрузки (при учете выделенных аудиозаписей), они будут загружены. Возможно, потребуется разрешить открытие всплывающих окон (возле адресной строки)."></i>
				<i id="cls-pl-dl-all" class="cls-download-all" data-placement="bottom" data-toggle="popover" title="Выделить все аудиозаписи" data-content="Выделить все аудиозаписи в плейлисте для загрузки."></i>
				<i id="cls-pl-gr-m3u" class="cls-m3u" data-placement="bottom" data-toggle="popover" title="Сгенерировать M3U" data-content="Сгенерировать .m3u файл, из текущего плейлиста."></i>
				<i id="cls-plr-bc" class="cls-broadcast" data-placement="bottom" data-toggle="popover" title="Трансляция" data-content="Включением или отключение трансляции в статус."></i>
			</div>
			<div class="cls-sh">
				<div class="cls-sh-container">
					<div class="cls-sh-query" data-toggle="popover" title="Поиск" data-content="Поиск аудиозаписей по запросу." data-placement="bottom">
						<form id="cls-sh-form">
							<input id="cls-sh-query" type="text" placeholder="Поиск">
						</form>
					</div>
					<div class="cls-sh-btn" data-toggle="popover" title="Жанр" data-content="Поиск аудиозаписей по жанру." data-placement="left">
						<div class="cls-sh-gr">
							<button id="cls-sh-gr-button" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<span id="cls-sh-gr-text">Жанр</span> <i class="caret"></i>
							</button>
							<ul id="cls-sh-gr-items" class="cls-sh-gr-list"></ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>
	<!-- /controls -->

	<!-- playlist -->
	<div class="pl" data-authorized="false">
		<div class="container">
			<div class="pl-container">
				<div class="pl-items-container">
					<div id="pl-items" class="pl-items"></div>
				</div>
			</div>
		</div>
	</div>
	<!-- /playlist -->

	<script src="js/combined.min.js"></script>
</body>
</html>