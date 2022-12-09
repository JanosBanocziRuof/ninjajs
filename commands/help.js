const fetch  = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('help')
		.setDescription('Get an overview of all the commands'),
	async execute(interaction) {
		await interaction.deferReply()
		const pingEm = new EmbedBuilder()
			.setColor(interaction.guild.members.me.displayHexColor)
			.addFields(
                {name: '__**Statistics**__', value: '`/servers` - Get realtime stats of the Ninja.io servers.\n`/stats` - Get the stats of a given player.\n`/leaderboard` - Fetch a leaderboard.\n`/ping` - Get the latency of the bot and the Ninja.io API.'},
				{name: `__**Miscellaneous**__`, value: '`/invite` - Get an invite link for me.\n`/support` - Get an invite link to my support server'},
            )
		await interaction.editReply({ embeds: [pingEm] });
	},
};