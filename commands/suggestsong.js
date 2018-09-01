const fs = require('fs');
const songscraper = require('../modules/songscraper.js')

module.exports = {
  name: 'suggestsong',
  aliases: ['suggest', 'ss'],
  description: '!suggestsong {single or double (default = singles)} {level} {number of suggestions}- Gives a song within a level',
  async execute(message, args) {
    var playstyle = 'singles';
    var level;
    if (!args.includes('single') && !args.includes('double')
        && !args.includes('singles') && !args.includes('doubles')){
      level = args[0];
    }
    else {
      playstyle = args[0];
      if (playstyle == 'single') {
        playstyle == 'singles';
      }
      else if (playstyle == 'double') {
        playstyle == 'doubles';
      }
      level = args[1];
    }
    var _message = await generateSong(playstyle, level);
    message.channel.send(_message);
  },
}


async function generateSong(playstyle, level) {
    var difficultyJson = JSON.parse(fs.readFileSync('./difficultylist.json', 'utf8'));
    var indexChosen = Math.floor(Math.random() * (difficultyJson[playstyle])[level].length);
    var songLink = ((difficultyJson[playstyle])[level])[indexChosen];
    var songJson = await songscraper.difficultySearch(songLink, playstyle, level);
    console.log(songJson);
    var difficulty = songJson['difficulty'];
    var bpm = songJson['bpm'];
    var songname = songJson['songname'];
    playstyle = playstyle[0].toUpperCase() + playstyle.slice(1);
    message = `I've picked a song for you!\n` + `__**${songname}**__\n` +
    `**Playstyle:** ${playstyle}\n` +
    `**Level:** ${level}\n` +
    `**Difficulty:** ${difficulty}\n` +
    `**BPM:** ${bpm}`;
    return message;
}
