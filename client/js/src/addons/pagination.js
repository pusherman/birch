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

