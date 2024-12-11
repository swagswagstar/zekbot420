const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const ms = require('ms');

const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { token, clientId, guildId } = config;

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

let logChannelId = null;
let muteRoleId = null;
let welcomeChannelId = null;

const commands = [
  new SlashCommandBuilder().setName('ban').setDescription('🔨 Ban a user')
    .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the ban').setRequired(false))
    .addStringOption(option => option.setName('duration').setDescription('Duration of the ban (optional)').setRequired(false)),

  new SlashCommandBuilder().setName('kick').setDescription('👢 Kick a user')
    .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the kick').setRequired(false)),

  new SlashCommandBuilder().setName('logchannel').setDescription('📝 Set the log channel')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to send logs').setRequired(true)),

  new SlashCommandBuilder().setName('assignmr').setDescription('🔇 Assign the mute role')
    .addRoleOption(option => option.setName('role').setDescription('The role to assign for mutes').setRequired(true)),

  new SlashCommandBuilder().setName('welcomechannel').setDescription('🎉 Set the welcome channel')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to send welcome messages').setRequired(true))
];

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(
      Routes.applicationGuildCommands(clientId, guildId),
      { body: commands.map(command => command.toJSON()) }
    );

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();

client.once('ready', () => {
  console.log('Bot is online!');
});

client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
  const user = options.getUser('user');

  if (commandName === 'logchannel') {
    logChannelId = options.getChannel('channel').id;
    const embed = new EmbedBuilder()
      .setTitle(':success: Log Channel Set')
      .setDescription(`Log channel set to <#${logChannelId}>.`)
      .setColor('#00ff00');
    return await interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'assignmr') {
    muteRoleId = options.getRole('role').id;
    const embed = new EmbedBuilder()
      .setTitle(':success: Mute Role Assigned')
      .setDescription(`Mute role set to <@&${muteRoleId}>.`)
      .setColor('#00ff00');
    return await interaction.reply({ embeds: [embed] });
  }

  if (commandName === 'welcomechannel') {
    welcomeChannelId = options.getChannel('channel').id;
    const embed = new EmbedBuilder()
      .setTitle(':success: Welcome Channel Set')
      .setDescription(`Welcome channel set to <#${welcomeChannelId}>.`)
      .setColor('#00ff00');
    return await interaction.reply({ embeds: [embed] });
  }

  if (!user) {
    return await interaction.reply('User not found.');
  }

  const reason = options.getString('reason') || 'No reason provided';
  const duration = options.getString('duration') || 'Permanent';
  const member = interaction.guild.members.cache.get(user.id);
  const actionExecutor = interaction.user;

  if (user.id === actionExecutor.id) {
    const embed = new EmbedBuilder()
      .setTitle(':fail: Action Failed')
      .setDescription("That's, you... you can't do that to yourself...???")
      .setColor('#ff0000');
    return await interaction.reply({ embeds: [embed] });
  }

  if (member && member.roles.highest.position >= interaction.member.roles.highest.position) {
    const embed = new EmbedBuilder()
      .setTitle(':fail: Action Failed')
      .setDescription('Insufficient permissions LOL')
      .setColor('#ff0000');
    return await interaction.reply({ embeds: [embed] });
  }

  try {
    if (commandName === 'ban') {
      if (member) {
        await member.ban({ reason });
        const embed = new EmbedBuilder()
          .setTitle(':success: User Banned')
          .setDescription(`**${user.tag}** was banned.
          **Reason**: ${reason}
          **Duration**: ${duration}`)
          .setColor('#ff0000')
          .setTimestamp();
        return await interaction.reply({ embeds: [embed] });
      }
    } else if (commandName === 'kick') {
      if (member) {
        await member.kick(reason);
        const embed = new EmbedBuilder()
          .setTitle(':success: User Kicked')
          .setDescription(`**${user.tag}** was kicked.
          **Reason**: ${reason}`)
          .setColor('#ff0000')
          .setTimestamp();
        return await interaction.reply({ embeds: [embed] });
      }
    }
  } catch (error) {
    console.error('Error handling interaction:', error);
    const embed = new EmbedBuilder()
      .setTitle(':warning: Error')
      .setDescription('There was an error processing your request.')
      .setColor('#ff0000');
    return await interaction.reply({ embeds: [embed] });
  }
});

client.on('guildMemberAdd', (member) => {
  if (!welcomeChannelId) return;

  const channel = member.guild.channels.cache.get(welcomeChannelId);
  if (!channel) return;

  const embed = new EmbedBuilder()
    .setTitle('Welcome!')
    .setDescription(`Heya <@${member.id}>, welcome to **${member.guild.name}**!`)
    .setColor('#00ff00')
    .setTimestamp();

  channel.send({ embeds: [embed] });
});

client.login(token);
