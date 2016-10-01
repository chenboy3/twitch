var app = angular.module('challongeApp', []);

app.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});

app.controller('setUpController', function($scope, $http){
	$scope.bracketId = "";
	$scope.submitId = function(){
		$http.get('/phoneNumber/'+$scope.bracketId);
	}
});

app.controller('phoneNumberController', function($scope, $http, $location, $window){
	$scope.entrants = [];
	var numbers = [];
	$scope.bracketId = window.location.pathname.split('/')[2];
	$http.get('/getBracket/'+$scope.bracketId).then(function successCallback(response){
		console.log(response);
		$scope.entrants = response['data'];
	},
	function errorCallback(response){
		console.log(response);
	});
	$scope.postNumbers = function(){
		var counter = 0;
		var numbers = [];
		var inputFields = document.getElementsByClassName('phoneNumber');
		angular.forEach(inputFields, function(input){
			numbers.push(input['value']);
			$scope.entrants[counter]['number'] = input['value'];
			counter++;
		});
		console.log($scope.entrants);
		$http.post('/startTexting', {'bracketName': $scope.bracketId, 'numbers': $scope.entrants}).then(function successCallback(response){
			$window.location.href = '/textingPage/'+$scope.bracketId;
		});
		console.log(numbers);
	}
});

app.controller('textingController', function($scope, $http, $interval){
	$scope.bracketId = window.location.pathname.split('/')[2];
	$interval(function(){
		$http.get('/pingNewMatches/'+$scope.bracketId);
	}, 5000);
})

function channel() {
	var name = document.getElementById("channelName").value;
	document.getElementById('video').src = 'http://player.twitch.tv/?channel=' + name;
	document.getElementById('chat').src = 'http://www.twitch.tv/' + name + '/chat';

}