# slothMusic [web](http://music.pavlovdmitry.com/)

## Русский
Музыкальный плеер VK.com. 

### Возможности
* Прослушивание аудиозаписей на любом устройстве.
* Добавление и удаление аудиозаписей.
* Генерирование M3U (из текущего плейлиста).
* Загрузка аудиозаписей.
* Сортировка по алфавиту (обычная, обратная).
* Drag-and-drop для перемещения аудиозаписей (синхронизировано с VK).
* Битрейт аудиозаписей (при наведении).

### БД
Для ускорения получения битрейта аудиозаписей, была создана таблица `audio`.

В таблице хранятся такие данные:
* `id` — id аудиозаписи
* `uid` — id пользователя
* `bytes` — размер файла в байтах
* `kbps` — битрейт аудиозаписи

Записи в таблицу добавляются, если `id` аудиозаписи в БД не найден.

#### Таблица `audio`

	CREATE TABLE IF NOT EXISTS `audio` (
		`id` int(11) NOT NULL,
		`uid` int(11) NOT NULL,
		`bytes` int(11) NOT NULL,
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
* Adding and deleting tracks.
* Generate M3U (playlist).
* Download audio.
* Sort alphabetically (normal, reverse).
* Drag-and-drop to move the audio (synchronized with VK).
* The bitrate of the audio (when you hover).

### DB
To expedite the receipt of the bit rate of the audio, create a table `audio`.

The table stores the following data:
* `id` — id audio
* `uid` — user id
* `bytes` — the size of the file in bytes
* `kbps` — the bitrate of the audio

The entries in the table are added if `id` recordings in the database was not found.

#### Table `audio`

	CREATE TABLE IF NOT EXISTS `audio` (
		`id` int(11) NOT NULL,
		`uid` int(11) NOT NULL,
		`bytes` int(11) NOT NULL,
		`kbps` int(11) NOT NULL,
		PRIMARY KEY (`id`)
	) ENGINE=MyISAM DEFAULT CHARSET=utf8;

Or in the file `database.sql` ([link](https://raw.githubusercontent.com/ifamed/slothMusic/master/database.sql))

You can ask me any questions by e-mail: dmitrypavlov.design@gmail.com

### License
[MIT](https://raw.githubusercontent.com/ifamed/slothMusic/master/LICENSE)