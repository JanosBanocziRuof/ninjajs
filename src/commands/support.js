const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('support')
		.setDescription('Get a link to the support server.'),
	async execute(interaction) {
		const pingEm = new EmbedBuilder()
			.setColor(interaction.guild.members.me.displayHexColor)
			.setDescription('Fear not! Cavalry has arrived - there is a [support server](https://discord.gg/HaJ5ZGCNkH).');
		await interaction.reply({ embeds: [pingEm], ephemeral: true });
	},
};