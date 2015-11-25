var React = require('react');
var ReactDOM = require('react-dom');
var Flux = require('flux');
var dispatcher = new Flux.Dispatcher();
var cx = require('classnames');

if (Number.prototype.toRadians === undefined) {
    Number.prototype.toRadians = function() { return this * Math.PI / 180; };
}

if (Number.prototype.toDegrees === undefined) {
    Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };
}

// Calculates distance between two geographical coordinates in metres
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
		case 'rewards':
			elem = <App.Rewards />; break;
		}

		return (
			<div id='app' className='flex column'>
				<App.Sidebar sidebar={this.state.sidebar} hideSidebar={this.hideSidebar} />
				<div className='flex column one' onClick={this.hideSidebar}>
					{ page == 'login' ? null : <App.Topbar showSidebar={this.showSidebar} /> }
					{ elem }
				</div>
			</div>
		)
	},
	getInitialState: function() {
		return { page: 'login', sidebar: false };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'goto':
				this.setState({ page: payload.page });
				break;
			}
		}.bind(this));

		document.addEventListener('deviceready', this.onDeviceReady, false);
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
	onDeviceReady: function() {
		if (device.platform == 'iOS') {
			document.addEventListener('active', this.onResume, false);
		} else {
			document.addEventListener('resume', this.onResume, false);
		}
	},
	onPause: function() {
		dispatcher.dispatch({ type: 'pause' });
	},
	onResume: function() {
		dispatcher.dispatch({ type: 'resume' });
	},
	showSidebar: function(event) {
		event.stopPropagation();
		this.setState({ sidebar: true });
	},
	hideSidebar: function() {
		this.setState({ sidebar: false });
	},
});

App.Topbar = React.createClass({
	render: function() {
		return (
			<div id='topbar' className='flex one row align-center'>
				<App.Topbar.Hamburger showSidebar={this.props.showSidebar} />
				<App.Topbar.Logo />
			</div>
		)
	},
});

App.Topbar.Hamburger = React.createClass({
	render: function() {
		return (
			<div className='hamburger flex one align-start'>
				<img className='image' src='images/hamburger.png' onClick={this.props.showSidebar} />
			</div>
		)
	},
});

App.Topbar.Logo = React.createClass({
	render: function() {
		return (
			<div className='logo flex one align-end justify-end'>
				<img className='image' src='images/ntuc_logo_white.png' />
			</div>
		)
	},
});

App.Sidebar = React.createClass({
	render: function() {
		return (
			<div id='sidebar' className={cx('flex column', this.props.sidebar ? 'active' : '')}>
				<App.Sidebar.List hideSidebar={this.props.hideSidebar} />
			</div>
		)
	},
});

App.Sidebar.List = React.createClass({
	render: function() {
		return (
			<div className='list flex'>
				<div className='flex one inner column'>
					<App.Sidebar.Item image='images/icon_drive.png' onClick={this.gotoDrive}>Drive</App.Sidebar.Item>
					<App.Sidebar.Item image='images/icon_rewards.png' onClick={this.gotoRewards}>Rewards</App.Sidebar.Item>
					<App.Sidebar.Item image='images/icon_setting.png' onClick={this.gotoSettings}>Settings</App.Sidebar.Item>
					<App.Sidebar.Item image='images/icon_logout.png' onClick={this.logout}>Log out</App.Sidebar.Item>
				</div>
			</div>
		)
	},
	gotoDrive: function() {
		this.props.hideSidebar();
		dispatcher.dispatch({ type: 'goto', page: 'driving' });
	},
	gotoRewards: function() {
		this.props.hideSidebar();
		dispatcher.dispatch({ type: 'goto', page: 'rewards' });
	},
	gotoSettings: function() {
		this.props.hideSidebar();
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	},
	logout: function() {
		this.props.hideSidebar();
		dispatcher.dispatch({ type: 'goto', page: 'login' });
	},
});

App.Sidebar.Item = React.createClass({
	render: function() {
		return (
			<div className='item flex row' onClick={this.props.onClick}>
				<img className='image' src={this.props.image} />
				<h1 className='text'>{this.props.children}</h1>
			</div>
		)
	},
});

App.Login = React.createClass({
	render: function() {
		return (
			<div id='login' className='flex one align-center justify-center' >
				<div className='flex inner column '>
					<h1>ANTI-SOCIAL DRIVE</h1>
					<h3>Don&#39;t use your phone while driving and earn rewards.</h3>
					<input id='nric' type='text' placeholder='NRIC' />
					<input id='policy-number' type='text' placeholder='Driver Policy Number' />
					<button onClick={this.gotoDashboard}>SIGN IN</button>
						<div className="login-bottom">
							<p>Terms and conditions</p>
							<img src="images/ntuc_logo_orange.png" alt="ntuc-logo"/>
						</div>
				</div>
			</div>
		)
	},
	gotoDashboard: function() {
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	},
});

App.Dashboard = React.createClass({
	render: function() {
		return (
			<div id='dashboard' className='flex seven column align-center' >
				<App.Dashboard.TotalMiles />
				<hr/>
				<App.Dashboard.Drives />
				<hr/>
				<App.Dashboard.StartDriving />
			</div>
		)
	},
});

App.Dashboard.TotalMiles = React.createClass({
	render: function() {
		return (
			<div className='total-miles flex column justify-center'>
				<img src='images/landing_miles_icon.png' />
				<h4>Total Miles</h4>
				<h1>{this.totalMiles().toFixed(2)}</h1>
				<h5>GET YOUR REWARDS NOW</h5>
			</div>

		)
	},
	totalMiles: function() {
		var meters = parseInt(localStorage.getItem('traveledDistance'));
		var miles = !isNaN(meters) ? meters * 0.000621371 : 0;
		return miles;
	},
});

App.Dashboard.Drives = React.createClass({
	render: function() {
		return (
			<div className='drives flex one column justify-center'>
				<div>
					<h3>DRIVES</h3>
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
		return parseInt(this.successCount()) + parseInt(this.failedCount());
	},
	successCount: function() {
		var count = parseInt(localStorage.getItem('successCount'));
		return count ? count : 0;
	},
	failedCount: function() {
		var count = parseInt(localStorage.getItem('failedCount'));
		return count ? count : 0;
	},
});

App.Dashboard.StartDriving = React.createClass({
	render: function() {
		return (
			<div className='start-driving flex one column justify-center'>
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
			<div id='driving' className='flex seven column'>
				{ this.state.failed ? <App.Driving.Failed /> : null }
				<App.Driving.Map updateDistance={this.updateDistance} />
				<App.Driving.Distance distance={this.state.distance} />
				<App.Driving.Finish distance={this.state.distance} />
			</div>
		)
	},
	getInitialState: function() {
		return { distance: 0, failed: false };
	},
	componentDidMount: function() {
		this.listenerID = dispatcher.register(function(payload) {
			switch (payload.type) {
			case 'resume':
				this.failed();
				break;
			}
		}.bind(this));
	},
	componentWillUnmount: function() {
		dispatcher.unregister(this.listenerID);
	},
	updateDistance: function(a, b) {
		var d = haversine(a.lat, b.lat, a.lng, b.lng);
		this.setState({ distance: d });
	},
	failed: function() {
		var traveledDistance = parseInt(localStorage.getItem('traveledDistance'));
		traveledDistance = !isNaN(traveledDistance) ? traveledDistance + this.state.distance : this.state.distance;
		localStorage.setItem('traveledDistance', traveledDistance);

		var failedCount = parseInt(localStorage.getItem('failedCount'));
		failedCount = !isNaN(failedCount) ? failedCount + 1 : 1;
		localStorage.setItem('failedCount', failedCount);

		this.setState({ failed: true });
	},
});

App.Driving.Map = React.createClass({
	render: function() {
		return <div id='map' className='map flex three'></div>
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
		if (typeof(plugin) == 'undefined') {
			return;
		}

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
			<div className='distance flex one column align-center justify-center'>
				<h3>MILES</h3>
				<h1>{this.totalDistance()}</h1>
			</div>
		)
	},
	totalDistance: function() {
		return (this.props.distance * 0.000621371).toFixed(2);
	},
});

App.Driving.Finish = React.createClass({
	render: function() {
		return (
			<div className='finish flex one column align-center justify-center'>
				<button onClick={this.finishDriving}>FINISH</button>
			</div>
		)
	},
	finishDriving: function() {
		var traveledDistance = parseInt(localStorage.getItem('traveledDistance'));
		traveledDistance = !isNaN(traveledDistance) ? traveledDistance + this.props.distance : this.props.distance;
		localStorage.setItem('traveledDistance', traveledDistance);

		var successCount = parseInt(localStorage.getItem('successCount'));
		successCount = !isNaN(successCount) ? successCount + 1 : 1;
		localStorage.setItem('successCount', successCount);
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	},
});

App.Driving.Failed = React.createClass({
	render: function() {
		return (
			<div className='failed flex one column align-center justify-center'>
				<div className='inner'>
					<p className='message'>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras dictum leo vel sollicitudin pretium. Quisque mattis viverra mi, quis ullamcorper lacus congue a.</p>
					<button className='button' onClick={this.startAgain}>START AGAIN</button>
				</div>
			</div>
		)
	},
	startAgain: function() {
		dispatcher.dispatch({ type: 'goto', page: 'dashboard' });
	},
});

App.Rewards = React.createClass({
	render: function() {
		return (
			<div id='rewards' className='flex seven column'>
				<div className='inner flex column inner align-center'>
					<h1>Rewards</h1>
					<p>Use your accumulated miles to exchange different NTUC Income rewards</p>
					<App.Rewards.List />
				</div>
			</div>
		)
	},
});

App.Rewards.List = React.createClass({
	render: function() {
		return (
			<div className='list flex column'>{
				this.state.items.map(function(item, i) {
					return <App.Rewards.Item key={i} item={item} />;
				})
			}</div>
		)
	},
	getInitialState: function() {
		return {
			items: [
				{
					distance: 2000,
					image: 'images/rewards_sample01.jpg',
				},
				{
					distance: 1000,
					image: 'images/rewards_sample02.jpg',
				},
			],
		};
	},
});

App.Rewards.Item = React.createClass({
	render: function() {
		var item = this.props.item;
		return (
			<div className='item flex column'>
				<img className='image' src={item.image} />
				<div className='footer flex row'>
					<p className='distance one'>{item.distance} KM</p>
					<div className='flex align-center justify-end one text-right'>
						<button className='button'>EXCHANGE</button>
					</div>
				</div>
			</div>
		)
	},
});

ReactDOM.render(<App />, document.getElementById('root'));
