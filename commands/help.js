module.exports = {
  name: 'help',
  description: '!help - Shows a list of available commands',
  execute(message, args) {
    var _message = 'Available Commands\n' +
    '!help - Show available commands\n' +
    '!who - Brief introduction about who I am\n' +
    '!songinfo {song name} - Lists Song information and difficulty breakdown (romaji accepted)\n' +
    '!suggestsong {singles / doubles} {level} - Suggests a song to play that fits the parameters';
    message.channel.send(_message);
  },
}
