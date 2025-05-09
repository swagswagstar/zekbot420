module.exports = {
    name: 'poll',
    async execute(message, args) {
      // Ensure the user is replying to a message
      if (!message.reference) {
        return message.reply({
          content: 'Please reply to a message to create a poll.'
        });
      }
  
      // Get the original message that was replied to
      const targetMessage = await message.channel.messages.fetch(message.reference.messageId);
  
      // Ensure there's text for the poll question
      const pollQuestion = args.join(' ');
      if (!pollQuestion) {
        return message.reply({
          content: 'Please provide a question for the poll.'
        });
      }
  
      // Edit the original message to include the poll question
      await targetMessage.edit({
        content: `${targetMessage.content}\n\n**Poll:** ${pollQuestion}`
      });
  
      // Add reactions to the original message
      targetMessage.react('👍');
      targetMessage.react('👎');
  
      message.reply({
        content: 'Poll has been created with reactions! 👍 for Yes, 👎 for No.'
      });
    }
  };
  