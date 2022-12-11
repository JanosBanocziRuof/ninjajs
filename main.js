const fetch  = require('node-fetch');
const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents, GatewayIntentBits, Events } = require('discord.js');
const { token } = require('./config.json');


// ###### REMEMBER ######
// type 'node deploy-commands.js' in a terminal to deploy the commands

// create a new client instance
const client  = new Client({intents: [GatewayIntentBits.Guilds]});

client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const eventsPath = path.join(__dirname, 'events');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	// Set a new item in the Collection with the key as the command name and the value as the exported module
	if ('data' in command && 'execute' in command) {
		client.commands.set(command.data.name, command);
	} else {
		console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

for (const file of eventFiles) {
	const filePath = path.join(eventsPath, file);
	const event = require(filePath);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(...args));
	}
}

// FIXME: console logs everything
client.on(Events.InteractionCreate, async interaction => {
   if (!interaction.isCommand()){
      if (!interaction.isAutocomplete()) {
         return;
      }
   }
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		if (interaction.isAutocomplete()) {
			await command.autocomplete(interaction);
		} else {
			await command.execute(interaction);
		}
	} catch (error) {
		console.error(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// login
client.login(token);