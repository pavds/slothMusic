import React from 'react';
import Service from '../Service';
import SpotifyAPI from 'spotify-web-api-js';

const spotifyAPI = new SpotifyAPI();

export default class User extends React.Component {
	static propTypes = {
		access_token: React.PropTypes.string.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			access_token: this.props.access_token,
			user: null,
			tracks: null
		};

		spotifyAPI.setAccessToken(this.state.access_token);

		this.getUserInfo = this.getUserInfo.bind(this);
		this.getUserTracks = this.getUserTracks.bind(this);
	}

	// get user info
	getUserInfo() {
		spotifyAPI.getMe()
			.then((response) => this.setState({user: response}));
	}

	// get user tracks
	getUserTracks(limit, offset) {
		limit = limit || 50;
		offset = offset || 0;

		spotifyAPI.getMySavedTracks({
			limit: limit,
			offset: offset
		})
			.then((response) => this.setState({tracks: response}));
	}

	componentWillMount() {
		this.getUserInfo();
		this.getUserTracks();
	}

	render() {
		const
			user = this.state.user || null,
			tracks = this.state.tracks || null;

		if (user !== null && tracks !== null) {
			return (
				<Service service={{name: 'spotify', user: user.id, totalTracks: tracks.total}}/>
			)
		} else {
			return false;
		}
	}
}
