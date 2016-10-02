/*
    This file is what connects to chat and parses messages as they come along. The chat client connects via a 
    Web Socket to Twitch chat. The important part events are onopen and onmessage.
*/
/* global variables, used to update stats */
var userCommentHash = {};
var copypastaCountHash = {};
var emoticonCountHash = {};
var numActiveViewers = 0;
var numComments = 0;
var numEmoticons = 0;



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
		console.log(message.data);
        var parsed = this.parseMessage(message.data);
        if(parsed !== null){
			console.log(parsed);
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
        username: null
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
        parsedMessage.messageLength = message.length - 1;
        // update emoticons
    }

    if(parsedMessage.command !== 'PRIVMSG'){
        parsedMessage = null;
    }

    return parsedMessage;
}

chatClient.prototype.updateInfo(parsedMessage) {
    numComments++;
    var user = parsedMessage[username];
    if (userCommentHash.hasOwnProperty(user)) {
        userCommentHash[user]++;
    }
    else {
        userCommentHash[user] = 1;
        numActiveViewers++;
    }

    var message = parsedMessage[message].substring(0, parsedMessage[message].length - 1);
    if (messageLength >= 100) {
        if (copypastaCountHash.hasOwnProperty(message)) {
            copypastaCountHash[message]++;
        }
        else {
            copypastaCountHash[message] = 1;
        }
    }

    for (var emote in emoticons) {
        if (emoticonCountHash.hasOwnProperty(emote)) {
            emoticonCountHash[emote] += emoticons[emote];
        }
        else {
            emoticonCountHash[emote] = emoticons[emote];
        }
        numEmoticons += emoticons[emote];
    }

    var maxComments = 0;
    var activeUser;
    for (var user in userCommentHash) {
        if (userCommentHash[user] > maxComments) {
            maxComments = userCommentHash[user];
            activeUser = user;
        }
    }

    this.updateTable(1, activeUser);
    this.updateTable(2, numComments);
    this.updateTable(3, numActiveViewers);
    

}

chatClient.prototype.updateTable (indice, value) {
    var tableCode = 'r' + indice + this.code;
    document.getElementById(tableCode).src = value;
}
