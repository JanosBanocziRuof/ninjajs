const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Invite me!'),
	async execute(interaction) {
		const pingEm = new EmbedBuilder()
			.setColor(interaction.guild.members.me.displayHexColor)
			.setDescription("Thank you for wanting me in you server! You can either invite me by clicking on my profile, or clicking [here.](https://discord.com/api/oauth2/authorize?client_id=816427796317470760&permissions=260385931072&scope=bot%20applications.commands) Send a direct message to my developer (<@!483977391459532800>) if you encounter any problems");
		await interaction.reply({ embeds: [pingEm], ephemeral: true });
	},
};