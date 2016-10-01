var request = require('request');

var Brackets = require ('../models/bracketModel');
var twilio = require('twilio');
var client = require('twilio')('AC470ec0cec6bebebf541ed7e523425c24',
 '8196d83d4a674648057e7f94942ee4f3');
module.exports.home = function(req,res){
	res.render('index');
}
module.exports.phoneNumber = function(req,res){
	res.render('input');
}
module.exports.getBracket = function(req,res){
	console.log(req.params.id);
	var participants = [];
	request.get({url: 'https://api.challonge.com/v1/tournaments/'+req.params.id+'/participants.json'},
	function(err, response, body){ 
		data = JSON.parse(body);
		data.forEach(function(element){
			var playerData = {};
			playerData['name'] = element['participant']['name'];
			playerData['id'] = element['participant']['id'];
			//console.log(name);
			participants.push(playerData);

		});
		res.send(participants);
	})
	.auth('niccalle', 'kybqKzS7sTjMiLi6MZCYGCJR5sgQZEczlI747hPR', true);
}
module.exports.textingPage = function(req,res){
	console.log("trying to get page " + req.params.name);
	res.render('text');
}
/*
Function: pingNewMatches

Purpose: Checks all of the open matches on challonge, it then checks to see which matches have
already been pinged for texting. It will then ping the match if it hasn't been called before.

Algorithm Description: Go through open matches on challonge api. Make a comparison with the matchID
to the pinged match list database. If the match has already pinged then it will be ignored. If it has 
not been pinged then the players number will be texted via twilio and then added to the pinged database.
*/

module.exports.pingNewMatches = function(req, res){
	//access challonge API
	//Need to make MatchesPinged, players(name/number). 
	var pinged = [];
	var playerDatabase = []; //name:'Armada' number: '6969696996969'

	Brackets.findOne({'bracketName': req.params.name}, function(error, bracket){
		if(error){
			console.log(error);
		}
		else{
			bracket['playerInfo'].forEach(function(element){
				playerDatabase.push(element);
			});
			bracket['matchesPinged'].forEach(function(element){
				pinged.push(element);
			});

			request.get({url: 'https://api.challonge.com/v1/tournaments/'+req.params.name+'/matches.json'},
				function(err,response,body){
					data= JSON.parse(body);
					data.forEach(function(element){
						if(element['match']['state'] == 'open'){
							var matchId = element['match']['id'].toString();
							if(pinged.indexOf(matchId) == -1)
							{	
							var player1;
							var player2;
							playerDatabase.forEach(function(player){
								if(player['playerId'] == element['match']['player1_id']){
									player1 = player;
								}
								if(player['playerId'] == element['match']['player2_id']){
									player2 = player;
								}
							})
							textPlayer(player1,player2);
							pinged.push(matchId);
							console.log(pinged);
							}
						}
					})
				Brackets.update({'bracketName': req.params.name}, {matchesPinged: pinged}, function(err, numAffected){});
				})
				.auth('niccalle', 'kybqKzS7sTjMiLi6MZCYGCJR5sgQZEczlI747hPR', true);
			}

	});
	/*
	request.get({url: 'https://api.challonge.com/v1/tournaments/NicGuacTest/matches.json'},
		function(err, response, body){
		    data = JSON.parse(body);
		    data.forEach(function(element){
		        if(element['match']['state'] == 'open'){
		       		if(//MatchesPinged != true)
		       		{
		        	console.log(//players[element['match']['player1_id']] has a match vs players[element['match']['player2_id']])
		            console.log(//"Sending a text to " + players[element['match']['player1_id']]+ " at number " + numbers[players[element['match']['player1_id']]] +
		            //" & " +  players[element['match']['player2_id']]+ " at number " + numbers[players[element['match']['player2_id']]] );
		        	
		        	//Set matchesPinged[element['match']['id']] to true
		        	
		            //send text to both players
		                client.sendMessage({
		                    body: "Hello "+ players[element['match']['player1_id']] + "you have a match vs " + players[element['match']['player2_id']],
		                    to: "+1"+numbers[players[element['match']['player1_id']]],
		                    from: "+19256607127"
		                }, function(err, data) {
		                    if(err)
		                        console.log(err);
		                    console.log(data);
		                });
		                client.sendMessage({
		                    body: "Hello "+ players[element['match']['player2_id']] + "you have a match vs " + players[element['match']['player1_id']],
		                    to: "+1"+numbers[players[element['match']['player2_id']]],
		                    from: "+19256607127"
		                }, function(err, data) {
		                    if(err)
		                        console.log(err);
		                    console.log(data);
		                });

		            }
		        }
		    });
		})
		
*/
}

function textPlayer(player1,player2){
		client.sendMessage({
		    body: "Hello "+ player1['name'] + "you have a match vs " + player2['name'],
			to: "+1"+player1['number'],
			from: "+19256607127"
		}, function(err, data) {
		     
		});	
		client.sendMessage({
		    body: "Hello "+ player2['name'] + "you have a match vs " + player1['name'],
			to: "+1"+player2['number'],
			from: "+19256607127"
		}, function(err, data) {
		     
		});	
}

/*
Function: startTexting

Purpose:  To make a model in the database for the specific bracket. 
It'll have all the numbers that we need to add. Look at the server.js code for an example of how to make a
new model and insert it into the database. 

Algorithm Descripion: Go through the array of numbers (req.body['numbers']), and make an array of Players.
Only make a player if the number isn't empty.

Return: res.render(...havent decided what to make this yet) This is going to a page that the user gets once they enter
the numbers
*/



module.exports.startTexting = function(req,res){
	console.log("Started Texting Method");
	var data = {
	'bracketName': req.body['bracketName'],
	'matchesPinged': [],
	'playerInfo': []
	};
	req.body['numbers'].forEach(function(element) {
		if (element['name'] != ""){
			data['playerInfo'].push({'name': element['name']/*req.body['name']*/, 'number': element['number'], 'playerId': element['id']});
		}
	});
	console.log(data);
	var newModel = new Brackets(data);
	newModel.save(function(err,succ){
	console.log('database initialized');
	})
		/*}, interval); */

		/* .auth('chenboy3', 'DTQjITLqFKyJR8kAGh8oK1uS0VBaPXjymwC2iL3d', true); */
		res.send('lmao');
	}
