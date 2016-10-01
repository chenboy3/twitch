var mongoose = require('mongoose'),
	Schema = mongoose.Schema,
	Player = require('./player');

var Matches = new Schema({
	pair: [Player]
});
module.exports = Matches;