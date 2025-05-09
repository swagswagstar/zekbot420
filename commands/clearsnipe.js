const { logSnipeClear } = require('../log');

module.exports = {
  name: 'clearsnipe',
  aliases: ['cs'],
  execute(message, args) {
    const channel = message.channel;
    const snipeData = message.client.snipes.get(channel.id);

    if (!snipeData) {
      return message.reply('No snipe data to clear in this channel.');
    }

    // Clear the snipe data
    message.client.snipes.delete(channel.id);
    
    // Log the snipe clear action in modlog
    logSnipeClear(message.client, message, message.author);  // Log the snipe clear action

    message.reply('Snipe data has been cleared for this channel.');
  }
};
