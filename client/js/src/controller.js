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

