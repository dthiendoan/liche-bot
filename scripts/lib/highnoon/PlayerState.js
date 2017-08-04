class PlayerState {
  constructor(name) {
    this.name = name;
    this.alive = true;
    this.ready = false;
    this.dodge = null;
  }

  getName() {
    return this.name;
  }

  isAlive() {
    return this.alive;
  }

  dodgeDirection() {
    return this.dodge;
  }

  setDodge(direction) {
    this.dodge = direction;
  }

  gotShot() {
    this.alive = false;
  }

  isReady() {
    return this.ready;
  }

  setReady() {
    this.ready = true;
  }

  unReady() {
    this.ready = false;
  }
};

module.exports = PlayerState;