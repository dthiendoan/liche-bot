var SESSION_CREATED = require('./lib/States.js').SESSION_CREATED;
var SESSION_REMOVED = require('./lib/States.js').SESSION_REMOVED;
var SESSION_DOES_NOT_EXIST = require('./lib/States.js').SESSION_DOES_NOT_EXIST;

var Session = require('./SessionState.js');
var SessionStore = require('./SessionStore.js');
var PlayerInterface = require('./PlayerInterface.js');
var PI = new PlayerInterface();

class SessionInterface {
  createSession(channelId, person, maxPlayers) {
    var sessionExists = Boolean(SessionStore[channelId]);
    if (sessionExists) {
      return PI.addPlayer(channelId, person);
    } else {
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