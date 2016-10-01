var express = require('express');
var app = express();
var config = require('./server/config');
var mongoose = require('mongoose');
var Brackets = require('./models/bracketModel');
app = config.initialize(app);

mongoose.connect('mongodb://niccalle:tyutyu@ds011158.mongolab.com:11158/challongetexter');
mongoose.connection.on('open', function(){
	console.log("Mongoose connected");
})
// var data = {
// 	'bracketName': 'NicGuacTest',
// 	'matchesPinged': ['1','2','3'],
// 	'playerInfo': [{'name': "Nic", 'number': '123'}]
// };
// var newModel = new Brackets(data);
// newModel.save(function(err,succ){
// 	console.log('something');
// })
app.listen(process.env.PORT, function(){
    console.log("Server listening at port " + app.get('port'));
});




