const config = {
	spotify: {
		timeout: 2000,
		album: 'Slothefy',
		client_id: '1ab27fed8b504b88b85b25659632e515',
		redirect_uri: 'http://127.0.0.1:8888',
		scope: 'playlist-read-private user-read-email user-library-read user-read-private user-read-email user-read-email user-read-birthdate user-follow-read user-top-read'
	},
	vk: {
		timeout: 1000,
		album: 'Slothefy',
		client_id: '5613624',
		redirect_uri: 'http://127.0.0.1:8888',
		scope: 'audio,status',
		display: 'page',
		v: '5.53'
	}
};

config.spotify.uri = `https://accounts.spotify.com/authorize/?client_id=${config.spotify.client_id}&response_type=token&redirect_uri=${config.spotify.redirect_uri}&scope=${config.spotify.scope}`;
config.vk.uri = `https://oauth.vk.com/authorize?client_id=${config.vk.client_id}&response_type=token&redirect_uri=${config.vk.redirect_uri}&display=${config.vk.display}&scope=${config.vk.scope}&v=${config.vk.v}`;

export default config;
