birch.event = {
  reg: {},
  register: function(event, action) {
    this.reg[event] = action;
  },

  trigger: function(event, param) {
    if (this.reg[event] === undefined) {
      return;
    }
    this.reg[event](param);
  }
};

