var TriggerHelper = require('./lib/TriggerHelper.js');
var connectionHelper = require('./lib/ConnectionHelper.js');
var help = require('./lib/Help.js');
var messageHelper = require('./lib/MessageHelper.js');

var UserInterface = require('./lib/highnoon/UserInterface.js');
var SessionStore = require('./lib/highnoon/SessionStore.js');
var GameEngine = require('./lib/highnoon/GameEngine.js');


help.setHelpCategory(
  'highnoon',
  'mcree\'s favorite time of the day',
  '/highnoon test - hello world message\n' +
  '/highnoon - use mcree\'s ultimate\n' +
  '/highnoon spin - spins the barrel\n' +
  '/highnoon stats - display the game scores'
);

function Highnoon (robot) {
  var trigger = new TriggerHelper('highnoon');
  var UI = new UserInterface();
  var GE = new GameEngine();

  robot.hear(trigger.getTrigger(), function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = UI.createSession(SessionStore[channelId], channelId, person);
    UI.checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('(\\d+?)'), function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = UI.createSession(SessionStore[channelId], channelId, person, msg.match[1]);
    UI.checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('removePlayer', '([\\s\\S]+?)'), function (msg) {
    var person = msg.match[1];
    var channelId = messageHelper.getChannelId(msg);
    var result = UI.removePlayer(channelId, person);
    UI.checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('test'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    GE.testDuel(msg, SessionStore[channelId]);
  });

  robot.hear(/BANG!/i, function (msg) {
    var shooter = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    GE.checkShot(msg, SessionStore[channelId], channelId, shooter);
  });

  robot.hear(trigger.getTrigger('cancel'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    UI.removeSession(msg, channelId);
  });

  robot.hear(trigger.getTrigger('time'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    GE.checkTime(msg, SessionStore[channelId], channelId);
  });
};

module.exports = Highnoon;