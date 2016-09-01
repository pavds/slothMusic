import Utils from '../Utils/Utils';
import SpotifyAPI from 'spotify-web-api-js';

const spotifyAPI = new SpotifyAPI();
const utils = new Utils();

const
	auth = {
		spotify: {
			client_id: '1ab27fed8b504b88b85b25659632e515',
			redirect_uri: 'http://127.0.0.1:8888',
			scope: 'playlist-read-private user-read-email user-library-read user-read-private user-read-email user-read-email user-read-birthdate user-follow-read user-top-read'
		},
		vk: {
			client_id: '5083406',
			redirect_uri: 'http://127.0.0.1:8888',
			scope: 'audio,status',
			display: 'page',
			v: '5.53'
		}
	},
	auth_uri = {
		spotify: `https://accounts.spotify.com/authorize/?client_id=${auth.spotify.client_id}&response_type=token&redirect_uri=${auth.spotify.redirect_uri}&scope=${auth.spotify.scope}`,
		vk: `https://oauth.vk.com/authorize?client_id=${auth.vk.client_id}&response_type=token&redirect_uri=${auth.vk.redirect_uri}&display=${auth.vk.display}&scope=${auth.vk.scope}&v=${auth.vk.v}`
	};

export default class oAuth {
	getAccessToken(service) {
		let
			params = auth[service],
			uri = auth_uri[service],
			queryToken = utils.getQueryString('access_token');

		if (queryToken === null) {
			window.location.href = uri;
		} else {
			localStorage.setItem(`${service}_token`, queryToken);
			return window.location.href = params.redirect_uri;
		}
	}

	clearToken(service) {
		if (localStorage.getItem(`${service}_token`) !== null) {
			localStorage.removeItem(`${service}_token`);
			return window.location.href = '/';
		}
		return false;
	}

	checkExpireToken(service) {
		return new Promise((resolve, reject) => {
			switch (service) {
				case 'spotify':
					spotifyAPI.setAccessToken(localStorage.getItem(`spotify_token`));
					spotifyAPI.getMe()
						.then((response) => resolve(true), (error) => reject(false));
					break;
				case 'vk':
					VK.init({apiId: auth.vk.client_id});
					VK.Auth.getLoginStatus((response) => resolve((response.session) ? true : false), (error) => reject(false));
					break;
				default:
					callback(false);
					break;
			}
		});
	}
}
