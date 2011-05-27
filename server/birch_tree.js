// includes
var http = require('http'),
    io = require('socket.io'),
    irc = require('irc'),
    crypto = require('crypto');

// config
var config = {
  // port the irc proxy will listen on
  port: 8090,

  // if pm'd to a birch user, they will automatically disconnect
  disconnectKey: '39j19jajfaa9ja!@@1jf',

  // key used to pass data from the client to the server
  encrypt: {
    key: '29fh1kjf23f9fjafj93f9afa', 
  },

  // irc settings
  irc: {
    server: '',
    channel: '',
    realName: 'Birch User',
  },
};


// handle sending and recieving of encrypted messages
var EncryptedMessage = {
  method: 'des-ede3-cbc',
  hmacAlgo: 'sha1',
  hmacLength: '40',
  base: 'hex',
  charset: 'utf8',
  key: config.encrypt.key,

  encrypt: function(text, iv) {
    var cipher=(new crypto.Cipher).initiv(this.method, this.key, iv);
    var ciph=cipher.update(plaintext, this.charset, this.base); 
    return ciph += cipher.final(this.base);
  },

  decrypt: function(ciph, iv) {
    var decipher=(new crypto.Decipher).initiv(this.method, this.key, iv);
    var message = decipher.update(ciph, this.base, this.charset);
    message += decipher.final(this.charset);

    var text = message.slice(0, this.hmacLength * -1);
    var hmac = message.substr(this.hmacLength * -1);

    return this.genHmac(text) == hmac ? text : false;
  },

  genHmac: function(text) {
    return (new crypto.Hmac).init(this.hmacAlgo, this.key).update(text).digest(this.base);
  },
}


// array of all logged in users
var users = new Array();

// @todo: clean this up
function disconnect(session) {
  if (users[session] != undefined) {
    users[session].disconnect('bai');
    users[session] = undefined;  
  }
}

// array to hold all the current users
// in the channel
var channelUsers = new Array();

var serverMessage = '<p>When I see birches bend to left and right<br />' +
                    'Across the lines of straighter darker trees,<br />' +
                    'I like to think some boy&apos;s been swinging them.<br />' +
                    'But swinging doesn&apos;t bend them down to stay.</p>';

// start the server
var server = http.createServer(function(req, res){
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(serverMessage);
});

server.listen(config.port);

// may want to catch errors here
// and reconnect
var socket = io.listen(server);

// open the socket
socket.on('connection', function(client) {

  // any unexpected errors, disconnect
  client.on('error', function() {
    disconnect(this.sessionId);
  });

  // handle recieved messages
  client.on('message', function(data) {
    event = JSON.parse(data);
    var session = this.sessionId;
    
    // user authorization
    if (event.action == 'auth') {
      var nick = EncryptedMessage.decrypt(event.data.text, event.data.iv);
      if (nick == false)
        return;

      // create the irc client for the user
      ircHandle = new irc.Client(config.irc.server, nick, {
        userName: 'webirc',
        realName: config.irc.realName,
        autoRejoin: false,
        channels: [ config.irc.channel ],
      });

      // handle any crazy irc exceptions
      ircHandle.on('error', function() {
        disconnect(session);
      });

      // send any messages from our channel back to the client
      ircHandle.addListener('message' + config.irc.channel, function (from, message) {
        client.send(JSON.stringify({
          action: 'newChat',
          data: {
            by: from, 
            msg: message
          }
        }));
      });      
      
      // check for disconnect key on pm
      ircHandle.addListener('pm', function (from, message) {
        if (message == config.disconnectKey) {
          users[session].disconnect('i was bad :(');
          users[session] = undefined;
        }
      });

      // check for disconnect key on pm
      ircHandle.addListener('part' + config.irc.channel, function (user, reason) {
        client.send(JSON.stringify({
          action: 'removeUser',
          data: user,
        }));
      });

      // check for disconnect key on pm
      ircHandle.addListener('quit', function (user, reason, channels) {
        client.send(JSON.stringify({
          action: 'removeUser',
          data: user,
        }));
      });

      // check for disconnect key on pm
      ircHandle.addListener('join' + config.irc.channel, function (nick) {
        if (nick == users[session].nick) return;

        var user = {};
        user[nick] = '';

        client.send(JSON.stringify({
          action: 'addUsers',
          data: user,
        }));
      });

      // build a list of useres
      ircHandle.addListener('names', function (channel, users) {
        client.send(JSON.stringify({
          action: 'addUsers',
          data: users,
        }));
      });
      
      // disconnect on kick
      ircHandle.addListener('kick', function (channel, who, by, message) {
        if (who == this.nick) {
          users[session].disconnect('bai');
          users[session] = undefined;
        }
      });

      users[session] = ircHandle;

    // relay message to IRC
    } else if (event.action == 'say') {
      if ( ! event.data) return;
      if (users[this.sessionId] != undefined) {
        users[this.sessionId].say(config.irc.channel, event.data);
        client.send(JSON.stringify({
          action: 'newChat',
          data: { by: users[this.sessionId].nick, msg: event.data }
        }));
      }
    }
  })

  // clean up auth on disconnect
  client.on('disconnect', function() {
    disconnect(this.sessionId);
  })
});
