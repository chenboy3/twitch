/*
    This file is what connects to chat and parses messages as they come along. The chat client connects via a 
    Web Socket to Twitch chat. The important part events are onopen and onmessage.
*/
/* global variables, used to update stats */

var chatClient = function chatClient(options){
    if (options.left) {
        this.code = 'l';
    }
    else {
        this.code = 'r';
    }
    this.username = options.username;
    this.password = options.password;
    this.channel = options.channel;
    this.server = 'irc-ws.chat.twitch.tv';
    this.port = 443;
    this.userCommentHash = {};
    this.copypastaCountHash = {};
    this.emoticonCountHash = {};
    this.userEmoticonHash = {};
    this.numActiveViewers = 0;
    this.numComments = 0;
    this.numEmoticons = 0;
    this.numEmoticonPosters = 0;
    this.messageTotalChars = 0;
    this.maxViewers = 0;
}

chatClient.prototype.open = function open(){
    this.webSocket = new WebSocket('wss://' + this.server + ':' + this.port + '/', 'irc');
    this.webSocket.onmessage = this.onMessage.bind(this);
    this.webSocket.onerror = this.onError.bind(this);
    this.webSocket.onclose = this.onClose.bind(this);
    this.webSocket.onopen = this.onOpen.bind(this);
};

chatClient.prototype.onError = function onError(message){
    console.log('Error: ' + message);
};

chatClient.prototype.sendMessage = function sendMessage(message){
	var socket = this.webSocket;
    if (socket !== null && socket.readyState === 1) {
		//alert('PRIVMSG ' + this.channel + " :" + messageDup);
		socket.send('PRIVMSG ' + this.channel + ' :' + message);
	}
}
/* This is an example of a leaderboard scoring system. When someone sends a message to chat, we store 
   that value in local storage. It will show up when you click Populate Leaderboard in the UI. 
*/
chatClient.prototype.onMessage = function onMessage(message){
    if(message !== null){
		if(message.data.slice(0, message.data.indexOf(' ')) === "PING"){
			this.webSocket.send('PONG :tmi.twitch.tv');
		}
        var parsed = this.parseMessage(message.data);
        if(parsed !== null){
            this.updateInfo(parsed);
        }
    }
};

chatClient.prototype.onOpen = function onOpen(){
    var socket = this.webSocket;
    if (socket !== null && socket.readyState === 1) {
        console.log('Connecting and authenticating...');
        socket.send('CAP REQ :twitch.tv/tags');
        socket.send('PASS ' + this.password);
        socket.send('NICK ' + this.username);
        socket.send('JOIN ' + this.channel);
    }
};

chatClient.prototype.onClose = function onClose(){
    console.log('Disconnected from the chat server.');
};

chatClient.prototype.close = function close(){
    if(this.webSocket){
        this.webSocket.close();
		localStorage.clear();
    }
};

/* This is an example of an IRC message with tags. I split it across 
multiple lines for readability. The spaces at the beginning of each line are 
intentional to show where each set of information is parsed. */

//@badges=global_mod/1,turbo/1;color=#0D4200;display-name=TWITCH_UserNaME;emotes=25:0-4,12-16/1902:6-10;mod=0;room-id=1337;subscriber=0;turbo=1;user-id=1337;user-type=global_mod
// :twitch_username!twitch_username@twitch_username.tmi.twitch.tv 
// PRIVMSG 
// #channel
// :Kappa Keepo Kappa

chatClient.prototype.parseMessage = function parseMessage(rawMessage) {
    var parsedMessage = {
        message: null,
        messageLength: 0,
        tags: null, /* not too important */
        command: null, /* not important? */
        original: rawMessage,
        channel: null, /* not important */
        username: null,
        emoticons: {}
    };

    if(rawMessage[0] === '@'){
        var tagIndex = rawMessage.indexOf(' '),
        userIndex = rawMessage.indexOf(' ', tagIndex + 1),
        commandIndex = rawMessage.indexOf(' ', userIndex + 1),
        channelIndex = rawMessage.indexOf(' ', commandIndex + 1),
        messageIndex = rawMessage.indexOf(':', channelIndex + 1);

        parsedMessage.tags = rawMessage.slice(0, tagIndex);
        parsedMessage.username = rawMessage.slice(tagIndex + 2, rawMessage.indexOf('!'));
        parsedMessage.command = rawMessage.slice(userIndex + 1, commandIndex);
        parsedMessage.channel = rawMessage.slice(commandIndex + 1, channelIndex);
        parsedMessage.message = rawMessage.slice(messageIndex + 1);
        parsedMessage.messageLength = parsedMessage.message.length - 1;
        // update emoticons
        parsedMessage.emoticons = this.parseEmoticons(rawMessage);
    }

    if(parsedMessage.command !== 'PRIVMSG'){
        parsedMessage = null;
    }

    return parsedMessage;
}

chatClient.prototype.parseEmoticons = function(string) {
    var emoteIndex = string.indexOf('emotes') + 7;
    var emoteEndIndex = string.indexOf(';', emoteIndex);
    var hash = {};
    while (emoteIndex <  emoteEndIndex) {
        var emoteBreak = string.indexOf(':', emoteIndex);
        var emoteValue = parseInt(string.substring(emoteIndex, emoteBreak));
        if (!hash.hasOwnProperty(emoteValue)) {
            hash[emoteValue] = 0;
        }
        emoteIndex = emoteBreak;
        while (string.charAt(emoteIndex) !== '/' && string.charAt(emoteIndex) !== ';') {
            emoteIndex++;
            if (string.charAt(emoteIndex) === '-') {
                hash[emoteValue]++;
            }
        }
        emoteIndex++;
    }
    return hash;

}

chatClient.prototype.updateInfo = function(parsedMessage) {

    this.messageTotalChars += parsedMessage.messageLength;
    this.numComments++;

    var user = parsedMessage.username;
    if (this.userCommentHash.hasOwnProperty(user)) {
        this.userCommentHash[user]++;
    }
    else {
        this.userCommentHash[user] = 1;
        this.numActiveViewers++;
    }

    if (parsedMessage.emoticons.length !== 0 && !this.userEmoticonHash.hasOwnProperty(user)) {
        this.userEmoticonHash[user] = true;
        this.numEmoticonPosters++;
    }

    var message = parsedMessage.message.substring(0, parsedMessage.message.length - 1);
    if (parsedMessage.messageLength >= 100) {
        if (this.copypastaCountHash.hasOwnProperty(message)) {
            this.copypastaCountHash[message]++;
        }
        else {
            this.copypastaCountHash[message] = 1;
        }
    }

    for (var emote in parsedMessage.emoticons) {
        if (this.emoticonCountHash.hasOwnProperty(emote)) {
            this.emoticonCountHash[emote] += parsedMessage.emoticons[emote];
        }
        else {
            this.emoticonCountHash[emote] = parsedMessage.emoticons[emote];
        }
        this.numEmoticons += parsedMessage.emoticons[emote];
    }

    var maxComments = 0;
    var activeUser;
    for (var user in this.userCommentHash) {
        if (this.userCommentHash[user] > maxComments) {
            maxComments = this.userCommentHash[user];
            activeUser = user;
        }
    }

    var maxEmotes = 0;
    var emote = '';
    for (var e in this.emoticonCountHash) {
        if (this.emoticonCountHash[e] > maxEmotes) {
            maxEmotes = this.emoticonCountHash[e];
            emote = e;
        }
    }

    var maxLength = 0;
    var maxcp = '';
    var maxrep = 0;
    var mostcp = '';
    for (var cp in this.copypastaCountHash) {
        if (cp.length > maxLength) {
            maxLength = cp.length;
            maxcp = cp;
        }
        if (this.copypastaCountHash[cp] > maxrep) {
            maxrep = this.copypastaCountHash[cp];
            mostcp = cp;
        }
    }

    emote = '<img src="http://static-cdn.jtvnw.net/emoticons/v1/' + emote +'/1.0">';
    var getURL = "https://api.twitch.tv/kraken/streams/" + this.channel.substring(1);
            var self = this;
    window.setTimeout(function() {

        $.get(getURL, function(response){
            var numTotalViewers = response['stream']['viewers'];
            if (numTotalViewers > self.maxViewers) {
                self.maxViewers = numTotalViewers;
            }
            self.updateTable(1, activeUser);
            self.updateTable(2, self.numComments);
            self.updateTable(3, self.numActiveViewers);
            self.updateTable(4, self.numEmoticons);
            self.updateTable(5, emote + ', ' + maxEmotes);
            self.updateTable(6, Object.keys(self.copypastaCountHash).length);
            self.updateTable(7, mostcp);
            self.updateTable(8, maxcp);
            self.updateTable(9, self.maxViewers); // max viewers
            self.updateTable(10, /* 0 */self.numActiveViewers/numTotalViewers*100 + '%'); // percentage active viewers
            self.updateTable(11, parseInt(self.messageTotalChars/self.numActiveViewers));
            self.updateTable(12, self.numEmoticons/self.numEmoticonPosters);
            // self.updateTable(13, 0); // uptime
        });
    }, 500);


}

chatClient.prototype.updateTable = function(indice, value) {
    var tableCode = 'r' + indice + this.code;
    document.getElementById(tableCode).innerHTML = value;
}

var HttpClient = function() {
    this.get = function(aUrl, aCallback) {
        var anHttpRequest = new XMLHttpRequest();
        anHttpRequest.onreadystatechange = function() {
            if (anHttpRequest.readyState == 4 && anHttpRequest.status == 200)
                aCallback(anHttpRequest.responseText);
        }

        anHttpRequest.open( "GET", aUrl, true );
        anHttpRequest.send( null );
    }
}