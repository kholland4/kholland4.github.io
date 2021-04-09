var CipherDisplay = {};

CipherDisplay.charset = [
  // ASCII control codes, displayed nicely -- https://en.wikipedia.org/wiki/Control_Pictures
  '\u2400', '\u2401', '\u2402', '\u2403', '\u2404', '\u2405', '\u2406', '\u2407',
  '\u2408', '\u2409', '\u240a', '\u240b', '\u240c', '\u240d', '\u240e', '\u240f',
  '\u2410', '\u2411', '\u2412', '\u2413', '\u2414', '\u2415', '\u2416', '\u2417',
  '\u2418', '\u2419', '\u241a', '\u241b', '\u241c', '\u241d', '\u241e', '\u241f',
  
  // Printable ASCII + DEL (127)
  ' ', '!', '"', '#', '$', '%', '&', '\'', '(', ')', '*', '+', ',',  '-', '.', '/',
  '0', '1', '2', '3', '4', '5', '6', '7',  '8', '9', ':', ';', '<',  '=', '>', '?',
  '@', 'A', 'B', 'C', 'D', 'E', 'F', 'G',  'H', 'I', 'J', 'K', 'L',  'M', 'N', 'O',
  'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W',  'X', 'Y', 'Z', '[', '\\', ']', '^', '_',
  '`', 'a', 'b', 'c', 'd', 'e', 'f', 'g',  'h', 'i', 'j', 'k', 'l',  'm', 'n', 'o',
  'p', 'q', 'r', 's', 't', 'u', 'v', 'w',  'x', 'y', 'z', '{', '|',  '}', '~', '\u2421'
  
  // Other byte values will be shown with \u00b7 Middle Dot
];

CipherDisplay.hexChars = [
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'
];

// Some sensible default colors
CipherDisplay.white = "white";
CipherDisplay.green = "palegreen";
CipherDisplay.yellow = "palegoldenrod";
CipherDisplay.red = "palevioletred";

/*
 *   CipherDisplay.Colored, CipherDisplay.Plain:
 *   for displaying a Cipher.Message as text or hexadecimal
 *
 *   Basic usage:
 *     var x = new CipherDisplay.Plain({hex: true}).link(yourMessage);
 *     something.appendChild(x.dom());
 *
 *   CipherDisplay.Colored has an additional ".colors" array
 *   indicating which CSS color to use for which data index in the message.
 *
 *   Both auto-update from and to the .link()ed message
 *   (use .unlink() to clean up when you're done).
 */

CipherDisplay._Core = class {
  constructor(options) {
    this.message = null;
    this.messageSubID = null;
    
    this.hex = false;
    if(options != null) {
      Object.assign(this, options);
    }
    
    this._dom = document.createElement("span");
    this._dom.style.fontFamily = "monospace";
    this._dom.style.whiteSpace = "pre-wrap";
    this._dom.style.wordWrap = "break-word";
    this._dom.style.color = "black";
  }
  
  from(message) {
    this.message = message;
    this.update();
    return this;
  }
  
  link(message) {
    if(this.message != null) {
      this.unlink();
    }
    
    this.message = message;
    this.messageSubID = this.message.sub(this.update.bind(this));
    
    this.update();
    
    return this;
  }
  
  unlink() {
    this.message.unsub(this.messageSubID);
    this.message = null;
    this.messageSubID = null;
    
    this.update();
    
    return this;
  }
  
  hexString() {
    if(this.message == null)
      return "";
    
    var s = "";
    for(var d of this.message.data) {
      s += CipherDisplay.hexChars[Math.floor(d / 16)];
      s += CipherDisplay.hexChars[d % 16];
    }
    
    return s;
  }
  
  update() {
    
  }
  
  dom() {
    this.update();
    return this._dom;
  }
};

CipherDisplay.Colored = class extends CipherDisplay._Core {
  constructor(options=null) {
    super(options);
    
    this.colors = [];
  }
  
  update() {
    while(this._dom.firstChild)
      this._dom.removeChild(this._dom.firstChild);
    
    if(this.message == null)
      return;
    
    if(this.calcColors != undefined) {
      this.colors = this.calcColors(this.message.data, this.colors);
    }
    
    var data = this.message.data;
    
    // {color, length} pairs of consecutive indices that have the same color
    var groups = [];
    var currGroupIndex = -1;
    for(var i = 0; i < data.length; i++) {
      var c = this.colors[i];
      if(c == undefined) {
        c = CipherDisplay.white;
      }
      
      var currColor = currGroupIndex >= 0 ? groups[currGroupIndex].color : null;
      if(c == currColor) {
        groups[currGroupIndex].length++;
      } else {
        groups.push({color: c, length: 1});
        currGroupIndex = groups.length - 1;
      }
    }
    
    // Make and append <span>s for each color section
    var idx = 0;
    for(var n = 0; n < groups.length; n++) {
      var c = groups[n].color;
      var len = groups[n].length;
      
      var segment = document.createElement("span");
      segment.style.backgroundColor = c;
      
      // Look up data values and append them one at a time
      for(var i = 0; i < len; i++) {
        var d = data[idx];
        
        if(this.hex) {
          segment.innerText += CipherDisplay.hexChars[Math.floor(d / 16)];
          segment.innerText += CipherDisplay.hexChars[d % 16];
        } else {
          var char = CipherDisplay.charset[d];
          if(char != undefined) {
            segment.innerText += char;
          } else {
            segment.innerText += "\u00b7"; // "Middle Dot"
          }
        }
        idx++;
      }
      
      this._dom.appendChild(segment);
    }
  }
};

CipherDisplay.Plain = class extends CipherDisplay._Core {
  constructor(options=null) {
    super(options);
  }
  
  update() {
    while(this._dom.firstChild)
      this._dom.removeChild(this._dom.firstChild);
    
    if(this.message == null)
      return;
    
    var data = this.message.data;
    
    for(var d of data) {
      if(this.hex) {
        this._dom.innerText += CipherDisplay.hexChars[Math.floor(d / 16)];
        this._dom.innerText += CipherDisplay.hexChars[d % 16];
      } else {
        var char = CipherDisplay.charset[d];
        if(char != undefined) {
          this._dom.innerText += char;
        } else {
          this._dom.innerText += "\u00b7"; // "Middle Dot"
        }
      }
    }
  }
};

/*
 *   CipherDisplay.Input.Plain, CipherDisplay.Input.Hex:
 *   for accepting user input
 *
 *   Basic usage:
 *     var x = new CipherDisplay.Input.Plain().link(yourMessage);
 *     something.appendChild(x.dom());
 *
 *   CipherDisplay.Input.Hex takes hex input & will color itself
 *   red upon invalid input
 *
 *   Both auto-update from and to the .link()ed message
 *   (use .unlink() to clean up when you're done).
 */

CipherDisplay.Input = {};

CipherDisplay.Input._Core = class {
  constructor(options) {
    this.message = null;
    this.messageSubID = null;
    
    this.placeholder = "";
    this.onchange = function() {};
    
    if(options != null) {
      Object.assign(this, options);
    }
    
    this._dom = document.createElement("input");
    this._dom.style.fontFamily = "monospace";
    this._dom.style.whiteSpace = "pre-wrap";
    this._dom.style.color = "black";
    
    this._dom.placeholder = this.placeholder;
    
    this.badInput = false;
    
    var updateFn = function() {
      var val = this.value();
      
      if(this.message != null) {
        this.message.update(val, this.messageSubID);
      }
      
      // this.badInput is only updated after querying this.value()
      if(this.badInput && this._dom.style.backgroundColor != CipherDisplay.red) {
        this._dom.style.backgroundColor = CipherDisplay.red;
      }
      if(!this.badInput && this._dom.style.backgroundColor != "") {
        this._dom.style.backgroundColor = "";
      }
      
      this.onchange();
    }.bind(this);
    this._dom.onchange = updateFn;
    this._dom.oninput = updateFn;
  }
  
  link(message) {
    if(this.message != null) {
      this.unlink();
    }
    
    this.message = message;
    this.messageSubID = this.message.sub(this.update.bind(this));
    
    this.update();
    
    return this;
  }
  
  unlink() {
    this.message.unsub(this.messageSubID);
    this.message = null;
    this.messageSubID = null;
    
    this.update();
    
    return this;
  }
  
  update() {
    this.setValue(this.message.data);
  }
  
  dom() {
    return this._dom;
  }
  
  value() {
    var s = this._dom.value;
    var data = [];
    for(var ch of s) {
      data.push(ch.charCodeAt(0));
    }
    return new Uint8Array(data);
  }
  
  setValue(data) {
    var s = "";
    for(var d of data) {
      s += String.fromCharCode(d);
    }
    this._dom.value = s;
  }
  
  length() {
    return this._dom.length;
  }
};

CipherDisplay.Input.Plain = class extends CipherDisplay.Input._Core {
  constructor(options=null) {
    super(options);
  }
};

CipherDisplay.Input.Hex = class extends CipherDisplay.Input._Core {
  constructor(options=null) {
    super(options);
  }
  
  value() {
    var s = this._dom.value;
    
    // Unusual behavior -- normally input is padded from the front --
    // but this works better for stuff being typed
    if(s.length % 2 != 0)
      s = s + "0";
    
    this.badInput = false;
    
    var data = [];
    for(var i = 0; i < s.length; i += 2) {
      var hex = s.substr(i, 2);
      if(!hex.match(/^[0-9a-fA-F]{2}$/g)) {
        hex = "00";
        this.badInput = true;
      }
      
      var n = parseInt(hex, 16);
      data.push(n);
    }
    
    return new Uint8Array(data);
  }
  
  setValue(data) {
    //TODO: be carefully non-intrusive and match case etc. of existing value
    
    var s = "";
    for(var d of data) {
      s += CipherDisplay.hexChars[Math.floor(d / 16)];
      s += CipherDisplay.hexChars[d % 16];
    }
    
    this._dom.value = s;
  }
  
  length() {
    return Math.ceil(this._dom.length / 2);
  }
};
