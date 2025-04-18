const functions = require('../global-functions.js')

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const nf = new Intl.NumberFormat('en-US')

module.exports = {
    // build the slash command
    data: new SlashCommandBuilder()
        .setName('kdr')
        .setDescription('Get the K/D ratio of a player.')
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

        var color, profile, pingEm, row = ''

        if (interaction.options.getBoolean('id')) {
            profile = await functions.getProfile('ID', interaction.options.getString('name'))
            color = await functions.getAura('ID', interaction.options.getString('name'))
        } else {
            profile = await functions.getProfile('name', interaction.options.getString('name'))
            color = await functions.getAura('name', interaction.options.getString('name'))
        }

        if (profile == 'invalid') {
            pingEm = new EmbedBuilder()
                .setColor(interaction.guild.members.me.displayHexColor)
                .setDescription('Something went critically wrong. Please try again later.')
            await interaction.editReply({ embeds: [pingEm] });
        } else if (profile == 'badName') {
            pingEm = new EmbedBuilder()
                .setColor(interaction.guild.members.me.displayHexColor)
                .setDescription('I could not find a player with that name, please double check your spelling.\nIf you unsure of the spelling, you can try searching for them using </search:1051343380069752909>.')
            await interaction.editReply({ embeds: [pingEm] });
        } else {
            pingEm = new EmbedBuilder()
                .setColor(color)
                .setDescription(`\`${profile['name']}\`'s K/D Ratio is ${nf.format((profile['kills'] / profile['deaths']).toFixed(3))}`)
        }


        await interaction.editReply({ embeds: [pingEm] });

    },
};