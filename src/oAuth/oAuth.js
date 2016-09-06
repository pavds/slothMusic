import Config from '../Config/Config';
import Utils from '../Utils/Utils';
import SpotifyAPI from 'spotify-web-api-js';

const
	spotifyAPI = new SpotifyAPI(),
	utils = new Utils();

export default class oAuth {
	getAccessToken(service) {
		let
			params = Config[service],
			uri = params.uri,
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
						.then(() => resolve(true), () => reject(false));
					break;
				case 'vk':
					VK.init({apiId: Config.vk.client_id});
					VK.Auth.getLoginStatus((response) => resolve((response.session) ? true : false), () => reject(false));
					break;
				default:
					reject(false);
					break;
			}
		});
	}
}
