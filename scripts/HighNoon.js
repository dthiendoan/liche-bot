import TriggerHelper from './lib/TriggerHelper';
import connectionHelper from './lib/ConnectionHelper';
import help from './lib/Help';
import messageHelper from './lib/MessageHelper';

import { createSession, removeSession, checkSession, addPlayer, removePlayer } from './lib/UserInterface';
import { testDuel, checkShot, checkTime } from './lib/highnoon/GameEngine';


help.setHelpCategory(
  'highnoon',
  'mcree\'s favorite time of the day',
  '/highnoon test - hello world message\n' +
  '/highnoon - use mcree\'s ultimate\n' +
  '/highnoon spin - spins the barrel\n' +
  '/highnoon stats - display the game scores'
);

export function Highnoon (robot) {
  var trigger = new TriggerHelper('highnoon');
  var sessionStore = {};

  robot.hear(trigger.getTrigger(), function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = createSession(sessionStore[channelId], channelId, person);
    checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('(\\d+?)'), function (msg) {
    var person = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    var result = createSession(sessionStore[channelId], channelId, person, msg.match[1]);
    checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('removePlayer', '([\\s\\S]+?)'), function (msg) {
    var person = msg.match[1];
    var channelId = messageHelper.getChannelId(msg);
    var result = removePlayer(msg, sessionStore[channelId], channelId, person);
    checkSession(msg, result, channelId, person);
  });

  robot.hear(trigger.getTrigger('test'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    testDuel(msg, sessionStore[channelId]);
  });

  robot.hear(/BANG!/i, function (msg) {
    var shooter = messageHelper.getPerson(msg);
    var channelId = messageHelper.getChannelId(msg);
    checkShot(msg, sessionStore[channelId], channelId, shooter);
  });

  robot.hear(trigger.getTrigger('cancel'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    removeSession(msg, channelId);
  });

  robot.hear(trigger.getTrigger('time'), function (msg) {
    var channelId = messageHelper.getChannelId(msg);
    checkTime(msg, sessionStore[channelId], channelId);
  });
};