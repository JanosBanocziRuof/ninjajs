const fs = require('node:fs');
const path = require('node:path');
const { Client, Collection, Intents, GatewayIntentBits, Events } = require('discord.js');
const { log } = require('node:console');
// use dotenv to load the .env file if on linux. start the bot with 'npm run win' on windows, else 'node .'
if (process.platform == 'linux') { require('dotenv').config() }


// ###### REMEMBER ######
// How to deploy commands:
// WINDOWS: 'node --env-file=.env ./src/deploy-commands-test.js' 
//          'node --env-file=.env ./src/deploy-commands-global.js'
// LINUX: 'node ./src/deploy-commands-test.js'
//        'node ./src/deploy-commands-global.js'

// create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Add this near the top of your main bot file
process.on('SIGTERM', () => {
    console.log('SIGTERM received. Gracefully shutting down...');

    // Perform cleanup (disconnect from Discord, close database connections, etc.)
    // For example, if you have a Discord client:
    if (client && client.destroy) {
        console.log('Disconnecting from Discord...');
        client.destroy()
            .then(() => {
                console.log('Successfully disconnected from Discord');
                process.exit(0);
            })
            .catch(err => {
                console.error('Error during discord disconnect:', err);
                process.exit(1);
            });
    } else {
        console.log('No cleanup needed, exiting');
        process.exit(0);
    }

    // Force exit after 5 seconds if cleanup doesn't complete
    setTimeout(() => {
        console.log('Forced exit after timeout');
        process.exit(1);
    }, 5000);
});

// You might also want to handle SIGINT for local development
process.on('SIGINT', () => {
    console.log('SIGINT received');
    // Call the same cleanup logic
    process.emit('SIGTERM');
});

client.commands = new Collection();
client.cooldowns = new Collection();

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
    // Cooldown shenanigans
    if (!interaction.isCommand() && !interaction.isAutocomplete()) return;

    const command = interaction.client.commands.get(interaction.commandName);
    if (interaction.isAutocomplete()) {
        // Skip cooldown logic for autocompletions but continue with the rest of the logic
        if (!command) {
            console.error(`No command matching ${interaction.commandName} was found.`);
            return;
        }

        try {
            console.log(`Autocomp command: \x1b[36m/${interaction.commandName}\x1b[97m, Author ID: ${interaction.user.id}, Server: ${interaction.guild.name}\n\t\x1b[90mOptions: ${JSON.stringify(interaction.options.data)}\x1b[97m`);
            await command.autocomplete(interaction);
        } catch (error) {
            console.error(error);
        }
        return;
    }

    const { cooldowns } = interaction.client;

    if (!cooldowns.has(command.data.name)) {
        cooldowns.set(command.data.name, new Collection());
    }

    const now = Date.now();
    const timestamps = cooldowns.get(command.data.name);
    const defaultCooldownDuration = 3;
    const cooldownAmount = (command.cooldown ?? defaultCooldownDuration) * 1_000;

    if (timestamps.has(interaction.user.id)) {
        const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

        if (now < expirationTime) {
            const expiredTimestamp = Math.round(expirationTime / 1_000);
            const secondsLeft = Math.round((expirationTime - now) / 1_000);
            return interaction.reply({ content: `Please wait, you are on a ${secondsLeft} second cooldown for \`${command.data.name}\`.`, ephemeral: true });
        }
    }
    timestamps.set(interaction.user.id, now);
    setTimeout(() => timestamps.delete(interaction.user.id), cooldownAmount);
    // End of cooldown shenanigans

    if (!interaction.isCommand()) {
        if (!interaction.isAutocomplete()) {
            return;
        }
    }

    if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
    }

    try {
        console.log(`Executed command: \x1b[32m/${interaction.commandName}\x1b[97m, Author ID: ${interaction.user.id}, Server: ${interaction.guild.name}\n\t\x1b[90mOptions: ${JSON.stringify(interaction.options.data)}\x1b[97m`);
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        // await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

// login
client.login(process.env.TOKEN);