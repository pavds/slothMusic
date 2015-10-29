$(function () {
	'use strict';
	/* ================================================== SlothMusic */
	var slothMusic = {
		/* ================================================== App */
		config: {
			id: 5083406,
			permissions: '8 | 1024',
			api: 5.37,
			load: false,
			audio: {
				count: 50,
				offset: 50
			},
		},
		mode: {
			listen: true,
			download: false
		},
		options: {
			reorder: true,
			offset: true,
		},
		device: {
			desktop: true,
			portable: false
		},
		tmp: {
			session: {},
			player: {},
			req: {}
		},
		/* ================================================== /App */

		/* ================================================== Elements */
		$els: {
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
		},
		/* ================================================== /Elements */

		// Инициализация
		init: function () {
			self = this;

			self.app.device();
			self.vk.init();
		},
		// VK
		vk: {
			// Инициализация Open API
			init: function () {
				VK.init({
					apiId: self.config.id
				});
				VK.Auth.getLoginStatus(self.vk.auth);
				VK.UI.button(self.$els.vk.auth.get(0).id);
			},
			// Авторизация
			auth: function (r) {
				if (r.status === 'connected') {
					self.app.auth(true);
					self.tmp.session = r.session;
					self.player.controls.broadcast(false);

					// Загрузка аудиозаписей пользователя и загрузка его плейлиста
					self.audio.getUser(true);

					console.log('auth: авторизация прошла успешно (id = ' + self.tmp.session.mid + ')');
				} else {
					self.app.auth(false);

					console.log('auth: авторизация не удалась');
				}
			},
			// События при document.ready
			ready: function () {
				// Авторизация приложения
				self.$els.vk.auth.on('click', function () {
					VK.Auth.login(self.vk.auth, self.config.permissions);
				});
			}
		},
		// Плеер
		player: {
			// Управление плеером
			controls: {
				// Воспроизвести
				play: function () {
					self.$els.player.audio.play();
				},
				// Пауза
				pause: function () {
					self.$els.player.audio.pause();
				},
				// Предыдущая аудиозапись в плейлисте
				prev: function () {
					try {
						var items = self.$els.playlist.items.find('a');
						var item = self.$els.playlist.items.find('a', '.active');
						var id;

						if (item.is(':first-child')) {
							id = items.last().data('id');
						} else {
							id = items.eq(item.index() - 1).data('id');
						}

						self.animation.player.controls.prev();
						self.player.play(id);
					} catch (e) {
						throw new Error('player.controls.prev: ошибка при воспроизведении предыдущей аудиозаписи');
					}
				},
				// Следующая аудиозапись в плейлисте
				next: function () {
					try {
						var items = self.$els.playlist.items.find('a');
						var item = self.$els.playlist.items.find('a.active');
						var id;

						if (item.is(':last-child')) {
							id = items.first().data('id');
						} else {
							id = items.eq(item.index() + 1).data('id');
						}

						self.animation.player.controls.next();
						self.player.play(id);
					} catch (e) {
						throw new Error('player.controls.next: ошибка при воспроизведении следующей аудиозаписи');
					}
				},
				// Перемотка
				rewind: {
					// Перемотка назад
					backward: function () {
						self.$els.player.audio.currentTime -= 10;
					},
					// Перемотка вперед
					forward: function () {
						self.$els.player.audio.currentTime += 10;
					}
				},
				// Включение или отлючение трансляции в статус
				broadcast: function (status) {
					try {
						if (status && self.tmp.player.id) {
							self.tmp.player.broadcast = true;
							self.audio.setBroadcast(self.tmp.player.owner_id + '_' + self.tmp.player.id, self.tmp.session.mid);
						} else if (self.tmp.player.id) {
							self.tmp.player.broadcast = false;
							self.audio.setBroadcast(0, self.tmp.session.mid);
						}
					} catch (e) {
						if (status) {
							throw new Error('player.controls.broadcast: ошибка при попытке включения трансляции');
						} else {
							throw new Error('player.controls.broadcast: ошибка при попытке выключения трансляции');
						}
					}
				}
			},
			// Воспроизвести аудиозапись по id, из текущего плейлиста
			play: function (id) {
				try {
					var item = self.tmp.session.playlist[id];
					var $item = self.$els.playlist.items.find('a[data-id="' + id + '"]');
					var title = item.artist + ' — ' + item.title;

					// Поиск cover-a
					if (self.device.desktop) {
						self.player.cover.search(item.artist + ' ' + item.title);
					}

					// Воспроизводимая аудиозапись
					self.tmp.player.id = item.id;
					self.tmp.player.owner_id = item.owner_id;
					self.tmp.player.title = title;
					self.tmp.player.item = $item;

					self.$els.player.audio.src = item.url;
					self.$els.player.audio.load();
					self.$els.player.audio.play();
					self.$els.player.controls.title.text(title);

					if (self.tmp.player.broadcast === true) {
						self.player.controls.broadcast(true);
					}

					self.$els.playlist.items
						.find('a')
						.removeClass('active');

					$item.addClass('active');

					console.log('self.player.play: воспроизведение (id = ' + id + ')');
				} catch (e) {
					throw new Error('player.play: ошибка воспроизведения');
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
									var $that = self.$els.player.cover;
									var url = r.responseData.results[0].unescapedUrl;

									if (url !== '' && !$that.hasClass('an-plr-cover')) {
										$that.addClass('an-plr-cover').prop('src', url).show();
									} else if (url !== '' && $that.hasClass('an-plr-cover')) {
										$that.prop('src', url).show();
									} else {
										$that.hide().removeClass('an-plr-cover').prop('src', '');
									}
								}
							}
						});
					} catch (e) {
						throw new Error('player.cover.search: ошибка получения cover-a');
					}
				}
			},
			// События при document.ready
			ready: function () {
				// Окончание проигрывания
				$(self.$els.player.audio).on('ended', function () {
					if (this.src) {
						self.player.controls.next();
					}
				});
				// Пауза
				$(self.$els.player.audio).on('pause', function () {
					if (this.src) {
						self.tmp.player.status = 'pause';
						self.animation.player.controls.pause();
						self.app.title('Пауза: ' + self.tmp.player.title);
					}
				});
				// Воспроизведение
				$(self.$els.player.audio).on('play', function () {
					if (this.src) {
						self.tmp.player.status = 'play';
						self.animation.player.controls.play();
						self.app.title(self.tmp.player.title);
					}
				});
				// Буферизация
				$(self.$els.player.audio).on('waiting', function () {
					if (this.src) {
						self.app.load(true);
						self.tmp.player.status = 'waiting';
						self.app.title('Загрузка: ' + self.tmp.player.title);
					}
				});
				// Проигрывание
				$(self.$els.player.audio).on('playing', function () {
					if (this.src) {
						self.app.load(false);
						self.tmp.player.status = 'playing';
						self.app.title(self.tmp.player.title);
					}
				});
				// Предыдущая аудиозапись
				$(self.$els.player.controls.prev).on('click', function () {
					self.player.controls.prev();
				});
				// Следующая аудиозапись
				$(self.$els.player.controls.next).on('click', function () {
					self.player.controls.next();
				});
				// Перемотать назад на 10 секунд
				$(self.$els.controls.player.rewind.backward).on('click', function () {
					self.player.controls.rewind.backward();
				});
				// Перемотать вперед на 10 секунд
				$(self.$els.controls.player.rewind.forward).on('click', function () {
					self.player.controls.rewind.forward();
				});
				// Трансляция (включить, выключить)
				$(self.$els.controls.player.broadcast).clickToggle(function () {
						self.player.controls.broadcast(true);
						$(this).addClass('active');
					},
					function () {
						self.player.controls.broadcast(false);
						$(this).removeClass('active');
					});
			}
		},
		playlist: {
			// Добавление аудиозаписей в плейлист
			add: function (r) {
				try {
					var items = {};
					var $pl = '';

					// Очистка текущего плейлиста, если не передан offset
					if (!r.offset || r.offset <= 0) {
						self.tmp.session.playlist = {};
					}

					// Если в ответе от сервера, обьекты находятся в items, а не в корне
					if (r.items) {
						items = r.items;
					} else {
						items = r;
					}

					// Собирает массив из ответа сервера и добавляет ссылки в DOM
					$(items).each(function (i, item) {
						self.tmp.session.playlist[item.id] = {
							url: item.url,
							duration: item.duration,
							owner_id: item.owner_id,
							artist: item.artist,
							title: item.title,
							id: item.id
						};
						$pl += '<a data-id="' + item.id + '" data-duration="' + item.duration + '" class="pl-item">' + item.artist + ' — ' + item.title + '</a>';
					}).promise().done(function () {
						// Если передан offset, для добавления в плейлист
						if (r.offset > 0) {
							self.$els.playlist.items.append($pl);
						} else {
							self.$els.playlist.items.html($pl);
						}
					});

					// Если используется компьютер, добавляет возможности:
					// просмотр битрейта, добавление или удаление аудиозаписей
					if (self.device.desktop) {
						var ids = [];

						ids = self.tmp.player.playlist.map(function (item) {
							return item.id;
						});

						$(self.$els.playlist.items).find('a').each(function () {
							var $that = $(this);

							// Если при добавлении аудиозаписей не найдены actions
							if (!$that.find('div').hasClass('actions')) {
								var $actions = {};
								var data = $that.data();
								var duration = self.playlist.secToTime(data.duration);
								duration.text = (((duration.h > 0) ? duration.h + ':' : '') + '' + duration.m + ':' + '' + duration.s);

								$('<div/>', {
									'class': 'actions'
								}).appendTo($that).promise().done(function () {
									$actions = $that.find('div', '.actions');

									// Битрейт
									$('<small/>', {
										'class': 'bitrate bitrate-load',
										'data-container': 'body',
										'data-toggle': 'popover',
										'data-placement': 'top',
										'data-content': 'Битрейт'
									}).appendTo($actions);

									// Длительность аудиозаписи
									$('<small/>', {
										'class': 'duration',
										'text': duration.text,
										'data-container': 'body',
										'data-toggle': 'popover',
										'data-placement': 'top',
										'data-content': 'Длительность'
									}).appendTo($actions);

								}).promise().done(function () {
									if ($.inArray(data.id, ids) >= 0) {
										//  Возможность удаления аудиозаписи
										$('<span/>', {
											'class': 'delete',
											'data-container': 'body',
											'data-toggle': 'popover',
											'data-placement': 'top',
											'data-content': 'Удалить'
										}).appendTo($actions);
									} else {
										//  Возможность добавления аудиозаписи
										$('<span/>', {
											'class': 'add',
											'data-container': 'body',
											'data-toggle': 'popover',
											'data-placement': 'top',
											'data-content': 'Добавить'
										}).appendTo($actions);
									}
								});
							}
						}).promise().done(function () {
							$('*[data-toggle="popover"]').popover({
								trigger: 'hover'
							});
						});
						// });
					}

				} catch (e) {
					throw new Error('playlist.add: ошибка добавления в плейлист');
				}
			},
			// Сортировка плейлиста
			sort: {
				// Рандомная сортировка
				shuffle: function () {
					self.$els.playlist.items.find('a').shuffle();
				},
				// Сортировка по алфавиту
				alphabetically: function (direction) {
					self.$els.playlist.items.alphabetically(direction);
				}
			},
			// Подгрузить еще аудиозаписи, используя текущий запрос, изменяя offset
			more: function () {
				try {
					switch (self.tmp.req.name) {
					case 'audio.get':
						self.audio.get(self.tmp.req.owner_id, (self.tmp.req.offset + self.config.audio.offset));
						break;
					case 'audio.getPopular':
						self.audio.getPopular(self.tmp.req.genre_id, (self.tmp.req.offset + self.config.audio.offset));
						break;
					case 'audio.getRecommendations':
						self.audio.getRecommendations(self.tmp.req.offset + self.config.audio.offset);
						break;
					case 'audio.search':
						self.audio.search(self.tmp.req.q, (self.tmp.req.offset + self.config.audio.offset));
						break;
					}
				} catch (e) {
					throw new Error('playlist.more: ошибка при подгрузке аудиозаписей');
				}
			},
			// Генерирование плейлистов из текущего
			generate: {
				// Генерирование .m3u из текущего плейлиста
				m3u: function () {
					try {
						var m3u = '#EXTM3U\r\n';

						$.each(self.tmp.session.playlist, function (i, item) {
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

							notify().success('Плейлист .M3U успешно сгенерирован', 2000);
						});

						window.URL.revokeObjectURL(url);
					} catch (e) {
						notify().error('Ошибка генерирования .M3U плейлиста', 2000);

						throw new Error('playlist.generate.m3u: ошибка генерирования m3u плейлиста');
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
						var $download = $('#download');
						var $links = $('#download').find('a');

						$.each($links, function (i, item) {
							// Нажатие ссылки и загрузка
							$(item)[0].click();
						}).promise().done(function () {
							// Удаление контейнера
							$download.remove();
							// Выключение режима загрузки
							self.$els.playlist.items.find('a.dl-active').removeClass('dl-active');
							self.$els.controls.playlist.download.mode.removeClass('active');
							// Включение режима прослушивания
							self.app.mode('listen');
						});
					});
				} catch (e) {
					notify().error('Ошибка при загрузке', 2000);

					throw new Error('playlist.download: ошибка загрузки аудиозаписей');
				}
			},
			// Получение битрейта аудиозаписи
			bitrate: function ($that) {
				try {
					var id = $that.data('id');
					var item = self.tmp.session.playlist[id];

					if (access_token !== 'undefined') {
						$.ajax({
							url: 'fileinfo',
							data: {
								id: id,
								duration: item.duration,
								owner_id: item.owner_id,
								uid: self.tmp.session.mid,
								access_token: access_token
							},
							method: 'POST',
							dataType: 'json',
							success: function (data) {
								if (parseInt(data.kbps) > 0) {
									var kbps = '';

									if (data.kbps >= 320) {
										kbps = 'bitrate-higher';
									} else if (data.kbps >= 256 && data.kbps < 320) {
										kbps = 'bitrate-high';
									} else if (data.kbps >= 192 && data.kbps < 256) {
										kbps = 'bitrate-medium';
									} else if (data.kbps < 192) {
										kbps = 'bitrate-low';
									}

									$that
										.find('div.actions > small.bitrate')
										.data('bitrate', 'checked')
										.removeClass('bitrate-load')
										.addClass(kbps).text(data.kbps);
								}
							}
						});
					}
				} catch (e) {
					throw new Error('playlist.bitrate: ошибка получения битрейта');
				}
			},
			// seToTime: конвертирует секунды в формат времени
			secToTime: function (sec) {
				var hours = Math.floor(sec / (60 * 60));
				var divisor_for_minutes = sec % (60 * 60);
				var minutes = Math.floor(divisor_for_minutes / 60);
				var divisor_for_seconds = divisor_for_minutes % 60;
				var seconds = Math.ceil(divisor_for_seconds);
				var obj = {
					"h": hours,
					"m": (hours > 0 && minutes <= 9) ? '0' + minutes : minutes,
					"s": (seconds <= 9) ? '0' + seconds : seconds
				};
				return obj;
			},
			// События при document.ready
			ready: function () {
				// Инициализация Drag-n-drop-a в плейлисте
				if (self.device.desktop) {
					try {
						$(function () {
							var plItems = document.getElementById('pl-items');
							var sortable = new Sortable(plItems, {
								animation: 250,
								// После перетаскивания аудиозаписи
								onEnd: function (e) {
									if (self.options.reorder) {
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
											self.audio.reorder(self.tmp.session.mid, itemId, nextId, '');
										}
										// Середина плейлиста
										else if (prevIndex >= 0 && nextIndex >= 0) {
											self.audio.reorder(self.tmp.session.mid, itemId, '', prevId);
										}
										// Конец плейлиста
										else if (prevIndex > 0 && nextIndex < 0) {
											self.audio.reorder(self.tmp.session.mid, itemId, '', prevId);
										}

										self.animation.playlist.moved(item);
									}
								},
							});

							console.log('sortable: ' + sortable);
						});
					} catch (e) {
						throw new Error('sortable: ошибка при drag-n-drop-е аудиозаписи');
					}
				}
				// Получение аудиозаписей пользователя
				$(self.$els.controls.load.user).on('click', function () {
					self.audio.get(self.tmp.session.mid, 0);
				});
				// Получение популярных аудиозаписей
				$(self.$els.controls.load.popular).on('click', function () {
					self.audio.getPopular(0, 0);
				});
				// Получение аудиозаписей рекомендуемых пользователю
				$(self.$els.controls.load.recommendations).on('click', function () {
					self.audio.getRecommendations(0);
				});
				// Рандомная сортировка
				$(self.$els.controls.playlist.sort.shuffle).on('click', function () {
					self.playlist.sort.shuffle();
				});
				// Сортировка по алфавиту (>, <)
				$(self.$els.controls.playlist.sort.alphabetically).clickToggle(function () {
					self.playlist.sort.alphabetically('<');
				}, function () {
					self.playlist.sort.alphabetically('>');
				});
				// Поисковая форма
				$(self.$els.controls.search.form).submit(function (e) {
					var q = $.trim(self.$els.controls.search.query.val());

					self.audio.search(q, 0);
					e.preventDefault();
				});
				// Аудиозаписи в плейлисте (воспроизведение, пауза)
				$(self.$els.playlist.items).on('click', 'a', function (e) {
					try {
						if (e.target === this) {
							var $that = $(this);

							// Воспроизведение
							if (self.mode.listen) {
								var id = $that.data('id');

								if ($that.hasClass('active')) {
									if (self.tmp.player.status === 'play' || self.tmp.player.status === 'playing') {
										self.player.controls.pause();
									} else {
										self.player.controls.play();
									}
								} else {
									self.player.play(id);
								}
								// Загрузка
							} else if (self.mode.download) {
								if (!$that.hasClass('dl-active')) {
									$that.addClass('dl-active');
								} else {
									$that.removeClass('dl-active');
								}
							}
						}
					} catch (e) {
						throw new Error('playlist.ready: ошибка при клике на аудиозапись');
					}
				});
				// Если используется компьютер
				if (self.device.desktop) {
					// Генерирование .m3u из текущего плейлиста
					$(self.$els.controls.playlist.generate.m3u).on('click', function () {
						self.playlist.generate.m3u();
					});
					// Включение или отключения режима загрузки
					$(self.$els.controls.playlist.download.mode).on('click', function () {
						try {
							var $that = $(this);
							var $items = self.$els.playlist.items.find('a');

							// Если включен режим прослушивания
							if (self.mode.listen) {
								self.app.mode('download');
								$that.addClass('active');
								self.$els.controls.playlist.download.all.addClass('active');
							}
							// Если включен режим загрузки
							else if (self.mode.download) {
								// Если были найдены помеченные для загрузки аудиозаписи
								if ($items.hasClass('dl-active')) {
									$items = self.$els.playlist.items.find('a.dl-active');
									var download = {};

									// Получение списка загружаемых аудиозаписей
									$.each($items, function (i, that) {
										var id = $(that).data('id');
										var item = self.tmp.session.playlist[id];

										download[i] = {
											artist: item.artist,
											title: item.title,
											owner_id: item.owner_id,
											id: item.id
										};
									}).promise().done(function () {
										self.playlist.download(download);
									});
								} else {
									self.app.mode('listen');
									$that.removeClass('active');
									self.$els.controls.playlist.download.all.removeClass('active');
								}
							}
						} catch (e) {
							throw new Error('playlist.ready: ошибка при клике на режим загрузки');
						}
					});
					// Выделение всех аудиозаписей в плейлисте, для загрузки
					$(self.$els.controls.playlist.download.all).clickToggle(function () {
						$(self.$els.playlist.items)
							.find('a')
							.addClass('dl-active');
					}, function () {
						$(self.$els.playlist.items)
							.find('a')
							.removeClass('dl-active');
					});
					// Показать битрейт аудиозаписи
					$(self.$els.playlist.items).on({
						mouseenter: function () {
							var $that = $(this);
							var bitrate = $that.find('div.actions > small.bitrate').data('bitrate');

							if (bitrate !== 'checked') {
								self.playlist.bitrate($that);
							}
						},
						click: function () {
							var $that = $(this);
							var bitrate = $that.find('div.actions > small.bitrate').data('bitrate');

							if (bitrate !== 'checked') {
								self.playlist.bitrate($that);
							}
						}
					}, 'a');
					// Добавить аудиозапись
					$(self.$els.playlist.items, 'a > div.actions').on('click', 'span.add', function (e) {
						if (e.target === this) {
							var $that = $(this);

							if (!$that.hasClass('done')) {
								self.audio.add($that);
							} else {
								self.audio.delete($that);
							}
						}
					});
					// Удалить аудиозапись
					$(self.$els.playlist.items, 'a > div.actions').on('click', 'span.delete', function (e) {
						if (e.target === this) {
							var $that = $(this);

							if (!$that.hasClass('done')) {
								self.audio.delete($that);
							} else {
								self.audio.restore($that);
							}
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
						var genres = self.genres.get();
						var list = '';

						$(genres).each(function (i, that) {
							list += '<li><a data-id="' + that.id + '">' + that.title + '</a></li>';
						});

						$(self.$els.controls.search.genres.items).html(list);
					} catch (e) {
						throw new Error('genres.ready: ошибка вывода жанров');
					}
				});
				// Получить аудиозаписи выбранного жанра
				$(self.$els.controls.search.genres.items).on('click', 'a', function () {
					var id = $(this).data('id');

					self.audio.getPopular(id, 0);
				});
			}
		},
		// Работа с API: audio
		audio: {
			// Загружает аудиозаписи пользователя, для проверки и вывода элементов добавления
			// или удаления аудиозаписей
			// owner_id: идентификатор владельца аудиозаписей
			// count: количество возвращаемых аудиозаписей
			// v: версия api
			getUser: function (get) {
				var request = 'audio.get';

				self.app.load(true);
				try {
					VK.Api.call(request, {
						owner_id: self.tmp.session.mid,
						count: 6000,
						v: self.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);
						self.tmp.player.playlist = r.response.items;

						// Если нужна загрузка плейлиста пользователя
						if (get) {
							self.audio.get(self.tmp.session.mid, 0)
						}
					});
				} catch (e) {
					throw new Error('Ошибка запроса: ' + request);
				}
			},
			// Возвращает список аудиозаписей пользователя или сообщества
			// owner_id: идентификатор владельца аудиозаписей
			// count: количество возвращаемых аудиозаписей
			// offset: смещение относительно первой найденной аудиозаписи для выборки определенного подмножества
			// v: версия api
			get: function (owner_id, offset) {
				var request = 'audio.get';

				// Если при подгрузке не были получены аудиозаписи, то считается, что все подгрузились
				// поэтому запрос блокируется с помощью self.options.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && self.options.offset) {
					self.app.load(true);
					try {
						VK.Api.call(request, {
							owner_id: owner_id,
							count: self.config.audio.count,
							offset: offset,
							v: self.config.api
						}, function (r) {
							self.app.load(false);
							self.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увелечения offset-a
								self.tmp.req = {
									name: request,
									owner_id: owner_id,
									offset: offset
								};

								// Включение запроса 'reorder' при drag-n-drop
								if (owner_id === self.tmp.session.mid) {
									self.app.reorder(true);
								} else {
									self.app.reorder(false);
								}

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.items.length > 0) {
									self.options.offset = true;
									self.playlist.add(r.response);
								} else {
									self.options.offset = false;
								}

								console.log(request + '(' + owner_id + ',' + offset + ')' + ': всего аудиозаписей = ' + r.response.count + ', (получено = ' + r.response.items.length + ')');
							}
						});
					} catch (e) {
						throw new Error('Ошибка запроса: ' + request);
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
				// поэтому запрос блокируется с помощью self.options.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && self.options.offset) {
					self.app.load(true);
					try {
						VK.Api.call(request, {
							genre_id: genre_id,
							count: self.config.audio.count,
							offset: offset,
							v: self.config.api
						}, function (r) {
							self.app.load(false);
							self.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увелечения offset-a
								self.tmp.req = {
									name: request,
									genre_id: genre_id,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								self.app.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.length > 0) {
									self.options.offset = true;
									self.playlist.add(r.response);
								} else {
									self.options.offset = false;
								}

								console.log(request + '(' + genre_id + ',' + offset + ')' + ': получено аудиозаписей = ' + r.response.length);
							}
						});
					} catch (e) {
						throw new Error('Ошибка запроса: ' + request);
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
				// поэтому запрос блокируется с помощью self.options.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && self.options.offset) {
					self.app.load(true);
					try {
						VK.Api.call(request, {
							count: self.config.audio.count,
							offset: offset,
							v: self.config.api
						}, function (r) {
							self.app.load(false);
							self.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увелечения offset-a
								self.tmp.req = {
									name: request,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								self.app.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.items.length > 0) {
									self.options.offset = true;
									self.playlist.add(r.response);
								} else {
									self.options.offset = false;
								}

								console.log(request + '(' + offset + ')' + ': всего аудиозаписей = ' + r.response.count + ', (получено = ' + r.response.items.length + ')');
							}
						});
					} catch (e) {
						throw new Error('Ошибка запроса: ' + request);
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
				// поэтому запрос блокируется с помощью self.options.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && self.options.offset) {
					self.app.load(true);
					try {
						VK.Api.call(request, {
							q: q,
							auto_complete: 1,
							count: self.config.audio.count,
							offset: offset,
							v: self.config.api
						}, function (r) {
							self.app.load(false);
							self.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увелечения offset-a
								self.tmp.req = {
									name: request,
									q: q,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								self.app.reorder(false);

								// Если нужна подгрузка аудиозаписей
								if (offset > 0) {
									r.response.offset = offset;
								}

								// Если в ответе присутствуют аудиозаписи
								if (r.response.items.length > 0) {
									self.options.offset = true;
									self.playlist.add(r.response);
								} else {
									self.options.offset = false;
								}

								console.log(request + '(' + q + ',' + offset + ')' + ': всего аудиозаписей = ' + r.response.count + ', (получено = ' + r.response.items.length + ')');
							}
						});
					} catch (e) {
						throw new Error('Ошибка запроса: ' + request);
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

				self.app.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						before: before,
						after: after,
						v: self.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);

						if (r.response === 1) {
							notify().success('Аудиозапись перемещена', 2000);

							console.log(request + '(' + owner_id + ',' + audio_id + ',' + before + ',' + after + ')' + ': аудиозапись перемещена');
						} else {
							notify().error('Аудиозапись не перемещена', 2000);

							console.log(request + '(' + owner_id + ',' + audio_id + ',' + before + ',' + after + ')' + ': аудиозапись не перемещена');
						}
					});
				} catch (e) {
					throw new Error('Ошибка запроса: ' + request);
				}
			},
			// Транслирует аудиозапись в статус пользователю
			// audio: идентификатор аудиозаписи, которая будет отображаться в статусе (owner_id_audio_id)
			// target_ids: перечисленные через запятую идентификаторы сообществ и пользователя, которым будет транслироваться аудиозапись
			// v: версия api
			setBroadcast: function (audio, target_ids) {
				var request = 'audio.setBroadcast';

				self.app.load(true);
				try {
					VK.Api.call(request, {
						audio: audio,
						target_ids: target_ids,
						v: self.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);

						if (r.response && self.tmp.player.broadcast) {
							notify().success('Включена трансляция в статус', 2000);

							console.log(request + '(' + audio + ',' + target_ids + ')' + ': аудиозапись транслируется');
						} else {
							notify().success('Трансляция в статус отключена', 2000);

							console.log(request + '(' + audio + ',' + target_ids + ')' + ': аудиозапись не транслируется');
						}
					});
				} catch (e) {
					throw new Error('Ошибка запроса: ' + request);
				}
			},
			// Копирует аудиозапись на страницу пользователя
			// owner_id: идентификатор владельца аудиозаписи
			// audio_id: идентификатор аудиозаписи
			// v: версия api
			add: function ($that) {
				var request = 'audio.add';
				var audio_id = $that.parent().parent().data('id');
				var owner_id = self.tmp.session.playlist[audio_id].owner_id;

				self.app.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: self.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);

						if (r.response) {
							notify().success('Аудиозапись добавлена', 1000);

							// Изменения всплывающего текста и назначение атрибута с новым id аудиозаписи
							$that
								.attr('data-content', 'Добавлено')
								.addClass('done')
								.parent()
								.parent()
								.attr('data-created', r.response);

							// Обновление плейлиста пользователя
							self.audio.getUser(false);

							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись добавлена');
						} else {
							notify().error('Аудиозапись не добавлена', 1000);

							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись не добавлена');
						}
					});
				} catch (e) {
					throw new Error('Ошибка запроса: ' + request);
				}
			},
			// Удаляет аудиозапись со страницы пользователя
			// owner_id: идентификатор владельца аудиозаписи
			// audio_id: идентификатор аудиозаписи
			// created_id: новый идентификатор при добавлении аудиозаписи
			// v: версия api
			delete: function ($that) {
				var request = 'audio.delete';
				var owner_id = self.tmp.session.mid;
				var audio_id = $that.parent().parent().data('id');
				var created_id = $that.parent().parent().attr('data-created');

				// Если аудиозапись была добавлена и существует атрибут нового id
				if (created_id) {
					audio_id = created_id;
				}

				self.app.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: self.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);

						if (r.response === 1) {
							notify().success('Аудиозапись удалена', 1000);

							// Если аудиозапись была добавлена и существует атрибут нового id
							if (created_id) {
								$that
									.attr('data-content', 'Добавить')
									.removeClass('done')
									.parent()
									.parent()
									.removeAttr('data-created');
							} else {
								$that
									.attr('data-content', 'Удалено')
									.addClass('done');
							}

							// Обновление плейлиста пользователя
							self.audio.getUser(false);

							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись удалена');
						} else {
							notify().error('Аудиозапись не удалена', 1000);

							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись не удалена');
						}
					});
				} catch (e) {
					throw new Error('Ошибка запроса: ' + request);
				}
			},
			// Восстанавливает удаленную аудиозапись, в пределах 20 минут
			// owner_id: идентификатор владельца аудиозаписи
			// audio_id: идентификатор аудиозаписи
			// v: версия api
			restore: function ($that) {
				var request = 'audio.restore';
				var owner_id = self.tmp.session.mid;
				var audio_id = $that.parent().parent().data('id');

				self.app.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: self.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);

						if (r.response) {
							notify().success('Аудиозапись восстановлена', 1000);

							$that
								.attr('data-content', 'Удалить')
								.removeClass('done');

							// Обновление плейлиста пользователя
							self.audio.getUser(false);

							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись восстановлена');
						} else {
							notify().error('Аудиозапись не восстановлена', 1000);

							console.log(request + '(' + owner_id + ',' + audio_id + ')' + ': аудиозапись не восстановлена');
						}
					});
				} catch (e) {
					throw new Error('Ошибка запроса: ' + request);
				}
			},
		},
		// Настройки и управление
		app: {
			// Авторизация
			auth: function (status) {
				try {
					if (status) {
						self.app.refresh();
						self.$els.vk.auth.hide();
						self.$els.authorized.attr('data-authorized', 'true').fadeIn(250);

						notify().success('Вы успешно вошли', 2000);
					} else {
						self.app.refresh();
						self.$els.authorized.attr('data-authorized', 'false').hide();
						self.$els.vk.auth.hide();

						notify().error('Вы не авторизованы', 2000);
					}
				} catch (e) {
					throw new Error('app.auth: ошибка при авторизации или деавторизации');
				}
			},
			// Загрузка
			load: function (status) {
				if (status) {
					self.config.load = true;
					self.$els.load.show();
				} else {
					self.config.load = false;
					self.$els.load.hide();
				}
			},
			// Режим
			mode: function (mode) {
				switch (mode) {
				case 'listen':
					self.mode.listen = true;
					self.mode.download = false;

					notify().success('Включен режим прослушивания', 1000);
					break;
				case 'download':
					self.mode.download = true;
					self.mode.listen = false;

					notify().success('Включен режим загрузки', 1000);
					break;
				}
			},
			// Drag-n-drop
			reorder: function (status) {
				if (status) {
					self.options.reorder = true;
				} else {
					self.options.reorder = false;
				}
			},
			// Заголовок страницы
			title: function (title) {
				$(document).prop('title', title);
			},
			// Очистка временных данных
			refresh: function () {
				self.tmp.session = {};
				self.tmp.player = {};
				self.tmp.req = {};
			},
			// Определение устройства
			device: function () {
				if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
					self.device.portable = true;
					self.device.desktop = false;
				} else {
					self.device.desktop = true;
					self.device.portable = false;
				}
			}
		},
		// Обработка ошибок сервера
		verify: function (request, r) {
			if (r.error) {
				if (r.error.error_code === 14) {
					self.captcha.show(r.error);
				} else {
					throw new Error(request + ': ' + r.error.error_msg);
				}
			}
		},
		// Обработка капчи
		captcha: {
			show: function (captcha) {
				$(self.$els.captcha.img).prop('src', captcha.captcha_img);
				$(self.$els.captcha.sid).val(captcha.captcha_sid);
				$(self.$els.captcha.key).val('');
				$(self.$els.captcha.container).modal('show');
			},
			ready: function () {
				try {
					$(self.$els.captcha.form).submit(function (e) {
						var captcha_sid = $.trim($(self.$els.captcha.sid).val());
						var captcha_key = $.trim($(self.$els.captcha.key).val());

						if (captcha_sid.length > 0 && captcha_key.length > 0) {
							VK.Api.call('audio.get', {
								count: 1,
								captcha_sid: captcha_sid,
								captcha_key: captcha_key,
								v: self.config.api
							}, function (r) {
								if (r.response) {
									$(self.$els.captcha.container).modal('hide');

									notify().success('Капча успешно отправлена', 2000);
								} else {
									notify().error('Капча неверно введена', 2000);
								}
							});
						}
						e.preventDefault();
					});
				} catch (e) {
					throw new Error('captcha.ready: ошибка при отправке капчи');
				}
			}
		},
		// Анимация
		animation: {
			player: {
				controls: {
					prev: function () {
						self.animation.custom($(self.$els.player.controls.title), 'an-plr-prev', 250);
					},
					next: function () {
						self.animation.custom($(self.$els.player.controls.title), 'an-plr-next', 250);
					},
					play: function () {
						self.animation.custom($(self.$els.player.controls.title), 'an-plr-next', 250);
					},
					pause: function () {
						self.animation.custom($(self.$els.player.controls.title), 'an-plr-prev', 250);
					},
				}
			},
			playlist: {
				moved: function (item) {
					if ($(item).hasClass('active')) {
						self.animation.custom($(item), 'an-pl-moved--active', 1000);
					} else {
						self.animation.custom($(item), 'an-pl-moved', 1000);
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
		// События при document.ready
		ready: function () {
			self.vk.ready();
			self.player.ready();
			self.genres.ready();
			self.playlist.ready();
			self.captcha.ready();

			// Для всех popover
			if (self.device.desktop) {
				$('[data-toggle="popover"]').popover({
					trigger: 'hover'
				});
			}
		}
	};
	/* ================================================== /SlothMusic */

	// При готовности всех элементов на странице
	$(document).ready(function () {
		try {
			slothMusic.init();
			slothMusic.ready();
		} catch (e) {
			throw new Error('document.ready: ошибка');
		}
	});

	// При скролле окна
	$(window).scroll(function () {
		try {
			if ($(window).scrollTop() + $(window).height() >= $(document).height() - 200 && !self.config.load) {
				slothMusic.playlist.more();
			}
		} catch (e) {
			throw new Error('window.scroll: ошибка при скролле');
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
