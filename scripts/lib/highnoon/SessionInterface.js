var SESSION_CREATED = require('./lib/States.js').SESSION_CREATED;
var SESSION_REMOVED = require('./lib/States.js').SESSION_REMOVED;
var SESSION_DOES_NOT_EXIST = require('./lib/States.js').SESSION_DOES_NOT_EXIST;
var INVALID_NUMBER_OF_PLAYERS = require('./lib/States.js').INVALID_NUMBER_OF_PLAYERS;

var Session = require('./SessionState.js');
var SessionStore = require('./SessionStore.js');
var PlayerInterface = require('./PlayerInterface.js');
var PI = new PlayerInterface();

class SessionInterface {
  createSession(channelId, person, maxPlayers = 2) {
    var sessionExists = Boolean(SessionStore[channelId]);
    if (sessionExists) {
      return PI.addPlayer(channelId, person);
    } else {
      if (maxPlayers < 2 || maxPlayers > 10) {
        return INVALID_NUMBER_OF_PLAYERS;
      }
      SessionStore[channelId] = new Session(channelId, maxPlayers);
      PI.addPlayer(channelId, person);
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

module.exports = SessionInterface;