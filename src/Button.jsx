import React from 'react';

export default class Button extends React.Component {
	constructor(props) {
		super(props);

		this.handleRippleEffect = this.handleRippleEffect.bind(this);
	}

	handleRippleEffect(e) {
		let
			target = e.target,
			rect = target.getBoundingClientRect(),
			ripple = target.querySelector('.ripple');

		if (ripple !== null) {
			ripple.parentNode.removeChild(ripple);
		}

		ripple = document.createElement('span');
		ripple.className = 'ripple';
		ripple.style.height = ripple.style.width = `${Math.max(rect.width, rect.height)}px`;
		target.appendChild(ripple);
		ripple.style.top = `${e.pageY - rect.top - ripple.offsetHeight / 2 - document.body.scrollTop}px`;
		ripple.style.left = `${e.pageX - rect.left - ripple.offsetWidth / 2 - document.body.scrollLeft}px`;

		return false;
	}

	render() {
		const
			action = this.props.action;

		return (
			<button className={`btn ${(action !== null) ? `btn--${action}` : ''}`} onMouseDown={this.handleRippleEffect} onClick={this.props.onClick}>
				{this.props.children}
			</button>
		)
	}
}
