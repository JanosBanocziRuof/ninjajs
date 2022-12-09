const fetch  = require('node-fetch');
const functions = require('../global-functions.js')
const { SlashCommandBuilder, EmbedBuilder,  MessageAttachment } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('search')
		.setDescription('search for a player or clan')
        .addSubcommand(subcommand =>
            subcommand
                .setName('player')
                .setDescription('search for a player')
                .addStringOption(option =>
                    option.setName('player')
                        .setDescription('player name')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('clan')
                .setDescription('search for a clan')
                .addStringOption(option =>
                    option.setName('clan')
                        .setDescription('clan name')
                        .setRequired(true))),
	async execute(interaction) {
		await interaction.deferReply()
        const subCommand = interaction['options']['_subcommand']
        if (subCommand === 'player') {
            const player = interaction['options']['_hoistedOptions'][0]['value']
            const url = `https://api.ninja.io/user/search/${player}`
            const response = await fetch(url);
            const data = await response.json();
            if (data['success'] != true) {
                const error = new EmbedBuilder()
                    .setColor(interaction.guild.members.me.displayHexColor)
                    .setTitle('Error')
                    .setDescription(data['error'])
                await interaction.editReply({ embeds: [error] })
                return
            } else {
                var len = data['users'].length
                if (data['users'].length > 10) {
                    len = 10
                } else {
                    len = data['users'].length
                }
                var desc = '';
                for (let i = 0; i < len; i++) {
                    desc = desc + `\n\`${data['users'][i]['name']}\` - ${data['users'][i]['id']}`
                }
                if (len == 0) {
                    desc = 'No users found'
                }
                const embed = new EmbedBuilder()
                    .setTitle(`Search results for \`${player}\``)
                    .setDescription(desc)
                    .setColor(interaction.guild.members.me.displayHexColor)
                await interaction.editReply({ embeds: [embed] });
            }
        }
        if (subCommand === 'clan') {
            const clan = interaction['options']['_hoistedOptions'][0]['value']
            const url = `https://api.ninja.io/clan/search/${clan}`
            const response = await fetch(url);
            const data = await response.json();
            if (data['success'] != true) {
                const error = new EmbedBuilder()
                    .setColor(interaction.guild.members.me.displayHexColor)
                    .setTitle('Error')
                    .setDescription(data['error'])
                await interaction.editReply({ embeds: [error] })
                return
            } else {
                //uncomment the following once buizerd fixed the api
                /*var len = data['clans'].length
                if (data['clans'].length > 10) {
                    len = 10
                } else {
                    len = data['clans'].length
                }
                var desc = '';
                for (let i = 0; i < len; i++) {
                    desc = desc + `\n\`${data['clans'][i]['name']}\` - ${data['clans'][i]['id']}`   //make sure it works once buizerd fixes the api
                }*/
                const embed = new EmbedBuilder()
                    .setTitle(`Unsuccessful`)   //change to `Search results for \`${clan}\`` once buizerd fixes the api
                    .setDescription('Unavailable at the moment due to an API error') //change to desc once buizerd fixes the api
                    .setColor(interaction.guild.members.me.displayHexColor)
                await interaction.editReply({ embeds: [embed] });
            }
        }

	}
}
