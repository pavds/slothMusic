import React from 'react';
import {render} from 'react-dom';
import Utils from './Utils/Utils';
import oAuth from './oAuth/oAuth';
import App from './App';

function renderApp() {
	const
		oauth = new oAuth(),
		utils = new Utils();

	let
		tokens = {
			spotify: localStorage.getItem('spotify_token') || null,
			vk: localStorage.getItem('vk_token') || null
		},
		queryToken = utils.getQueryString('access_token');

	if (!tokens.spotify) {
		console.warn('Get Spotify token...');
		oauth.getAccessToken('spotify');
	}
	else if (!tokens.vk && tokens.spotify && queryToken !== tokens.spotify) {
		console.warn('Get VK token...');
		oauth.getAccessToken('vk');
	}
	else if (tokens.spotify && tokens.vk) {
		console.info('Check tokens...');

		const authorized = new Promise((resolve, reject) => {
			let access = {
				spotify: false,
				vk: false,
				check: () => (access.spotify && access.vk) ? resolve(true) : false
			};

			oauth.checkExpireToken('spotify')
				.then((authorized) => {
						console.info('The Spotify token is not expired.');
						access.spotify = true;
						access.check();
					},
					(error) => {
						console.warn('The Spotify token is expired! Remove token and refreshing...');
						oauth.clearToken('spotify');
						// reject();
					})

			oauth.checkExpireToken('vk')
				.then((authorized) => {
						console.info('The VK token is not expired.');
						access.vk = true;
						access.check();
					},
					(error) => {
						console.warn('The VK token is expired! Remove token and refreshing...');
						oauth.clearToken('vk');
						// reject();
					})
		});

		authorized
			.then(() => {
					console.info('Auth successful.');
					render(<App tokens={tokens}/>, document.getElementById('app'));
				},
				() => {
					console.error(`Auth failure!`);
				})
	}
}

renderApp();
