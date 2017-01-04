var MessageHelper = function() {
  this.getPerson = function(msg) {
    return msg.message.user.mention_name || msg.message.user.name;
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
