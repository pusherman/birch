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

