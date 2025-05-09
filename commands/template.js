const { logSnipeClear } = require('../log'); // If it's a moderation command, import the log function

module.exports = {
  name: 'yourcommandname', // Replace with your command name
  aliases: ['ex'], // If you want a shorter alias, add it here
  execute(message, args) {

    // have fun lol
    
    message.reply('Snipe data has been cleared for this channel.');
  }
};
