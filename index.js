const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const config = require('./config.json');
const { logMessageDeletion, logSnipeClear } = require('./log'); // Import the log module

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent]
});

client.commands = new Collection();
client.snipes = new Map(); // Store snipes data

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Logged in as ${client.user.tag}`);
  client.user.setActivity('tatum shoot bricks in a playoff game', { type: 3 });
});

// Store deleted messages
client.on('messageDelete', async (message) => {
  if (message.author.bot) return;

  // Store the deleted message in the snipes map
  client.snipes.set(message.channel.id, {
    user: message.author,
    content: message.content,
    timestamp: Date.now()
  });

  // Log the deleted message to the modlog channel
  await logMessageDeletion(client, message, message.author);
});

client.on('messageCreate', message => {
  if (message.author.bot || !message.content.startsWith(config.prefix)) return;

  const args = message.content.slice(config.prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  // Find the command by name or alias
  const command = client.commands.find(cmd => cmd.name === commandName || (cmd.aliases && cmd.aliases.includes(commandName)));
  
  if (!command) return;

  try {
    command.execute(message, args);
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing that command.');
  }
});

// Log snipe clears
client.on('messageCreate', async (message) => {
  if (message.content === ',cs' || message.content === ',clearsnipe') {
    await logSnipeClear(client, message, message.author);  // Log the snipe clear action
  }
});

client.login(config.token);
