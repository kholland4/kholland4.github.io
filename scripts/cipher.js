var Cipher = {};

Cipher.Message = class {
  constructor(u8arr=null) {
    if(u8arr != null) {
      this.data = u8arr;
    } else {
      this.data = new Uint8Array();
    }
    
    this.subscribers = {};
    this.nextSubID = 1;
  }
  
  update(newData, srcID) {
    if(newData != undefined)
      this.data = newData;
    
    for(var s of Object.keys(this.subscribers)) {
      if(srcID != null && srcID != undefined && s == "id" + srcID)
        continue;
      
      this.subscribers[s].callback();
    }
  }
  
  sub(callback) {
    var id = this.nextSubID;
    this.nextSubID++;
    
    this.subscribers["id" + id] = {
      callback: callback
    };
    
    return id;
  }
  
  unsub(id) {
    delete this.subscribers["id" + id];
  }
  
  static fromHex(s) {
    if(s.length % 2 != 0)
      s = "0" + s;
    
    var data = [];
    for(var i = 0; i < s.length; i += 2) {
      var hex = s.substr(i, 2);
      if(!hex.match(/^[0-9a-fA-F]{2}$/g))
        return null;
      
      var n = parseInt(hex, 16);
      data.push(n);
    }
    
    return new Cipher.Message(new Uint8Array(data));
  }
};

Cipher._Core = class {
  constructor() {
    //Classes that inherit from this are expected to initialize
    //this.messagesIn and this.messagesOut to something sensible, like:
    //  this.messagesIn = {A: null, B: null};
    //  this.messagesOut = {Q: null};
    
    this.messagesInSubID = {};
    this.messagesOutSubID = {};
  }
  
  link(what, message) {
    var where = null;
    var whereSubID = null;
    if(what in this.messagesIn) {
      where = this.messagesIn;
      whereSubID = this.messagesInSubID;
    } else if(what in this.messagesOut) {
      where = this.messagesOut;
      whereSubID = this.messagesOutSubID;
    }
    if(where == null)
      throw new Error("cannot link message to invalid 'what': " + what);
    
    if(where[what] != null) {
      where[what].unsub(whereSubID[what]);
      where[what] = null;
      whereSubID[what] = null;
    }
    
    where[what] = message;
    if(where == this.messagesIn) {
      whereSubID[what] = where[what].sub(this.update.bind(this));
    } else {
      whereSubID[what] = where[what].sub(function() {});
    }
    
    this.update();
    
    return this;
  }
  
  unlink(what) {
    var where = null;
    var whereSubID = null;
    if(what in this.messagesIn) {
      where = this.messagesIn;
      whereSubID = this.messagesInSubID;
    } else if(what in this.messagesOut) {
      where = this.messagesOut;
      whereSubID = this.messagesOutSubID;
    }
    if(where == null)
      throw new Error("cannot link message to invalid 'what': " + what);
    
    where[what].unsub(whereSubID[what]);
    where[what] = null;
    whereSubID[what] = null;
    
    this.update();
    
    return this;
  }
  
  update() {
    for(var what of Object.keys(this.messagesOut)) {
      if(this.messagesOut[what] == null)
        continue;
      
      var res = this.result(what);
      if(res == null)
        continue;
      
      this.messagesOut[what].update(res, this.messagesOutSubID[what]);
    }
  }
  
  result(what) {
    return null;
  }
};

Cipher.XOR = class extends Cipher._Core {
  constructor() {
    super();
    
    this.messagesIn = {A: null, B: null};
    this.messagesOut = {Q: null};
  }
  
  result(what) {
    if(what == "Q") {
      if(this.messagesIn.A == null)
        return null;
      
      if(this.messagesIn.B == null)
        return null;
      
      var dataA = this.messagesIn.A.data;
      var dataB = this.messagesIn.B.data;
      
      var out = new Uint8Array(Math.min(dataA.length, dataB.length));
      
      for(var i = 0; i < out.length; i++) {
        out[i] = dataA[i] ^ dataB[i];
      }
      
      return out;
    }
    
    return null;
  }
};

Cipher.calcXOR = function(m1, m2) {
  var out = new Uint8Array(Math.min(m1.data.length, m2.data.length));

  for(var i = 0; i < out.length; i++) {
    out[i] = m1.data[i] ^ m2.data[i];
  }
  
  return new Cipher.Message(out);
};
