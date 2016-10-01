function channel1() {
	var name = document.getElementById("channelName1").value;
	document.getElementById('video1').src = 'http://player.twitch.tv/?channel=' + name;
	document.getElementById('chat1').src = 'http://www.twitch.tv/' + name + '/chat';

}

function channel2() {
	var name = document.getElementById("channelName2").value;
	document.getElementById('video2').src = 'http://player.twitch.tv/?channel=' + name;
	document.getElementById('chat2').src = 'http://www.twitch.tv/' + name + '/chat';

}

function rotate() {
	var temp1 = document.getElementById('video1').src;
	var temp2 = document.getElementById('chat1').src;
	document.getElementById('video1').src = document.getElementById('video2').src;
	document.getElementById('chat1').src = document.getElementById('chat2').src;
	document.getElementById('video2').src = temp1;
	document.getElementById('chat2').src = temp2;

}