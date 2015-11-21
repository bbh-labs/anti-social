'use strict';

var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var dispatcher = new Flux.Dispatcher();

if (Number.prototype.toRadians === undefined) {
	Number.prototype.toRadians = function () {
		return this * Math.PI / 180;
	};
}

if (Number.prototype.toDegrees === undefined) {
	Number.prototype.toDegrees = function () {
		return this * 180 / Math.PI;
	};
}

function haversine(lat1, lat2, lon1, lon2) {
	var R = 6371000; // metres
	var t1 = lat1.toRadians();
	var t2 = lat2.toRadians();
	var dt = (lat2 - lat1).toRadians();
	var da = (lon2 - lon1).toRadians();

	var a = Math.sin(dt / 2) * Math.sin(dt / 2) + Math.cos(t1) * Math.cos(t2) * Math.sin(da / 2) * Math.sin(da / 2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	var d = R * c;

	return d;
}

var App = React.createClass({
	displayName: 'App',

	render: function render() {
		var page = this.state.page;
		var elem;

		switch (page) {
			case 'login':
				elem = React.createElement(App.Login, null);break;
			case 'dashboard':
				elem = React.createElement(App.Dashboard, null);break;
			case 'driving':
				elem = React.createElement(App.Driving, null);break;
		}

		return React.createElement(
			'div',
			{ id: 'app', className: 'flex column' },
			page == 'login' ? null : React.createElement(App.Topbar, null),
			elem
		);
	},
	getInitialState: function getInitialState() {
		return { page: 'login' };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'goto':
					this.setState({ page: payload.page });
					break;
			}
		}).bind(this));

		document.addEventListener('pause', this.onPause, false);
		document.addEventListener('resume', this.onResume, false);
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	},
	onPause: function onPause() {
		dispatcher.dispatch({ type: 'pause' });
	},
	onResume: function onResume() {
		dispatcher.dispatch({ type: 'resume' });
	}
});

App.Login = React.createClass({
	displayName: 'Login',

	render: function render() {
		return React.createElement(
			'div',
			{ id: 'login', className: 'flex' },
			React.createElement(
				'div',
				{ className: 'flex inner column justify-center' },
				React.createElement(
					'h1',
					null,
					'ANTI-SOCIAL DRIVE'
				),
				React.createElement(
					'h3',
					null,
					'Don\'t use your phone while driving and earn rewards.'
				),
				React.createElement('input', { id: 'nric', type: 'text', placeholder: 'NRIC' }),
				React.createElement('input', { id: 'policy-number', type: 'text', placeholder: 'Driver Policy Number' }),
				React.createElement(
					'button',
					{ onClick: this.gotoDashboard },
					'SIGN IN'
				)
			)
		);
	},
	gotoDashboard: function gotoDashboard() {
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	}
});

App.Topbar = React.createClass({
	displayName: 'Topbar',

	render: function render() {
		return React.createElement(
			'div',
			{ id: 'topbar', className: 'flex row' },
			React.createElement(App.Topbar.Hamburger, null),
			React.createElement(App.Topbar.Logo, null)
		);
	}
});

App.Topbar.Hamburger = React.createClass({
	displayName: 'Hamburger',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'hamburger' },
			React.createElement('img', { src: 'images/dummy.png' })
		);
	}
});

App.Topbar.Logo = React.createClass({
	displayName: 'Logo',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'logo' },
			React.createElement('img', { src: 'images/dummy.png' })
		);
	}
});

App.Dashboard = React.createClass({
	displayName: 'Dashboard',

	render: function render() {
		return React.createElement(
			'div',
			{ id: 'dashboard', className: 'flex column align-center' },
			React.createElement(App.Dashboard.TotalMiles, null),
			React.createElement(App.Dashboard.Drives, null),
			React.createElement(App.Dashboard.StartDriving, null)
		);
	}
});

App.Dashboard.TotalMiles = React.createClass({
	displayName: 'TotalMiles',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'total-miles flex column justify-center' },
			React.createElement('img', { src: 'images/dummy.png' }),
			React.createElement(
				'h4',
				null,
				'Total Miles'
			),
			React.createElement(
				'h1',
				null,
				this.totalMiles().toFixed(2)
			),
			React.createElement(
				'h5',
				null,
				'GET YOUR REWARDS NOW'
			)
		);
	},
	totalMiles: function totalMiles() {
		var meters = localStorage.getItem('meters');
		var miles = meters ? meters * 0.000621371 : 0;
		return miles;
	}
});

App.Dashboard.Drives = React.createClass({
	displayName: 'Drives',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'drives flex column justify-center' },
			React.createElement(
				'div',
				null,
				React.createElement(
					'h3',
					null,
					'DRIVE'
				),
				React.createElement(
					'h3',
					null,
					this.driveCount()
				)
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'h3',
					null,
					'SUCCESSED'
				),
				React.createElement(
					'h3',
					null,
					this.successCount()
				)
			),
			React.createElement(
				'div',
				null,
				React.createElement(
					'h3',
					null,
					'FAILED'
				),
				React.createElement(
					'h3',
					null,
					this.failedCount()
				)
			)
		);
	},
	driveCount: function driveCount() {
		return this.successCount() + this.failedCount();
	},
	successCount: function successCount() {
		var count = localStorage.getItem('successCount');
		return count ? count : 0;
	},
	failedCount: function failedCount() {
		var count = localStorage.getItem('failedCount');
		return count ? count : 0;
	}
});

App.Dashboard.StartDriving = React.createClass({
	displayName: 'StartDriving',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'start-driving flex column justify-center' },
			React.createElement(
				'button',
				{ onClick: this.startDriving },
				'START DRIVING'
			)
		);
	},
	startDriving: function startDriving() {
		dispatcher.dispatch({ type: 'goto', page: 'driving' });
	}
});

App.Driving = React.createClass({
	displayName: 'Driving',

	render: function render() {
		return React.createElement(
			'div',
			{ id: 'driving', className: 'flex column' },
			React.createElement(App.Driving.Map, { updateDistance: this.updateDistance }),
			React.createElement(App.Driving.Distance, { distance: this.state.distance }),
			React.createElement(App.Driving.Finish, null)
		);
	},
	getInitialState: function getInitialState() {
		return { distance: 0 };
	},
	componentDidMount: function componentDidMount() {
		this.listenerID = dispatcher.register(function (payload) {
			switch (payload.type) {
				case 'pause':
					this.paused = true;
					break;
				case 'resume':
					if (this.paused) {
						alert('Lorem ipsum dolor sit amet!');
						this.paused = false;
						setTimeout(function () {
							dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
						}, 0);
					}
					break;
			}
		});
	},
	componentWillUnmount: function componentWillUnmount() {
		dispatcher.unregister(this.listenerID);
	},
	updateDistance: function updateDistance(a, b) {
		var d = haversine(a.lat, b.lat, a.lng, b.lng);
		this.setState({ distance: d });
	}
});

App.Driving.Map = React.createClass({
	displayName: 'Map',

	render: function render() {
		return React.createElement('div', { id: 'map', className: 'map' });
	},
	componentDidMount: function componentDidMount() {
		if (typeof plugin != 'undefined' && typeof this.map == 'undefined') {
			this.map = plugin.google.maps.Map.getMap(document.getElementById('map'), {
				controls: {
					compass: true,
					zoom: true,
					myLocationButton: true
				},
				gestures: {
					scroll: true,
					tilt: true,
					rotate: true,
					zoom: true
				}
			});
			this.map.addEventListener(plugin.google.maps.event.MAP_READY, this.onMapReady);
		}

		this.watchID = navigator.geolocation.watchPosition(this.onLocationReceived, this.onLocationError, {
			enabledHighAccuracy: true,
			timeout: 30000,
			maximumAge: 10000
		});
	},
	componentWillUnmount: function componentWillUnmount() {
		navigator.geolocation.clearWatch(this.watchID);
	},
	onMapReady: function onMapReady() {
		this.map.setZoom(19);
	},
	onLocationReceived: function onLocationReceived(position) {
		var coords = position.coords;
		var latlng = new plugin.google.maps.LatLng(coords.latitude, coords.longitude);
		if (this.marker) {
			this.marker.setPosition(latlng);
			this.props.updateDistance(this.origLatLng, {
				lat: coords.latitude,
				lng: coords.longitude
			});
		} else {
			this.origLatLng = { lat: coords.latitude, lng: coords.longitude };
			this.map.setCenter(latlng);
			this.map.addMarker({ position: latlng, title: 'You' }, (function (marker) {
				this.marker = marker;
			}).bind(this));
		}
	},
	onLocationError: function onLocationError(error) {
		alert(error.message);
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	}
});

App.Driving.Distance = React.createClass({
	displayName: 'Distance',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'distance flex column align-center justify-center' },
			React.createElement(
				'h3',
				null,
				'MILES'
			),
			React.createElement(
				'h1',
				null,
				this.totalDistance()
			)
		);
	},
	totalDistance: function totalDistance() {
		return this.props.distance * 0.000621371;
	}
});

App.Driving.Finish = React.createClass({
	displayName: 'Finish',

	render: function render() {
		return React.createElement(
			'div',
			{ className: 'finish flex column align-center justify-center' },
			React.createElement(
				'button',
				{ onClick: this.finish },
				'FINISH'
			)
		);
	},
	finish: function finish() {
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	}
});

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));