module.exports = {
    name: 'modlog',
    async execute(message, args) {
      // Check if the user has the 'Administrator' permission or is the server owner
      if (!message.member.permissions.has('ADMINISTRATOR') && message.author.id !== message.guild.ownerId) {
        return message.reply({
          content: 'You do not have the required permissions to run this command.'
        });
      }
  
      // Ensure the user provided a channel (either name or ID)
      const channelInput = args[0];
      if (!channelInput) {
        return message.reply({
          content: 'Please provide a valid channel name or ID to log events.'
        });
      }
  
      // Attempt to find the channel by ID first, then by name
      let channel = message.guild.channels.cache.get(channelInput);
      
      if (!channel) {
        // If no channel found by ID, try finding by name (sanitize spaces for better matching)
        channel = message.guild.channels.cache.find(ch => ch.name.replace(/\s+/g, '').toLowerCase() === channelInput.replace(/\s+/g, '').toLowerCase());
      }
  
      if (!channel) {
        return message.reply({
          content: 'Could not find that channel. Please make sure the name or ID is correct.'
        });
      }
  
      // Log a simple event (you can expand this with more logging info)
      channel.send({
        content: `A modlog action was triggered by ${message.author.tag} in ${message.channel.name}.`
      });
  
      message.reply({
        content: `Modlog has been triggered. Action logged in ${channel}.`
      });
    }
  };
  