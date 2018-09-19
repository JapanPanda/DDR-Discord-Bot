const filename = './rival_codes.json'
const fs = require('fs');
var rivalCodeList = fs.existsSync(filename) ? JSON.parse(fs.readFileSync(filename, 'utf8')) : [];

module.exports = {
  name: 'rival',
  description: '!rival {add|del|get} {handle name (add|get args. only)} {rival code (add arg. only)} - Share your rival code to members of the server.',
  execute(message, args) {
    if (!validateArgLength(message, args, 1))
      return;

    var firstArg = args[0].toLowerCase().valueOf();
    if (firstArg == 'add') {
      addRivalCode(message, args);
    }
    else if (firstArg == 'del') {
      delRivalCode(message, args);
    }
    else if (firstArg == 'get') {
      getRivalCode(message, args);
    }
    else {
      message.channel.send('Unknown argument: ' + args[0] + '\nDescription: ' + this.description);
      return;
    }
  }
}

function addRivalCode(message, args) {
  if (!validateArgLength(message, args, 3))
    return;

  var handleName = validateHandleName(message, args, args.length - 1);
  var rivalCode = validateRivalCode(message, args, args.length - 1);
  if (!handleName || !rivalCode)
    return;

  var temp = rivalCodeList.filter(entry => entry.id == message.author.id);
  if (temp.length > 0) {
    temp[0].handle_name = handleName;
    temp[0].rival_code = rivalCode;
  }
  else {
    rivalCodeList.push({
      id: message.author.id,
      handle_name: handleName,
      rival_code: rivalCode
    });
  }
  fs.writeFile(filename, JSON.stringify(rivalCodeList, null, 2), (err) => {
    if (err)
      throw err;
    else {
      message.channel.send('Successfully added rival code: ' + rivalCode + ' (' + handleName + ')');
      console.log('finished writing ' + filename);
    }
  });
}

function delRivalCode(message, args) {
  var temp = rivalCodeList.map((entry) => entry.id);
  if (temp.filter(id => id == message.author.id).length > 0) {
    rivalCodeList.splice(temp.indexOf(message.author.id), 1);
    fs.writeFile(filename, JSON.stringify(rivalCodeList, null, 2), (err) => {
      if (err)
        throw err;
      else {
        message.channel.send('Successfully deleted your rival code.');
        console.log('finished writing ' + filename);
      }
    });
  }
  else {
    message.channel.send('Your rival code hasn\'t been stored.');
  }
}

function getRivalCode(message, args) {
  if (!validateArgLength(message, args, 2))
    return;

  var handleName = validateHandleName(message, args, args.length);
  if (!handleName)
    return;

  var temp = rivalCodeList.filter(entry => entry.handle_name == handleName);
  if (temp.length > 0) {
    var msg = 'Found ' + temp.length + ' results of "' + handleName + '"\n';
    for (var i in temp) {
      if (i > 0)
        msg += '\n';
      msg += '\t' + temp[i].rival_code;
    }
    message.channel.send(msg);
  }
  else
    message.channel.send('Handle name ' + handleName + ' not found.');
}

function validateHandleName(message, args, j) {
  var handleName = '';
  for (var i = 1; i < j; ++i) {
    if (i > 1)
      handleName += ' ';

    handleName += args[i].toUpperCase();
  }
  if (handleName.length > 8) {
    message.channel.send('Invalid handle name: "' + handleName + '"\'s character length > 8.');
    return false;
  }
  return handleName;
}

function validateRivalCode(message, args, j) {
  var rivalCode = args[j];
  rivalCode = rivalCode.replace(/-/g, '');
  if (rivalCode.match(/[^0-9]/)) {
    message.channel.send('Invalid rival code: "' + rivalCode + '" contains non-numeric characters.');
    return false;
  }
  if (rivalCode.length != 8) {
    message.channel.send('Invalid rival code: "' + rivalCode + '"\'s character length != 8.');
    return false;
  }
  return rivalCode;
}

function validateArgLength(message, args, j) {
  if (args.length < j) {
    message.channel.send('Too few arguments.\nDescription: ' + module.exports.description);
    return false;
  }
  return true;
}
