module.exports = {
    name: 'snipe',
    aliases: ['s'],
    async execute(message, args) {
      const channel = message.channel;
  
      const snipeData = message.client.snipes.get(channel.id);
      if (!snipeData) {
        return message.reply('No message has been deleted recently in this channel.');
      }
  
      const { user, content, timestamp } = snipeData;
      const timeAgo = formatTimeAgo(Date.now() - timestamp);
  
      message.reply(`**${user.username}** said: "${content}", deleted ${timeAgo}.`);
    }
  };
  
  function formatTimeAgo(ms) {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
  
    if (days > 0) return `${days} day(s) ago`;
    if (hours > 0) return `${hours} hour(s) ago`;
    if (minutes > 0) return `${minutes} minute(s) ago`;
    return `${seconds} second(s) ago`;
  }
  