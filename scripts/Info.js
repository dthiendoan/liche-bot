var Info = function(robot) {
  robot.respond(/help/, function (msg) {
    msg.reply(
      '\n/dice XdY: roll dice\n' +
      '/gygax: Rolls character attributes with 3d6\n' +
      '/gygax_4d6: Rolls character attributes with 4d6 and removes the lowest die\n' +
      '/food [list|remove {id}|add {name}|pick]\n'
    );

  });
};

module.exports = Info;
