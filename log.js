const fs = require('fs');
const path = require('path');
const { EmbedBuilder } = require('discord.js');

async function logMessageDeletion(client, message, author) {
  const modlogChannel = message.guild.channels.cache.find(channel => channel.name === 'moderator-only');
  if (!modlogChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#fc6603')
    .setTitle('Message Deleted')
    .setDescription(`**Message:**\n${message.content}`)
    .addFields(
      { name: 'Author', value: message.author.tag, inline: true },
      { name: 'Deleted By', value: author.tag, inline: true },
      { name: 'Channel', value: message.channel.name, inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setTimestamp()
    .setAuthor({
      name: message.author.tag, 
      iconURL: message.author.displayAvatarURL(),
    });

  modlogChannel.send({ embeds: [embed] });
}


async function logSnipeClear(client, message, author) {
  const modlogChannel = message.guild.channels.cache.find(channel => channel.name === 'moderator-only');
  if (!modlogChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#a903fc')
    .setTitle('Snipe Cleared')
    .setDescription('Snipe data has been cleared.')
    .addFields(
      { name: 'Cleared By', value: author.tag, inline: true },
      { name: 'Channel', value: message.channel.name, inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setTimestamp()
    .setAuthor({
      name: message.author.tag, 
      iconURL: message.author.displayAvatarURL(),
    });

  modlogChannel.send({ embeds: [embed] });
}

async function logBan(client, guild, target, moderator, reason) {
  const modlogChannel = guild.channels.cache.find(channel => channel.name === 'moderator-only');
  if (!modlogChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#ff0000')
    .setTitle('User Banned')
    .addFields(
      { name: 'User', value: `${target.user.tag} (${target.id})`, inline: true },
      { name: 'Banned By', value: moderator.tag, inline: true },
      { name: 'Reason', value: reason }
    )
    .setTimestamp()
    .setAuthor({
      name: message.author.tag, 
      iconURL: message.author.displayAvatarURL(),
    });
  modlogChannel.send({ embeds: [embed] });
}

async function logUnban(client, guild, user, author) {
  const modlogChannel = guild.channels.cache.find(channel => channel.name === 'moderator-only');
  if (!modlogChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#00ff00')
    .setTitle('User Unbanned')
    .addFields(
      { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
      { name: 'Unbanned By', value: author.tag, inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setTimestamp()
    .setAuthor({
      name: message.author.tag, 
      iconURL: message.author.displayAvatarURL(),
    });
  modlogChannel.send({ embeds: [embed] });
}

async function logKick(client, guild, user, author, reason) {
  const modlogChannel = guild.channels.cache.find(channel => channel.name === 'moderator-only');
  if (!modlogChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#ffa500')
    .setTitle('User Kicked')
    .addFields(
      { name: 'User', value: `${user.tag} (${user.id})`, inline: true },
      { name: 'Kicked By', value: author.tag, inline: true },
      { name: 'Reason', value: reason, inline: false },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setTimestamp()
    .setAuthor({
      name: message.author.tag, 
      iconURL: message.author.displayAvatarURL(),
    });
  modlogChannel.send({ embeds: [embed] });
}

async function logClearMessages(client, message, author, amount, messagesContent) {
  // Log to the file system
  const filePath = path.join(__dirname, 'cleared_messages.txt');
  
  fs.appendFile(filePath, messagesContent + '\n\n', err => {
    if (err) {
      console.error('Failed to save cleared messages:', err);
    }
  });

  // Log to the modlog channel with an embed
  const modlogChannel = message.guild.channels.cache.find(ch => ch.name === 'moderator-only');
  if (!modlogChannel) return;

  const embed = new EmbedBuilder()
    .setColor('#03fcb6')
    .setTitle('Messages Cleared')
    .setDescription(`**Actioned By:** ${author.tag}\n**Channel:** ${message.channel.name}`)
    .addFields(
      { name: 'Amount Cleared', value: `${amount}`, inline: true },
      { name: 'Cleared By', value: author.tag, inline: true },
      { name: 'Time', value: `<t:${Math.floor(Date.now() / 1000)}:R>`, inline: true }
    )
    .setTimestamp()
    .setAuthor({
      name: message.author.tag, 
      iconURL: message.author.displayAvatarURL(),
    });
  // Send the embed with the text file attached
  try {
    await modlogChannel.send({
      embeds: [embed],
      files: [filePath]
    });

    // Delete the file after sending
    fs.unlink(filePath, (err) => {
      if (err) {
        console.error('Failed to delete cleared messages file:', err);
      }
    });
  } catch (err) {
    console.error('Failed to send log with file attachment:', err);
  }
}

module.exports = { logMessageDeletion, logSnipeClear, logUnban, logBan, logKick, logClearMessages };
