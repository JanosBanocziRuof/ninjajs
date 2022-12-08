const functions = require('../global-functions.js')

const fetch  = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

function getServers(version) {
    return fetch("https://api.ninja.io/server", {headers: { 'Client-Version': version }})
      .then(res => {
        return res.json()
      })
  }

function online(data) {
    if(data == 'online') {
        return '<:online:908802066300956745>'
    }
    else {
        return '<:offline:908802113168105596>'
    }
}

function fieldBuilder(servers, entries){
    let fields = []
    for(let i = 0; i < entries; i++) {
        fields.push({
            name: `${servers['servers'][i]['name']}${online(servers['servers'][i]['status'])}`,
            value: `Players: ${servers['servers'][i]['players']}\nGames: ${servers['servers'][i]['games']}`,
            inline: true
        })
    }
    return fields
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('servers')
		.setDescription('Get realtime stats of the Ninja.io game servers.'),
	async execute(interaction) {
        await interaction.deferReply();
        const a = await functions.getGameVersion()
        const servers = await getServers(a)
        const b = fieldBuilder(servers, servers['servers'].length)
		const serversEM = new MessageEmbed()
            .setColor(interaction.guild.me.displayHexColor)
            .setTitle(`**${servers['servers'].length} Servers Are Online**`)
            .setFields(b)
		interaction.editReply({ embeds: [serversEM] });
	},
};