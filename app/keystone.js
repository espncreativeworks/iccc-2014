// Simulate config options from your production environment by
// customising the .env file in your project's root folder.
require('dotenv').load();

if (process.env.NODE_ENV === 'production'){
	require('newrelic');
}

// Require keystone
var keystone = require('keystone'),
	handlebars = require('express3-handlebars');


// Initialise Keystone with your project's configuration.
// See http://keystonejs.com/guide/config for available options
// and documentation.


keystone.init({

	'name': 'Infiniti CCC (dev)',
	'brand': 'Infiniti CCC Admin (dev)',

	'port': process.env.PORT || 9002,

	'less': 'public',
	'static': 'public',
	'favicon': 'public/favicon.ico',
	'views': 'templates/views',
	'view engine': 'hbs',

	'custom engine': handlebars.create({
		layoutsDir: 'templates/views/layouts',
		partialsDir: 'templates/views/partials',
		defaultLayout: 'default',
		helpers: new require('./templates/views/helpers')(),
		extname: '.hbs'
	}).engine,

	'auto update': true,
	'session': true,
	'session store': 'mongo',
	'auth': true,
	'user model': 'User',
	'cookie secret': process.env.COOKIE_SECRET

});

// Load your project's Models

keystone.import('models');

// Setup common locals for your templates. The following are required for the
// bundled templates and layouts. Any runtime locals (that should be set uniquely
// for each request) should be added to ./routes/middleware.js

keystone.set('locals', {
	_: require('underscore'),
	env: keystone.get('env'),
	utils: keystone.utils,
	editable: keystone.content.editable
});


// Cloudinary Config
keystone.set('cloudinary config', process.env.CLOUDINARY_URL);
keystone.set('cloudinary prefix', 'iccc');
keystone.set('cloudinary folders', true);

// Embed.ly Config
keystone.set('embedly api key', process.env.EMBEDLY_API_KEY);

// Google Maps Config
keystone.set('google api key', process.env.GOOGLE_BROWSER_KEY);
keystone.set('google server api key', process.env.GOOGLE_SERVER_KEY);
keystone.set('default region', 'us');

// Load your project's Routes

keystone.set('routes', require('./routes'));

// Setup common locals for your emails. The following are required by Keystone's
// default email templates, you may remove them if you're using your own.

// Configure the navigation bar in Keystone's Admin UI

keystone.set('nav', {
	'users': 'users',
	'resources': ['coaches', 'schools', 'charities'],
	'polls': ['ballots', 'votes'],
	'video': ['videos']
});

// Start Keystone to connect to your database and initialise the web server

keystone.start();
