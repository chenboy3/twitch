//user must install "ReadLine Sync" with command - npm install readline-sync
//install twillio = npm install -g twilio
var twilio = require('twilio');
var client = require('twilio')('AC470ec0cec6bebebf541ed7e523425c24',
 '8196d83d4a674648057e7f94942ee4f3');
var request = require('request');
var interval = 2000; //  10 seconds
var players = {}
var numbers = {}
var matchesPinged = {}
var readlineSync = require('readline-sync');
var bracketController = require('../controller/bracketController');

module.exports = function(app){
	app.get('/', bracketController.home);
	app.get('/phoneNumber/:id', bracketController.phoneNumber);
	app.get('/getBracket/:id', bracketController.getBracket);
	app.post('/startTexting', bracketController.startTexting);
	app.get('/textingPage/:id', bracketController.textingPage);
	app.get('/pingNewMatches/:name', bracketController.pingNewMatches);
}