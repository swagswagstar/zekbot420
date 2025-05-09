const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = {
  token: process.env.TOKEN,
  prefix: process.env.PREFIX
};

const { logMessageDeletion, logSnipeClear } = require('./log'); // Import the log module

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();
client.snipes = new Map();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('tatum shoot bricks in a playoff game', { type: 3 });
});

client.on('messageCreate', message => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.find(cmd => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName)));
  
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing that command.');
  }
});

client.on('messageCreate', async (message) => {
  if (message.content === ',cs' || message.content === ',clearsnipe') {
    await logSnipeClear(client, message, message.author);
  }
});

client.login(config.token);
require('./storesnipe')(client);
