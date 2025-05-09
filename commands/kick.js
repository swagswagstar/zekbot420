const { PermissionFlagsBits } = require('discord.js');
const { logKick } = require('../log');

module.exports = {
  name: 'kick',
  aliases: [],
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.KickMembers)) return;

    const target = message.mentions.members.first();
    if (!target) return message.reply('Mention a user to kick.');

    if (!target.kickable) return message.reply('I can’t kick that user.');

    const reason = args.slice(1).join(' ') || '✌️';

    try {
      await target.send(`You were kicked from **${message.guild.name}**. Reason: ${reason}`);
    } catch (err) {}

    await target.kick(reason);
    message.reply(`${target.user.tag} has been kicked.`);

    await logKick(message.client, message.guild, target.user, message.author, reason);
  }
};
