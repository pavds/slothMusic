$(function () {
	'use strict';

	/* ================================================== App config */
	var app = {
		config: {
			id: 5083406,
			permissions: '8 | 1024',
			api: 5.40,
			load: false,
			audio: {
				count: 50,
				offset: 50
			}
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
		}
	};
	/* ================================================== /App config */

	/* ================================================== Elements */
	var $els = {
		authorized: {
			true: document.getElementsByClassName('authorized'),
			false: document.getElementsByClassName('no-authorized'),
		},
		player: {
			audio: document.getElementById('plr-audio'),
			cover: $(document.getElementById('plr-cover')),
			controls: {
				title: document.getElementById('plr-cls-title'),
				prev: document.getElementById('plr-cls-prev'),
				next: document.getElementById('plr-cls-next'),
			}
		},
		controls: {
			load: {
				user: $(document.getElementById('cls-ld-user')),
				popular: $(document.getElementById('cls-ld-popular')),
				recommendations: $(document.getElementById('cls-ld-recommendations'))
			},
			player: {
				rewind: {
					backward: document.getElementById('cls-plr-rw-backward'),
					forward: document.getElementById('cls-plr-rw-forward'),
				},
				broadcast: document.getElementById('cls-plr-bc')
			},
			search: {
				form: document.getElementById('cls-sh-form'),
				query: document.getElementById('cls-sh-query'),
				genres: {
					items: document.getElementById('cls-sh-gr-items'),
					button: $(document.getElementById('cls-sh-gr-button')),
					text: $(document.getElementById('cls-sh-gr-text'))
				}
			},
			playlist: {
				sort: {
					shuffle: $(document.getElementById('cls-pl-st-shuffle')),
					alphabetically: $(document.getElementById('cls-pl-st-alphabetically'))
				},
				download: {
					mode: document.getElementById('cls-pl-dl-mode'),
					all: document.getElementById('cls-pl-dl-all')
				},
				generate: {
					m3u: $(document.getElementById('cls-pl-gr-m3u'))
				}
			}
		},
		playlist: {
			body: document.getElementById('pl-items'),
			items: $(document.getElementById('pl-items')),
		},
		vk: {
			auth: document.getElementById('vk-auth'),
		},
		captcha: {
			container: document.getElementById('ml-ca-container'),
			form: document.getElementById('ml-ca-form'),
			title: document.getElementById('ml-ca-title'),
			img: document.getElementById('ml-ca-img'),
			key: document.getElementById('ml-ca-key'),
			sid: document.getElementById('ml-ca-sid'),
		},
		load: document.getElementById('load')
	};
	/* ================================================== /Elements */

	/* ================================================== SlothMusic */
	var slothMusic = {
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
					apiId: app.config.id
				}, app.config.api);
				VK.Auth.getLoginStatus(self.vk.auth);
				VK.UI.button($els.vk.auth.id);
			},
			// Авторизация
			auth: function (r) {
				if (r.status === 'connected') {
					self.app.auth(true);
					app.tmp.session = r.session;
					self.player.controls.broadcast(false);

					// Загрузка аудиозаписей пользователя и загрузка его плейлиста
					self.audio.getUser(true);

					console.log('auth: авторизация прошла успешно (id = ' + app.tmp.session.mid + ')');
				} else {
					self.app.auth(false);


					console.log('auth: авторизация не удалась');
				}
			},
			// События при document.ready
			ready: function () {
				// Авторизация приложения
				$els.vk.auth.addEventListener('click', function (e) {
					VK.Auth.login(self.vk.auth, app.config.permissions);
				});
			}
		},
		// Плеер
		player: {
			// Управление плеером
			controls: {
				// Воспроизвести
				play: function () {
					$els.player.audio.play();
				},
				// Пауза
				pause: function () {
					$els.player.audio.pause();
				},
				// Предыдущая аудиозапись в плейлисте
				prev: function () {
					try {
						var $items = $els.playlist.items.find('.pl-item');
						var $item = app.tmp.player.item;
						var $prev = ($item.is(':first-child')) ? $items.last() : $items.eq($item.index() - 1);

						self.animation.player.controls.prev();
						self.player.play($prev);
					} catch (e) {
						throw new Error('player.controls.prev: ошибка при воспроизведении предыдущей аудиозаписи');
					}
				},
				// Следующая аудиозапись в плейлисте
				next: function () {
					try {
						var $items = $els.playlist.items.find('.pl-item');
						var $item = app.tmp.player.item;
						var $next = ($item.is(':last-child')) ? $items.first() : $items.eq($item.index() + 1);

						self.animation.player.controls.next();
						self.player.play($next);
					} catch (e) {
						throw new Error('player.controls.next: ошибка при воспроизведении следующей аудиозаписи');
					}
				},
				// Перемотка
				rewind: {
					// Перемотка назад
					backward: function () {
						$els.player.audio.currentTime -= 10;
					},
					// Перемотка вперед
					forward: function () {
						$els.player.audio.currentTime += 10;
					}
				},
				// Включение или отлючение трансляции в статус
				broadcast: function (status) {
					try {
						if (status && app.tmp.player.id) {
							app.tmp.player.broadcast = true;
							self.audio.setBroadcast(app.tmp.player.owner_id + '_' + app.tmp.player.id, app.tmp.session.mid);
						} else if (app.tmp.player.id) {
							app.tmp.player.broadcast = false;
							self.audio.setBroadcast(0, app.tmp.session.mid);
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
			play: function ($item) {
				try {
					var id = $item.data('id');
					var item = app.tmp.session.playlist[id];
					var title = item.artist + ' — ' + item.title;

					// Поиск cover-a
					(app.device.desktop) ? self.player.cover.search(item.artist + ' ' + item.title): void 0;

					// Убрать подсветку предыдущей аудиозаписи
					$(app.tmp.player.item).removeClass('active');

					// Воспроизводимая аудиозапись
					app.tmp.player.id = item.id;
					app.tmp.player.owner_id = item.owner_id;
					app.tmp.player.title = title;
					app.tmp.player.item = $($item);

					// Загрузка аудиозаписи
					$els.player.audio.src = item.url;
					$els.player.audio.load();
					$els.player.audio.play();
					$els.player.controls.title.innerHTML = title;

					// Трансляция аудиозаписи, если трансляция включена
					(app.tmp.player.broadcast === true) ? self.player.controls.broadcast(true): void 0;

					// Подсветка активной аудиозаписи
					$item[0].classList.add('active');

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
							url: 'https://ajax.googleapis.com/ajax/services/search/images',
							method: 'GET',
							dataType: 'jsonp',
							data: {
								v: '1.0',
								q: query,
								imgsz: 'large',
							},
							success: function (r) {
								if (r.responseStatus === 200) {
									var $that = $els.player.cover;
									var url = r.responseData.results[0].unescapedUrl;

									if (url !== '' && !$that.hasClass('an-plr-cover')) {
										$that
											.addClass('an-plr-cover')
											.prop('src', url)
											.show();
									} else if (url !== '' && $that.hasClass('an-plr-cover')) {
										$that
											.prop('src', url)
											.show();
									} else {
										$that
											.hide()
											.removeClass('an-plr-cover')
											.prop('src', '');
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
				$els.player.audio.addEventListener('ended', function () {
					if (this.src) {
						self.player.controls.next();
					}
				}, false);
				// Пауза
				$els.player.audio.addEventListener('pause', function () {
					if (this.src) {
						app.tmp.player.status = 'pause';
						self.animation.player.controls.pause();
						self.app.title('Пауза: ' + app.tmp.player.title);
					}
				}, false);
				// Воспроизведение
				$els.player.audio.addEventListener('play', function () {
					if (this.src) {
						app.tmp.player.status = 'play';
						self.animation.player.controls.play();
						self.app.title(app.tmp.player.title);
					}
				}, false);
				// Буферизация
				$els.player.audio.addEventListener('waiting', function () {
					if (this.src) {
						self.app.load(true);
						app.tmp.player.status = 'waiting';
						self.app.title('Загрузка: ' + app.tmp.player.title);
					}
				}, false);
				// Проигрывание
				$els.player.audio.addEventListener('playing', function () {
					if (this.src) {
						self.app.load(false);
						app.tmp.player.status = 'playing';
						self.app.title(app.tmp.player.title);
					}
				}, false);
				// Предыдущая аудиозапись
				$els.player.controls.prev.addEventListener('click', function () {
					self.player.controls.prev();
				});
				// Следующая аудиозапись
				$els.player.controls.next.addEventListener('click', function () {
					self.player.controls.next();
				});
				// Перемотать назад на 10 секунд
				$els.controls.player.rewind.backward.addEventListener('click', function () {
					self.player.controls.rewind.backward();
				});
				// Перемотать вперед на 10 секунд
				$els.controls.player.rewind.forward.addEventListener('click', function () {
					self.player.controls.rewind.forward();
				});
				// Трансляция (включить, выключить)
				$($els.controls.player.broadcast).clickToggle(function () {
						self.player.controls.broadcast(true);
						this.classList.add('active');
					},
					function () {
						self.player.controls.broadcast(false);
						this.classList.remove('active');
					});
			}
		},
		playlist: {
			// Добавление аудиозаписей в плейлист
			add: function (r) {
				try {
					var items = (r.items) ? r.items : r;
					var $pl = document.createDocumentFragment();

					// Очистка текущего плейлиста, если не передан offset
					(!r.offset || r.offset <= 0) ? app.tmp.session.playlist = []: void 0;

					// Собирает массив из ответа сервера и добавляет ссылки в DOM
					$(function () {
						for (var i = 0; i < items.length; i++) {
							var item = items[i];
							var $el = document.createElement('a');

							// Удаление пробелов в названии аудиозаписи
							item.artist = item.artist.replace(/(^\s+|\s+$)/g, '');
							item.title = item.title.replace(/(^\s+|\s+$)/g, '');

							// Плейлист текущей сессии
							app.tmp.session.playlist[item.id] = {
								url: item.url,
								duration: item.duration,
								owner_id: item.owner_id,
								artist: item.artist,
								title: item.title,
								id: item.id
							};

							// Аудиозапись в плейлисте
							$el.className = 'pl-item';
							$el.setAttribute('data-id', item.id);
							$el.setAttribute('data-duration', item.duration);
							$el.innerHTML = item.artist + ' — ' + item.title;
							$pl.appendChild($el);
						}

						// Если зашли с помощью ПК
						if (app.device.desktop) {
							var ids = [];
							var $items = $pl.childNodes;

							// Id аудиозаписей, которые есть у пользователя
							for (var i = 0; i < app.tmp.player.playlist.length; i++) {
								ids[i] = Number(app.tmp.player.playlist[i].id);
							}

							// Битрейт, длительность, добавление, удаление аудиозаписей
							for (var i = 0; i < $items.length; i++) {
								var $item = $items[i];
								var $actions = document.createElement('div');
								var $bitrate = document.createElement('small');
								var $duration = document.createElement('small');
								var $span = document.createElement('span');
								var data = $item.dataset;

								// Битрейт
								$bitrate.className = 'bitrate bitrate-load';
								$bitrate.setAttribute('data-toggle', 'popover');
								$bitrate.setAttribute('data-content', 'Битрейт');
								$actions.appendChild($bitrate);

								// Длительность
								$duration.className = 'duration';
								$duration.setAttribute('data-toggle', 'popover');
								$duration.setAttribute('data-content', 'Длительность');
								$duration.innerHTML = self.playlist.secToTime(data.duration);
								$actions.appendChild($duration);

								// Если аудиозаписи есть у пользователя
								if (ids.indexOf(Number(data.id)) >= 0) {
									// Удаление
									$span.className = 'delete';
									$span.setAttribute('data-content', 'Удалить');
								}
								// Если аудиозаписи нет у пользователя
								else {
									// Добавление
									$span.className = 'add';
									$span.setAttribute('data-content', 'Добавить');
								}
								$span.setAttribute('data-toggle', 'popover');
								$actions.appendChild($span);

								// Контейнер
								$actions.className = 'actions';
								$item.appendChild($actions);
							}

							// Bootstrap popover
							$($pl.childNodes).find('[data-toggle="popover"]').popover({
								trigger: 'hover',
								container: 'body',
								placement: 'top',
							});
						}

						// Если передан offset, элементы будут добавляться
						// если нет, то произойдет перезапись всего плейлиста
						(!r.offset > 0) ? $els.playlist.body.innerHTML = '': void 0;
						$els.playlist.body.appendChild($pl);
					});
				} catch (e) {
					throw new Error('playlist.add: ошибка добавления в плейлист');
				}
			},
			// Сортировка плейлиста
			sort: {
				// Рандомная сортировка
				shuffle: function () {
					$($els.playlist.body.childNodes).shuffle();
				},
				// Сортировка по алфавиту
				alphabetically: function (direction) {
					$($els.playlist.body.childNodes).alphabetically(direction);
				}
			},
			// Подгрузить еще аудиозаписи, используя текущий запрос, изменяя offset
			more: function () {
				try {
					switch (app.tmp.req.name) {
					case 'audio.get':
						self.audio.get(app.tmp.req.owner_id, (app.tmp.req.offset + app.config.audio.offset));
						break;
					case 'audio.getPopular':
						self.audio.getPopular(app.tmp.req.genre_id, (app.tmp.req.offset + app.config.audio.offset));
						break;
					case 'audio.getRecommendations':
						self.audio.getRecommendations(app.tmp.req.offset + app.config.audio.offset);
						break;
					case 'audio.search':
						self.audio.search(app.tmp.req.q, (app.tmp.req.offset + app.config.audio.offset));
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
						var items = app.tmp.session.playlist;
						var a = document.createElement('a');
						var file, url;
						var m3u = '#EXTM3U\r\n';

						for (var id in items) {
							var item = items[id];

							m3u += '#EXTINF:' + item.duration + ',' + (item.artist).replace(/\r\n|\r|\n/g, ' ') + ' - ' + (item.title).replace(/\r\n|\r|\n/g, ' ') + '\r\n';
							m3u += (item.url.replace('https', 'http')).replace(/\?extra=(.*)/, '') + '\r\n';
						}

						file = new Blob([m3u], {
							type: 'audio/x-mpegurl'
						});

						url = window.URL.createObjectURL(file);

						a.href = url;
						a.target = '_blank';
						a.download = 'playlist.m3u';
						a.click();

						window.URL.revokeObjectURL(url);

						notify().success('Плейлист .M3U успешно сгенерирован', 2000);
					} catch (e) {
						notify().error('Ошибка генерирования .M3U плейлиста', 2000);

						throw new Error('playlist.generate.m3u: ошибка генерирования m3u плейлиста');
					}
				}
			},
			// Загрузка переданных аудиозаписей
			download: function ($items) {
				try {
					// Получение списка загружаемых аудиозаписей,
					// создание ссылок и эмуляция клика
					for (var i = 0; i < $items.length; i++) {
						var a = document.createElement('a');
						var $that = $items[i];
						var id = Number($that.dataset.id);
						var item = app.tmp.session.playlist[id];

						a.href = '/download?o=' + item.owner_id + '&i=' + item.id;
						a.target = '_blank';
						a.click();
					}

					// Убрать выделение загружаемых аудиозаписей
					$($els.playlist.body)
						.find('.dl-active')
						.removeClass('dl-active');

					// Скрытие кнопки выбора всех аудиозаписей
					$els.controls.playlist.download.mode.classList.remove('active');

					// Включение режима прослушивания
					self.app.mode('listen');
				} catch (e) {
					notify().error('Ошибка при загрузке', 2000);

					throw new Error('playlist.download: ошибка загрузки аудиозаписей');
				}
			},
			// Получение битрейта аудиозаписи
			bitrate: function ($that) {
				try {
					var id = $that.data('id');
					var item = app.tmp.session.playlist[id];

					if (access_token !== 'undefined') {
						$.ajax({
							url: 'fileinfo',
							data: {
								id: id,
								owner_id: item.owner_id,
								uid: app.tmp.session.mid,
							},
							method: 'POST',
							dataType: 'json',
							success: function (data) {
								if (data.kbps > 0) {
									var kbps =
										(data.kbps >= 320) ? 'bitrate-higher' :
										(data.kbps >= 256 && data.kbps < 320) ? 'bitrate-high' :
										(data.kbps >= 192 && data.kbps < 256) ? 'bitrate-medium' :
										(data.kbps < 192) ? 'bitrate-low' : '';

									$that
										.find('.bitrate')
										.data('bitrate', 'checked')
										.removeClass('bitrate-load')
										.addClass(kbps)
										.text(data.kbps);
								}
							}
						});
					}
				} catch (e) {
					// throw new Error('playlist.bitrate: ошибка получения битрейта');
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
					'h': hours,
					'm': (hours > 0 && minutes <= 9) ? '0' + minutes : minutes,
					's': (seconds <= 9) ? '0' + seconds : seconds
				};
				return (((obj.h > 0) ? obj.h + ':' : '') + '' + obj.m + ':' + '' + obj.s);
			},
			// События при document.ready
			ready: function () {
				// Инициализация Drag-n-drop-a в плейлисте
				if (app.device.desktop) {
					try {
						$(function () {
							var pl = document.getElementById('pl-items');
							var sortable = new Sortable(pl, {
								animation: 250,
								// После перетаскивания аудиозаписи
								onEnd: function (e) {
									if (app.options.reorder) {
										var $item = e.item;
										var $prev = $($item).prev();
										var $next = $($item).next();
										var that = {
											id: $($item).data('id'),
											prev: {
												index: $($prev).index(),
												id: $($prev).data('id'),
											},
											next: {
												index: $($next).index(),
												id: $($next).data('id'),
											}
										};

										// Начало плейлиста
										if (that.prev.index < 0 && that.next.index >= 0) {
											self.audio.reorder(app.tmp.session.mid, that.id, that.next.id, '');
										}
										// Середина плейлиста
										else if (that.prev.index >= 0 && that.next.index >= 0) {
											self.audio.reorder(app.tmp.session.mid, that.id, '', that.prev.id);
										}
										// Конец плейлиста
										else if (that.prev.index > 0 && that.next.index < 0) {
											self.audio.reorder(app.tmp.session.mid, that.id, '', that.prev.id);
										}

										self.animation.playlist.moved($item);
									}
								},
							});
						});
					} catch (e) {
						throw new Error('sortable: ошибка при drag-n-drop-е аудиозаписи');
					}
				}
				// Получение аудиозаписей пользователя
				$($els.controls.load.user).on('click', function () {
					self.audio.get(app.tmp.session.mid, 0);
				});
				// Получение популярных аудиозаписей
				$($els.controls.load.popular).on('click', function () {
					self.audio.getPopular(0, 0);
				});
				// Получение аудиозаписей рекомендуемых пользователю
				$($els.controls.load.recommendations).on('click', function () {
					self.audio.getRecommendations(0);
				});
				// Рандомная сортировка
				$($els.controls.playlist.sort.shuffle).on('click', function () {
					self.playlist.sort.shuffle();
				});
				// Сортировка по алфавиту (>, <)
				$($els.controls.playlist.sort.alphabetically).clickToggle(function () {
					self.playlist.sort.alphabetically('<');
				}, function () {
					self.playlist.sort.alphabetically('>');
				});
				// Поисковая форма
				$els.controls.search.form.addEventListener('submit', function (e) {
					var q = $els.controls.search.query.value.trim();

					$els.controls.search.query.value = q;
					self.audio.search(q, 0);

					e.preventDefault();
				});
				// Аудиозаписи в плейлисте (воспроизведение, пауза)
				$($els.playlist.items).on('click', 'a', function (e) {
					try {
						if (e.target === this) {
							// Воспроизведение
							if (app.mode.listen) {
								var id = Number(this.dataset.id);

								(app.tmp.player.id === id) ? (app.tmp.player.status === 'play' || app.tmp.player.status === 'playing') ? self.player.controls.pause(): self.player.controls.play(): self.player.play($(this));

								// Загрузка
							} else if (app.mode.download) {
								(!this.checkClass('dl-active')) ? this.classList.add('dl-active'): this.classList.remove('dl-active');
							}
						}
					} catch (e) {
						throw new Error('playlist.ready: ошибка при клике на аудиозапись');
					}
				});
				// Если используется компьютер
				if (app.device.desktop) {
					// Генерирование .m3u из текущего плейлиста
					$($els.controls.playlist.generate.m3u).on('click', function () {
						self.playlist.generate.m3u();
					});
					// Включение или отключения режима загрузки
					$els.controls.playlist.download.mode.addEventListener('click', function (e) {
						try {
							var $items = $($els.playlist.body.childNodes);

							// Если включен режим прослушивания
							if (app.mode.listen) {
								self.app.mode('download');
								this.classList.add('active');
								$els.controls.playlist.download.all.classList.add('active');
							}
							// Если включен режим загрузки
							else if (app.mode.download) {
								// Если были найдены помеченные для загрузки аудиозаписи
								if ($items.hasClass('dl-active')) {
									var $items = $els.playlist.body.getElementsByClassName('dl-active');

									// Перейти к загрузке
									self.playlist.download($items);
								} else {
									self.app.mode('listen');
									this.classList.remove('active');
									$els.controls.playlist.download.all.classList.remove('active');
								}
							}
						} catch (e) {
							throw new Error('playlist.ready: ошибка при клике на режим загрузки');
						}
					});
					// Выделение всех аудиозаписей в плейлисте, для загрузки
					$($els.controls.playlist.download.all).clickToggle(function () {
						for (var i = 0; i < $els.playlist.body.children.length; i++) {
							$els.playlist.body.children[i].classList.add('dl-active');
						}
					}, function () {
						for (var i = 0; i < $els.playlist.body.children.length; i++) {
							$els.playlist.body.children[i].classList.remove('dl-active');
						}
					});
					// Показать битрейт аудиозаписи
					$($els.playlist.items).on({
						mouseenter: function () {
							var bitrate = this.getElementsByClassName('bitrate')[0].dataset.bitrate;

							(bitrate !== 'checked') ? self.playlist.bitrate($(this)): void 0;
						},
						click: function () {
							var bitrate = this.getElementsByClassName('bitrate')[0].dataset.bitrate;

							(bitrate !== 'checked') ? self.playlist.bitrate($(this)): void 0;
						}
					}, 'a');
					// Добавить аудиозапись
					$($els.playlist.items, 'a > div.actions').on('click', 'span.add', function (e) {
						if (e.target === this) {
							(!this.checkClass('done')) ? self.audio.add($(this)): self.audio.delete($(this));
						}
					});
					// Удалить аудиозапись
					$($els.playlist.items, 'a > div.actions').on('click', 'span.delete', function (e) {
						if (e.target === this) {
							(!this.checkClass('done')) ? self.audio.delete($(this)): self.audio.restore($(this));
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
				try {
					var genres = self.genres.get();
					var ul = document.createDocumentFragment();

					// Создание элементов
					for (var i = 0; i < genres.length; i++) {
						var item = genres[i];
						var li = document.createElement('li');
						var a = document.createElement('a');

						a.setAttribute('data-id', item.id);
						a.innerHTML = item.title;
						li.appendChild(a);
						ul.appendChild(li);
					}

					// Встраивание элементов в DOM
					$els.controls.search.genres.items.appendChild(ul);

					// Получение аудиозаписей выбранного жанра
					$els.controls.search.genres.items.addEventListener('click', function (e) {
						var that = e.target;

						if (that.nodeName === 'A') {
							self.audio.getPopular(that.dataset.id, 0);
						}
					});
				} catch (e) {
					throw new Error('genres.ready: ошибка вывода жанров');
				}
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
						owner_id: app.tmp.session.mid,
						count: 6000,
						v: app.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);
						app.tmp.player.playlist = r.response.items;

						// Если нужна загрузка плейлиста пользователя
						(get) ? self.audio.get(app.tmp.session.mid, 0): void 0;
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
				// поэтому запрос блокируется с помощью app.options.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && app.options.offset) {
					self.app.load(true);
					try {
						VK.Api.call(request, {
							owner_id: owner_id,
							count: app.config.audio.count,
							offset: offset,
							v: app.config.api
						}, function (r) {
							self.app.load(false);
							self.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увеличения offset-a
								app.tmp.req = {
									name: request,
									owner_id: owner_id,
									offset: offset
								};

								// Включение запроса 'reorder' при drag-n-drop
								(owner_id === app.tmp.session.mid) ? self.app.reorder(true): self.app.reorder(false);

								// Если нужна подгрузка аудиозаписей
								r.response.offset = (offset > 0) ? offset : 0;

								// Если в ответе присутствуют аудиозаписи
								if (r.response.items.length > 0) {
									app.options.offset = true;
									self.playlist.add(r.response);
								} else {
									app.options.offset = false;
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
				// поэтому запрос блокируется с помощью app.options.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && app.options.offset) {
					self.app.load(true);
					try {
						VK.Api.call(request, {
							genre_id: genre_id,
							count: app.config.audio.count,
							offset: offset,
							v: app.config.api
						}, function (r) {
							self.app.load(false);
							self.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увеличения offset-a
								app.tmp.req = {
									name: request,
									genre_id: genre_id,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								self.app.reorder(false);

								// Если нужна подгрузка аудиозаписей
								r.response.offset = (offset > 0) ? offset : 0;

								// Если в ответе присутствуют аудиозаписи
								if (r.response.length > 0) {
									app.options.offset = true;
									self.playlist.add(r.response);
								} else {
									app.options.offset = false;
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
				// поэтому запрос блокируется с помощью app.options.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && app.options.offset) {
					self.app.load(true);
					try {
						VK.Api.call(request, {
							count: app.config.audio.count,
							offset: offset,
							v: app.config.api
						}, function (r) {
							self.app.load(false);
							self.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увеличения offset-a
								app.tmp.req = {
									name: request,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								self.app.reorder(false);

								// Если нужна подгрузка аудиозаписей
								r.response.offset = (offset > 0) ? offset : 0;

								// Если в ответе присутствуют аудиозаписи
								if (r.response.length > 0) {
									app.options.offset = true;
									self.playlist.add(r.response);
								} else {
									app.options.offset = false;
								}

								console.log(request + '(' + offset + ')' + ': получено аудиозаписей = ' + r.response.length);
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
				// поэтому запрос блокируется с помощью app.options.offset
				// если это не подгрузка, а начальная загрузка плейлиста с offset = 0, то запрос уходит
				if (offset === 0 || offset > 0 && app.options.offset) {
					self.app.load(true);
					try {
						VK.Api.call(request, {
							q: q,
							auto_complete: 1,
							count: app.config.audio.count,
							offset: offset,
							v: app.config.api
						}, function (r) {
							self.app.load(false);
							self.verify(request, r);

							if (r.response) {
								// Запись запроса, для возможности увеличения offset-a
								app.tmp.req = {
									name: request,
									q: q,
									offset: offset
								};

								// Отключение запроса 'reorder' при drag-n-drop
								self.app.reorder(false);

								// Если нужна подгрузка аудиозаписей
								r.response.offset = (offset > 0) ? offset : 0;

								// Если в ответе присутствуют аудиозаписи
								if (r.response.items.length > 0) {
									app.options.offset = true;
									self.playlist.add(r.response);
								} else {
									app.options.offset = false;
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
						v: app.config.api
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
						v: app.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);

						if (r.response && app.tmp.player.broadcast) {
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
				var owner_id = app.tmp.session.playlist[audio_id].owner_id;

				self.app.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: app.config.api
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
				var owner_id = app.tmp.session.mid;
				var audio_id = $that.parent().parent().data('id');
				var created_id = $that.parent().parent().attr('data-created');

				// Если аудиозапись была добавлена и существует атрибут нового id
				audio_id = (created_id) ? created_id : audio_id;

				self.app.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: app.config.api
					}, function (r) {
						self.app.load(false);
						self.verify(request, r);

						if (r.response === 1) {
							notify().success('Аудиозапись удалена', 1000);

							// Если аудиозапись была добавлена и существует атрибут нового id
							if (created_id) {
								$that[0].setAttribute('data-content', 'Добавить');
								$that[0].classList.remove('done');
								$that[0].parentElement.parentElement.removeAttribute('data-created');
							} else {
								$that[0].setAttribute('data-content', 'Удалено');
								$that[0].classList.add('done');
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
				var owner_id = app.tmp.session.mid;
				var audio_id = $that.parent().parent().data('id');

				self.app.load(true);
				try {
					VK.Api.call(request, {
						owner_id: owner_id,
						audio_id: audio_id,
						v: app.config.api
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
						$($els.authorized.false).fadeIn(250);
						$els.vk.auth.style.display = 'none';

						notify().success('Вы успешно вошли', 2000);
					} else {
						self.app.refresh();
						$($els.authorized.true).hide();
						$els.vk.auth.style.display = 'block';

						notify().error('Вы не авторизованы', 2000);
					}
				} catch (e) {
					throw new Error('app.auth: ошибка при авторизации или деавторизации');
				}
			},
			// Загрузка
			load: function (status) {
				if (status) {
					app.config.load = true;
					$els.load.style.display = 'block';
				} else {
					app.config.load = false;
					$els.load.style.display = 'none';
				}
			},
			// Режим
			mode: function (mode) {
				switch (mode) {
				case 'listen':
					app.mode.listen = true;
					app.mode.download = false;

					notify().success('Включен режим прослушивания', 1000);
					break;
				case 'download':
					app.mode.download = true;
					app.mode.listen = false;

					notify().success('Включен режим загрузки', 1000);
					break;
				}
			},
			// Drag-n-drop
			reorder: function (status) {
				app.options.reorder = (status) ? true : false;
			},
			// Заголовок страницы
			title: function (title) {
				document.title = title;
			},
			// Очистка временных данных
			refresh: function () {
				app.tmp.session = {
					playlist: [],
				};
				app.tmp.player = {};
				app.tmp.req = {};
			},
			// Определение устройства
			device: function () {
				var userAgent = (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));

				app.device.portable = (userAgent) ? true : false;
				app.device.desktop = (!userAgent) ? true : false;
			}
		},
		// Обработка ошибок сервера
		verify: function (request, r) {
			if (r.error) {
				switch (r.error.error_code) {
				case 14:
					self.captcha.show(r.error);
					break;
				case 6:
					notify().error('Слишком много запросов в секунду', 2000);
					break;
				default:
					notify().error(r.error.error_msg, 2000);
					throw new Error(request + ': ' + r.error.error_msg);
					break;
				}
			}
		},
		// Обработка капчи
		captcha: {
			show: function (captcha) {
				$els.captcha.img.src = captcha.captcha_img;
				$els.captcha.sid.value = captcha.captcha_sid;
				$els.captcha.key.value = '';
				$($els.captcha.container).modal('show');
			},
			ready: function () {
				try {
					$els.captcha.form.addEventListener('submit', function (e) {
						var captcha_key = $els.captcha.key.value.trim();
						var captcha_sid = $els.captcha.sid.value;

						if (captcha_sid.length > 0 && captcha_key.length > 0) {
							VK.Api.call('audio.get', {
								count: 1,
								captcha_sid: captcha_sid,
								captcha_key: captcha_key,
								v: app.config.api
							}, function (r) {
								if (r.response) {
									$($els.captcha.container).modal('hide');

									notify().success('Капча успешно отправлена', 2000);
								} else {
									notify().error('Капча введена неверно', 2000);
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
						self.animation.custom($els.player.controls.title, 'an-plr-prev', 250);
					},
					next: function () {
						self.animation.custom($els.player.controls.title, 'an-plr-next', 250);
					},
					play: function () {
						self.animation.custom($els.player.controls.title, 'an-plr-next', 250);
					},
					pause: function () {
						self.animation.custom($els.player.controls.title, 'an-plr-prev', 250);
					},
				}
			},
			playlist: {
				moved: function (item) {
					(item.checkClass('active')) ? self.animation.custom(item, 'an-pl-moved--active', 1000): self.animation.custom(item, 'an-pl-moved', 1000);
				},
			},
			custom: function (el, animation, time) {
				el.classList.add(animation);

				setTimeout(function () {
					el.classList.remove(animation);
				}, time);
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
			if (app.device.desktop) {
				$(document.getElementsByClassName('cls')).find('[data-toggle="popover"]').popover({
					trigger: 'hover',
					placement: 'bottom'
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
			if ($(window).scrollTop() + $(window).height() >= $(document).height() - 200 && !app.config.load) {
				slothMusic.playlist.more();
			}
		} catch (e) {
			throw new Error('window.scroll: ошибка при скролле');
		}
	});
});
