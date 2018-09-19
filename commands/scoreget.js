const fs = require('fs');
const filename = './scores.json'
const songscraper = require('../modules/songscraper.js');
const score = require('./score.js');

var scoreList = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};

module.exports = {
  name: 'scoreget',
  description: '**!scoreget {[ handle ] (optional, default = you)} {song name (romaji only)} {difficulty/playstyle (esp, edp, etc)}**' +
  ' - You may also use !scoreget list {[ handle ] (optional, default = you)} {playstyle} {level ex: 19} to get scores for a level!',
  async execute(message, args) {
    if (args.length == 0) {
      message.channel.send('Incorrect usage! Refer to:\n' + module.exports.description);
      return;
    }
    if (args[0] == 'list') {
      listScores(message, args);
    }
    else {
      getScore(message, args);
    }
  },
}

function getPlaystyle(args) {
  var playstyle = args[args.length - 2];
  if (playstyle.toLowerCase() == 'single') {
    playstyle = 'singles';
  }
  else if (playstyle.toLowerCase() == 'double') {
    playstyle = 'doubles';
  }

  if (playstyle != 'singles' && playstyle != 'doubles') {
    return 0;
  }
  return playstyle;
}

function getHandle(args) {
  var handle = '';
  var start = 0;
  var end = 0;
  for (var i = 0; i < args.length; i++) {
    if (args[i] == '[') {
      start = i + 1;
    }
    if (args[i] == ']') {
      end = i;
      break;
    }
  }
  for (var i = start; i < end; i++) {
    handle += args[i];
    if (i != end - 1) {
      handle += ' ';
    }
  }
  handle = handle.toUpperCase();
  return handle;
}

function getOwnScores(message, playstyle, level) {
  var prettyPlaystyle = playstyle.charAt(0).toUpperCase() + playstyle.slice(1);
  if(!scoreList.hasOwnProperty(message.author.id)) {
    message.channel.send('You\'re not registered in the score manager! Use !scoreregister {handle} first and add some scores!');
    return;
  }
  if(scoreList[message.author.id][playstyle][level] == null || scoreList[message.author.id][playstyle][level].length == 0) {
    message.channel.send('You have no registered scores under the level ' + level + ' in ' + prettyPlaystyle);
    return;
  }
  var userScoreList = scoreList[message.author.id][playstyle][level]
  var _message = `Your Level ${level} scores:\n` ;
  for (var score in userScoreList) {
    var prettyScore = userScoreList[score]['score'].slice(0,3) + ',' + userScoreList[score]['score'].slice(3);
    _message += `**${userScoreList[score]['prettyName']} ${prettyPlaystyle} ${userScoreList[score]['difficulty']}**: `;
    _message += `${prettyScore}\n`;
  }
  message.channel.send(_message);
}

function getOtherScores(message, handle, playstyle, level) {
  var prettyPlaystyle = playstyle.charAt(0).toUpperCase() + playstyle.slice(1);
  var selectedEntry;
  for (var entry in scoreList) {
    if (scoreList[entry]['handle'] == handle) {
      selectedEntry = scoreList[entry];
      break;
    }
  }
  if (selectedEntry == null) {
    message.channel.send('The handle ' + handle + ' is not registered in the score manager!');
    return;
  }
  if(selectedEntry[playstyle][level] == null || selectedEntry[playstyle][level].length == 0) {
    message.channel.send(handle +' does not have scores under the level ' + level + ' in ' + prettyPlaystyle);
    return;
  }
  var userScoreList = selectedEntry[playstyle][level];
  var _message = `${handle}'s Level ${level} scores:\n` ;
  for (var score in userScoreList) {
    var prettyScore = userScoreList[score]['score'].slice(0,3) + ',' + userScoreList[score]['score'].slice(3);
    _message += `**${userScoreList[score]['prettyName']} ${prettyPlaystyle} ${userScoreList[score]['difficulty']}**: `;
    _message += `${prettyScore}\n`;
  }
  message.channel.send(_message);
}

function listScores(message, args) {
  var level = args[args.length - 1];
  if (level < 1 && level > 19) {
    message.channel.send('Invalid level: ' + level + '\nMust be a number 1-19!')
    return;
  }

  var playstyle = getPlaystyle(args);
  if(playstyle == 0) {
    message.channel.send('Invalid playstyle specified: ' + playstyle +
    '\nPossible combinations are:\n' +
    '**BE**: Beginner, **B**: Basic, **D**: Difficult, **E**: Expert, **C**: Challenge\nCombined with:\n**SP**: Singles, **DP**: Doubles\n' +
    'An example of an abbreviation would be **BSP** (Basic Single Play)');
    return;
  }

  var counter = 0;
  var handle = '';
  if (args[1] == '[') {
    handle = getHandle(args);
  }
  else if (args.length == 4) {
    message.channel.send('Invalid number of arguments!'+
    '\nTo list another person\'s score, use !scoreget list {[ handle ]} {playstyle} {level}.'+
    '\nTo list your owns, just use !scoreget list {playstyle} {level}.');
    return;
  }
  else if (args.length == 3) {
    handle = '';
  }
  else {
    mesage.channel.send('Invalid amount of arguments!\nValid examples:\n!scoreget list 19 singles\n!scoreget list [ Hawawa ] 19 singles');
    return;
  }
  if (handle == '') {
    getOwnScores(message, playstyle, level);
  }
  else {
    getOtherScores(message, handle, playstyle, level);
  }
}

async function getScore(message, args) {
  //!scoreget {[ handle ] (optional, default = you)} {song name (romaji only)} {difficulty/playstyle (esp, edp, etc)}
  scoreList = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : {};
  var handle = '';
  if (args[0] == '[') {
    handle = getHandle(args);
    var length = handle.split(' ').length;
    args = args.slice(length + 2);
    console.log(args);
  }
  console.log(handle);

  var songInfo = score.getSongInfo(message, args);
  if (songInfo == 0) {
    return;
  }
  var info = await score.getInfo(message, args, songInfo);
  if (info == 0) {
    return;
  }

  var rawDifficulty = songInfo.difficulty;
  var difficulty = rawDifficulty.charAt(0).toUpperCase() + rawDifficulty.slice(1);
  var rawPlaystyle = songInfo.playstyle;
  var playstyle = rawPlaystyle.charAt(0).toUpperCase() + rawPlaystyle.slice(1);

  var selectedEntry;
  if (handle == '') {
    selectedEntry = scoreList[message.author.id];
  }
  else {
    for (var entry in scoreList) {
      if (scoreList[entry]['handle'] == handle) {
        selectedEntry = scoreList[entry];
        break;
      }
    }
  }
  if (!selectedEntry[songInfo.playstyle][info.difficulty].hasOwnProperty(songInfo.songName.toUpperCase())) {
    message.channel.send(`${selectedEntry['handle']} does not have a registered score for ` +
                         `**${info.prettyName} | ${playstyle} ${difficulty}!**`);
    return;
  }
  var scoreCopy = selectedEntry[songInfo.playstyle][info.difficulty][songInfo.songName.toUpperCase()];
  var scores = scoreCopy['score'].slice(0,3) + ',' + scoreCopy['score'].slice(3);
  message.channel.send(`${selectedEntry['handle']} has a score of **${scores}** ` +
                       `on **${info.prettyName} | ${playstyle} ${difficulty}**!`);
}
