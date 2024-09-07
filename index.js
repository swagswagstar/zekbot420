const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const axios = require('axios');
const ms = require('ms');

// Load configuration
const configPath = path.join(__dirname, 'config.json');
const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const { token, clientId, guildId, lastfmApiKey, lastfmApiSecret } = config;

// Initialize the Discord client
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers
  ]
});

let logChannelId = null; // Stores the log channel ID
let muteRoleId = null;   // Stores the mute role ID
const actionHistory = []; // Stores history of actions
const userLastFmTokens = {}; // Stores users' Last.fm tokens

// Slash command definitions
const commands = [
  new SlashCommandBuilder().setName('ban').setDescription('Ban a user')
    .addUserOption(option => option.setName('user').setDescription('The user to ban').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the ban').setRequired(false))
    .addStringOption(option => option.setName('duration').setDescription('Duration of the ban (optional)').setRequired(false)),

  new SlashCommandBuilder().setName('kick').setDescription('Kick a user')
    .addUserOption(option => option.setName('user').setDescription('The user to kick').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the kick').setRequired(false)),

  new SlashCommandBuilder().setName('warn').setDescription('Warn a user')
    .addUserOption(option => option.setName('user').setDescription('The user to warn').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the warning').setRequired(true)),

  new SlashCommandBuilder().setName('mute').setDescription('Mute a user')
    .addUserOption(option => option.setName('user').setDescription('The user to mute').setRequired(true))
    .addStringOption(option => option.setName('reason').setDescription('Reason for the mute').setRequired(false))
    .addStringOption(option => option.setName('duration').setDescription('Duration of the mute (optional)').setRequired(false)),

  new SlashCommandBuilder().setName('logchannel').setDescription('Set the log channel')
    .addChannelOption(option => option.setName('channel').setDescription('The channel to send logs').setRequired(true)),

  new SlashCommandBuilder().setName('assignmr').setDescription('Assign the mute role')
    .addRoleOption(option => option.setName('role').setDescription('The role to assign for mutes').setRequired(true)),

  new SlashCommandBuilder().setName('fmlogin').setDescription('Connect your Last.fm account'),

  new SlashCommandBuilder().setName('fm').setDescription('Get the current Last.fm scrobble')
];

const rest = new REST({ version: '10' }).setToken(token);

// Register the slash commands
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

// Bot ready event
client.once('ready', () => {
  console.log('Bot is online!');
});

// Handle slash commands
client.on('interactionCreate', async (interaction) => {
  if (!interaction.isCommand()) return;

  const { commandName, options } = interaction;
  const user = options.getUser('user');

  if (!user) {
      return await interaction.reply('User not found.');
  }

  const reason = options.getString('reason') || 'No reason provided';
  const duration = options.getString('duration') || 'Permanent';
  const member = interaction.guild.members.cache.get(user.id);
  const actionExecutor = interaction.user.tag;

  try {
      if (commandName === 'ban') {
          if (member) {
              await member.ban({ reason });
              await interaction.reply(`Banned ${user.tag} for reason: ${reason}. Duration: ${duration}`);
              logAction('Ban', user, actionExecutor, reason, duration, interaction);
          } else {
              await interaction.reply('User not found.');
          }
      } else if (commandName === 'kick') {
          if (member) {
              await member.kick(reason);
              await interaction.reply(`Kicked ${user.tag} for reason: ${reason}`);
              logAction('Kick', user, actionExecutor, reason, null, interaction);
          } else {
              await interaction.reply('User not found.');
          }
      } else if (commandName === 'warn') {
          if (member) {
              await interaction.reply(`Warned ${user.tag} for reason: ${reason}`);
              logAction('Warn', user, actionExecutor, reason, null, interaction);
          } else {
              await interaction.reply('User not found.');
          }
      } else if (commandName === 'mute') {
          if (!muteRoleId) {
              return await interaction.reply('Mute role not assigned.');
          }
          if (member) {
              await member.roles.add(muteRoleId);
              await interaction.reply(`Muted ${user.tag} for reason: ${reason}. Duration: ${duration}`);
              logAction('Mute', user, actionExecutor, reason, duration, interaction);

              if (duration !== 'Permanent') {
                  const msDuration = ms(duration);
                  setTimeout(async () => {
                      await member.roles.remove(muteRoleId);
                      console.log(`Unmuted ${user.tag} after ${duration}`);
                  }, msDuration);
              }
          } else {
              await interaction.reply('User not found.');
          }
      } else if (commandName === 'logchannel') {
          logChannelId = options.getChannel('channel').id;
          await interaction.reply(`Log channel set to <#${logChannelId}>.`);
      } else if (commandName === 'assignmr') {
          muteRoleId = options.getRole('role').id;
          await interaction.reply(`Mute role set to <@&${muteRoleId}>.`);
      } else if (commandName === 'fmlogin') {
          const authUrl = `https://www.last.fm/api/auth/?api_key=${lastfmApiKey}&token=${lastfmApiSecret}&callback_url=${encodeURIComponent('https://3d1f-31-164-90-246.ngrok-free.app')}`;
          await interaction.reply(`Please [click here](<${authUrl}>) to connect your Last.fm account.`);
      } else if (commandName === 'fm') {
          const userId = interaction.user.id;
          if (!userLastFmTokens[userId]) {
              return await interaction.reply("This command requires a Last.fm account connected to the bot. If you have one, [click here](https://your-ngrok-url.com/callback) to connect your accounts.");
          }

          try {
              const token = userLastFmTokens[userId];
              const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${userId}&api_key=${lastfmApiKey}&format=json`, {
                  headers: {
                      'Authorization': `Bearer ${token}`
                  }
              });

              const track = response.data.recenttracks.track[0];
              if (track) {
                  const embed = new EmbedBuilder()
                      .setAuthor({ name: `NOW PLAYING for ${interaction.user.username}` })
                      .setTitle(track.name)
                      .setURL(track.url)
                      .setDescription(`Artist: **${track.artist['#text']}**\nAlbum: **${track.album['#text']}**`)
                      .setThumbnail(track.image.find(img => img.size === 'large')['#text'])
                      .setColor("#f50000")
                      .setFooter({ text: `${response.data.user.playcount} total scrobbles` })
                      .setTimestamp();

                  await interaction.reply({ embeds: [embed] });
              } else {
                  await interaction.reply('No recent tracks found.');
              }
          } catch (error) {
              console.error('Error fetching Last.fm data:', error);
              await interaction.reply('There was an error fetching your Last.fm data.');
          }
      }
  } catch (error) {
      console.error('Error handling interaction:', error);
      await interaction.reply('There was an error processing your request.');
  }
});


// Log actions to the specified log channel
async function logAction(action, user, executor, reason, duration, interaction) {
  if (!logChannelId) {
    console.error('Log channel ID is not set.');
    return;
  }

  const logChannel = interaction.guild.channels.cache.get(logChannelId);
  if (!logChannel) {
    console.error(`Log channel not found: ${logChannelId}`);
    return;
  }

  const randomColor = Math.floor(Math.random() * 16777215).toString(16);

  const embed = new EmbedBuilder()
    .setAuthor({ name: user.username, iconURL: user.displayAvatarURL() })
    .setTitle(action)
    .setDescription(`**Reason**: ${reason}\n**Duration**: ${duration || 'N/A'}`)
    .setColor(`#${randomColor}`)
    .setTimestamp();

  await logChannel.send({ embeds: [embed] });
}


// Handle prefixed commands (non-slash) with `,`
client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const prefix = ',';

  if (!message.content.startsWith(prefix)) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'fm') {
    const userId = message.author.id;
    if (!userLastFmTokens[userId]) {
      return await message.reply("This command requires a Last.fm account connected to the bot. If you have one, [click here](https://your-ngrok-url.com/callback) to connect your accounts.");
    }

    try {
      const token = userLastFmTokens[userId];
      const response = await axios.get(`https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${userId}&api_key=${lastfmApiKey}&format=json`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const track = response.data.recenttracks.track[0];
      if (track) {
        const embed = new EmbedBuilder()
          .setAuthor({ name: `NOW PLAYING for ${message.author.username}` })
          .setTitle(track.name)
          .setURL(track.url)
          .setDescription(`Artist: **${track.artist['#text']}**\nAlbum: **${track.album['#text']}**`)
          .setThumbnail(track.image.find(img => img.size === 'large')['#text'])
          .setColor("#f50000")
          .setFooter({ text: `${response.data.user.playcount} total scrobbles` })
          .setTimestamp();

        await message.reply({ embeds: [embed] });
      } else {
        await message.reply('No recent tracks found.');
      }
    } catch (error) {
      console.error('Error fetching Last.fm data:', error);
      await message.reply('There was an error fetching your Last.fm data.');
    }
  }
});

// Login the bot
client.login(token);
