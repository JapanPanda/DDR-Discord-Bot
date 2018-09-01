var rp = require('request-promise');
var cheerio = require('cheerio');
var fs = require('fs');
var songscraper = require('./songscraper.js')
// Only ran at the start of the bot, could also be ran manually

var options = {
  uri: '',
  transform: function(body) {
    return cheerio.load(body);
  }
}

var options2 = {
  uri: '',
  transform: function(body) {
    return cheerio.load(body);
  }
}


async function scrape() {
  var startURL = 'https://remywiki.com/Category:DDR_Songs';
  options.uri = startURL;
  var difficultyJson = await scrapeDifficulties();
  console.log('I\'m supposed to appear after the Finished writing log!');
  // I want it to write the json from here, but its not waiting and difficultyjson will be undefined
  // fs.writeFile('difficultylist.json', JSON.stringify(difficultyJson, null, 2), () => {
  //   console.log('Finished writing');
  // });
}

async function scrapeDifficulties() {
  var difficultyJson = {};
  return rp(options)
    .then(async ($) => {
      links = getNextPage($);
      var nextPageLink = links[0];
      console.log("Scraping remywiki's list of DDR Songs. This might take a while...")
      return links;
    }).then(async (links) => {
      scrapeAllPages(links).then((difficultyJson) => {
        jsonString = JSON.stringify(difficultyJson, null, 2);
        return difficultyJson;
      });
    }).catch((error) => {
      console.log(error);
    })
    .catch((err) => {
      console.log(err);
    });
}

function scrapeIndividualPage(link) {
  options2.uri = link;
  return rp(options2)
    .then(($$) => {
      //console.log("entering 3rd part");
      if (songscraper.isCutCSExclusive($$)) {
        //console.log(link + " is not in arcade editions");
        return 0;
      }
      var currDifficulty = songscraper.getDifficulty($$);
      if (currDifficulty.length == 0) {
        //console.log("Excluded " + link + " since no difficulties were found");
        return 0;
      }
      //console.log(JSON.stringify(difficultyJson, null, 2));
      currDifficulty.push(link);
      //console.log(currDifficulty);
      return currDifficulty;
    })
    .catch((err) => {
      console.log(link);
      console.log(err);
    });
}

function removeInvalidEntries(difficulty) {
  var filteredDifficulty = [];
  for (var i = 0; i < difficulty.length; i++) {
    if (difficulty[i] != 0) {
      filteredDifficulty.push(difficulty[i]);
    }
  }
  return filteredDifficulty;
}

async function scrapeAllPages(links) {
  const promise = new Promise((resolve, reject) => {
    var promises = [];
    var difficultyJson = {};
    difficultyJson = {'Singles': {}, 'Doubles': {}};
    for (var i = 1; i < 20; i++) {
      difficultyJson['Singles'][i] = [];
      difficultyJson['Doubles'][i] = [];
    }
    for (let i = 1; i < links.length; i++) {
      if (links[i].includes('index.php')) {
        continue;
      }
      promises.push(scrapeIndividualPage(links[i]));
    }
    Promise.all(promises)
      .then((difficulty) => {
        var filteredDifficulty = removeInvalidEntries(difficulty);
        for(var i = 0; i < filteredDifficulty.length; i++) {
          for(var j = 0; j < 5; j++) {
            if((filteredDifficulty[i])[j] == 'N/A') {
              continue;
            }
            difficultyJson['Singles'][(filteredDifficulty[i])[j]].push(filteredDifficulty[i][9]);
          }
          for(var j = 5; j < 9; j++) {
            if((filteredDifficulty[i])[j] == 'N/A') {
              continue;
            }
            difficultyJson['Doubles'][(filteredDifficulty[i])[j]].push(filteredDifficulty[i][9]);
          }
        }

        // It works if I write it here since difficultyJson exists
        fs.writeFile('difficultylist.json', JSON.stringify(difficultyJson, null, 2), () => {
          console.log('Finished writing');
        });
      })
      .catch((err) => {
        reject();
        console.log(err);
      })
  });

}

function getNextPage($) {
  var candidates = $('#mw-pages').find('a');
  var links = [];
  candidates.each(function(i, elem) {
    links.push('https://remywiki.com' + $(this).attr('href'));
  });
  return links;
}

function getSongLinks() {

}

scrape();
