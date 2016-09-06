import React from 'react';
import Config from '../Config/Config';
import Service from '../Service';
import Button from '../Button';
import SpotifyAPI from 'spotify-web-api-js';
import SpotifyUser from '../Spotify/User';
import oAuth from '../oAuth/oAuth';
import Captcha from '../Captcha';

const
	spotifyAPI = new SpotifyAPI(),
	spotifyUser = new SpotifyUser({access_token: localStorage.getItem('spotify_token')}),
	oauth = new oAuth();

export default class User extends React.Component {
	static propTypes = {
		access_token: React.PropTypes.string.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			user: {},
			total: 0,
			import: [],
			albumId: null,
			busy: false,
			captcha: {
				sid: null,
				img: null
			}
		};

		this.getUserInfo = this.getUserInfo.bind(this);
		this.getCount = this.getCount.bind(this);
		this.getAllTracks = this.getAllTracks.bind(this);
		this.searchTracks = this.searchTracks.bind(this);
		this.searchTrack = this.searchTrack.bind(this);
		this.handleSync = this.handleSync.bind(this);
		this.handleRefresh = this.handleRefresh.bind(this);
	}

	getUserInfo() {
		return new Promise((resolve, reject) =>
			VK.Api.call('users.get', {
				v: Config.vk.v
			}, (response) => resolve(response.response[0]))
		);
	}

	getCount() {
		return new Promise((resolve, reject) =>
			VK.Api.call('audio.getCount', {
				owner_id: this.state.user.id,
				v: Config.vk.v
			}, (response) => resolve(response.response))
		);
	}

	getAllTracks() {
		return new Promise((resolve, reject) =>
			VK.Api.call('audio.get', {
				owner_id: this.state.user.id,
				count: 6000,
				v: Config.vk.v
			}, (response) => resolve(response.response))
		);
	}

	searchTracks(trackNames) {
		let tracks = [];

		return new Promise((resolve, reject) =>
			trackNames.map((trackName, i) => {
				this.searchTrack(trackName, i * Config.vk.timeout)
					.then((response) => {
						if (response.count && response.count > 0) {
							let items = response.items;

							if (items.length > 0) {
								console.log(`VK: "${trackName}" push in array.`);
								tracks.push(items[0]);
							} else {
								console.warn(`VK: "${trackName}" not found.`);
							}

							console.log(`current.i = ${i}, length = ${trackNames.length}`);

							if (i === trackNames.length - 1) {
								resolve(tracks);
							}
						}
					});
			})
		);
	}

	searchTrack(q, timeout) {
		let delay = () => new Promise((resolve, reject) => setTimeout(() => resolve(), timeout));

		return new Promise((resolve, reject) => {
			delay()
				.then(() => {
					VK.Api.call('audio.search', {
						q: q,
						count: 3,
						sort: 0,
						v: Config.vk.v
					}, (response) => (response.error) ? reject(response.error) : resolve(response.response))
				});
		});
	}

	addAlbum(title = Config.vk.album) {
		return new Promise((resolve, reject) =>
			VK.Api.call('audio.addAlbum', {
				title: title,
				v: Config.vk.v
			}, (response) => (response.error) ? reject(response.error) : resolve(response.response))
		);
	}

	addTrack(audio_id, owner_id) {
		return new Promise((resolve, reject) =>
			VK.Api.call('audio.add', {
				audio_id: audio_id,
				owner_id: owner_id,
				v: Config.vk.v
			}, (response) => (response.error) ? reject(response.error) : resolve(response.response))
		);
	}

	getAlbums() {
		return new Promise((resolve, reject) =>
			VK.Api.call('audio.getAlbums', {
				v: Config.vk.v
			}, (response) => (response.error) ? reject(response.error) : resolve(response.response))
		);
	}

	handleSync(e) {
		let button = e.target;

		if (this.state.busy) {
			if (!button.disabled) {
				button.disabled = true;
			}
		} else {
			this.setState({busy: true});
			button.disabled = true;

			console.info('Spotify: get all tracks...');

			spotifyUser.getAllUserTracks()
				.then((tracks) => {
					this.setState({import: tracks, busy: false});
					button.disabled = false;

					console.info(`Received: ${tracks.length} tracks.`);

					let trackNames = tracks.map((item) => `${item.track.artists[0].name} ${item.track.name}`);

					console.info('VK: Check token...');
					oauth.checkExpireToken('vk')
						.then((authorized) => {
								console.info('VK: token is not expired.');
								console.info('VK: search tracks...');

								this.searchTracks(trackNames)
									.then((tracksFound) => console.log(tracksFound));
							},
							(error) => {
								console.warn('VK: token is expired!');
							})
				});

			// TODO: moved to other method
			// let
			// 	tracks = this.state.tracks.items,
			// 	trackNames = tracks.map((item) => `${item.track.artists[0].name} ${item.track.name}`);
			// TODO: test this string
			// trackNames = tracks.map((item) => {
			// 	let artists = item.track.artists[0].name; // first artist
			// 	// let artists = item.track.artists.map((artist) => artist.name).join(' '); // all artists
			// 	return `${artists} ${item.track.name}`;
			// });

			// console.info('Check VK token...');
			// oauth.checkExpireToken('vk')
			// 	.then((authorized) => {
			// 			console.info('The VK token is not expired.');
			// 			console.info('Search tracks in VK...');
			//
			// 			this.searchTracks(trackNames);
			// 		},
			// 		(error) => {
			// 			console.warn('The VK token is expired!');
			// 		})
		}
	}

	handleRefresh(e) {
		let button = e.target;

		if (this.state.busy) {
			if (!button.disabled) {
				button.disabled = true;
			}
		} else {
			this.setState({busy: true});
			button.disabled = true;

			console.info('VK: refresh data...');

			this.getUserInfo()
				.then((user) => {
					console.info('VK: updated user info.');
					this.setState({user: user, busy: true});

					this.getCount()
						.then((response) => {
							console.info('VK: updated total count.');
							this.setState({total: response});

							this.getAlbums()
								.then((response) => {
									let albums = response.items;
									// let albumId;
                  //
									// response.items.forEach(album => {
									// 	console.log(album.title === Config.vk.album);
									// 	return (album.title === Config.vk.album) ? album.id : false;
									// });

									//console.log( Object.keys(albums).some(album => (albums[album].title === Config.vk.album) ? albums[album].id : false) );

									// console.log(response);
									// console.log( response.items.some(album => album.title == Config.vk.album) );
									// console.log(  );
									// let albumId = response.items.map((album) => (album.title === Config.vk.album) ? album.id : void 0);

									// if (albumId === null) {
									// 	this.addAlbum()
									// 		.then((response) => {
									// 			console.info(`VK: added "${Config.vk.album}" album.`);
									// 			this.setState({albumId: response.album_id});
									// 			console.log(this.state.albumId);
									// 		});
									// } else {
									// 	console.info(`VK: "${Config.vk.album}" album alredy exist.`);
									// 	this.setState({albumId: albumId});
									// }

									button.disabled = false;
									this.setState({busy: false});
								});
						});
				});
		}
	}

	componentWillMount() {
		// get user info
		this.getUserInfo()
			.then((user) => {
				this.setState({user: user});

				// get all tracks
				// this.getAllTracks()
				// 	.then((tracks) => this.setState({tracks: {total: tracks.count, items: tracks.items}}));

				this.getCount()
					.then((response) => this.setState({total: response}));

				// add album
				this.getAlbums()
					.then((response) => {
						let albumNames = response.items.map((album) => album.title);

						if (albumNames.indexOf(Config.vk.album) < 0) {
							this.addAlbum()
								.then((response) => console.log(response));
						}
					});
			});
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.user !== nextState.user || this.state.total !== nextState.total;
	}

	render() {
		const
			user = this.state.user || {},
			total = this.state.total || 0;

		if (Object.keys(user).length > 0 && total > 0) {
			user.first_name = (user.first_name === 'Spencer') ? 'Dmitry' : user.first_name;
			user.last_name = (user.last_name === 'Treat-Clark') ? 'Pavlov' : user.last_name;

			return (
				<Service service={{name: 'vk', user: `${user.first_name} ${user.last_name}`, totalTracks: total}}>
					<Button action="refresh" onClick={this.handleRefresh}>Refresh</Button>
					<Button action="sync" onClick={this.handleSync}>Spotify</Button>
					<Captcha data={{img: 'https://api.vk.com/captcha.php?sid=177319126058&s=1'}}/>
				</Service>
			)
		} else {
			return false;
		}
	}
}
