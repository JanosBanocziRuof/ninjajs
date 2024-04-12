const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents, GatewayIntentBits, Events } = require('discord.js');
// use dotenv to load the .env file if on linux. start the bot with 'npm run win' on windows, else 'node .'
if (process.platform == 'linux'){ require('dotenv').config() }


// ###### REMEMBER ######
// How to deploy commands:
// WINDOWS: 'node --env-file=.env ./src/deploy-commands.js' 
//          'node --env-file=.env ./src/deploy-commands-global.js'
// LINUX: 'node ./src/deploy-commands.js'
//        'node ./src/deploy-commands-global.js'

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

client.on(Events.InteractionCreate, async interaction => {
    if (!interaction.isCommand()) {
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
            console.log(`Autocomp command: \x1b[36m/${interaction.commandName}\x1b[97m, Author ID: ${interaction.user.id}, Server: ${interaction.guild.name}\n\t\x1b[90mOptions: ${JSON.stringify(interaction.options.data)}\x1b[97m`);
			await command.autocomplete(interaction);
		} else {
            console.log(`Executed command: \x1b[32m/${interaction.commandName}\x1b[97m, Author ID: ${interaction.user.id}, Server: ${interaction.guild.name}\n\t\x1b[90mOptions: ${JSON.stringify(interaction.options.data)}\x1b[97m`);
			await command.execute(interaction);
		}
	} catch (error) {
		console.error(error);
		// await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
	}
});

// login
client.login(process.env.TOKEN);