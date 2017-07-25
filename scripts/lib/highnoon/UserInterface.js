var SESSION_CREATED = require('./lib/States.js').SESSION_CREATED;
var SESSION_FULL = require('./lib/States.js').SESSION_FULL;
var SESSION_REMOVED = require('./lib/States.js').SESSION_REMOVED;
var SESSION_DOES_NOT_EXIST = require('./lib/States.js').SESSION_DOES_NOT_EXIST;
var PLAYER_ADDED = require('./lib/States.js').PLAYER_ADDED;
var PLAYER_ALREADY_IN_SESSION = require('./lib/States.js').PLAYER_ALREADY_IN_SESSION;
var PLAYER_REMOVED = require('./lib/States.js').PLAYER_REMOVED;
var PLAYER_DOES_NOT_EXIST = require('./lib/States.js').PLAYER_DOES_NOT_EXIST;
var Session = require('./Session.js');
var SessionStore = require('./SessionStore.js');
var PlayerState = require('./PlayerState.js');

class UserInterface {
  addPlayer(channelId, person) {
    if (!SessionStore[channelId].sessionIsFull()) {
      if (SessionStore[channelId].players[person] === undefined) {
        SessionStore[channelId].players[person] = new PlayerState(person);
        return PLAYER_ADDED;
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
        return PLAYER_REMOVED;
      } else {
        return PLAYER_DOES_NOT_EXIST;
      }
    } else {
      return SESSION_DOES_NOT_EXIST;
    }
  }

  createSession(channelId, person, maxPlayers = 2) {
    var sessionExists = Boolean(SessionStore[channelId]);
    if (sessionExists) {
      return SessionStore[channelId].addPlayer(person);
    } else {
      SessionStore[channelId] = new Session(channelId, maxPlayers);
      addPlayer(channelId, person);
      return SESSION_CREATED;
    }
  }

  removeSession(msg, channelId) {
    var existed = Boolean(SessionStore[channelId]); // check if it exists first prior to deletion
    if (!existed) {
      return SESSION_DOES_NOT_EXIST;
    } else {
      delete SessionStore[channelId];
      return SESSION_REMOVED;
    }
  }
};

module.exports = UserInterface;