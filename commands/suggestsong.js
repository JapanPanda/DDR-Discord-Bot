const fs = require('fs');
const songscraper = require('../modules/songscraper.js')

module.exports = {
  name: 'suggestsong',
  aliases: ['suggest', 'ss'],
  description: '!suggestsong {single or double (default = singles)} {level} {number of suggestions}- Gives a song within a level',
  execute(message, args) {
    var playstyle = 'single';
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
    var songChosen = generateSong(playstyle, level);
    message.channel.send(_message);
  },
}


async function generateSong(playstyle, level) {
    var difficultyJson = JSON.parse(fs.readFileSync('../difficultylist.json', 'utf8'));
    var indexChosen = Math.floor(Math.random() * (difficultyJson[playstyle])[level].length);
    indexChosen = 34;
    var songLink = ((difficultyJson[playstyle])[level])[indexChosen];
    console.log(songLink);
    var songJson = await songscraper.difficultySearch(songLink, playstyle, level);
    //console.log(songJson);
}


generateSong('singles', 13);
