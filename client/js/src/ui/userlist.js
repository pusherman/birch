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

