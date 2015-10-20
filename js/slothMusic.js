$(function () {
	/* ================================================== App */
	var app = {
		id: 5083406,
		permissions: '8 | 1024',
		api: 5.37,
		audio: {
			count: 50,
			offset: 50
		},
		load: false,
		offset: true,
		mode: {
			listen: true,
			download: false
		},
		reorder: true
	};
	var session = {};
	var player = {};
	var req = {};
	var device = {
		desktop: true,
		portable: false
	};
	if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
		device.desktop = false;
		device.portable = true;
	} else {
		device.desktop = true;
		device.portable = false;
	}
	/* ================================================== /App */

	/* ================================================== Elements */
	var els = {
		authorized: $('*[data-authorized="false"]'),
		player: {
			audio: $('#plr-audio').get(0),
			cover: $('#plr-cover'),
			controls: {
				title: $('#plr-cls-title'),
				prev: $('#plr-cls-prev'),
				next: $('#plr-cls-next')
			}
		},
		controls: {
			load: {
				user: $('#cls-ld-user'),
				popular: $('#cls-ld-popular'),
				recommendations: $('#cls-ld-recommendations')
			},
			player: {
				rewind: {
					backward: $('#cls-plr-rw-backward'),
					forward: $('#cls-plr-rw-forward')
				},
				broadcast: $('#cls-plr-bc')
			},
			search: {
				form: $('#cls-sh-form'),
				query: $('#cls-sh-query'),
				genres: {
					items: $('#cls-sh-gr-items'),
					button: $('#cls-sh-gr-button'),
					text: $('#cls-sh-gr-text')
				}
			},
			playlist: {
				sort: {
					shuffle: $('#cls-pl-st-shuffle'),
					alphabetically: $('#cls-pl-st-alphabetically')
				},
				download: {
					mode: $('#cls-pl-dl-mode'),
					all: $('#cls-pl-dl-all')
				},
				generate: {
					m3u: $('#cls-pl-gr-m3u')
				}
			}
		},
		playlist: {
			items: $('#pl-items'),
		},
		vk: {
			auth: $('#vk-auth'),
		},
		captcha: {
			container: $('#ml-ca-container'),
			form: $('#ml-ca-form'),
			title: $('#ml-ca-title'),
			img: $('#ml-ca-img'),
			key: $('#ml-ca-key'),
			sid: $('#ml-ca-sid')
		},
		load: $('#load')
	};
	/* ================================================== /Elements */

	/* ================================================== SlothMusic */
	var that = {};
	var slothMusic = {
		init: function () {
			that = this;
			that.vk.init();
		},
		vk: {
			// Инициализация Open API
			init: function () {
				VK.init({
					apiId: app.id
				});
				VK.Auth.getLoginStatus(that.vk.auth);
				VK.UI.button(els.vk.auth.get(0).id);
			},
			// Авторизация
			auth: function (r) {
				if (r.status === 'connected') {
					session = r.session;
					els.vk.auth.hide();
					els.authorized.fadeIn(250);

					console.log('auth: авторизация прошла успешно (id = ' + session.mid + ')');

					that.player.controls.broadcast(false);
					that.audio.get(session.mid, 0);
				} else {
					session = {};
					player = {};

					els.authorized.hide();
					els.vk.auth.show();
					console.log('auth: авторизация не удалась');
				}
			},
			// События при document.ready
			ready: function () {
				// Авторизация приложения
				els.vk.auth.on('click', function () {
					VK.Auth.login(that.vk.auth, app.permissions);
				});
			}
		},
		player: {
			// Управление плеером
			controls: {
				// Воспроизвести
				play: function () {
					els.player.audio.play();
				},
				// Пауза
				pause: function () {
					els.player.audio.pause();
				},
				// Предыдущая аудиозапись в плейлисте
				prev: function () {
					try {
						var items = els.playlist.items.find('a');
						var item = els.playlist.items.find('a.active');
						var id;

						if (item.is(':first-child')) {
							id = items.last().data('id');
						} else {
							id = items.eq(item.index() - 1).data('id');
						}

						that.animation.player.controls.prev();
						that.player.play(id);
					} catch (e) {
						console.log('player.controls.prev: ошибка при воспроизведении предыдущей аудиозаписи');
					}
				},
				// Следующая аудиозапись в плейлисте
				next: function () {
					try {
						var items = els.playlist.items.find('a');
						var item = els.playlist.items.find('a.active');
						var id;

						if (item.is(':last-child')) {
							id = items.first().data('id');
						} else {
							id = items.eq(item.index() + 1).data('id');
						}

						that.animation.player.controls.next();
						that.player.play(id);
					} catch (e) {
						console.log('player.controls.next: ошибка при воспроизведении следующей аудиозаписи');
					}
				},
				// Перемотка
				rewind: {
					// Перемотка назад
					backward: function () {
						els.player.audio.currentTime -= 10;
					},
					// Перемотка вперед
					forward: function () {
						els.player.audio.currentTime += 10;
					}
				},
				// Включение или отлючение трансляции в статус
				broadcast: function (status) {
					try {
						if (status) {
							player.broadcast = true;
							that.audio.setBroadcast(player.owner_id + '_' + player.id, session.mid);
						} else {
							player.broadcast = false;
							that.audio.setBroadcast(0, session.mid);
						}
					} catch (e) {
						if (status) {
							console.log('player.controls.broadcast: ошибка при попытке включения трансляции');
						} else {
							console.log('player.controls.broadcast: ошибка при попытке выключения трансляции');
						}
					}
				}
			},
			// Воспроизвести аудиозапись по id, из текущего плейлиста
			play: function (id) {
				try {
					var item = session.playlist[id];
					var itemPl = els.playlist.items.find('a[data-id="' + id + '"]');
					var title = $.trim(item.artist) + ' — ' + $.trim(item.title);

					// Поиск cover-a
					if (device.desktop) {
						that.player.cover.search($.trim(item.artist) + ' ' + $.trim(item.title));
					}

					// Воспроизводимая аудиозапись
					player.id = item.id;
					player.owner_id = item.owner_id;
					player.title = title;
					player.item = itemPl;

					els.player.audio.src = item.url;
					els.player.audio.load();
					els.player.audio.play();
					els.player.controls.title.text(title);

					if (player.broadcast === true) {
						that.player.controls.broadcast(true);
					}

					els.playlist.items.find('a').removeClass('active');
					itemPl.addClass('active');
				} catch (e) {
					console.log('player.play: ошибка воспроизведения');
				}
			},
			// Получение cover-a к аудиозаписи
			cover: {
				search: function (query) {
					try {
						$.ajax({
							url: 'http://ajax.googleapis.com/ajax/services/search/images',
							method: 'GET',
							dataType: 'jsonp',
							data: {
								v: '1.0',
								q: query,
								imgsz: 'large',
							},
							success: function (r) {
								if (r.responseStatus === 200) {
									var url = r.responseData.results[0].unescapedUrl;

									$(els.player.cover).prop('src', url);
									$(els.player.cover).show(250);
								}
							}
						});
					} catch (e) {
						console.log('player.cover.search: ошибка получения cover-a');
					}
				}
			},
			// События при document.ready
			ready: function () {
				// Окончание проигрывания
				$(els.player.audio).on('ended', function () {
					if (this.src) {
						that.player.controls.next();
					}
				});
				// Пауза
				$(els.player.audio).on('pause', function () {
					if (this.src) {
						player.status = 'pause';
						that.animation.player.controls.pause();
						that.title('Пауза: ' + player.title);
					}
				});
				// Воспроизведение
				$(els.player.audio).on('play', function () {
					if (this.src) {
						player.status = 'play';
						that.animation.player.controls.play();
						that.title(player.title);
					}
				});
				// Буферизация
				$(els.player.audio).on('waiting', function () {
					if (this.src) {
						that.load(true);
						player.status = 'waiting';
						that.title('Загрузка: ' + player.title);
					}
				});
				// Проигрывание
				$(els.player.audio).on('playing', function () {
					if (this.src) {
						that.load(false);
						player.status = 'playing';
						that.title(player.title);
					}
				});
				// Предыдущая аудиозапись
				$(els.player.controls.prev).on('click', function () {
					that.player.controls.prev();
				});
				// Следующая аудиозапись
				$(els.player.controls.next).on('click', function () {
					that.player.controls.next();
				});
				// Перемотать назад на 10 секунд
				$(els.controls.player.rewind.backward).on('click', function () {
					that.player.controls.rewind.backward();
				});
				// Перемотать вперед на 10 секунд
				$(els.controls.player.rewind.forward).on('click', function () {
					that.player.controls.rewind.forward();
				});
				// Трансляция (включить, выключить)
				$(els.controls.player.broadcast).clickToggle(function () {
						that.player.controls.broadcast(true);
						$(this).addClass('active');
					},
					function () {
						that.player.controls.broadcast(false);
						$(this).removeClass('active');
					});
			}
		},
		playlist: {
			// Добавление аудиозаписей в плейлист
			add: function (r) {
				try {
					var items = {};
					var pl = '';

					// Очистка текущего плейлиста, если не передан offset
					if (!r.offset || r.offset <= 0) {
						session.playlist = {};
					}

					// Если в ответе от сервера, обьекты находятся в items, а не в корне
					if (r.items) {
						items = r.items;
					} else {
						items = r;
					}

					// Собирает массив из ответа сервера и добавляет ссылки в DOM
					$(items).each(function (i, item) {
						session.playlist[item.id] = {
							url: item.url,
							duration: item.duration,
							owner_id: item.owner_id,
							artist: item.artist,
							title: item.title,
							id: item.id
						};
						pl += '<a data-id="' + item.id + '" data-duration="' + item.duration + '" class="pl-item">' + $.trim(item.artist) + ' — ' + $.trim(item.title) + '</a>';
					}).promise().done(function () {
						// Если передан offset, для добавления в плейлист
						if (r.offset > 0) {
							els.playlist.items.append(pl);
						} else {
							els.playlist.items.html(pl);
						}
					});

					// Если используется компьютер, добавляет возможности:
					// просмотр битрейта, добавление или удаление аудиозаписей
					if (device.desktop) {
						VK.Api.call('audio.get', {
							owner_id: session.mid,
							count: 6000,
							v: app.api
						}, function (r) {
							var userItems = r.response.items;
							var ids = [];
							var actions = {};

							$(userItems).each(function (i, item) {
								ids[i] = item.id;
							});

							$(els.playlist.items).find('a').each(function () {
								var item = this;

								// Если при добавлении аудиозаписей не найдены actions
								if (!$(item).find('div').hasClass('actions')) {
									var data = $(item).data();
									var duration = secondsToTime(data.duration);
									var durationText = (((duration.h > 0) ? duration.h + ':' : '') + '' + duration.m + ':' + '' + duration.s);

									$('<div/>', {
										'class': 'actions'
									}).appendTo(item).promise().done(function () {
										actions = $(item).find('div', '.actions');

										$('<small/>', {
											'class': 'bitrate',
											'data-container': 'body',
											'data-toggle': 'popover',
											'data-placement': 'top',
											'data-content': 'Битрейт'
										}).appendTo(actions);

										$('<small/>', {
											'class': 'duration',
											'text': durationText,
											'data-container': 'body',
											'data-toggle': 'popover',
											'data-placement': 'top',
											'data-content': 'Длительность'
										}).appendTo(actions);

									}).promise().done(function () {
										if ($.inArray(data.id, ids) >= 0) {
											//  Возможность удаления аудиозаписи
											$('<span/>', {
												'class': 'delete',
												'data-container': 'body',
												'data-toggle': 'popover',
												'data-placement': 'top',
												'data-content': 'Удалить'
											}).appendTo(actions);
										} else {
											//  Возможность добавления аудиозаписи
											$('<span/>', {
												'class': 'add',
												'data-container': 'body',
												'data-toggle': 'popover',
												'data-placement': 'top',
												'data-content': 'Добавить'
											}).appendTo(actions);
										}
									});
								}
							}).promise().done(function () {
								$('[data-toggle="popover"]').popover({
									trigger: 'hover'
								});
							});
						});
					}

				} catch (e) {
					console.log('playlist.add: ошибка добавления в плейлист');
				}
			},
			// Сортировка плейлиста
			sort: {
				// Рандомная сортировка
				shuffle: function () {
					els.playlist.items.find('a').shuffle();
				},
				// Сортировка по алфавиту
				alphabetically: function (direction) {
					els.playlist.items.alphabetically(direction);
				}
			},
			// Подгрузить еще аудиозаписи, используя текущий запрос, изменяя offset
			more: function () {
				switch (req.name) {
				case 'audio.get':
					that.audio.get(req.owner_id, (req.offset + app.audio.offset));
					break;
				case 'audio.getPopular':
					that.audio.getPopular(req.genre_id, (req.offset + app.audio.offset));
					break;
				case 'audio.getRecommendations':
					that.audio.getRecommendations(req.offset + app.audio.offset);
					break;
				case 'audio.search':
					that.audio.search(req.q, (req.offset + app.audio.offset));
					break;
				}
			},
			// Генерирование плейлистов из текущего
			generate: {
				// Генерирование .m3u из текущего плейлиста
				m3u: function () {
					try {
						var m3u = '#EXTM3U\r\n';

						$.each(session.playlist, function (i, item) {
							m3u += '#EXTINF:' + item.duration + ',' + (item.artist).replace(/\r\n|\r|\n/g, ' ') + ' - ' + (item.title).replace(/\r\n|\r|\n/g, ' ') + '\r\n';
							m3u += (item.url.replace('https', 'http')).replace(/\?extra=(.*)/, '') + '\r\n';
						});

						var file = new Blob([m3u], {
							type: 'audio/x-mpegurl'
						});

						var url = window.URL.createObjectURL(file);

						$('<a/>', {
							'id': 'm3u-playlist',
							'class': 'hide',
							'href': url,
							'download': 'playlist.m3u'
						}).appendTo('body').promise().done(function () {
							$(this)[0].click();
							$(this).remove();
						});

						window.URL.revokeObjectURL(url);
					} catch (e) {
						console.log('playlist.generate.m3u: ошибка генерирования m3u плейлиста');
					}
				}
			},
			// Загрузка переданных аудиозаписей
			download: function (items) {
				try {
					// Создание списка ссылок для загрузки аудиозаписей
					var dList = '<div id="download" class="hide">';
					$.each(items, function (i, item) {
						dList += '<a target="_blank" href="download?o=' + item.owner_id + '&i=' + item.id + '&a=' + item.artist + '&t=' + item.title + '">';
					});
					dList += '</div>';

					// Встраивание списка в DOM
					$(dList).appendTo('body').promise().done(function () {
						var links = $('#download');
						var linksItems = $('#download').find('a');

						$.each(linksItems, function (i, item) {
							// Нажатие ссылки и загрузка
							$(item)[0].click();
						}).promise().done(function () {
							// Удаление контейнера
							$(links).remove();
							// Выключение режима загрузки
							els.playlist.items.find('a.dl-active').removeClass('dl-active');
							els.controls.playlist.download.mode.removeClass('active');
							// Включение режима прослушивания
							that.mode('listen');
						});
					});
				} catch (e) {
					console.log('playlist.download: ошибка загрузки аудиозаписей');
				}
			},
			// Получение битрейта аудиозаписи
			bitrate: function (item) {
				try {
					var id = $(item).data('id');
					var itemPl = session.playlist[id];

					if (access_token !== 'undefined') {
						$.ajax({
							url: 'fileinfo',
							data: {
								id: id,
								duration: itemPl.duration,
								owner_id: itemPl.owner_id,
								access_token: access_token,
								uid: session.mid
							},
							method: 'POST',
							dataType: 'json',
							success: function (data) {
								var kbpsClass = '';

								if (parseInt(data.kbps) > 0) { // если битрейт известен
									if (data.kbps >= 320) {
										kbpsClass = 'bitrate-higher';
									} else if (data.kbps >= 256 && data.kbps < 320) {
										kbpsClass = 'bitrate-high';
									} else if (data.kbps >= 192 && data.kbps < 256) {
										kbpsClass = 'bitrate-medium';
									} else if (data.kbps < 192) {
										kbpsClass = 'bitrate-low';
									}

									$(item).find('div.actions > small.bitrate').data('bitrate', 'checked').addClass(kbpsClass).text(data.kbps);
								}
							}
						});
					}
				} catch (e) {
					console.log('playlist.bitrate: ошибка получения битрейта');
				}
			},
			// События при document.ready
			ready: function () {
				// Инициализация Drag-n-drop-a в плейлисте
				if (device.desktop) {
					try {
						$(function () {
							var plItems = document.getElementById('pl-items');
							var sortable = new Sortable(plItems, {
								animation: 250,
								// После перетаскивания аудиозаписи
								onEnd: function (e) {
									if (app.reorder) {
										var item = e.item;
										var prev = $(item).prev();
										var next = $(item).next();
										var prevIndex = $(prev).index();
										var nextIndex = $(next).index();
										var itemId = $(item).data('id');
										var prevId = $(prev).data('id');
										var nextId = $(next).data('id');

										// Начало плейлиста
										if (prevIndex < 0 && nextIndex >= 0) {
											that.audio.reorder(session.mid, itemId, nextId, '');
										}
										// Середина плейлиста
										else if (prevIndex >= 0 && nextIndex >= 0) {
											that.audio.reorder(session.mid, itemId, '', prevId);
										}
										// Конец плейлиста
										else if (prevIndex > 0 && nextIndex < 0) {
											that.audio.reorder(session.mid, itemId, '', prevId);
										}

										that.animation.playlist.moved(item);
									}
								},
							});
						});
					} catch (e) {
						console.log('sortable: ошибка при drag-n-drop-е аудиозаписи');
					}
				}
				// Получение аудиозаписей пользователя
				$(els.controls.load.user).on('click', function () {
					that.audio.get(session.mid, 0);
				});
				// Получение популярных аудиозаписей
				$(els.controls.load.popular).on('click', function () {
					that.audio.getPopular(0, 0);
				});
				// Получение аудиозаписей рекомендуемых пользователю
				$(els.controls.load.recommendations).on('click', function () {
					that.audio.getRecommendations(0);
				});
				// Рандомная сортировка
				$(els.controls.playlist.sort.shuffle).on('click', function () {
					that.playlist.sort.shuffle();
				});
				// Сортировка по алфавиту (>, <)
				$(els.controls.playlist.sort.alphabetically).clickToggle(function () {
					that.playlist.sort.alphabetically('<');
				}, function () {
					that.playlist.sort.alphabetically('>');
				});
				// Поисковая форма
				$(els.controls.search.form).submit(function (e) {
					var q = $.trim(els.controls.search.query.val());

					that.audio.search(q, 0);
					e.preventDefault();
				});
				// Аудиозаписи в плейлисте (воспроизведение, пауза)
				$(els.playlist.items).on('click', 'a', function (e) {
					if (app.mode.listen) {
						var item = this;
						var id = $(item).data('id');

						if (e.target === item) {
							if ($(item).hasClass('active')) {
								if (player.status === 'play' || player.status === 'playing') {
									that.player.controls.pause();
								} else {
									that.player.controls.play();
								}
							} else {
								that.player.play(id);
							}
						}
					} else if (app.mode.download) {
						if (!$(this).hasClass('dl-active')) {
							$(this).addClass('dl-active');
						} else {
							$(this).removeClass('dl-active');
						}
					}
				});
				// Если используется компьютер
				if (device.desktop) {
					// Генерирование .m3u из текущего плейлиста
					$(els.controls.playlist.generate.m3u).on('click', function () {
						that.playlist.generate.m3u();
					});
					// Включение или отключения режима загрузки
					$(els.controls.playlist.download.mode).on('click', function () {
						var items = els.playlist.items.find('a');

						// Если включен режим прослушивания
						if (app.mode.listen) {
							that.mode('download');
							$(this).addClass('active');
							els.controls.playlist.download.all.addClass('active');
						}
						// Если включен режим загрузки
						else if (app.mode.download) {
							// Если были найдены помеченные для загрузки аудиозаписи
							if (items.hasClass('dl-active')) {
								items = els.playlist.items.find('a.dl-active');
								var download = {};

								// Получение списка загружаемых аудиозаписей
								$.each(items, function (i, item) {
									id = $(item).data('id');
									itemPl = session.playlist[id];

									download[i] = {
										artist: $.trim(itemPl.artist),
										title: $.trim(itemPl.title),
										owner_id: itemPl.owner_id,
										id: itemPl.id
									};
								}).promise().done(function () {
									that.playlist.download(download);
								});
							} else {
								that.mode('listen');
								$(this).removeClass('active');
								els.controls.playlist.download.all.removeClass('active');
							}
						}
					});
					// Выделение всех аудиозаписей в плейлисте, для загрузки
					$(els.controls.playlist.download.all).clickToggle(function () {
						$(els.playlist.items).find('a').addClass('dl-active');
					}, function () {
						$(els.playlist.items).find('a').removeClass('dl-active');
					});
					// Показать битрейт аудиозаписи
					$(els.playlist.items).on({
						mouseenter: function () {
							var bitrate = $(this).find('div.actions > small.bitrate').data('bitrate');

							if (bitrate !== 'checked') {
								that.playlist.bitrate(this);
							}
						},
						click: function () {
							var bitrate = $(this).find('div.actions > small.bitrate').data('bitrate');

							if (bitrate !== 'checked') {
								that.playlist.bitrate(this);
							}
						}
					}, 'a');
					// Добавить аудиозапись
					$(els.playlist.items).on('click', 'a > div.actions > span.add', function () {
						if (!$(this).hasClass('done')) {
							var item = this;
							var id = $(item).parent().parent().data('id');

							that.audio.add(session.playlist[id].owner_id, id);
							$(item).attr('data-content', 'Добавлено').addClass('done');
						}
					});
					// Удалить аудиозапись
					$(els.playlist.items).on('click', 'a > div.actions > span.delete', function () {
						if (!$(this).hasClass('done')) {
							var item = this;
							var id = $(item).parent().parent().data('id');

							that.audio.delete(session.mid, id);
							$(item).attr('data-content', 'Удалено').addClass('done');
						}
					});
				}
			}
		},
		// Жанры, которые использует VK
		genres: {
			// Получение массива жанров
			get: function () {
				var genres = [{
					id: 1,
					title: 'Rock'
				}, {
					id: 2,
					title: 'Pop'
				}, {
					id: 3,
					'title': 'Rap & Hip-Hop'
				}, {
					id: 4,
					'title': 'Easy Listening'
				}, {
					id: 5,
					'title': 'Dance & House'
				}, {
					id: 6,
					title: 'Instrumental'
				}, {
					id: 7,
					title: 'Metal'
				}, {
					id: 8,
					title: 'Dubstep'
				}, {
					id: 9,
					'title': 'Jazz & Blues'
				}, {
					id: 10,
					'title': 'Drum & Bass'
				}, {
					id: 11,
					title: 'Trance'
				}, {
					id: 12,
					title: 'Chanson'
				}, {
					id: 13,
					title: 'Ethnic'
				}, {
					id: 14,
					'title': 'Acoustic & Vocal'
				}, {
					id: 15,
					title: 'Reggae'
				}, {
					id: 16,
					title: 'Classical'
				}, {
					id: 17,
					'title': 'Indie Pop'
				}, {
					id: 18,
					title: 'Other'
				}, {
					id: 19,
					title: 'Speech'
				}, {
					id: 21,
					title: 'Alternative'
				}, {
					id: 22,
					'title': 'Electropop & Disco'
				}];
				return genres;
			},
			// События при document.ready
			ready: function () {
				// Вывод жанров в список
				$(function () {
					try {
						var genres = that.genres.get();
						var list = '';

						$(genres).each(function (i, item) {
							list += '<li><a data-id="' + item.id + '">' + item.title + '</a></li>';
						});

						$(els.controls.search.genres.items).html(list);
					} catch (e) {
						console.log('genres.ready: ошибка вывода жанров');
					}
				});
				// Получить аудиозаписи выбранного жанра
				$(els.controls.search.genres.items).on('click', 'a', function () {
					var id = $(this).data('id');

					that.audio.getPopular(id, 0);
				});
			}
		},
		// Работа с API: audio
		audio: {
			// Возвращает список аудиозаписей пользователя или сообщества
			// owner_id: идентификатор владельца аудиозаписей
			// count: количество возвращаемых аудиозаписей
			// offset: смещение относительно первой найденной аудиозаписи для выборки определенного подмножества
			// v: версия api
			get: function (owner_id, offset) {
				var request = 'audio.get';

				// Если при подгрузке не были получены аудиозаписи, то считается, что все подгрузились
				// поэтому запрос блокируется с помощью app.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && app.offset) {
					that.load(true);
					try {
						VK.Api.call(request, {
							owner_id: owner_id,
							count: app.audio.count,
							offset: offset,
							v: app.api
						}, function (r) {
							that.load(false);
							that.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увелечения offset-a
								req = {
									name: request,
									owner_id: owner_id,
									offset: offset
								};

								// Включение запроса 'reorder' при drag-n-drop
								if (owner_id == session.mid) {
									that.reorder(true);
								} else {
									that.reorder(false);
								}

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.items.length > 0) {
									app.offset = true;
									that.playlist.add(r.response);
								} else {
									app.offset = false;
								}

								console.log(request + '(' + owner_id + ',' + offset + ')' + ': всего аудиозаписей = ' + r.response.count + ', (получено = ' + r.response.items.length + ')');
							}
						});
					} catch (e) {
						console.log('Ошибка запроса: ' + request);
					}
				}
			},
			// Возвращает список аудиозаписей из раздела 'Популярное'
			// genre_id: идентификатор жанра
			// count: количество возвращаемых аудиозаписей
			// offset: смещение относительно первой найденной аудиозаписи для выборки определенного подмножества
			// v: версия api
			getPopular: function (genre_id, offset) {
				var request = 'audio.getPopular';

				// Если при подгрузке не были получены аудиозаписи, то считается, что все подгрузились
				// поэтому запрос блокируется с помощью app.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && app.offset) {
					that.load(true);
					try {
						VK.Api.call(request, {
							genre_id: genre_id,
							count: app.audio.count,
							offset: offset,
							v: app.api
						}, function (r) {
							that.load(false);
							that.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увелечения offset-a
								req = {
									name: request,
									genre_id: genre_id,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								that.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.length > 0) {
									app.offset = true;
									that.playlist.add(r.response);
								} else {
									app.offset = false;
								}

								console.log(request + '(' + genre_id + ',' + offset + ')' + ': получено аудиозаписей = ' + r.response.length);
							}
						});
					} catch (e) {
						console.log('Ошибка запроса: ' + request);
					}
				}
			},
			// Возвращает список рекомендуемых аудиозаписей на основе списка воспроизведения заданного пользователя
			// count: количество возвращаемых аудиозаписей
			// offset: смещение относительно первой найденной аудиозаписи для выборки определенного подмножества
			// v: версия api
			getRecommendations: function (offset) {
				var request = 'audio.getRecommendations';

				// Если при подгрузке не были получены аудиозаписи, то считается, что все подгрузились
				// поэтому запрос блокируется с помощью app.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && app.offset) {
					that.load(true);
					try {
						VK.Api.call(request, {
							count: app.audio.count,
							offset: offset,
							v: app.api
						}, function (r) {
							that.load(false);
							that.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увелечения offset-a
								req = {
									name: request,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								that.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.items.length > 0) {
									app.offset = true;
									that.playlist.add(r.response);
								} else {
									app.offset = false;
								}

								console.log(request + '(' + offset + ')' + ': всего аудиозаписей = ' + r.response.count + ', (получено = ' + r.response.items.length + ')');
							}
						});
					} catch (e) {
						console.log('Ошибка запроса: ' + request);
					}
				}
			},
			// Возвращает список аудиозаписей в соответствии с заданным критерием поиска
			// q: текст поискового запроса
			// auto_complete: если этот параметр равен 1, возможные ошибки в поисковом запросе будут исправлены
			// count: количество аудиозаписей, информацию о которых необходимо вернуть
			// offset: смещение, необходимое для выборки определенного подмножетсва аудиозаписей
			// v: версия api
			search: function (q, offset) {
				var request = 'audio.search';

				// Если при подгрузке не были получены аудиозаписи, то считается, что все подгрузились
				// поэтому запрос блокируется с помощью app.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && app.offset) {
					that.load(true);
					try {
						VK.Api.call(request, {
							q: q,
							auto_complete: 1,
							count: app.audio.count,
							offset: offset,
							v: app.api
						}, function (r) {
							that.load(false);
							that.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увелечения offset-a
								req = {
									name: request,
									q: q,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								that.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.items.length > 0) {
									app.offset = true;
									that.playlist.add(r.response);
								} else {
									app.offset = false;
								}

								console.log(request + '(' + q + ',' + offset + ')' + ': всего аудиозаписей = ' + r.response.count + ', (получено = ' + r.response.items.length + ')');
							}
						});
					} catch (e) {
						console.log('Ошибка запроса: ' + request);
					}
				}
			},
			// Изменяет порядок аудиозаписи, перенося ее между аудиозаписями
			// owner_id: идентификатор владельца аудиозаписи
			// audio_id: идентификатор аудиозаписи, которую нужно переместить
			// before: идентификатор аудиозаписи, перед которой нужно поместить композицию
			// after: идентификатор аудиозаписи, после которой нужно поместить композицию
			// v: версия api
			reorder: function (owner_id, audio_id, before, after) {
				var request = 'audio.reorder';
				that.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						before: before,
						after: after,
						v: app.api
					}, function (r) {
						that.load(false);
						that.verify(request, r);

						if (r.response === 1) {
							console.log(request + '(' + owner_id + ',' + audio_id + ',' + before + ',' + after + ')' + ': аудиозапись перемещена');
						} else {
							console.log(request + '(' + owner_id + ',' + audio_id + ',' + before + ',' + after + ')' + ': аудиозапись не перемещена');
						}
					});
				} catch (e) {
					console.log('Ошибка запроса: ' + request);
				}
			},
			// Транслирует аудиозапись в статус пользователю
			// audio: идентификатор аудиозаписи, которая будет отображаться в статусе (owner_id_audio_id)
			// target_ids: перечисленные через запятую идентификаторы сообществ и пользователя, которым будет транслироваться аудиозапись
			// v: версия api
			setBroadcast: function (audio, target_ids) {
				var request = 'audio.setBroadcast';
				that.load(true);
				try {
					VK.Api.call(request, {
						audio: audio,
						target_ids: target_ids,
						v: app.api
					}, function (r) {
						that.load(false);
						that.verify(request, r);

						if (r.response && player.broadcast) {
							console.log(request + '(' + audio + ',' + target_ids + ')' + ': аудиозапись транслируется');
						} else {
							console.log(request + '(' + audio + ',' + target_ids + ')' + ': аудиозапись не транслируется');
						}
					});
				} catch (e) {
					console.log('Ошибка запроса: ' + request);
				}
			},
			// Копирует аудиозапись на страницу пользователя
			// owner_id: идентификатор владельца аудиозаписи
			// audio_id: идентификатор аудиозаписи
			// v: версия api
			add: function (owner_id, audio_id) {
				var request = 'audio.add';
				that.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: app.api
					}, function (r) {
						that.load(false);
						that.verify(request, r);

						if (r.response) {
							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись добавлена');
						} else {
							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись не добавлена');
						}
					});
				} catch (e) {
					console.log('Ошибка запроса: ' + request);
				}
			},
			// Удаляет аудиозапись со страницы пользователя
			// owner_id: идентификатор владельца аудиозаписи
			// audio_id: идентификатор аудиозаписи
			// v: версия api
			delete: function (owner_id, audio_id) {
				var request = 'audio.delete';
				that.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: app.api
					}, function (r) {
						that.load(false);
						that.verify(request, r);

						if (r.response === 1) {
							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись удалена');
						} else {
							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись не удалена');
						}
					});
				} catch (e) {
					console.log('Ошибка запроса: ' + request);
				}
			},
		},
		// Загрузка
		load: function (status) {
			if (status) {
				app.load = true;
				els.load.show();
			} else {
				app.load = false;
				els.load.hide();
			}
		},
		// Режим
		mode: function (mode) {
			switch (mode) {
			case 'listen':
				app.mode.listen = true;
				app.mode.download = false;
				break;
			case 'download':
				app.mode.download = true;
				app.mode.listen = false;
				break;
			}
		},
		// Drag-n-drop
		reorder: function (status) {
			if (status) {
				app.reorder = true;
			} else {
				app.reorder = false;
			}
		},
		// Проверка ответа от сервера на ошибки
		verify: function (request, r) {
			if (r.error) {
				if (r.error.error_code === 14) {
					that.captcha.show(r.error);
				} else {
					throw new Error(request + ': ' + r.error.error_msg);
				}
			}
		},
		// Обработка капчи
		captcha: {
			show: function (captcha) {
				$(els.captcha.img).prop('src', captcha.captcha_img);
				$(els.captcha.sid).val(captcha.captcha_sid);
				$(els.captcha.key).val('');
				$(els.captcha.modal).modal('show');
			},
			ready: function () {
				$(els.captcha.form).submit(function (e) {
					var captcha_sid = $.trim($(els.captcha.sid).val());
					var captcha_key = $.trim($(els.captcha.key).val());

					if (captcha_sid.length > 0 && captcha_key.length > 0) {
						VK.Api.call('audio.get', {
							count: 1,
							captcha_sid: captcha_sid,
							captcha_key: captcha_key,
							v: app.api
						}, function (r) {
							if (r.response) {
								$(controls.captcha.modal).modal('hide');
							}
						});
					}
					e.preventDefault();
				});
			}
		},
		// Анимация
		animation: {
			player: {
				controls: {
					prev: function () {
						that.animation.custom($(els.player.controls.title), 'an-plr-prev', 250);
					},
					next: function () {
						that.animation.custom($(els.player.controls.title), 'an-plr-next', 250);
					},
					play: function () {
						that.animation.custom($(els.player.controls.title), 'an-plr-next', 250);
					},
					pause: function () {
						that.animation.custom($(els.player.controls.title), 'an-plr-prev', 250);
					},
				}
			},
			playlist: {
				moved: function (item) {
					if ($(item).hasClass('active')) {
						that.animation.custom($(item), 'an-pl-moved--active', 1000);
					} else {
						that.animation.custom($(item), 'an-pl-moved', 1000);
					}
				},
			},
			custom: function (el, animation, time) {
				$(el).addClass(animation).promise().done(function () {
					setTimeout(function () {
						$(el).removeClass(animation);
					}, time);
				});
			},
		},
		// Заголовок страницы
		title: function (title) {
			$(document).prop('title', title);
		},
		// События при document.ready
		ready: function () {
			that.vk.ready();
			that.player.ready();
			that.genres.ready();
			that.playlist.ready();

			// Для всех popover
			if (device.desktop) {
				$('[data-toggle="popover"]').popover({
					trigger: 'hover'
				});
			}
		}
	};
	/* ================================================== /SlothMusic */

	// При готовности всех элементов на странице
	$(document).ready(function () {
		slothMusic.init();
		slothMusic.ready();
	});

	// При скролле окна
	$(window).scroll(function () {
		if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100 && !app.load) {
			slothMusic.playlist.more();
		}
	});
});

// Shuffle: перемешать элементы
$(function () {
	$.fn.shuffle = function () {
		var allElems = this.get(),
			getRandom = function (max) {
				return Math.floor(Math.random() * max);
			},
			shuffled = $.map(allElems, function () {
				var random = getRandom(allElems.length),
					randEl = $(allElems[random]).clone(true)[0];
				allElems.splice(random, 1);
				return randEl;
			});
		this.each(function (i) {
			$(this).replaceWith($(shuffled[i]));
		});
		return $(shuffled);
	};
});

// Alphabetically: отсортировать элементы по алфавиту (direction: направление сортировки)
$(function () {
	$.fn.alphabetically = function (direction) {
		var mylist = $(this);
		var listitems = $('a', mylist).get();
		listitems.sort(function (a, b) {
			var compA = $(a).text().toUpperCase();
			var compB = $(b).text().toUpperCase();
			if (direction === '<') {
				return (compA < compB) ? -1 : 1;
			} else if (direction === '>') {
				return (compA > compB) ? -1 : 1;
			}
		});
		$.each(listitems, function (i, itm) {
			mylist.append(itm);
		});
	};
});

// clickToggle: выполняет функции по клику (поочередно)
$(function () {
	$.fn.clickToggle = function (a, b) {
		var ab = [b, a];

		function cb() {
			ab[this._tog ^= 1].call(this);
		}
		return this.on('click', cb);
	};
});


// secondsToTime: конвертирует секунды в формат времени
function secondsToTime(secs) {
	var hours = Math.floor(secs / (60 * 60));

	var divisor_for_minutes = secs % (60 * 60);
	var minutes = Math.floor(divisor_for_minutes / 60);

	var divisor_for_seconds = divisor_for_minutes % 60;
	var seconds = Math.ceil(divisor_for_seconds);

	var obj = {
		"h": hours,
		"m": (hours > 0 && minutes <= 9) ? '0' + minutes : minutes,
		"s": (seconds <= 9) ? '0' + seconds : seconds
	};
	return obj;
}
