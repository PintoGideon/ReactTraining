import React, { Component } from 'react';

export default class Toggle extends Component {
	render() {
		state = {
			on: false
		};
		toggle = () => {
			this.setState({
				on: !this.state.on
			});
		};

		return (
			<div>
				{this.state.on && <h1>Toggle me</h1>}
				<button onClick={toggle}>Show/Hide</button>
			</div>
		);
	}
}
