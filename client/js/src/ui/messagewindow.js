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



