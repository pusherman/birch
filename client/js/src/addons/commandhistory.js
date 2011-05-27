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

