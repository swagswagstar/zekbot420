module.exports = {
  name: 'avatar',
  aliases: ['av', 'pfp'],  // Add pfp as an alias as well
  execute(message, args) {
    // Check if the first argument is a mention or not
    const user = message.mentions.users.first() || message.author;
    
    // Send the avatar URL as a reply
    message.reply({
      content: `${user.username}'s avatar: ${user.displayAvatarURL({ format: 'png', dynamic: true, size: 512 })}`
    });
  }
};
