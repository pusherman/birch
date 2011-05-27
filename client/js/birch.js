var birch = {};

birch.config = {
  serverHost: 'some.host.com',
  serverPort: 8090
};

birch.addon = {
  enable: function(addon) {
    if (addon instanceof Array) {
      var i, len = addon.length;
      for (i=0; i<len; addon[i++].init());

    } else {
      addon.init();
    }
  }
};

birch.addon.commandHistory = {
  commands: [],
  index: 0,

  add: function(cmd) {
    this.commands.push(cmd);
    this.index = this.commands.length;
  },

  next: function() {
    var idx = this.index === 0 ? 0 : --this.index;
    $(birch.ui.messageInput).val(this.commands[idx]);
  },

  prev: function() {
    var idx = this.index === this.commands.length ? this.commands.length : ++this.index;
    $(birch.ui.messageInput).val(this.commands[idx]);
  },

  init: function() {
    birch.event.register('sendingCommand', function(cmd) {
      birch.addon.commandHistory.add(cmd);
    });

    $(birch.ui.messageInput).keydown(function(e) {
      // up arrow pressed
      if (e.keyCode === 38) {
        e.preventDefault();
        birch.addon.commandHistory.next();

      // down arrow pressed
      } else if (e.keyCode === 40) {
        e.preventDefault();
        birch.addon.commandHistory.prev();
      }
    });
  }
};

birch.addon.messageIndicator = {
  origTitle: '',
  hasFocus: true,
  unreadMessages: 0,
  hasMention: false,

  newUnread: function() {
    if (this.hasFocus) { return; }
    ++this.unreadMessages;
    this.updateTitle();
  },

  newMention: function() {
    if (this.hasFocus) { return; }
    document.title = '! ' + document.title;
    this.hasMention = true;
  },

  updateTitle: function() {
    if (this.hasFocus) { return; }
    var newTitle = this.hasMention ? '! ' : '';
    document.title = newTitle += '(' + this.unreadMessages + ') ' + this.origTitle;
  },
  
  reset: function() {
    // work around for chrome
    setTimeout(function(title){  
      document.title = title;
    }, 250, this.origTitle);

    this.unreadMessages = 0;
    this.hasMention = false;
  },

  init: function() {
    this.origTitle = document.title;

    birch.event.register('hilight', function() {
      birch.addon.messageIndicator.newMention();
    });

    birch.event.register('messageRecieved', function() {
      birch.addon.messageIndicator.newUnread();
    });

    $(window).bind("focus", function() {
      birch.addon.messageIndicator.hasFocus = true; 
      birch.addon.messageIndicator.reset();
    });

    $(window).bind("blur", function() {
      birch.addon.messageIndicator.hasFocus = false;
    });
  }
};

birch.addon.nickCompletion = {
  nicks: [],
  matches: [],
  cycleMode: false,
  currentSuggestion: 0,
  left: '',
  right: '',

  suggest: function() {
    if (this.cycleMode === false) {
      this.parseInput();
    }

    if (this.matches.length > 0) {
      this.setInput(this.matches[this.currentSuggestion++ % this.matches.length]);
    }
  },

  parseInput: function() {
    var inputVal = $(birch.ui.messageInput).val();
    var cursorAt = $(birch.ui.messageInput).get(0).selectionStart;

    var nextSpace = inputVal.indexOf(' ', cursorAt);
    if (nextSpace === -1) {
      nextSpace = inputVal.length;
    }
    
    this.left = inputVal.slice(0, inputVal.lastIndexOf(' ', cursorAt - 1) + 1);
    this.right = inputVal.slice(nextSpace, inputVal.length);
    var suggest = inputVal.substr(this.left.length, inputVal.length - (this.left.length + this.right.length));

    this.cycleMode = true;    
    this.loadMatches(suggest);  
  },

  loadMatches: function(str) {
    var listLen = this.nicks.length,
        strLen = str.length,
        i = 0;

    for (i=0; i<listLen; ++i) {
      if ( str.toLowerCase() === this.nicks[i].substr(0, strLen).toLowerCase() ) {
        this.matches.push(this.nicks[i]);
      }
    }
  },

  setInput: function(suggest) {
    if (this.left === '' && this.right === '') {
      suggest += ': ';
    }
    $(birch.ui.messageInput).val(this.left + suggest + this.right + ' ');
  },

  reset: function() {
    this.matches = [];
    this.cycleMode = this.left = this.right = false;
  },

  init: function() {
    birch.event.register('userAdded', function(nicks) {
      var nick;
      for (nick in nicks) {
        if (nicks.hasOwnProperty(nick)) {
          birch.addon.nickCompletion.nicks.push(nick);
        }
      }
    });

    $(birch.ui.messageInput).keydown(function(e) {
      // tab key hit
      if (e.keyCode === 9) {
        e.preventDefault();
        birch.addon.nickCompletion.suggest();

      } else {
        birch.addon.nickCompletion.reset();
      }
    });
  }
};

/**
 * Page up when the P key is pressed
 * Page down with the N key is pressed
 */
birch.addon.pagination = {
  bottom: 0,

  pageUp: function() {
    this.bottom -= 50;
    console.log(this.bottom);
    $(birch.ui.messageWin).css('bottom', this.bottom + 'px');
  },

  pageDown: function() {
    this.bottom += 50;
    if (this.bottom > birch.ui.bottom) {
      this.bottom = birch.ui.bottom;
    }

    $(birch.ui.messageWin).css('bottom', this.bottom + 'px');
  },

  init: function() {
    this.bottom = birch.ui.bottom;

    $(window).keydown(function(e) {
      if (e.srcElement.id === $(birch.ui.messageInput).attr('id')) {
        return;
      }
      // p key pressed
      if (e.keyCode === 80) {
        birch.addon.pagination.pageUp();

      // n key pressed
      } else if (e.keyCode == 78) {
        birch.addon.pagination.pageDown();
      }
    });
  }
};

birch.event = {
  reg: {},
  register: function(event, action) {
    this.reg[event] = action;
  },

  trigger: function(event, param) {
    if (this.reg[event] === undefined) {
      return;
    }
    this.reg[event](param);
  }
};

birch.connection = {
  socket: null,

  open: function(host, port) {
    this.socket = new io.Socket(host, { port: port });
    this.socket.connect();
  },

  register: function(ciph, vector) {
    this.socket.send(JSON.stringify({
      action: 'auth',
      data: {
        iv: vector,
        text: ciph
      }
    }));
  },

  onMessage: function(handler) {
    this.socket.on('message', handler);
  }
};

birch.controller = {
  recieveMessage: function(data) {
    var message = JSON.parse(data);

    switch(message.action) {
      case 'newChat':
        birch.ui.messageWindow.addLine(message.data.by, message.data.msg);
        birch.event.trigger('messageRecieved', message.data);

        if (message.data.msg.indexOf(birch.ui.messageWindow.hilight) !== -1) {
          birch.event.trigger('hilight');
        }

        break;

      case 'addUsers':
        birch.ui.loading(false);
        birch.ui.userList.addUsers(message.data);
        birch.event.trigger('userAdded', message.data);
        break;

      case 'removeUser':
        birch.ui.userList.removeUser(message.data);
        birch.event.trigger('userRemoved', message.data);
        break;
    }
  },

  sendMessage: function(msg) {
    birch.event.trigger('sendingCommand', msg);

    if (msg.substr(0,4) === '/me ') {
      msg = msg.substr(4, msg.length);
      msg = String.fromCharCode(1) + 'ACTION ' + msg + String.fromCharCode(1);
    }

    birch.connection.socket.send(JSON.stringify({ 
      action: 'say',
      data: msg
    }));

    $(birch.ui.messageInput).val('');
  }
};

birch.ui = {
  messageInput: '#words',
  sendButton: '#send',
  loadingOverlay: '#overlay',
  userWin: '#users',
  messageWin: '#chats',
  chatBar: '#chatbox',
  bottom: 65,

  unavailableMsg: 'service is currently unavalable...',

  disable: function() {
    $(this.messageInput).attr('disabled', 'true');
    $(this.sendButton).attr('disabled', 'true');
    $(this.messageInput).val(this.unavailableMsg);
  },

  enable: function() {
    $(this.messageInput).attr('disabled', '');
    $(this.sendButton).attr('disabled', '');
    $(this.messageInput).val('');
  },

  loading: function(status) {
    if (status === true) {
      $(this.loadingOverlay).show();
    } else {
      $(this.loadingOverlay).hide();
    }
  },

  attachListeners: function() {
    $(this.messageInput).keydown(function(e) {
      if (e.keyCode === 13) {
        birch.controller.sendMessage($(birch.ui.messageInput).val());
      }
    });

    $(this.sendButton).click(function() {
      birch.controller.sendMessage($(birch.ui.messageInput).val());
      $(birch.ui.messageInput).focus(); 
    });  
  }
};

// handle rendering of the message window
birch.ui.messageWindow = {
  parent: birch.ui,
  id: null,
  messages: 0,
  hilight: null,
  bufferSize: 50,
  
  urlify: function(text) {
    return text.replace(/(https?:\/\/[^\s]+)/g, function(url) {
      return '<a target="_blank" href="' + url + '">' + url + '</a>';
    });
  },

  ts: function() {
    var d = new Date();

    var h = d.getHours();
    var m = d.getMinutes();

    if (h < 10) { h = '0' + h; }
    if (m < 10) { m = '0' + m; }

    return h + ':' + m;
  },

  addLine: function(by, msg){
    var elLine = $('<div class="chatline" />');
    var elTs = $('<span class="ts">').text(this.ts());
    var elBy, elMsg;

    if (msg.charCodeAt(0) === 1) {
      elBy = $('<span class="action" />').text(' * ' + by + ' ');
      msg = msg.substr(7, msg.length);

    } else {
      elBy = $('<span class="by" />').text(' <' + by + '> ');
    }

    if (msg.indexOf(this.hilight) !== -1) {
      elBy.addClass('hilight');

    } else if (by === this.hilight) {
      elBy.addClass('me');
    }

    elMsg = $('<span class="msg">').text(msg);
    //todo: find way to do this w/out allowing xss
    //elMsg.html(this.urlify(elMsg.text()));
    elLine.append(elTs).append(elBy).append(elMsg);

    $(this.parent.messageWin).append(elLine);

    if (++this.messages > this.bufferSize) {
      $('.chatline').first().remove();
    }
  }
};



// handling updating the user bar
birch.ui.userList = {
  parent: birch.ui,
  statusOrder: ['~', '&', '@', '%', '+', 'r'],
  users: {},

  // add some users to the user list
  addUsers: function(users) {
    var nick;
    for (nick in users) {
      if (users.hasOwnProperty(nick) && nick.length > 1) {
        var status = (users[nick].length === 0) ? 'r' : users[nick];

        if (this.users[status] !== undefined) {
          this.users[status].push(nick);
        } else {
          this.users[status] = [nick];
        }
      }
    }

    this.renderList();
  },

  // remove a user from our list
  removeUser: function(nick) {
    var user = this.findUser(nick);
    if (user.index !== undefined) {
      this.users[user.status].splice(user.index, 1);
      $('#' + nick).remove();
    }
  },

  // find a user based on nick
  findUser: function(nick) {
    var i, j,
        status, 
        len = this.statusOrder.length;

    for (i=0; i<len; ++i) {
      status = this.statusOrder[i];
      if (this.users[status] !== undefined) {
        for (j=0; j<this.users[status].length; ++j) {
          if ( this.users[status][j] === nick ) {
            return {status: status, index: j};
          }
        }
      }
    }

    return false;
  },

  // draw the user list
  renderList: function() {
    $(this.parent.userWin + ' li').remove();
    var i, j,
        status,
        len = this.statusOrder.length;

    for (i=0; i<len; ++i) {
      status = this.statusOrder[i];
      if (this.users[status] !== undefined) {
        this.users[status].sort();
        for (j=0; j<this.users[status].length; ++j) {
          this.renderUser(status, this.users[status][j]);
        }
      }
    }
  },

  // draw a user on the user list
  renderUser: function(status, nick) {
    if (status === 'r') { status = ''; }
    var elLi = $('<li>').attr('id', nick);
    $(this.parent.userWin).append(elLi.text(status + nick));
  }
};

$(function() {
  birch.ui.disable();

  birch.connection.open(birch.config.serverHost, birch.config.serverPort);

  birch.ui.enable();
  birch.ui.loading(true);
  birch.ui.messageWindow.hilight = $('#hilight').val();

  birch.connection.register($('#auth').val(), $('#iv').val());
  birch.connection.onMessage(birch.controller.recieveMessage);

  birch.ui.attachListeners();

  //enable any addons
  birch.addon.enable([
    birch.addon.commandHistory,
    birch.addon.nickCompletion,
    birch.addon.messageIndicator,
    birch.addon.pagination
  ]);
});

