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

