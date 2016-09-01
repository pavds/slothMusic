export default class Utils {
	// get URL params
	getQueryString(field, url) {
		let
			href = url ? url : window.location.href,
			reg = new RegExp('[#&]' + field + '=([^&]*)', 'i'),
			string = reg.exec(href);
		return string ? string[1] : null;
	}
}
