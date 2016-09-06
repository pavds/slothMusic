import React from 'react';

export default class Captcha extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		const data = this.props.data;

		return (
			<div className="captcha">
				<div className="captcha__box">
					<img src={data.img} className="captcha__img"/>
					<div className="captcha__fields">
						<input type="text" name="captcha_key" className="captcha__field" placeholder="Введите код"/>
						<input type="hidden" name="captcha_sid" value={data.sid} className="captcha__field captcha__field--hidden"/>
					</div>
				</div>
			</div>
		)
	}
}
