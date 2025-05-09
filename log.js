const { EmbedBuilder } = require('discord.js');

async function logMessageDeletion(client, message, author) {
  const modlogChannel = message.guild.channels.cache.find(channel => channel.name === 'moderator-only');
  if (!modlogChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Message Deleted')
    .setDescription(`**Message:**\n${message.content}`)
    .addFields(
      { name: 'Author', value: message.author.tag, inline: true },
      { name: 'Deleted By', value: author.tag, inline: true },
      { name: 'Channel', value: message.channel.name, inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setTimestamp();

  modlogChannel.send({ embeds: [embed] });
}

async function logSnipeClear(client, message, author) {
  const modlogChannel = message.guild.channels.cache.find(channel => channel.name === 'moderator-only');
  if (!modlogChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('Snipe Data Cleared')
    .setDescription('Snipe data has been cleared.')
    .addFields(
      { name: 'Cleared By', value: author.tag, inline: true },
      { name: 'Channel', value: message.channel.name, inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setTimestamp();

  modlogChannel.send({ embeds: [embed] });
}

module.exports = { logMessageDeletion, logSnipeClear };
