const fs = require('fs');
const filename = './scores.json'
const songscraper = require('../modules/songscraper.js');
var scoreList = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};

module.exports = {
  name: 'score',
  description: '**!score {add|del} {song name (romaji only)} {difficulty/playstyle (esp, edp, etc)} {score (ex: 924230) (add only)}**' +
  '- Score manager. **Use !scoreregister first!** Adds or deletes your own score on a database.'
  + ' To overwrite a score, just add the new score and it will be overwritten automatically.'
  + ' Use !scoreget for getting scores!',
  async execute(message, args) {
    scoreList = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};
    if (args.length == 0) {
      message.channel.send('Incorrect usage! Refer to:\n' + module.exports.description);
      return;
    }
    var songInfo = getSongInfo(message, args);
    if (songInfo == 0) {
      console.log(songInfo);
      return;
    }
    var info = await getDifficultyLevel(message, args, songInfo);
    if (info == 0) {
      return;
    }
    if (args[0] == 'add') {
      addScore(message, args, info, songInfo);
    }
    else if (args[0] == 'del') {
      deleteScore(message, args, info, songInfo);
    }
    else {
      message.channel.send('Invalid argument used: ' + args[0]);
    }
  },
  getSongInfo: function(message, args) {  return getSongInfo(message, args); },
  getInfo: async function(message, args, songInfo) { return await getDifficultyLevel(message, args, songInfo); }
}

function getSongInfo(message, args) {
  var songInfo = {songName: '', playstyle: '', difficulty: ''};
  var returnCode = parseSongInfo(args, songInfo);
  if(returnCode == 1) {
    message.channel.send('BEDP (Beginner Double Play) does not exist!');
    return 0;
  }
  else if(returnCode == 2) {
    message.channel.send('Could not find the abbreviation ' + args[0] + '\nPossible combinations are:\n' +
    '**BE**: Beginner, **B**: Basic, **D**: Difficult, **E**: Expert, **C**: Challenge\nCombined with:\n**SP**: Singles, **DP**: Doubles\n' +
    'An example of an abbreviation would be **BSP** (Basic Single Play)');
    return 0;
  }
  return songInfo;
}

async function getDifficultyLevel(message, args, songInfo) {
  var info = await songscraper.getLevel(songInfo.songName, songInfo.playstyle, songInfo.difficulty);

  if (info == 0) {
    var songName = encodeURI(songInfo.songName);
    var link = 'https://remywiki.com/index.php?search=' + songName + '&title=Special%3ASearch&go=Go';
    var _message = 'Song Page wasn\'t found on Remywiki (https://remywiki.com)\n' +
    'I tried searching, but here are the results ' + link + '\n' +
    'Are you sure your song name was correct and specific enough?'
    message.channel.send(_message);
    return 0;
  }

  if (info['difficultyName'] == 'N/A') {
    message.channel.send(songInfo.playstyle + ' ' + songInfo.difficulty + ' does not exist in this chart!');
    return 0;
  }
  return info;
}

async function addScore(message, args, info, songInfo) {
  songInfo.score = args[args.length - 1];

  if(songInfo.score.match(/[^0-9]/)) {
    message.channel.send('Invalid score format! Numbers only please.\nEx: 994230');
    return;
  }

  if(songInfo.score % 10 != 0) {
    message.channel.send('Invalid score! You can\'t have a nonzero last digit!');
    return;
  }

  scoreList[message.author.id][songInfo.playstyle][info.difficulty][songInfo.songName.toUpperCase()] = {};
  scoreList[message.author.id][songInfo.playstyle][info.difficulty][songInfo.songName.toUpperCase()]['score'] = songInfo.score;
  scoreList[message.author.id][songInfo.playstyle][info.difficulty][songInfo.songName.toUpperCase()]['prettyName'] = info.prettyName;
  scoreList[message.author.id][songInfo.playstyle][info.difficulty][songInfo.songName.toUpperCase()]['difficulty'] = songInfo.difficulty;

  fs.writeFile(filename, JSON.stringify(scoreList, null, 2), (err) => {
    if (err != null) {
      console.log(err);
      message.channel.send('Something went wrong while trying to submit your score!');
    }
    else {
      var prettyScore = songInfo.score.slice(0,3) + ',' + songInfo.score.slice(3);
      var difficulty = songInfo.difficulty.charAt(0).toUpperCase() + songInfo.difficulty.slice(1);
      var playstyle = songInfo.playstyle.charAt(0).toUpperCase() + songInfo.playstyle.slice(1);
      message.channel.send(`Successfully recorded the score of ${prettyScore} ` +
        `for ${info.prettyName} ${playstyle} ${difficulty} under the handle ` +
        `${scoreList[message.author.id]['handle']}!`);
    }
  });
}

function deleteScore(message, args, info, songInfo) {
  var scoreCopy = scoreList[message.author.id][songInfo.playstyle][info.difficulty][songInfo.songName.toUpperCase()]['score'];
  if (!scoreList[message.author.id][songInfo.playstyle][info.difficulty].hasOwnProperty(songInfo.songName.toUpperCase())) {
    message.channel.send(`Could not find ${info.prettyName} ${songInfo.playstyle} ${songInfo.difficulty}` +
      ` recorded under the handle ${scoreList[message.author.id]['handle']}`)
  }
  delete scoreList[message.author.id][songInfo.playstyle][info.difficulty][songInfo.songName.toUpperCase()];
  fs.writeFile(filename, JSON.stringify(scoreList, null, 2), (err) => {
    if (err != null) {
      console.log(err);
      message.channel.send('Something went wrong while trying to submit your score!');
    }
    else {
      message.channel.send(`Successfully deleted the score of ${scoreCopy} ` +
        `for ${info.prettyName} ${songInfo.playstyle} ${songInfo.difficulty} under the handle ` +
        `${scoreList[message.author.id]['handle']}!`);
    }
  });
}

function songNameParser(args, songInfo) {
  var songname = '';
  var counter = 0;
  for (var i = 0; i < args.length; i++) {
    if (endofSongNameParameter(args[i].toLowerCase())) {
      counter = i;
      break;
    }
    if (args[i] != 'add' && args[i] != 'del') {
      songname += args[i];
      songname += ' ';
    }
  }
  songInfo.songName = songname.slice(0, songname.length - 1);
  return counter;
}

function endofSongNameParameter(arg) {
  return arg == 'besp' || arg == 'bsp' || arg == 'dsp' || arg == 'esp' ||
  arg == 'csp' || arg == 'bdp' || arg == 'ddp' || arg == 'edp' || arg == 'cdp';
}

function parseSongInfo(args, songInfo) {
  var counter = songNameParser(args, songInfo);
  switch(args[counter].toLowerCase()) {
    case 'bedp':
      return 1;
      break;
    case 'besp':
      songInfo.playstyle = 'singles';
      songInfo.difficulty = 'beginner';
      break;
    case 'bsp':
      songInfo.playstyle = 'singles';
      songInfo.difficulty = 'basic';
      break;
    case 'dsp':
      songInfo.playstyle = 'singles';
      songInfo.difficulty = 'difficult';
      break;
    case 'esp':
      songInfo.playstyle = 'singles';
      songInfo.difficulty = 'expert';
      break;
    case 'csp' :
      songInfo.playstyle = 'singles';
      songInfo.difficulty = 'challenge';
      break;
    case 'bdp':
      songInfo.playstyle = 'doubles';
      songInfo.difficulty = 'beginner';
      break;
    case 'ddp':
      songInfo.playstyle = 'doubles';
      songInfo.difficulty = 'difficult';
      break;
    case 'edp':
      songInfo.playstyle = 'doubles';
      songInfo.difficulty = 'expert';
      break;
    case 'cdp':
      songInfo.playstyle = 'doubles';
      songInfo.difficulty = 'challenge';
      break;
    default:
      return 2;
      break;
  }
  return 0;
}
