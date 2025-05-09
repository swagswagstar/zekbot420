module.exports = {
    name: 'help',
    execute(message, args) {
      message.reply({
        content: `${message.author}, all commands are available on the wiki: https://github.com/swagswagstar/zekbot420/wiki.\n\If you have any problems, open an issue on the repository: https://github.com/swagswagstar/zekbot420/issues.`,
        allowedMentions: { repliedUser: false }
      });
    }
  };
  