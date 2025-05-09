const fs = require('fs');
const path = require('path');

module.exports = {
  name: 'clear',
  async execute(message, args) {
    if (!args[0] || isNaN(args[0])) {
      return message.reply('Please specify the number of messages to clear.');
    }

    const amount = parseInt(args[0]);

    if (amount <= 0 || amount > 100) {
      return message.reply('You can only clear between 1 and 100 messages.');
    }

    // Fetch messages to clear
    const messages = await message.channel.messages.fetch({ limit: amount });

    // Collect the content of the cleared messages
    const messagesContent = messages.map(msg => `[${msg.author.tag}] (${msg.createdAt}): ${msg.content}`).join('\n');

    // Define the file path
    const filePath = path.join(__dirname, 'cleared_messages.txt');

    // Save the messages to a .txt file
    fs.appendFile(filePath, messagesContent + '\n\n', err => {
      if (err) {
        console.error('Failed to save cleared messages:', err);
      }
    });

    // Delete the messages
    await message.delete();
    await message.channel.bulkDelete(amount, true);

    // Find the modlog channel
    const modlogChannel = message.guild.channels.cache.find(ch => ch.name === 'moderator-only');
    if (modlogChannel) {
      // Attach the file and send the log message
      modlogChannel.send({
        content: `**${message.author.tag}** cleared ${amount} messages in ${message.channel.name}.`,
        files: [filePath]  // Attach the .txt file with the cleared messages
      }).then(() => {
        // Optionally, clean up the file after sending it
        fs.unlink(filePath, (err) => {
          if (err) {
            console.error('Failed to delete cleared messages file:', err);
          }
        });
      }).catch(err => {
        console.error('Failed to send log with file attachment:', err);
      });
    }

    // Send confirmation and delete the message after 5 seconds
    message.channel.send(`Cleared ${amount} messages.`).then(msg => msg.delete({ timeout: 5000 }));
  }
};
