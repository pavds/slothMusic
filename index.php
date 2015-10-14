<?php

session_start();
require 'class/slothmusic.class.php';

$slothMusic = new slothMusic();

if (!verify($_GET['code']) && !verify($_SESSION['access_token'])) {
	// получение кода
	$slothMusic->auth_code();
} else if (verify($_GET['code']) && !verify($_SESSION['access_token'])) {
	// получение access_token
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

	<link rel="stylesheet" href="css/combine.min.css">

	<?php if (verify($_SESSION['access_token'])): ?>
		<script>var access_token = "<?php echo $_SESSION['access_token'];?>";</script>
	<?php endif;?>
</head>
<body>
	<div id="loading" class="loading">
		<i class="spinner"></i>
	</div>

	<div class="player not_authorized">
		<div class="container">
			<div class="player-controls">
				<div class="player-controls-prev">
					<i id="prev"></i>
				</div>
				<div class="player-controls-title">
					<h1 id="title"></h1>
				</div>
				<div class="player-controls-next">
					<i id="next"></i>
				</div>
			</div>
			<div class="player-audio">
				<div class="player-audio-container">
					<audio id="player" autobuffer="auto" controls autoplay></audio>
				</div>
			</div>
		</div>
	</div>

	<div class="authButton">
		<div class="container">
			<div id="authButton" class="authButton-btn" type="button"></div>
		</div>
	</div>

	<div class="audio not_authorized">
		<div class="container">
			<div class="audio-categories">
				<i id="my" class="my" title="Мои"></i>
				<i id="popular" class="popular" title="Популярные"></i>
				<i id="recommendations" class="recommendations" title="Рекомендации"></i>
				<i id="shuffle" class="shuffle" title="Перемешать"></i>
				<i id="alphabetically" class="alphabetically" title="По алфавиту"></i>
				<i id="backward" class="backward" title="Перемотать назад"></i>
				<i id="forward" class="forward" title="Перемотать вперед"></i>
				<i id="download" class="download" title="Режим загрузки"></i>
				<i id="downloadAll" class="download-all hide" title="Выделить все аудиозаписи"></i>
				<i id="m3u" class="m3u" title="Сгенерировать M3U плейлист"></i>
			</div>
			<div class="audio-search">
				<div class="audio-search-container">
					<div class="audio-search-query">
						<form id="search">
							<input id="query" type="text" placeholder="Поиск" class="text-left">
						</form>
					</div>
					<div class="audio-search-btn">
						<div class="audio-search-genres">
							<button id="genresBtn" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								<span id="genresText">Жанр</span> <i class="caret"></i>
							</button>
							<ul id="genresList" class="audio-search-genres-list"></ul>
						</div>
					</div>
				</div>
			</div>
		</div>
	</div>

	<div class="playlist not_authorized">
		<div class="container">
			<div class="playlist-container">
				<div class="playlist-song">
					<div id="playlist" class="playlist-items"></div>
				</div>
			</div>
		</div>
	</div>

	<script src="js/slothMusic.min.js"></script>
</body>
</html>