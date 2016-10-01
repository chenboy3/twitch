var mongoose = require('mongoose'),
	Schema = mongoose.Schema;

var PlayerSchema = new Schema({
	name: {type: String},
	number: {type: String},
	playerId: {type: Number}
});
module.exports = PlayerSchema;