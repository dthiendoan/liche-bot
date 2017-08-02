class Session {
  constructor(channelId, maxPlayers) {
    this.channelId = channelId;
    this.players = {};
    this.maxPlayers = Number(maxPlayers);
    this.playersDead = 0;
    this.allShotsFired = false;
    this.countdownValue = Math.floor(Math.random() * 7500) + 2500; // Guarantees to never be zero
    this.timer = null;
    this.elapsed = 0;
  }

  playersNeeded() {
    return this.maxPlayers - Object.keys(this.players).length;
  }

  getCurrentPlayers() {
    return this.players;
  }

  getMaxPlayers() {
    return this.maxPlayers;
  }

  getCountdownValue() {
    return this.countdownValue;
  }

  sessionIsFull() {
    return Object.keys(this.players).length >= this.maxPlayers;
  }

  isTimeToDraw() {
    return this.elapsed >= this.countdownValue;
  }

  increaseDeathCount() {
    this.playersDead++;
  }

  onePlayerLeft() {
    return this.playersDead === this.maxPlayers - 1;
  }

  duelIsDone() {
    this.allShotsFired = true;
  }
};

module.exports = Session;