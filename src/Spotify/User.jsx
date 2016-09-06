import React from 'react';
import Config from '../Config/Config';
import Service from '../Service';
import Button from '../Button';
import SpotifyAPI from 'spotify-web-api-js';
import oAuth from '../oAuth/oAuth';

const
	spotifyAPI = new SpotifyAPI(),
	oauth = new oAuth();

export default class User extends React.Component {
	static propTypes = {
		access_token: React.PropTypes.string.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			access_token: this.props.access_token,
			user: {},
			total: 0,

			busy: false
		};

		spotifyAPI.setAccessToken(this.state.access_token);

		this.getUserInfo = this.getUserInfo.bind(this);
		this.getUserTracks = this.getUserTracks.bind(this);
		this.getAllUserTracks = this.getAllUserTracks.bind(this);
	}

	// get user info
	getUserInfo() {
		return new Promise((resolve, reject) =>
			spotifyAPI.getMe()
				.then((response) => resolve(response))
		);
	}

	getAllUserTracks(limit = 50) {
		return new Promise((resolve, reject) => {
			let
				tracks = [],
				getTracks = (limit = 50, offset = 0) => {
				this.getUserTracks(limit, offset, Config.spotify.timeout)
					.then((response) => {
						response.items.map((track) => tracks.push(track));

						if (response.next !== null) {
							getTracks(limit, offset + limit);
						} else {
							resolve(tracks);
						}
					});
			};
			getTracks();
		});

		// TODO: Remove this
		// this.getUserTracks(limit, offset, Config.spotify.timeout)
		// 	.then((response) => {
		// 		total = response.total;
		// 		offset += limit;
		// 		reqsLength = ~~(total / limit);
		//
		// 		this.setState({tracks: response.items});
		//
		// 		log(response.items.length);
		//
		// 		if (total > limit) {
		// 			for (let reqId = 1; reqId <= reqsLength; reqId++) {
		// 				this.getUserTracks(limit, offset, reqId * Config.spotify.timeout)
		// 					.then((response) => {
		// 						response.items.map((item) => this.state.tracks.push(item));
		//
		// 						log(response.items.length);
		// 					});
		// 				offset += limit;
		// 			}
		// 		}
		// 	});
	}

	// get user tracks
	getUserTracks(limit = 50, offset = 0, timeout = Config.spotify.timeout) {
		let delay = () => new Promise((resolve, reject) => setTimeout(() => resolve(), timeout));

		return new Promise((resolve, reject) => {
			delay()
				.then(() => {
					spotifyAPI.getMySavedTracks({
						limit: limit,
						offset: offset
					})
						.then((response) => resolve(response));
				});
		});
	}

	componentWillMount() {
		this.getUserInfo()
			.then((response) => this.setState({user: response}));

		this.getUserTracks(1, 0, 0)
			.then((response) => this.setState({total: response.total}));

		// this.getAllUserTracks(50)
		// 	.then((tracks) => {
    //
		// 		// console.log(tracks);
		// 		this.setState({ready: true});
		// 	})
		// // .then((response) => console.log(response));
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.user !== nextState.user || this.state.total !== nextState.total;
	}

	render() {
		const
			user = this.state.user || {},
			total = this.state.total || 0;

		if (Object.keys(user).length > 0 && total > 0) {
			return (
				<Service service={{name: 'spotify', user: user.id, totalTracks: total}}>
					<Button action="refresh">Refresh</Button>
					<Button action="sync">VK</Button>
				</Service>
			)
		} else {
			return false;
		}
	}
}
