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

