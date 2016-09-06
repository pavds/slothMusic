import React from 'react';
import Spotify from './Spotify/User';
import VK from './VK/User';
import styles from './assets/scss/App.scss';

export default class App extends React.Component {
	static propTypes = {
		tokens: React.PropTypes.shape({
			spotify: React.PropTypes.string.isRequired,
			vk: React.PropTypes.string.isRequired
		})
	};

	constructor(props) {
		super(props);

		this.state = {
			tokens: {
				spotify: this.props.tokens.spotify,
				vk: this.props.tokens.vk
			}
		};
	}

	render() {
		return (
			<div className="app">

				{/*TODO: add more services*/}

				{/*<header className="header">*/}
					{/*<img className="header__logo" src="http://image.flaticon.com/icons/svg/185/185732.svg"/>*/}
					{/*<h1 className="header__title">Slothefy</h1>*/}
				{/*</header>*/}

				<h1 className="title">Services</h1>
				<div className="services">
					<Spotify access_token={this.state.tokens.spotify}/>
					<VK access_token={this.state.tokens.vk}/>
				</div>
			</div>
		)
	}
}
