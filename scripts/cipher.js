var Cipher = {};

Cipher.Message = class {
  constructor(u8arr) {
    this.data = u8arr;
    
    this.subscribers = {};
    this.nextSubID = 1;
  }
  
  update(newData, srcID) {
    this.data = newData;
    for(var s of Object.keys(this.subscribers)) {
      if(s == "id" + srcID)
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
}
