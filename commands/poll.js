module.exports = {
    name: 'poll',
    async execute(message, args) {
      if (!message.reference) {
        return message.reply({
          content: 'Please reply to a message to create a poll.'
        });
      }
  
      const targetMessage = await message.channel.messages.fetch(message.reference.messageId);
  
      const pollQuestion = args.join(' ');
      if (!pollQuestion) {
        return message.reply({
          content: 'Please provide a question for the poll.'
        });
      }
  
      await targetMessage.edit({
        content: `${targetMessage.content}\n\n**Poll:** ${pollQuestion}`
      });
  
      targetMessage.react('👍');
      targetMessage.react('👎');
  
      message.reply({
        content: 'Poll has been created with reactions! 👍 for Yes, 👎 for No.'
      });
    }
  };
  