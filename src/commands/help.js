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
                { name: '__**Statistics**__', value: '`/stats` - Get the stats of a given player.\n`/kdr` - Get a players K/D ratio.\n`/clan` - Get the stats/members of a given clan.\n`/search` - Search for a player or clan.\n`/leaderboard` - Fetch a leaderboard.\n`/ping` - Get the latency of the bot and the NinjaBattle.io API.\n`/1v1` - Fetch the last 10 1v1s of a player.' },
                { name: `__**Miscellaneous**__`, value: '`/invite` - Get an invite link for me.\n`/support` - Get an invite link to my support server' },
            )
        await interaction.editReply({ embeds: [pingEm] });
    },
};