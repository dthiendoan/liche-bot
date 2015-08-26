var RemindMe = function (robot) {
  var timeoutMap;

  var decodeDuration = function(value, durationString) {
    var maxDuration = 432000000;
    var durationMultiplier;

    switch (durationString) {
      case 'minute':
      case 'minutes':
        durationMultiplier = 60000;
        break;
      case 'hour':
      case 'hours':
        durationMultiplier = 3600000;
        break;
      case 'day':
      case 'days':
        durationMultiplier = 86400000;
        break;
      default:
        throw "Cannot recognize the duration";
    }

    var resultDuration = value * durationMultiplier;
    if (resultDuration > maxDuration) {
      throw "Please enter a duration smaller than 5 days."
    }

    return resultDuration;
  }


  robot.hear(/^\/remind me\s+(.+?)\s+in\s+(\d+)\s*([a-zA-Z]+)\s*$/, function (msg) {
    try {
      var message = msg.match[1];
      var duration = decodeDuration(parseInt(msg.match[2]), msg.match[3]);    
    } catch (err) {
      msg.reply(err);
      return;
    }
    msg.reply('aye!');
    console.log(duration);
    setTimeout(function() {msg.reply(message);}, duration);
  });
};

module.exports = RemindMe;
