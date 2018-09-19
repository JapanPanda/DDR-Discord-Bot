module.exports = {
  name: 'who',
  description: '**!who** - I\'ll tell you a little bit about myself',
  execute(message, args) {
    var _message = 'Hiya, I\'m a bot written by Hawawa#8742!\n' +
    'I\'m written with Node.js using the discord.js library.\n' +
    'You can view my source code on https://github.com/JapanPanda/DDR-Discord-Bot\n' +
    'If theres any bugs, please harrass my owner through discord dm.'
    message.channel.send(_message);
  },
}
