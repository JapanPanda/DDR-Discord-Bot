const fs = require('fs');
const songscraper = require('../modules/songscraper.js')

module.exports = {
  name: 'suggestsong',
  aliases: ['suggest', 'ss'],
  description: '!suggestsong {single or double (default = singles)} {level / range} {number of suggestions (4 max & default = 1)} - Gives a song within a level',
  async execute(message, args) {
    message.channel.startTyping();
    try {
      if(args.length > 3) {
        var message = 'Too many arguments! Accepted arguments are {playstyle (default = singles)} {level / range} {number (4 max & default = 1)}';
        message.channel.send(_message);
        message.channel.stopTyping();
        return;
      }

      var playstyle = 'singles';
      var level;
      var levels;
      var times = 1;
      if (!args.includes('single') && !args.includes('double')
          && !args.includes('singles') && !args.includes('doubles')){
        level = args[0];
        if(args.length == 2) {
          times = parseInt(args[1]);
        }
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
        if(args.length == 3) {
          times = parseInt(args[2]);
        }
      }

      var rawLevels = level.split('-');
      console.log(rawLevels);
      var parsedLevels = [];


      var error = false;
      if (isNaN(times)) {
        _message = `Invalid times chosen, ${times} is not a number!`;
        error = true;
      }
      if (times < 0 || times > 4) {
        _message = `Invalid amount of times chosen. The range is 1-4 inclusive!`;
        error = true;
      }

      rawLevels.forEach(function(_level) {
        var parsedLevel = parseInt(_level);
        parsedLevels.push(parsedLevel);
        if (parsedLevel > 19) {
          var _message = `Ok Fefemz, you needa calm down there.\nTheres no level ${level} difficulty yet!`;
          error = true;
        }
        else if(parsedLevel < 1) {
          var _message = `Ok now, you possibly can't be that bad.\nTheres no level ${level} difficulty yet!`;
          error = true;
        }
      });

      if(!error) {
        var _message = await generateSong(playstyle, parsedLevels, times);
      }
      message.channel.send(_message);
      message.channel.stopTyping();
    }
    catch (error) {
      var errmessage = 'Something went wrong! Please check your parameters';
      message.channel.send(errmessage);
      message.channel.stopTyping();
    }
  },
}


async function generateSong(playstyle, levels, times) {
    var difficultyJson = JSON.parse(fs.readFileSync('./difficultylist.json', 'utf8'));
    var message;
    if(times == 1) {
      message = `I've picked a song for you!\n`;
       message = await generateSingleSong(playstyle, levels, difficultyJson);
    }
    else {
      message = `I've picked ${times} songs for you!\n`;
      for(var i = 0; i < times; i++) {
        message += await generateSingleSong(playstyle, levels, difficultyJson);
        message += '\n\n';
      }
    }
    return message;
}

async function generateSingleSong(playstyle, levels, difficultyJson) {
  console.log(levels);
  var levelChosen;
  if(levels.length != 1) {
    levelChosen = levels[0] + (Math.floor(Math.random() * (levels[1] - levels[0])));
  }
  else {
    levelChosen = levels[0];
  }
  console.log(levelChosen);
  var indexChosen = Math.floor(Math.random() * (difficultyJson[playstyle])[levelChosen].length);
  var songLink = ((difficultyJson[playstyle])[levelChosen])[indexChosen];
  var songJson = await songscraper.difficultySearch(songLink, playstyle, levelChosen);
  console.log(songJson);
  var difficulty = songJson['difficulty'];
  var bpm = songJson['bpm'];
  var songname = songJson['songname'];
  var songromaji = songJson['songromaji'];
  var notecount = songJson['notecount'];
  var notecountLength = notecount.split('/').length;

  if (notecountLength == 2) {
    notecount += ' / 0';
  }
  playstyle = playstyle[0].toUpperCase() + playstyle.slice(1);
  var songString;
  songname.replace(String.fromCharCode(8220), '"');
  songname.replace(String.fromCharCode(8221), '"');
  if (songname != songromaji) {
    songString = `${songname} (${songromaji})`;
  }
  else {
    songString = songname;
  }
  var message = `__**${songString}**__\n` +
  `**Playstyle:** ${playstyle}\n` +
  `**Level:** ${levelChosen}\n` +
  `**Difficulty:** ${difficulty}\n` +
  `**Notes / Freeze Arrows / Shock Arrows**: ${notecount}\n` +
  `**BPM:** ${bpm}`;
  return message;
}
