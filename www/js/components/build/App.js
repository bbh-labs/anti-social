var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var dispatcher = new Flux.Dispatcher();
var cx = require('classnames');

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

// Calculates distance between two geographical coordinates in metres
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

	render: function () {
		var page = this.state.page;
		var elem;

		switch (page) {
			case 'login':
				elem = React.createElement(App.Login, null);break;
			case 'dashboard':
				elem = React.createElement(App.Dashboard, null);break;
			case 'driving':
				elem = React.createElement(App.Driving, null);break;
			case 'rewards':
				elem = React.createElement(App.Rewards, null);break;
		}

		return React.createElement(
			'div',
			{ id: 'app', className: 'flex column' },
			React.createElement(App.Sidebar, { sidebar: this.state.sidebar, hideSidebar: this.hideSidebar }),
			React.createElement(
				'div',
				{ className: 'flex column one', onClick: this.hideSidebar },
				page == 'login' ? null : React.createElement(App.Topbar, { showSidebar: this.showSidebar }),
				elem
			)
		);
	},
	getInitialState: function () {
		return { page: 'login', sidebar: false };
	},
	componentDidMount: function () {
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
	componentWillUnmount: function () {
		dispatcher.unregister(this.listenerID);
	},
	onPause: function () {
		dispatcher.dispatch({ type: 'pause' });
	},
	onResume: function () {
		dispatcher.dispatch({ type: 'resume' });
	},
	showSidebar: function (event) {
		event.stopPropagation();
		this.setState({ sidebar: true });
	},
	hideSidebar: function () {
		this.setState({ sidebar: false });
	}
});

App.Topbar = React.createClass({
	displayName: 'Topbar',

	render: function () {
		return React.createElement(
			'div',
			{ id: 'topbar', className: 'flex one row align-center' },
			React.createElement(App.Topbar.Hamburger, { showSidebar: this.props.showSidebar }),
			React.createElement(App.Topbar.Logo, null)
		);
	}
});

App.Topbar.Hamburger = React.createClass({
	displayName: 'Hamburger',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'hamburger flex one align-start' },
			React.createElement('img', { className: 'image', src: 'images/hamburger.png', onClick: this.props.showSidebar })
		);
	}
});

App.Topbar.Logo = React.createClass({
	displayName: 'Logo',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'logo flex one align-end justify-end' },
			React.createElement('img', { className: 'image', src: 'images/ntuc_logo_white.png' })
		);
	}
});

App.Sidebar = React.createClass({
	displayName: 'Sidebar',

	render: function () {
		return React.createElement(
			'div',
			{ id: 'sidebar', className: cx('flex column', this.props.sidebar ? 'active' : '') },
			React.createElement(App.Sidebar.List, { hideSidebar: this.props.hideSidebar })
		);
	}
});

App.Sidebar.List = React.createClass({
	displayName: 'List',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'list flex' },
			React.createElement(
				'div',
				{ className: 'flex one inner column' },
				React.createElement(
					App.Sidebar.Item,
					{ image: 'images/icon_drive.png', onClick: this.gotoDrive },
					'Drive'
				),
				React.createElement(
					App.Sidebar.Item,
					{ image: 'images/icon_rewards.png', onClick: this.gotoRewards },
					'Rewards'
				),
				React.createElement(
					App.Sidebar.Item,
					{ image: 'images/icon_setting.png', onClick: this.gotoSettings },
					'Settings'
				),
				React.createElement(
					App.Sidebar.Item,
					{ image: 'images/icon_logout.png', onClick: this.logout },
					'Log out'
				)
			)
		);
	},
	gotoDrive: function () {
		this.props.hideSidebar();
		dispatcher.dispatch({ type: 'goto', page: 'driving' });
	},
	gotoRewards: function () {
		this.props.hideSidebar();
		dispatcher.dispatch({ type: 'goto', page: 'rewards' });
	},
	gotoSettings: function () {
		this.props.hideSidebar();
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	},
	logout: function () {
		this.props.hideSidebar();
		dispatcher.dispatch({ type: 'goto', page: 'login' });
	}
});

App.Sidebar.Item = React.createClass({
	displayName: 'Item',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'item flex row', onClick: this.props.onClick },
			React.createElement('img', { className: 'image', src: this.props.image }),
			React.createElement(
				'h1',
				{ className: 'text' },
				this.props.children
			)
		);
	}
});

App.Login = React.createClass({
	displayName: 'Login',

	render: function () {
		return React.createElement(
			'div',
			{ id: 'login', className: 'flex one align-center justify-center' },
			React.createElement(
				'div',
				{ className: 'flex inner column ' },
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
				),
				React.createElement(
					'div',
					{ className: 'login-bottom' },
					React.createElement(
						'p',
						null,
						'Terms and conditions'
					),
					React.createElement('img', { src: 'images/ntuc_logo_orange.png', alt: 'ntuc-logo' })
				)
			)
		);
	},
	gotoDashboard: function () {
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	}
});

App.Dashboard = React.createClass({
	displayName: 'Dashboard',

	render: function () {
		return React.createElement(
			'div',
			{ id: 'dashboard', className: 'flex seven column align-center' },
			React.createElement(App.Dashboard.TotalMiles, null),
			React.createElement('hr', null),
			React.createElement(App.Dashboard.Drives, null),
			React.createElement('hr', null),
			React.createElement(App.Dashboard.StartDriving, null)
		);
	}
});

App.Dashboard.TotalMiles = React.createClass({
	displayName: 'TotalMiles',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'total-miles flex column justify-center' },
			React.createElement('img', { src: 'images/landing_miles_icon.png' }),
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
	totalMiles: function () {
		var meters = parseInt(localStorage.getItem('traveledDistance'));
		var miles = !isNaN(meters) ? meters * 0.000621371 : 0;
		return miles;
	}
});

App.Dashboard.Drives = React.createClass({
	displayName: 'Drives',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'drives flex one column justify-center' },
			React.createElement(
				'div',
				null,
				React.createElement(
					'h3',
					null,
					'DRIVES'
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
	driveCount: function () {
		return parseInt(this.successCount()) + parseInt(this.failedCount());
	},
	successCount: function () {
		var count = parseInt(localStorage.getItem('successCount'));
		return count ? count : 0;
	},
	failedCount: function () {
		var count = parseInt(localStorage.getItem('failedCount'));
		return count ? count : 0;
	}
});

App.Dashboard.StartDriving = React.createClass({
	displayName: 'StartDriving',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'start-driving flex one column justify-center' },
			React.createElement(
				'button',
				{ onClick: this.startDriving },
				'START DRIVING'
			)
		);
	},
	startDriving: function () {
		dispatcher.dispatch({ type: 'goto', page: 'driving' });
	}
});

App.Driving = React.createClass({
	displayName: 'Driving',

	render: function () {
		return React.createElement(
			'div',
			{ id: 'driving', className: 'flex seven column' },
			this.state.failed ? React.createElement(App.Driving.Failed, null) : null,
			React.createElement(App.Driving.Map, { updateDistance: this.updateDistance }),
			React.createElement(App.Driving.Distance, { distance: this.state.distance }),
			React.createElement(App.Driving.Finish, { distance: this.state.distance })
		);
	},
	getInitialState: function () {
		return { distance: 0, failed: false };
	},
	componentDidMount: function () {
		this.listenerID = dispatcher.register((function (payload) {
			switch (payload.type) {
				case 'resume':
					this.failed();
					break;
			}
		}).bind(this));
	},
	componentWillUnmount: function () {
		dispatcher.unregister(this.listenerID);
	},
	updateDistance: function (a, b) {
		var d = haversine(a.lat, b.lat, a.lng, b.lng);
		this.setState({ distance: d });
	},
	failed: function () {
		var traveledDistance = parseInt(localStorage.getItem('traveledDistance'));
		traveledDistance = !isNaN(traveledDistance) ? traveledDistance + this.state.distance : this.state.distance;
		localStorage.setItem('traveledDistance', traveledDistance);

		var failedCount = parseInt(localStorage.getItem('failedCount'));
		failedCount = !isNaN(failedCount) ? failedCount + 1 : 1;
		localStorage.setItem('failedCount', failedCount);

		this.setState({ failed: true });
	}
});

App.Driving.Map = React.createClass({
	displayName: 'Map',

	render: function () {
		return React.createElement('div', { id: 'map', className: 'map flex three' });
	},
	componentDidMount: function () {
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
	componentWillUnmount: function () {
		navigator.geolocation.clearWatch(this.watchID);
	},
	onMapReady: function () {
		this.map.setZoom(19);
	},
	onLocationReceived: function (position) {
		if (typeof plugin == 'undefined') {
			return;
		}

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
	onLocationError: function (error) {
		alert(error.message);
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	}
});

App.Driving.Distance = React.createClass({
	displayName: 'Distance',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'distance flex one column align-center justify-center' },
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
	totalDistance: function () {
		return (this.props.distance * 0.000621371).toFixed(2);
	}
});

App.Driving.Finish = React.createClass({
	displayName: 'Finish',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'finish flex one column align-center justify-center' },
			React.createElement(
				'button',
				{ onClick: this.finishDriving },
				'FINISH'
			)
		);
	},
	finishDriving: function () {
		var traveledDistance = parseInt(localStorage.getItem('traveledDistance'));
		traveledDistance = !isNaN(traveledDistance) ? traveledDistance + this.props.distance : this.props.distance;
		localStorage.setItem('traveledDistance', traveledDistance);

		var successCount = parseInt(localStorage.getItem('successCount'));
		successCount = !isNaN(successCount) ? successCount + 1 : 1;
		localStorage.setItem('successCount', successCount);
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	}
});

App.Driving.Failed = React.createClass({
	displayName: 'Failed',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'failed flex one column align-center justify-center' },
			React.createElement(
				'div',
				{ className: 'inner' },
				React.createElement(
					'p',
					{ className: 'message' },
					'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dictum leo vel sollicitudin pretium. Quisque mattis viverra mi, quis ullamcorper lacus congue a.'
				),
				React.createElement(
					'button',
					{ className: 'button', onClick: this.startAgain },
					'START AGAIN'
				)
			)
		);
	},
	startAgain: function () {
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	}
});

App.Rewards = React.createClass({
	displayName: 'Rewards',

	render: function () {
		return React.createElement(
			'div',
			{ id: 'rewards', className: 'flex seven column' },
			React.createElement(
				'div',
				{ className: 'inner flex column inner align-center' },
				React.createElement(
					'h1',
					null,
					'Rewards'
				),
				React.createElement(
					'p',
					null,
					'Use your accumulated miles to exchange different NTUC Income rewards'
				),
				React.createElement(App.Rewards.List, null)
			)
		);
	}
});

App.Rewards.List = React.createClass({
	displayName: 'List',

	render: function () {
		return React.createElement(
			'div',
			{ className: 'list flex column' },
			this.state.items.map(function (item, i) {
				return React.createElement(App.Rewards.Item, { key: i, item: item });
			})
		);
	},
	getInitialState: function () {
		return {
			items: [{
				distance: 2000,
				image: 'images/rewards_sample01.jpg'
			}, {
				distance: 1000,
				image: 'images/rewards_sample02.jpg'
			}]
		};
	}
});

App.Rewards.Item = React.createClass({
	displayName: 'Item',

	render: function () {
		var item = this.props.item;
		return React.createElement(
			'div',
			{ className: 'item flex column' },
			React.createElement('img', { className: 'image', src: item.image }),
			React.createElement(
				'div',
				{ className: 'footer flex row' },
				React.createElement(
					'p',
					{ className: 'distance one' },
					item.distance,
					' KM'
				),
				React.createElement(
					'div',
					{ className: 'flex align-center justify-end one text-right' },
					React.createElement(
						'button',
						{ className: 'button' },
						'EXCHANGE'
					)
				)
			)
		);
	}
});

ReactDOM.render(React.createElement(App, null), document.getElementById('root'));