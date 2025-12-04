let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const functions = require('../global-functions.js')


module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Get the latency of the bot and the Ninja.io API.'),
    async execute(interaction) {
        await interaction.deferReply()
        const start = Date.now()
        await fetch(functions.apiURLBase)
        const APIping = Date.now() - start
        const pingEm = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setTitle('🏓Pong!')
            .setDescription(`🤖Bot Ping: ${Math.round(interaction.client.ws.ping)}ms\n🛰️Ninja.io API ping: ${APIping}ms`);
        await interaction.editReply({ embeds: [pingEm] });
    },
};