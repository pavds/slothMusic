# slothMusic [web](http://music.pavlovdmitry.com/)

## Русский
Музыкальный плеер VK.com. 

### Возможности
* Прослушивание аудиозаписей на любом устройстве.
* Плейлисты: `Мои аудиозаписи`, `Популярные`, `Рекомендуемые`.
* Поиск аудиозаписей (по названию, по жанрам).
* Добавление и удаление аудиозаписей.
* Генерирование M3U (из текущего плейлиста).
* Загрузка аудиозаписей (выборочная).
* Сортировка плейлиста (по алфавиту, рандомная).
* Битрейт аудиозаписей (при наведении).
* Транслирование аудиозаписи в статус.
* AJAX подгрузка аудиозаписей.
* Поддержка капчи.
* Поиск и показ cover-a текущей аудиозаписи.
* ~~Drag-and-drop для перемещения аудиозаписей (синхронизировано с VK).~~

### БД
Для ускорения получения битрейта аудиозаписей, была создана таблица `audio`.

В таблице хранятся такие данные:
* `id` — id аудиозаписи
* `uid` — id пользователя
* `kbps` — битрейт аудиозаписи

Записи в таблицу добавляются, если `id` аудиозаписи в БД не найден.

#### Таблица `audio`

	CREATE TABLE IF NOT EXISTS `audio` (
		`id` int(11) NOT NULL,
		`uid` int(11) NOT NULL,
		`kbps` int(11) NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;

Либо в файле `database.sql` ([ссылка](https://raw.githubusercontent.com/ifamed/slothMusic/master/database.sql))

По всем вопросам можно писать на dmitrypavlov.design@gmail.com

### Лицензия
[MIT](https://raw.githubusercontent.com/ifamed/slothMusic/master/LICENSE)

## English
The music player VK.com.

### Opportunities
* Listen to audio on any device.
* Playlists: `My music`, `Popular`, `Recommended`.
* Search of recordings (by title, by genre).
* Adding and deleting tracks.
* Generate M3U (playlist).
* Download audio (selective).
* Playlist sorting (by alphabet, random).
* The bitrate of the audio (when you hover).
* Broadcasting audio in status.
* AJAX loading of audio.
* Support captcha.
* Show cover-a current audio.
* ~~Drag-and-drop to move the audio (synchronized with VK).~~

### DB
To expedite the receipt of the bit rate of the audio, create a table `audio`.

The table stores the following data:
* `id` — id audio
* `uid` — user id
* `kbps` — the bitrate of the audio

The entries in the table are added if `id` recordings in the database was not found.

#### Table `audio`

	CREATE TABLE IF NOT EXISTS `audio` (
		`id` int(11) NOT NULL,
		`uid` int(11) NOT NULL,
		`kbps` int(11) NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;

Or in the file `database.sql` ([link](https://raw.githubusercontent.com/ifamed/slothMusic/master/database.sql))

You can ask me any questions by e-mail: dmitrypavlov.design@gmail.com

### License
[MIT](https://raw.githubusercontent.com/ifamed/slothMusic/master/LICENSE)