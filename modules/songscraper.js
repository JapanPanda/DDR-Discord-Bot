
var rp = require('request-promise')
var cheerio = require('cheerio')

module.exports = {
  search: function(name) { return search(name) },
  getDifficulty: function($) { var difficulty = getRawDifficulty($);
                             return parseDifficulty($, difficulty); },
  isCutCSExclusive: function($) { return isCutCSExclusive($); }
};

function getSongInfo($, songJson) {
  var songName = $('.mw-headline').eq(0).text();
  var songInfo;
  $('.mw-parser-output').find('p').each(function(i, elem) {
    if ($(this).text().includes('Artist: ')) {
      songInfo = $('.mw-parser-output').find('p').eq(i).text();
      return false;
    }
  });
  if(songInfo.includes('Composition/Arrangement: ')) {
    var artist = songInfo.slice(8, songInfo.indexOf('Composition/Arrangement: ') - 1);
    songInfo = songInfo.slice(songInfo.indexOf(artist) + artist.length);
    var charter = songInfo.slice(26, songInfo.indexOf('BPM: ') - 1);
  }
  else {
    var artist = songInfo.slice(8, songInfo.indexOf('Composition: ') - 1);
    songInfo = songInfo.slice(songInfo.indexOf(artist) + artist.length);
    var charter = songInfo.slice(14, songInfo.indexOf('BPM: ') - 1);
    var separateArranger = true;
  }
  songInfo = songInfo.slice(songInfo.indexOf(charter) + charter.length);
  var bpm = songInfo.slice(6, songInfo.indexOf('Length: ') - 1);
  songInfo = songInfo.slice(songInfo.indexOf(bpm) + bpm.length);
  var length = songInfo.slice(9, 13);
  if(separateArranger) {
    charter = charter.replace('Arrangement: ', '**Arrangement:** ')
  }
  songJson['songname'] = songName;
  songJson['artist'] = artist;
  songJson['charter'] = charter;
  songJson['bpm'] = bpm;
  songJson['length'] = length;
}

function parseDifficulty($, difficulty) {
  var difficultiesArray = [];
  difficulty.each(function(i, elem) {
    if (i != 0) {
      var rawText = $(this).text();
      var filteredText = '';
      for(var j = 0; j < rawText.length; j++) {
        if (!isNaN(parseInt(rawText[j]))) {
          filteredText += rawText[j];
        }
      }
      if(filteredText == '') {
        difficultiesArray.push("N/A");
      }
      else {
        difficultiesArray.push(filteredText);
      }
    }
  });
  return difficultiesArray;
}

function parseNoteCount($, noteCount) {
  noteCountArray = [];
  noteCount.each(function(i, elem) {
    if (i != 0) {
      var rawText = $(this).text();
      var filteredText = rawText.slice(0, rawText.length - 1);
      noteCountArray.push(filteredText);
    }
  })
  return noteCountArray;
}

function getRawDifficulty($, index = 0) {
  var difficulty;
  $('tbody').each(function(i, elem) {
    var gameName = $(this).find('tr').last().find('td').eq(0).text();
    if (gameName.includes('DanceDance') || gameName.includes('DDR')) {
      difficulty = $(this).find('tr').last().find('td');
      index = i;
      return false;
    } else {
      difficulty = [];
    }
  });
  return difficulty;
}

function getRawNoteCount($, index) {
  var noteCount;
  $('tbody').eq(index).find('tr').each(function(i, elem) {
    var rowTitle = $(this).find('td').first().text();
    if(rowTitle.includes('Notecounts')) {
      noteCount = $(this).find('td');
      return false;
    }
  });
  return noteCount;
}

function getChartInfo($, songJson) {
  var difficulty;
  var index;

  $('tbody').each(function(i, elem) {
    var gameName = $(this).find('tr').last().find('td').eq(0).text();
    if (gameName.includes('DanceDanceRevolution')) {
      difficulty = $(this).find('tr').last().find('td');
      index = i;
      return false;
    }
  });

  var noteCount = getRawNoteCount($, index);

  difficultiesArray = parseDifficulty($, difficulty);
  noteCountArray = parseNoteCount($, noteCount);

  songJson['difficulty'] = difficultiesArray;
  songJson['notecount'] = noteCountArray;
}

function search(name) {

  var songJson = {};

  var options = {
    uri: name,
    followAllRedirects: true,
    transform: function(body) {
      return cheerio.load(body);
    }
  }

  return rp(options)
    .then(($) => {

      if ($('#firstHeading').text() == 'Search results') {
        console.log('User tried to search ' + name + ' which yielded no results');
        return 0;
      }

      getSongInfo($, songJson);
      getChartInfo($, songJson);

      return songJson;
    })
    .catch((error) => {
      console.log(error);
    });
}

// Check if song is still in DDR Arcade versions
function isCutCSExclusive($) {
  var categories = $('.catlinks').find('a');
  var isValid = true;
  categories.each(function(i, elem) {
    if($(this).text() == 'DDR CS Exclusives' || $(this).text() == 'DDR Cut Songs') {
      isValid = false;
      return false; // break out of callback function loop early (Cheerio)
    }
  });
  return !isValid;
}

/*
var songName = "PARANOiA Revolution";
var searchUri = 'https://remywiki.com/index.php?search=' + songName + '&title=Special%3ASearch&go=Go';
search(searchUri);
*/
