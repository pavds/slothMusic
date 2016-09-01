import React from 'react';

export default class Service extends React.Component {
	static propTypes = {
		service: React.PropTypes.shape({
			name: React.PropTypes.string.isRequired,
			user: React.PropTypes.string.isRequired,
			totalTracks: React.PropTypes.number.isRequired
		})
	};

	constructor(props) {
		super(props);
	}

	componentDidMount() {
		console.info(`${this.props.service.name} is loaded.`);
	}

	render() {
		const service = this.props.service;

		return (
			<div className={`service service--${service.name}`}>
				<div className="service__inner">
					<div className={`service__logo service__logo--${service.name}`}></div>
					<div className="service__user">{service.user}</div>
					<div className="service__info">Total tracks: {service.totalTracks}</div>
				</div>
			</div>
		)
	}

}
