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

