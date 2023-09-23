const functions = require('../global-functions.js')

const fetch  = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const nf = new Intl.NumberFormat('en-US')

function winRateCalc(usnm, json, ID) {
    var total = 0
    var wins = 0
    var games = json['games']
    for (let i = 0; i < games.length; i++) {
        // using the player's ID, figure out if they are [gd][p1_id] or [gd][p2_id]. put p1 or p2 in a var
        if (games[i]['gd']['p1_id'] == ID) {
            if (parseFloat(games[i]['gd']['p1_delta']) > 0) {   // if p1 won
                wins++
            }
        } else {
            if (parseFloat(games[i]['gd']['p2_delta']) > 0) {   // if p2 won
                wins++
            }
        }
        total++
    }
    return `\`${usnm}\`'s **Win Rate:** ${(Math.floor((parseFloat(wins) / parseFloat(total)) * 100))}% in ${total} games`
}

function historyFormatter(json, ID) {
    var games = json['games']
    var output = ''
    // vector of length 10
    var opponents = []
    var maxOppenentNameLength = 0

    var interations = 0
    if (games.length > 10) {
        interations = 10
    } else {
        interations = games.length
    }

    for (let i = 0; i < interations; i++) {
        var reason, delta, opponent = ''
        if (games[i]['res'] == 'noshow'){
            reason = 'No Show'
            // if the player is p1
            if (games[i]['gd']['p1_id'] == ID) {
                delta = parseFloat(games[i]['gd']['p1_delta'])
                opponent = games[i]['gd']['p2_name']
            } else {
                delta = parseFloat(games[i]['gd']['p2_delta'])
                opponent = games[i]['gd']['p1_name']
            }
        } else if (games[i]['res'] == 'draw') {
            reason = 'Draw'
            if (games[i]['gd']['p1_id'] == ID) {
                delta = parseFloat(games[i]['gd']['p1_delta'])
                opponent = games[i]['gd']['p2_name']
            } else {
                delta = parseFloat(games[i]['gd']['p2_delta'])
                opponent = games[i]['gd']['p1_name']
            }
        } else {
            if (games[i]['gd']['p1_id'] == ID) {
                if (parseFloat(games[i]['gd']['p1_delta']) > 0) {
                    reason = 'Win'
                } else {
                    reason = 'Loss'
                }
                delta = parseFloat(games[i]['gd']['p1_delta'])
                opponent = games[i]['gd']['p2_name']
            } else {
                if (parseFloat(games[i]['gd']['p2_delta']) > 0) {
                    reason = 'Win'
                } else {
                    reason = 'Loss'
                }
                delta = parseFloat(games[i]['gd']['p2_delta'])
                opponent = games[i]['gd']['p1_name']
            }
        }

        var date = games[i]['date']
        // turn date into a date object, its current format is 2023-09-20 03:28:19 
        date = new Date(date)
        // turn the date object into a int of epoch time
        date = Date.parse(date) / 1000
        // put the opponent in the vector
        opponents.push(opponent)
        // if the opponent's name is longer than the current max, set the max to the opponent's name
        if (opponent.length > maxOppenentNameLength) {
            maxOppenentNameLength = opponent.length
        }
        output += `**${reason}**(${delta})\n>>>\`namePlaceholder_${i}\` on <t:${date}:d>\n`
    }
    // make all the names in the vector the same length using extra spaces at the end
    for (let i = 0; i < opponents.length; i++) {
        var spaces = ''
        var difference = maxOppenentNameLength - opponents[i].length
        for (let j = 0; j < difference; j++) {
            spaces += ' '
        }
        output = output.replace(`namePlaceholder_${i}`, `${opponents[i]}${spaces}`)
    }
    return output
}

module.exports = {
   // build the slash command
	data: new SlashCommandBuilder()
   .setName('1v1')
   .setDescription('Get the 1v1 history of a player.')
   .addStringOption(option =>
      option.setName('name')
         .setDescription('The username')
         .setRequired(true))
   .addBooleanOption(option =>
      option.setName('id')
         .setDescription('ID or not?')),

// execute the slash command
async execute(interaction) {
   // try to defer the reply
   
   await interaction.deferReply()
   
   var color, history, pingEm, formatted, userID, winRateString, username = ''

   if (interaction.options.getBoolean('id')) {
      color = await functions.getAura('ID', interaction.options.getString('name'))
      userID = interaction.options.getString('name')
      username = await functions.getProfile('ID', interaction.options.getString('name'))
      if (username != 'badName') { username = username['name'] }
   } else {
      color = await functions.getAura('name', interaction.options.getString('name'))
      // get only the user's ID
      userID = await functions.getUserID(interaction.options.getString('name'))
      username = interaction.options.getString('name')
   }

    // fetch the user's 1v1 history from https://api2.ninja.io/user/[userID]/match-history
    await new Promise(r => setTimeout(r, 100));
    const historyResponse = await fetch(`https://api2.ninja.io/user/${userID}/match-history`)
    if ((historyResponse.status == 500) || (userID == 'badName') || (username == 'badName')) {
        history = 'badName';
    } else if (historyResponse.status != 200) {
        history = 'invalid';
    } else{
        var temp = await historyResponse.json();
        
        if (temp['games'].length == 0) {
            formatted = 'No games found'
            winRateString = `\`${username}\`'s **Win Rate:** 0% in 0 games`
        } else {
            winRateString = winRateCalc(username, temp, userID)
            formatted = historyFormatter(temp, userID)
        }
    }




    if (history == 'invalid') {
        pingEm = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setDescription('Something went critically wrong. Please try again later.')
        await interaction.editReply({ embeds: [pingEm] });
    } else if (history == 'badName') {
        pingEm = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setDescription('I could not find a player with that name, please double check your spelling.\nIf you unsure of the spelling, you can try searching for them using </search:1051343380069752909>.')
        await interaction.editReply({ embeds: [pingEm] });
    } else {
        pingEm = new EmbedBuilder()
            .setColor(color)
            .setTitle(winRateString)
            .setDescription(formatted)
    }

	
   await interaction.editReply({ embeds: [pingEm]});
   
	},
};