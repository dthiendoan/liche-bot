var SESSION_FULL = require('./lib/States.js').SESSION_FULL;
var SESSION_DOES_NOT_EXIST = require('./lib/States.js').SESSION_DOES_NOT_EXIST;
var PLAYER_ADDED = require('./lib/States.js').PLAYER_ADDED;
var ALL_PLAYER_SLOTS_FILLED = require('./lib/States.js').ALL_PLAYER_SLOTS_FILLED;
var PLAYER_ALREADY_IN_SESSION = require('./lib/States.js').PLAYER_ALREADY_IN_SESSION;
var PLAYER_REMOVED = require('./lib/States.js').PLAYER_REMOVED;
var PLAYER_DOES_NOT_EXIST = require('./lib/States.js').PLAYER_DOES_NOT_EXIST;

var SessionStore = require('./SessionStore.js');
var Player = require('./PlayerState.js');

class PlayerInterface {
  addPlayer(channelId, person) {
    if (!SessionStore[channelId].sessionIsFull()) {
      if (SessionStore[channelId].players[person] === undefined) {
        SessionStore[channelId].players[person] = new Player(person);
        return SessionStore[channelId].sessionIsFull() ? ALL_PLAYER_SLOTS_FILLED : PLAYER_ADDED;
      } else {
        return PLAYER_ALREADY_IN_SESSION;
      }
    } else {
      return SESSION_FULL;
    }
  }

  removePlayer(channelId, person) {
    var sessionExists = Boolean(SessionStore[channelId]);
    if (sessionExists) {
      if (SessionStore[channelId].players[person] !== undefined) {
        delete SessionStore[channelId].players[person];
        for (var player in SessionStore[channelId].players) {
          SessionStore[channelId].players[player].unReady();  // if they were already in preparation state, reset all readys
        }
        return PLAYER_REMOVED;
      } else {
        return PLAYER_DOES_NOT_EXIST;
      }
    } else {
      return SESSION_DOES_NOT_EXIST;
    }
  }

};

module.exports = PlayerInterface;