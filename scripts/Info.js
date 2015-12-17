var Info = function(robot) {
  robot.respond(/help/, function (msg) {
    msg.reply(
      '\n/dice XdY: roll dice\n' +
      '/gygax: Rolls character attributes with 3d6\n' +
      '/gygax_4d6: Rolls character attributes with 4d6 and removes the lowest die\n' +
      '/food [list|remove {name}|add {name}|pick]\n' +
      '/gossip [add {gossip_text}|remove {id}|{word_filters}]\n' +
      '/roulette [|spin|stats]\n' +
      '/deck [pick|deal|shuffle]'
    );

  });
};

module.exports = Info;
