var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var dispatcher = new Flux.Dispatcher();

if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

function haversine(lat1, lat2, lon1, lon2) {
	var R = 6371000; // metres
	var t1 = lat1.toRadians();
	var t2 = lat2.toRadians();
	var dt = (lat2-lat1).toRadians();
	var da = (lon2-lon1).toRadians();

	var a = Math.sin(dt/2) * Math.sin(dt/2) +
		Math.cos(t1) * Math.cos(t2) *
		Math.sin(da/2) * Math.sin(da/2);
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
	var d = R * c;
	
	return d;
}

var App = React.createClass({
	render: function() {
		var page = this.state.page;
		var elem;

		switch (page) {
		case 'login':
			elem = <App.Login />; break;
		case 'dashboard':
			elem = <App.Dashboard />; break;
		case 'driving':
			elem = <App.Driving />; break;
		}

		return (
			<div id='app' className='flex column'>
				{ page == 'login' ? null : <App.Topbar /> }
				{ elem }
			</div>
		)
	},
	getInitialState: function() {
		return { page: 'login' };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'goto':
				this.setState({ page: payload.page });
				break;
			}
		}.bind(this));

		document.addEventListener('pause', this.onPause, false);
		document.addEventListener('resume', this.onResume, false);
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
	onPause: function() {
		dispatcher.dispatch({ type: 'pause' });
	},
	onResume: function() {
		dispatcher.dispatch({ type: 'resume' });
	},
});

App.Login = React.createClass({
	render: function() {
		return (
			<div id='login' className='flex'>
				<div className='flex inner column justify-center'>
					<h1>ANTI-SOCIAL DRIVE</h1>
					<h3>Don&#39;t use your phone while driving and earn rewards.</h3>
					<input id='nric' type='text' placeholder='NRIC' />
					<input id='policy-number' type='text' placeholder='Driver Policy Number' />
					<button onClick={this.gotoDashboard}>SIGN IN</button>
				</div>
			</div>
		)
	},
	gotoDashboard: function() {
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	},
});

App.Topbar = React.createClass({
	render: function() {
		return (
			<div id='topbar' className='flex row'>
				<App.Topbar.Hamburger />
				<App.Topbar.Logo />
			</div>
		)
	},
});

App.Topbar.Hamburger = React.createClass({
	render: function() {
		return (
			<div className='hamburger'>
				<img src='images/dummy.png' />
			</div>
		)
	},
});

App.Topbar.Logo = React.createClass({
	render: function() {
		return (
			<div className='logo'>
				<img src='images/dummy.png' />
			</div>
		)
	},
});

App.Dashboard = React.createClass({
	render: function() {
		return (
			<div id='dashboard' className='flex column align-center' >
				<App.Dashboard.TotalMiles />
				<App.Dashboard.Drives />
				<App.Dashboard.StartDriving />
			</div>
		)
	},
});

App.Dashboard.TotalMiles = React.createClass({
	render: function() {
		return (
			<div className='total-miles flex column justify-center'>
				<img src='images/dummy.png' />
				<h4>Total Miles</h4>
				<h1>{this.totalMiles().toFixed(2)}</h1>
				<h5>GET YOUR REWARDS NOW</h5>
			</div>
		)
	},
	totalMiles: function() {
		var meters = localStorage.getItem('meters');
		var miles = meters ? meters * 0.000621371 : 0;
		return miles;
	},
});

App.Dashboard.Drives = React.createClass({
	render: function() {
		return (
			<div className='drives flex column justify-center'>
				<div>
					<h3>DRIVE</h3>
					<h3>{this.driveCount()}</h3>
				</div>
				<div>
					<h3>SUCCESSED</h3>
					<h3>{this.successCount()}</h3>
				</div>
				<div>
					<h3>FAILED</h3>
					<h3>{this.failedCount()}</h3>
				</div>
			</div>
		)
	},
	driveCount: function() {
		return this.successCount() + this.failedCount();
	},
	successCount: function() {
		var count = localStorage.getItem('successCount');
		return count ? count : 0;
	},
	failedCount: function() {
		var count = localStorage.getItem('failedCount');
		return count ? count : 0;
	},
});

App.Dashboard.StartDriving = React.createClass({
	render: function() {
		return (
			<div className='start-driving flex column justify-center'>
				<button onClick={this.startDriving}>START DRIVING</button>
			</div>
		)
	},
	startDriving: function() {
		dispatcher.dispatch({ type: 'goto', page: 'driving' });
	},
});

App.Driving = React.createClass({
	render: function() {
		return (
			<div id='driving' className='flex column'>
				<App.Driving.Map updateDistance={this.updateDistance} />
				<App.Driving.Distance distance={this.state.distance} />
				<App.Driving.Finish />
			</div>
		)
	},
	getInitialState: function() {
		return { distance: 0 };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'pause':
				this.paused = true;
				break;
			case 'resume':
				if (this.paused) {
					alert('Lorem ipsum dolor sit amet!');
					this.paused = false;
					setTimeout(function() {
						dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
					}, 0);
				}
				break;
			}
		});
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
	updateDistance: function(a, b) {
		var d = haversine(a.lat, b.lat, a.lng, b.lng);
		this.setState({ distance: d });
	},
});

App.Driving.Map = React.createClass({
	render: function() {
		return <div id='map' className='map'></div>
	},
	componentDidMount: function() {
		if (typeof(plugin) != 'undefined' && typeof(this.map) == 'undefined') {
			this.map = plugin.google.maps.Map.getMap(document.getElementById('map'), {
				controls: {
					compass: true,
					zoom: true,
					myLocationButton: true,
				},
				gestures: {
					scroll: true,
					tilt: true,
					rotate: true,
					zoom: true,
				},
			});
			this.map.addEventListener(plugin.google.maps.event.MAP_READY, this.onMapReady);
		}

		this.watchID = navigator.geolocation.watchPosition(this.onLocationReceived, this.onLocationError, {
			enabledHighAccuracy: true,
			timeout: 30000,
			maximumAge: 10000,
		});
	},
	componentWillUnmount: function() {
		navigator.geolocation.clearWatch(this.watchID);
	},
	onMapReady: function() {
		this.map.setZoom(19);
	},
	onLocationReceived: function(position) {
		var coords = position.coords;
		var latlng = new plugin.google.maps.LatLng(coords.latitude, coords.longitude);
		if (this.marker) {
			this.marker.setPosition(latlng);
			this.props.updateDistance(this.origLatLng, {
				lat: coords.latitude,
				lng: coords.longitude,
			});
		} else {
			this.origLatLng = { lat: coords.latitude, lng: coords.longitude };
			this.map.setCenter(latlng);
			this.map.addMarker({ position: latlng, title: 'You' }, function(marker) {
				this.marker = marker;
			}.bind(this));
		}
	},
	onLocationError: function(error) {
		alert(error.message);
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	},
});

App.Driving.Distance = React.createClass({
	render: function() {
		return (
			<div className='distance flex column align-center justify-center'>
				<h3>MILES</h3>
				<h1>{this.totalDistance()}</h1>
			</div>
		)
	},
	totalDistance: function() {
		return this.props.distance * 0.000621371;
	},
});

App.Driving.Finish = React.createClass({
	render: function() {
		return (
			<div className='finish flex column align-center justify-center'>
				<button onClick={this.finish}>FINISH</button>
			</div>
		)
	},
	finish: function() {
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	},
});

ReactDOM.render(<App />, document.getElementById('root'));
