import React from 'react';
import Service from '../Service';

export default class User extends React.Component {
	static propTypes = {
		access_token: React.PropTypes.string.isRequired
	};

	constructor(props) {
		super(props);

		this.state = {
			user: {},
			tracks: {
				total: 0,
				items: []
			}
		};

		this.getUserInfo = this.getUserInfo.bind(this);
		this.getCountAudio = this.getCountAudio.bind(this);
		this.getAllTracks = this.getAllTracks.bind(this);
	}

	getUserInfo() {
		return new Promise((resolve, reject) =>
			VK.Api.call('users.get', {}, (response) => resolve(response.response[0]))
		);
	}

	getCountAudio() {
		return new Promise((resolve, reject) =>
			VK.Api.call('audio.getCount', {owner_id: this.state.user.uid}, (response) => resolve(response.response))
		);
	}

	getAllTracks() {
		return new Promise((resolve, reject) =>
			VK.Api.call('audio.get', {
				owner_id: this.state.user.uid,
				count: 6000
			}, (response) => resolve(response.response))
		);
	}

	componentWillMount() {
		// get user info
		this.getUserInfo()
			.then((user) => {
				this.setState({user: user});

				// get total audio count
				this.getCountAudio()
					.then((total) => this.setState({tracks: {total: total, items: []}}));

				// get all tracks
				this.getAllTracks()
					.then((tracks) => this.setState({tracks: {total: this.state.tracks.total, items: tracks}}));
			});
	}

	shouldComponentUpdate(nextProps, nextState) {
		return this.state.user !== nextState.user || this.state.tracks !== nextState.tracks;
	}

	render() {
		const
			user = this.state.user,
			tracks = this.state.tracks,
			isLoadUser = Object.keys(user).length > 0,
			isLoadTracks = tracks.total > 0 && Object.keys(tracks.items).length > 0;

		if (isLoadUser && isLoadTracks) {
			user.first_name = (user.first_name === 'Spencer') ? 'Dmitry' : user.first_name;
			user.last_name = (user.last_name === 'Treat-Clark') ? 'Pavlov' : user.last_name;

			return (
				<Service service={{name: 'vk', user: `${user.first_name} ${user.last_name}`, totalTracks: tracks.total}}/>
			)
		} else {
			return false;
		}
	}
}
