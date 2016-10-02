function channel1() {
	var name = document.getElementById("channelName1").value;
	if (name != null) {
		document.getElementById('video1').src = 'http://player.twitch.tv/?channel=' + name;
		document.getElementById('chat1').src = 'http://www.twitch.tv/' + name + '/chat';
		window.chatClient = new chatClient({
			channel: '#' + name,
			username: 'statsbot1',
			password: 'oauth:5wdfjk1peq08snxckn43aiankecz70',
			left: true
		});
		window.chatClient.open();
	}

}

function channel2() {
	var name = document.getElementById("channelName2").value;
	if (name != null) {
		document.getElementById('video2').src = 'http://player.twitch.tv/?channel=' + name;
		document.getElementById('chat2').src = 'http://www.twitch.tv/' + name + '/chat';
		window.chatClient = new chatClient({
			channel: '#' + name,
			username: 'statsbot2',
			password: 'oauth:2pcokcej8qk9fsibdbss6m89itfcde',
			left: false
		});
		window.chatClient.open();
	}
}

function rotate() {
	var temp1 = document.getElementById('video1').src;
	var temp2 = document.getElementById('chat1').src;
	document.getElementById('video1').src = document.getElementById('video2').src;
	document.getElementById('chat1').src = document.getElementById('chat2').src;
	document.getElementById('video2').src = temp1;
	document.getElementById('chat2').src = temp2;

}