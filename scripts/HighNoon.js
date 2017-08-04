var TriggerHelper = require('./lib/TriggerHelper.js');
var connectionHelper = require('./lib/ConnectionHelper.js');
var help = require('./lib/Help.js');
var messageHelper = require('./lib/MessageHelper.js');

var SessionInterface = require('./lib/highnoon/SessionInterface.js');
var PlayerInterface = require('./lib/highnoon/PlayerInterface.js');
var SessionStore = require('./lib/highnoon/SessionStore.js');
var GameEngine = require('./lib/highnoon/GameEngine.js');


help.setHelpCategory(
  'highnoon',
  'mcree\'s favorite time of the day',
  '&highnoon [number of players] - creates a session with optional specification of player count\n' +
  'ready - type this in when the game asks everyone to type ready to start the duel\n' +
  'BANG! <username> - shoots a player\n' +
  '&highnoon stats - display the game scores\n' +
  '&highnoon test - manually triggers draw time\n' +
  '&highnoon debug - debugging feature\n'
);

function Highnoon (robot) {
  var trigger = new TriggerHelper('highnoon');
  var SI = new SessionInterface();
  var PI = new PlayerInterface();
  var GE = new GameEngine();

  robot.hear(trigger.getTrigger(), function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = SI.createSession(channelId, person);
    GE.checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('(\\d+?)'), function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = SI.createSession(channelId, person, msg.match[1]);
    GE.checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('remove', '([\\s\\S]+?)'), function (msg) {
    var person = msg.match[1];
    var channelId = messageHelper.getChannelId(msg);
    var result = PI.removePlayer(channelId, person);
    GE.checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('test'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    GE.testDuel(msg, SessionStore[channelId]);
  });

  robot.hear(/DODGE! \w+$/i, function (msg) {
    var player = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var direction = msg.match[0].slice(7);
    GE.checkDodge(msg, SessionStore[channelId], player, direction);
  });

  robot.hear(/BANG! \w+ \w+$/i, function (msg) {
    var shooter = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var victim = msg.match[0].slice(6);
    var direction = msg.match[0].split(' ')[2];
    GE.checkShot(msg, SessionStore[channelId], channelId, shooter, victim, direction);
  });

  robot.hear(/BANG! \w+$/i, function (msg) {
    var shooter = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var victim = msg.match[0].slice(6);
    GE.checkShot(msg, SessionStore[channelId], channelId, shooter, victim);
  });

  robot.hear(/^BANG!$/, function (msg) {
    var shooter = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    GE.checkShot(msg, SessionStore[channelId], channelId, shooter);
  });

  robot.hear(/^ready$/, function (msg) {
    var player = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = GE.checkReady(msg, channelId, player);
    GE.checkSession(msg, result, channelId, player);
  });

  robot.hear(trigger.getTrigger('cancel'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    var result = SI.removeSession(msg, channelId);
    GE.checkSession(msg, result, channelId);
  });

  robot.hear(trigger.getTrigger('stats'), function (msg) {
    GE.showResults(msg);
  });

  robot.hear(trigger.getTrigger('time'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    GE.checkTime(msg, SessionStore[channelId], channelId);
  });

  robot.hear(trigger.getTrigger('debug'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    msg.reply('CURRENT SESSION INFORMATION:\n' + JSON.stringify(SessionStore[channelId]));
    msg.reply('\n\nIS SESSION FULL? ' + SessionStore[channelId].sessionIsFull());
    msg.reply('\n\nWHAT IS CURRENT NUMBER OF PLAYERS? ' + Object.keys(SessionStore[channelId].players).length);
    msg.reply('\n\nWHAT IS MAX PLAYERS? ' + SessionStore[channelId].getMaxPlayers());
  });
};

module.exports = Highnoon;