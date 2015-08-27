// This Library sole purpose is to prevent smartasses to abuse the bot

String.prototype.endsWith = function(suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.startsWith = function(searchString, position) {
  position = position || 0;
  return this.indexOf(searchString, position) === position;
};

var AntiWeasel = function() {
  var isKarmaString = function(message) {
    var msg = message.trim();
    return (msg.endsWith('++') || msg.endsWith('--') || msg.startsWith('++') || msg.startsWith('--'));
  };

  this.check = function(message) {
    return !isKarmaString(message);
  };
};

module.exports = AntiWeasel;
