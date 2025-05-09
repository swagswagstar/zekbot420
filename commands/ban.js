const { PermissionFlagsBits } = require('discord.js');
const { logBan } = require('../log');

module.exports = {
  name: 'ban',
  aliases: ['byebye'],
  async execute(message, args) {
    if (!message.member.permissions.has(PermissionFlagsBits.BanMembers)) return;

    const target = message.mentions.members.first();
    if (!target) return message.reply('Mention a user to ban.');
    if (!target.bannable) return message.reply('I can’t ban that user.');

    const reason = args.slice(1).join(' ') || 'No reason specified';

    try {
      await target.send(`You were banned from **${message.guild.name}**. Reason: ${reason}`);
    } catch {}

    await target.ban({ reason });

    await logBan(message.client, message.guild, target, message.author, reason);
    message.reply(`✌️`);
  }
};
