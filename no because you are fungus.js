if (autoModerator !== undefined)
  autoModerator.close()

String.prototype.equalsIgnoreCase     = function(other)    { return typeof other !== 'string' ? false : this.toLowerCase() === other.toLowerCase(); };
var autoModeratorModel = require('app/base/Class').extend({
  version: "1.0.3",
	skipWords: [
		'skip pls',
		'skip please',
		'skip plz',
		'skip this shit',
		'skip this fucking shit'
	],
	fanWords: [
		'fan me',
		'fun me',
		'become my fan',
		'troco fa',
		'fan for fan',
		'fan 4 fan',
		'fan4fan',
		'fun4fun',
		'fun 4 fun',
		'virem meu fa',
		'is now your fan',
		'reciprocate',
		'fans me',
		'give fan',
		'fan plz',
		'fan pls',
		'pls fan',
		'plz fan',
		'become fan',
		'trade fan',
		'fan i fan',
		'be my fan',
    'fuck ambassadors'
	],
	whiteList: [
		'http://plug.dj/terms',
		'http://plug.dj/privacy',
		'http://plug.dj/about'
	],
	mutedUsers: [],
	init: function() {
		this.proxy = {
			chat:        $.proxy(this.onChat,          this),
			chatCommand: $.proxy(this.onChatCommand,   this),
		}
		API.on(API.CHAT,          this.proxy.chat);
		API.on(API.CHAT_COMMAND,  this.proxy.chatCommand);
		console.log('AutoModerator version ' + this.version + ' now running!')
	},
	close: function() {
		API.off(API.CHAT,          this.proxy.onChat);
		API.off(API.CHAT_COMMAND,  this.proxy.onChatCommand);
		console.log('AutoModerator version ' + this.version + ' now stopped!')
	},
	onChat:function(data) {
		if (this.mutedUsers.indexOf(data.fromID) > -1)
			API.moderateDeleteChat(data.chatID);
		else if (data.type === 'emote') {
			API.moderateDeleteChat(data.chatID)
			API.sendChat('@' + data.from + ', please don\'t use yellow text.')
		} else {
			var message = data.message.toLowerCase();
			for (var i in this.skipWords) {
				if (message.indexOf(this.skipWords[i].toLowerCase()) > -1) {
					API.moderateDeleteChat(data.chatID)
					API.sendChat('@' + data.from + ', please don\'t ask for skips.')
				}
			}
			for (var i in this.fanWords) {
				if (message.indexOf(this.fanWords[i].toLowerCase()) > -1) {
					API.moderateDeleteChat(data.chatID)
					API.sendChat('@' + data.from + ', please don\'t ask for fans.')
				}
			}
			if (message.indexOf('http://adf.ly/') > -1) {
				API.moderateDeleteChat(data.chatID)
				API.sendChat('@' + data.from + ', please change your autowoot program.')
			}
			if (message.indexOf('http://plug.dj/') > -1) {
				var woop = false
				for (var i in this.whiteList) {
					if (message.indexOf(this.whiteList[i].toLowerCase()) > -1) {
						var woop = true
						break
					}
				}
				if (woop == false) {
					API.moderateDeleteChat(data.chatID)
					API.sendChat('@' + data.from + ', don\'t put room links in the chat you ass clown.')
				}
			}
		}
	},
	onChatCommand: function(value) {
		if (value.indexOf('/skipword') === 0) {
			var a = value.substr(9)
			if (this.skipWords.indexOf(a) < 0) {
				this.skipWords.push(a)
				API.chatLog(a + ' added to skip words list')
			} else {
				this.skipWords.splice(this.skipWords.indexOf(a),1)
				API.chatLog(a + ' removed from skip words list')
			}
		}
		if (value.indexOf('/fanword') === 0) {
			var a = value.substr(8)
			if (this.fanWords.indexOf(a) < 0) {
				this.fanWords.push(a)
				API.chatLog(a + ' added to fan words list')
			} else {
				this.fanWords.splice(this.skipwords.indexOf(a),1)
				API.chatLog(a + ' removed from fan words list')
			}
		}	
		if (value.indexOf('/mute') === 0) {
			var user = this.getUserID(value.substr(5))
			if (user === null) API.chatLog('user not found!')
			else {
				this.mutedUsers.push(user.id)
				API.chatLog(user.username + ' added to muted users list')
			}
		}
		if (value.indexOf('/unmute') === 0) {
			var user = this.getUserID(value.substr(7))
			if (user === null) API.chatLog('user not found!')
			else if (this.mutedUsers.indexOf(user.id) > -1) {
				this.mutedUsers.splice(this.mutedUsers.indexOf(user.id), 1);
				API.chatLog(user.username + ' removed from muted users list')
			}
		}
	},
	getUserID: function(data) {
    	data = data.trim();
        if (data.substr(0,1) === '@')
            data = data.substr(1);
            var users = API.getUsers();
            for (var i in users) {
                if (users[i].username.equalsIgnoreCase(data) || users[i].id.equalsIgnoreCase(data))
                    return users[i];
            }
            return null;
        }
});
var autoModerator = new autoModeratorModel();
