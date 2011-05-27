birch.addon = {
  enable: function(addon) {
    if (addon instanceof Array) {
      var i, len = addon.length;
      for (i=0; i<len; addon[i++].init());

    } else {
      addon.init();
    }
  }
};

