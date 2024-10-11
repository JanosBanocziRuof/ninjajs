let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});
const functions = require('../global-functions.js')
const { SlashCommandBuilder, EmbedBuilder, MessageAttachment } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('search')
        .setDescription('search for a player or clan')
        .addStringOption(option =>
            option.setName('quary')
                .setDescription('Enter a search quary')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply()
        const quary = interaction.options.getString('quary')
        const userURL = `https://api2.ninja.io/user/search/${quary.replace(/ /g, "")}`
        const clanURL = `https://api2.ninja.io/clan/search/${quary.replace(/ /g, "%20")}`

        const userResponse = await fetch(userURL);
        const userData = await userResponse.json();

        const clanResponse = await fetch(clanURL);
        const clanData = await clanResponse.json();

        if (userData['success'] != true || clanData['success'] != true) {
            const errorEM = new EmbedBuilder()
                .setColor(interaction.guild.members.me.displayHexColor)
                .setTitle('Error')
                .setDescription(userData['error'] || clanData['error'])

            return await interaction.editReply({ embeds: [errorEM] });
        } else {
            var userLength = userData['users'].length
            var clanLength = clanData['clans'].length
            if (userData['users'].length > 10) {
                userLength = 10
            }
            if (clanData['clans'].length > 10) {
                clanLength = 10
            }
            var userDesc = '';
            var clanDesc = '';
            for (let i = 0; i < userLength; i++) {
                userDesc += `\`${userData['users'][i]['name']}\` - ${userData['users'][i]['id']}\n`
            }
            for (let i = 0; i < clanLength; i++) {
                clanDesc += `\`${clanData['clans'][i]['name']}\` - ${clanData['clans'][i]['id']}\n`
            }
            if (userLength == 0) { userDesc = 'No users found' }
            if (clanLength == 0) { clanDesc = 'No clans found' }

            const searchEM = new EmbedBuilder()
                .setColor(interaction.guild.members.me.displayHexColor)
                .setTitle(`Search results for ${quary}`)
                .addFields(
                    { name: 'Users', value: userDesc, inline: true },
                    { name: 'Clans', value: clanDesc, inline: true }
                )

            await interaction.editReply({ embeds: [searchEM] });
        }
    },
}
