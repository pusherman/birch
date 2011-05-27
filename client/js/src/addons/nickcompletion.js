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

