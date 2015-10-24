$(function () {
	/* ================================================== SlothMusic */
	var slothMusic = {
		/* ================================================== App */
		app: {
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
			reorder: true,
			device: {
				desktop: true,
				portable: false
			}
		},
		req: {},
		session: {},
		plr: {},
		/* ================================================== /App */

		/* ================================================== Elements */
		els: {
			authorized: $('body').find('*[data-authorized]'),
			player: {
				audio: $('#plr-audio').get(0),
				cover: $('#plr-cover'),
				controls: {
					container: $('#plr-cls-container'),
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
		},
		/* ================================================== /Elements */

		// Инициализация
		init: function () {
			if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
				slothMusic.app.device.desktop = false;
				slothMusic.app.device.portable = true;
			} else {
				slothMusic.app.device.desktop = true;
				slothMusic.app.device.portable = false;
			}

			slothMusic.vk.init();
		},
		vk: {
			// Инициализация Open API
			init: function () {
				VK.init({
					apiId: slothMusic.app.id
				});
				VK.Auth.getLoginStatus(slothMusic.vk.auth);
				VK.UI.button(slothMusic.els.vk.auth.get(0).id);
			},
			// Авторизация
			auth: function (r) {
				if (r.status === 'connected') {
					slothMusic.session = r.session;
					slothMusic.els.vk.auth.hide();
					slothMusic.els.authorized.attr('data-authorized', 'true').fadeIn(250);

					console.log('auth: авторизация прошла успешно (id = ' + slothMusic.session.mid + ')');

					slothMusic.player.controls.broadcast(false);
					slothMusic.audio.get(slothMusic.session.mid, 0);
				} else {
					slothMusic.session = {};
					slothMusic.plr = {};

					slothMusic.els.authorized.attr('data-authorized', 'false').hide();
					slothMusic.els.vk.auth.show();
					console.log('auth: авторизация не удалась');
				}
			},
			// События при document.ready
			ready: function () {
				// Авторизация приложения
				slothMusic.els.vk.auth.on('click', function () {
					VK.Auth.login(slothMusic.vk.auth, slothMusic.app.permissions);
				});
			}
		},
		player: {
			// Управление плеером
			controls: {
				// Воспроизвести
				play: function () {
					slothMusic.els.player.audio.play();
				},
				// Пауза
				pause: function () {
					slothMusic.els.player.audio.pause();
				},
				// Предыдущая аудиозапись в плейлисте
				prev: function () {
					try {
						var items = slothMusic.els.playlist.items.find('a');
						var item = slothMusic.els.playlist.items.find('a.active');
						var id;

						if (item.is(':first-child')) {
							id = items.last().data('id');
						} else {
							id = items.eq(item.index() - 1).data('id');
						}

						slothMusic.animation.player.controls.prev();
						slothMusic.player.play(id);
					} catch (e) {
						console.log('player.controls.prev: ошибка при воспроизведении предыдущей аудиозаписи');
					}
				},
				// Следующая аудиозапись в плейлисте
				next: function () {
					try {
						var items = slothMusic.els.playlist.items.find('a');
						var item = slothMusic.els.playlist.items.find('a.active');
						var id;

						if (item.is(':last-child')) {
							id = items.first().data('id');
						} else {
							id = items.eq(item.index() + 1).data('id');
						}

						slothMusic.animation.player.controls.next();
						slothMusic.player.play(id);
					} catch (e) {
						console.log('player.controls.next: ошибка при воспроизведении следующей аудиозаписи');
					}
				},
				// Перемотка
				rewind: {
					// Перемотка назад
					backward: function () {
						slothMusic.els.player.audio.currentTime -= 10;
					},
					// Перемотка вперед
					forward: function () {
						slothMusic.els.player.audio.currentTime += 10;
					}
				},
				// Включение или отлючение трансляции в статус
				broadcast: function (status) {
					try {
						if (status) {
							slothMusic.plr.broadcast = true;
							slothMusic.audio.setBroadcast(slothMusic.plr.owner_id + '_' + slothMusic.plr.id, slothMusic.session.mid);
						} else {
							slothMusic.plr.broadcast = false;
							slothMusic.audio.setBroadcast(0, slothMusic.session.mid);
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
					var item = slothMusic.session.playlist[id];
					var itemPl = slothMusic.els.playlist.items.find('a[data-id="' + id + '"]');
					var title = item.artist + ' — ' + item.title;

					// Поиск cover-a
					if (slothMusic.app.device.desktop) {
						slothMusic.player.cover.search(item.artist + ' ' + item.title);
					}

					// Воспроизводимая аудиозапись
					slothMusic.plr.id = item.id;
					slothMusic.plr.owner_id = item.owner_id;
					slothMusic.plr.title = title;
					slothMusic.plr.item = itemPl;

					slothMusic.els.player.audio.src = item.url;
					slothMusic.els.player.audio.load();
					slothMusic.els.player.audio.play();
					slothMusic.els.player.controls.title.text(title);

					if (slothMusic.plr.broadcast === true) {
						slothMusic.player.controls.broadcast(true);
					}

					slothMusic.els.playlist.items.find('a').removeClass('active');
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
									var item = slothMusic.els.player.cover;
									var url = r.responseData.results[0].unescapedUrl;

									if (url !== '' && !$(item).hasClass('an-plr-cover')) {
										$(item).addClass('an-plr-cover').prop('src', url).show();
									} else if (url !== '' && $(item).hasClass('an-plr-cover')) {
										$(item).prop('src', url).show();
									} else {
										$(item).hide().removeClass('an-plr-cover').prop('src', '');
									}
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
				$(slothMusic.els.player.audio).on('ended', function () {
					if (this.src !== '') {
						slothMusic.player.controls.next();
					}
				});
				// Пауза
				$(slothMusic.els.player.audio).on('pause', function () {
					if (this.src !== '') {
						slothMusic.plr.status = 'pause';
						slothMusic.animation.player.controls.pause();
						slothMusic.title('Пауза: ' + slothMusic.plr.title);
					}
				});
				// Воспроизведение
				$(slothMusic.els.player.audio).on('play', function () {
					if (this.src !== '') {
						slothMusic.plr.status = 'play';
						slothMusic.animation.player.controls.play();
						slothMusic.title(slothMusic.plr.title);
					}
				});
				// Буферизация
				$(slothMusic.els.player.audio).on('waiting', function () {
					if (this.src !== '') {
						slothMusic.load(true);
						slothMusic.plr.status = 'waiting';
						slothMusic.title('Загрузка: ' + slothMusic.plr.title);
					}
				});
				// Проигрывание
				$(slothMusic.els.player.audio).on('playing', function () {
					if (this.src !== '') {
						slothMusic.load(false);
						slothMusic.plr.status = 'playing';
						slothMusic.title(slothMusic.plr.title);
					}
				});
				// Предыдущая аудиозапись
				$(slothMusic.els.player.controls.prev).on('click', function () {
					slothMusic.player.controls.prev();
				});
				// Следующая аудиозапись
				$(slothMusic.els.player.controls.next).on('click', function () {
					slothMusic.player.controls.next();
				});
				// Перемотать назад на 10 секунд
				$(slothMusic.els.controls.player.rewind.backward).on('click', function () {
					slothMusic.player.controls.rewind.backward();
				});
				// Перемотать вперед на 10 секунд
				$(slothMusic.els.controls.player.rewind.forward).on('click', function () {
					slothMusic.player.controls.rewind.forward();
				});
				// Трансляция (включить, выключить)
				$(slothMusic.els.controls.player.broadcast).clickToggle(function () {
						slothMusic.player.controls.broadcast(true);
						$(this).addClass('active');
					},
					function () {
						slothMusic.player.controls.broadcast(false);
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
					if ($.isEmptyObject(r.offset) || r.offset <= 0) {
						slothMusic.session.playlist = {};
					}

					// Если в ответе от сервера, обьекты находятся в items, а не в корне
					if (!$.isEmptyObject(r.items)) {
						items = r.items;
					} else {
						items = r;
					}

					// Собирает массив из ответа сервера и добавляет ссылки в DOM
					$(items).each(function (i, item) {
						slothMusic.session.playlist[item.id] = {
							url: item.url,
							duration: item.duration,
							owner_id: item.owner_id,
							artist: item.artist,
							title: item.title,
							id: item.id
						};
						pl += '<a data-id="' + item.id + '" data-duration="' + item.duration + '" class="pl-item">' + item.artist + ' — ' + item.title + '</a>';
					}).promise().done(function () {
						// Если передан offset, для добавления в плейлист
						if (r.offset > 0) {
							slothMusic.els.playlist.items.append(pl);
						} else {
							slothMusic.els.playlist.items.html(pl);
						}
					});

					// Если используется компьютер, добавляет возможности:
					// просмотр битрейта, добавление или удаление аудиозаписей
					if (slothMusic.app.device.desktop) {
						VK.Api.call('audio.get', {
							owner_id: slothMusic.session.mid,
							count: 6000,
							v: slothMusic.app.api
						}, function (r) {
							var userItems = r.response.items;
							var ids = [];
							var actions = {};

							$(userItems).each(function (i, item) {
								ids[i] = item.id;
							});

							$(slothMusic.els.playlist.items).find('a').each(function () {
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
											'class': 'bitrate bitrate-load',
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
					slothMusic.els.playlist.items.find('a').shuffle();
				},
				// Сортировка по алфавиту
				alphabetically: function (direction) {
					slothMusic.els.playlist.items.alphabetically(direction);
				}
			},
			// Подгрузить еще аудиозаписи, используя текущий запрос, изменяя offset
			more: function () {
				switch (slothMusic.req.name) {
				case 'audio.get':
					slothMusic.audio.get(slothMusic.req.owner_id, (slothMusic.req.offset + slothMusic.app.audio.offset));
					break;
				case 'audio.getPopular':
					slothMusic.audio.getPopular(slothMusic.req.genre_id, (slothMusic.req.offset + slothMusic.app.audio.offset));
					break;
				case 'audio.getRecommendations':
					slothMusic.audio.getRecommendations(slothMusic.req.offset + slothMusic.app.audio.offset);
					break;
				case 'audio.search':
					slothMusic.audio.search(slothMusic.req.q, (slothMusic.req.offset + slothMusic.app.audio.offset));
					break;
				}
			},
			// Генерирование плейлистов из текущего
			generate: {
				// Генерирование .m3u из текущего плейлиста
				m3u: function () {
					try {
						var m3u = '#EXTM3U\r\n';

						$.each(slothMusic.session.playlist, function (i, item) {
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
							$(this)[0].click().end().remove();
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
							slothMusic.els.playlist.items.find('a.dl-active').removeClass('dl-active');
							slothMusic.els.controls.playlist.download.mode.removeClass('active');
							// Включение режима прослушивания
							slothMusic.mode('listen');
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
					var itemPl = slothMusic.session.playlist[id];

					if (access_token !== 'undefined') {
						$.ajax({
							url: 'fileinfo',
							data: {
								id: id,
								duration: itemPl.duration,
								owner_id: itemPl.owner_id,
								access_token: access_token,
								uid: slothMusic.session.mid
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

									$(item).find('div.actions > small.bitrate').data('bitrate', 'checked').removeClass('bitrate-load').addClass(kbpsClass).text(data.kbps);
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
				if (slothMusic.app.device.desktop) {
					try {
						$(function () {
							var plItems = document.getElementById('pl-items');
							var sortable = new Sortable(plItems, {
								animation: 250,
								// После перетаскивания аудиозаписи
								onEnd: function (e) {
									if (slothMusic.app.reorder) {
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
											slothMusic.audio.reorder(slothMusic.session.mid, itemId, nextId, '');
										}
										// Середина плейлиста
										else if (prevIndex >= 0 && nextIndex >= 0) {
											slothMusic.audio.reorder(slothMusic.session.mid, itemId, '', prevId);
										}
										// Конец плейлиста
										else if (prevIndex > 0 && nextIndex < 0) {
											slothMusic.audio.reorder(slothMusic.session.mid, itemId, '', prevId);
										}

										slothMusic.animation.playlist.moved(item);
									}
								},
							});
						});
					} catch (e) {
						console.log('sortable: ошибка при drag-n-drop-е аудиозаписи');
					}
				}
				// Получение аудиозаписей пользователя
				$(slothMusic.els.controls.load.user).on('click', function () {
					slothMusic.audio.get(slothMusic.session.mid, 0);
				});
				// Получение популярных аудиозаписей
				$(slothMusic.els.controls.load.popular).on('click', function () {
					slothMusic.audio.getPopular(0, 0);
				});
				// Получение аудиозаписей рекомендуемых пользователю
				$(slothMusic.els.controls.load.recommendations).on('click', function () {
					slothMusic.audio.getRecommendations(0);
				});
				// Рандомная сортировка
				$(slothMusic.els.controls.playlist.sort.shuffle).on('click', function () {
					slothMusic.playlist.sort.shuffle();
				});
				// Сортировка по алфавиту (>, <)
				$(slothMusic.els.controls.playlist.sort.alphabetically).clickToggle(function () {
					slothMusic.playlist.sort.alphabetically('<');
				}, function () {
					slothMusic.playlist.sort.alphabetically('>');
				});
				// Поисковая форма
				$(slothMusic.els.controls.search.form).submit(function (e) {
					var q = $.trim(slothMusic.els.controls.search.query.val());

					slothMusic.audio.search(q, 0);
					e.preventDefault();
				});
				// Аудиозаписи в плейлисте (воспроизведение, пауза)
				$(slothMusic.els.playlist.items).on('click', 'a', function (e) {
					var item = this;

					if (slothMusic.app.mode.listen) {
						var id = $(item).data('id');

						if (e.target === item) {
							if ($(item).hasClass('active')) {
								if (slothMusic.plr.status === 'play' || slothMusic.plr.status === 'playing') {
									slothMusic.player.controls.pause();
								} else {
									slothMusic.player.controls.play();
								}
							} else {
								slothMusic.player.play(id);
							}
						}
					} else if (slothMusic.app.mode.download) {
						if (!$(item).hasClass('dl-active')) {
							$(item).addClass('dl-active');
						} else {
							$(item).removeClass('dl-active');
						}
					}
				});
				// Если используется компьютер
				if (slothMusic.app.device.desktop) {
					// Генерирование .m3u из текущего плейлиста
					$(slothMusic.els.controls.playlist.generate.m3u).on('click', function () {
						slothMusic.playlist.generate.m3u();
					});
					// Включение или отключения режима загрузки
					$(slothMusic.els.controls.playlist.download.mode).on('click', function () {
						var item = this;
						var items = slothMusic.els.playlist.items.find('a');

						// Если включен режим прослушивания
						if (slothMusic.app.mode.listen) {
							slothMusic.mode('download');
							$(item).addClass('active');
							slothMusic.els.controls.playlist.download.all.addClass('active');
						}
						// Если включен режим загрузки
						else if (slothMusic.app.mode.download) {
							// Если были найдены помеченные для загрузки аудиозаписи
							if (items.hasClass('dl-active')) {
								items = slothMusic.els.playlist.items.find('a.dl-active');
								var download = {};

								// Получение списка загружаемых аудиозаписей
								$.each(items, function (i, item) {
									id = $(item).data('id');
									itemPl = slothMusic.session.playlist[id];

									download[i] = {
										artist: itemPl.artist,
										title: itemPl.title,
										owner_id: itemPl.owner_id,
										id: itemPl.id
									};
								}).promise().done(function () {
									slothMusic.playlist.download(download);
								});
							} else {
								slothMusic.mode('listen');
								$(item).removeClass('active');
								slothMusic.els.controls.playlist.download.all.removeClass('active');
							}
						}
					});
					// Выделение всех аудиозаписей в плейлисте, для загрузки
					$(slothMusic.els.controls.playlist.download.all).clickToggle(function () {
						$(slothMusic.els.playlist.items).find('a').addClass('dl-active');
					}, function () {
						$(slothMusic.els.playlist.items).find('a').removeClass('dl-active');
					});
					// Показать битрейт аудиозаписи
					$(slothMusic.els.playlist.items).on({
						mouseenter: function () {
							var item = this;
							var bitrate = $(item).find('div.actions > small.bitrate').data('bitrate');

							if (bitrate !== 'checked') {
								slothMusic.playlist.bitrate(item);
							}
						},
						click: function () {
							var item = this;
							var bitrate = $(item).find('div.actions > small.bitrate').data('bitrate');

							if (bitrate !== 'checked') {
								slothMusic.playlist.bitrate(item);
							}
						}
					}, 'a');
					// Добавить аудиозапись
					$(slothMusic.els.playlist.items, 'a > div.actions').on('click', 'span.add', function (e) {
						var item = e.target;

						if (!$(item).hasClass('done')) {
							var id = $(item).parent().parent().data('id');

							slothMusic.audio.add(slothMusic.session.playlist[id].owner_id, id);
							$(item).attr('data-content', 'Добавлено').addClass('done');
						}
					});
					// Удалить аудиозапись
					$(slothMusic.els.playlist.items, 'a > div.actions').on('click', 'span.delete', function (e) {
						var item = e.target;

						if (!$(item).hasClass('done')) {
							var id = $(item).parent().parent().data('id');

							slothMusic.audio.delete(slothMusic.session.mid, id);
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
						var genres = slothMusic.genres.get();
						var list = '';

						$(genres).each(function (i, item) {
							list += '<li><a data-id="' + item.id + '">' + item.title + '</a></li>';
						});

						$(slothMusic.els.controls.search.genres.items).html(list);
					} catch (e) {
						console.log('genres.ready: ошибка вывода жанров');
					}
				});
				// Получить аудиозаписи выбранного жанра
				$(slothMusic.els.controls.search.genres.items).on('click', 'a', function () {
					var id = $(this).data('id');

					slothMusic.audio.getPopular(id, 0);
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
				// поэтому запрос блокируется с помощью slothMusic.app.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && slothMusic.app.offset) {
					slothMusic.load(true);
					try {
						VK.Api.call(request, {
							owner_id: owner_id,
							count: slothMusic.app.audio.count,
							offset: offset,
							v: slothMusic.app.api
						}, function (r) {
							slothMusic.load(false);
							slothMusic.verify(request, r);

							if (!$.isEmptyObject(r.response)) {
								// Запись запроса, для возможности увелечения offset-a
								slothMusic.req = {
									name: request,
									owner_id: owner_id,
									offset: offset
								};

								// Включение запроса 'reorder' при drag-n-drop
								if (owner_id === slothMusic.session.mid) {
									slothMusic.reorder(true);
								} else {
									slothMusic.reorder(false);
								}

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (!$.isEmptyObject(r.response.items) && r.response.items.length > 0) {
									slothMusic.app.offset = true;
									slothMusic.playlist.add(r.response);
								} else {
									slothMusic.app.offset = false;
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
				// поэтому запрос блокируется с помощью slothMusic.app.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && slothMusic.app.offset) {
					slothMusic.load(true);
					try {
						VK.Api.call(request, {
							genre_id: genre_id,
							count: slothMusic.app.audio.count,
							offset: offset,
							v: slothMusic.app.api
						}, function (r) {
							slothMusic.load(false);
							slothMusic.verify(request, r);

							if (!$.isEmptyObject(r.response)) {
								// Запись запроса, для возможности увелечения offset-a
								slothMusic.req = {
									name: request,
									genre_id: genre_id,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								slothMusic.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.length > 0) {
									slothMusic.app.offset = true;
									slothMusic.playlist.add(r.response);
								} else {
									slothMusic.app.offset = false;
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
				// поэтому запрос блокируется с помощью slothMusic.app.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && slothMusic.app.offset) {
					slothMusic.load(true);
					try {
						VK.Api.call(request, {
							count: slothMusic.app.audio.count,
							offset: offset,
							v: slothMusic.app.api
						}, function (r) {
							slothMusic.load(false);
							slothMusic.verify(request, r);

							if (!$.isEmptyObject(r.response)) {
								// Запись запроса, для возможности увелечения offset-a
								slothMusic.req = {
									name: request,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								slothMusic.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (!$.isEmptyObject(r.response.items) && r.response.items.length > 0) {
									slothMusic.app.offset = true;
									slothMusic.playlist.add(r.response);
								} else {
									slothMusic.app.offset = false;
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
				// поэтому запрос блокируется с помощью slothMusic.app.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && slothMusic.app.offset) {
					slothMusic.load(true);
					try {
						VK.Api.call(request, {
							q: q,
							auto_complete: 1,
							count: slothMusic.app.audio.count,
							offset: offset,
							v: slothMusic.app.api
						}, function (r) {
							slothMusic.load(false);
							slothMusic.verify(request, r);

							if (!$.isEmptyObject(r.response)) {
								// Запись запроса, для возможности увелечения offset-a
								slothMusic.req = {
									name: request,
									q: q,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								slothMusic.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (!$.isEmptyObject(r.response.items) && r.response.items.length > 0) {
									slothMusic.app.offset = true;
									slothMusic.playlist.add(r.response);
								} else {
									slothMusic.app.offset = false;
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
				slothMusic.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						before: before,
						after: after,
						v: slothMusic.app.api
					}, function (r) {
						slothMusic.load(false);
						slothMusic.verify(request, r);

						if (!$.isEmptyObject(r.response) && r.response === 1) {
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
				slothMusic.load(true);
				try {
					VK.Api.call(request, {
						audio: audio,
						target_ids: target_ids,
						v: slothMusic.app.api
					}, function (r) {
						slothMusic.load(false);
						slothMusic.verify(request, r);

						if (!$.isEmptyObject(r.response) && slothMusic.plr.broadcast) {
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
				slothMusic.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: slothMusic.app.api
					}, function (r) {
						slothMusic.load(false);
						slothMusic.verify(request, r);

						if (!$.isEmptyObject(r.response)) {
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
				slothMusic.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: slothMusic.app.api
					}, function (r) {
						slothMusic.load(false);
						slothMusic.verify(request, r);

						if (!$.isEmptyObject(r.response) && r.response === 1) {
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
				slothMusic.app.load = true;
				slothMusic.els.load.show();
			} else {
				slothMusic.app.load = false;
				slothMusic.els.load.hide();
			}
		},
		// Режим
		mode: function (mode) {
			switch (mode) {
			case 'listen':
				slothMusic.app.mode.listen = true;
				slothMusic.app.mode.download = false;
				break;
			case 'download':
				slothMusic.app.mode.download = true;
				slothMusic.app.mode.listen = false;
				break;
			}
		},
		// Drag-n-drop
		reorder: function (status) {
			if (status) {
				slothMusic.app.reorder = true;
			} else {
				slothMusic.app.reorder = false;
			}
		},
		// Проверка ответа от сервера на ошибки
		verify: function (request, r) {
			if (!$.isEmptyObject(r.error)) {
				if (r.error.error_code === 14) {
					slothMusic.captcha.show(r.error);
				} else {
					throw new Error(request + ': ' + r.error.error_msg);
				}
			}
		},
		// Обработка капчи
		captcha: {
			show: function (captcha) {
				$(slothMusic.els.captcha.img).prop('src', captcha.captcha_img);
				$(slothMusic.els.captcha.sid).val(captcha.captcha_sid);
				$(slothMusic.els.captcha.key).val('');
				$(slothMusic.els.captcha.container).modal('show');
			},
			ready: function () {
				$(slothMusic.els.captcha.form).submit(function (e) {
					var captcha_sid = $.trim($(slothMusic.els.captcha.sid).val());
					var captcha_key = $.trim($(slothMusic.els.captcha.key).val());

					if (captcha_sid.length > 0 && captcha_key.length > 0) {
						VK.Api.call('audio.get', {
							count: 1,
							captcha_sid: captcha_sid,
							captcha_key: captcha_key,
							v: slothMusic.app.api
						}, function (r) {
							if (!$.isEmptyObject(r.response)) {
								$(slothMusic.els.captcha.container).modal('hide');
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
						slothMusic.animation.custom($(slothMusic.els.player.controls.title), 'an-plr-prev', 250);
					},
					next: function () {
						slothMusic.animation.custom($(slothMusic.els.player.controls.title), 'an-plr-next', 250);
					},
					play: function () {
						slothMusic.animation.custom($(slothMusic.els.player.controls.title), 'an-plr-next', 250);
					},
					pause: function () {
						slothMusic.animation.custom($(slothMusic.els.player.controls.title), 'an-plr-prev', 250);
					},
				}
			},
			playlist: {
				moved: function (item) {
					if ($(item).hasClass('active')) {
						slothMusic.animation.custom($(item), 'an-pl-moved--active', 1000);
					} else {
						slothMusic.animation.custom($(item), 'an-pl-moved', 1000);
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
			slothMusic.vk.ready();
			slothMusic.player.ready();
			slothMusic.genres.ready();
			slothMusic.playlist.ready();
			slothMusic.captcha.ready();

			// Для всех popover
			if (slothMusic.app.device.desktop) {
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
		if ($(window).scrollTop() + $(window).height() >= $(document).height() - 100 && !slothMusic.app.load) {
			slothMusic.playlist.more();
		}
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