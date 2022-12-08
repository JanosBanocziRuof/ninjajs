const fetch  = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ping')
		.setDescription('Get the latency of the bot and the Ninja.io API.'),
	async execute(interaction) {
		await interaction.deferReply()
		const start = Date.now()
    	await fetch("https://api.ninja.io/")
    	const APIping = Date.now()-start
		const pingEm = new MessageEmbed()
			.setColor(interaction.guild.me.displayHexColor)
			.setTitle('🏓Pong!')
			.setDescription(`🤖Bot Ping: ${Math.round(interaction.client.ws.ping)}ms\n🛰️Ninja.io API ping: ${APIping}ms`);
		await interaction.editReply({ embeds: [pingEm] });
	},
};