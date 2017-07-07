var MessageHelper = function() {
  this.getPerson = function(msg) {
    return msg.message.user.mention_name || msg.message.user.name;
  }

  this.getMessageObj = function(msg) {
    return msg.message;
  }
  
  this.getChannelId = function(msg) {
    return msg.message.room;
  }
}

MessageHelper.instance = null;

MessageHelper.getInstance = function() {
  if(this.instance === null){
      this.instance = new MessageHelper();
  }

  return this.instance;
}


module.exports = MessageHelper.getInstance();
