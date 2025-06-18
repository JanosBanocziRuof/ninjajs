const functions = require('../global-functions.js')

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

const nf = new Intl.NumberFormat('en-US')

module.exports = {
    // build the slash command
    data: new SlashCommandBuilder()
        .setName('level')
        .setDescription('Get the level of a player.')
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
            const currentLevel = Math.min(Math.max(Math.floor(.2 * Math.sqrt(profile['experience'] / 15.625)), 1), 240);
            const nextLevel = Math.min(currentLevel + 1, 240);
            const expForNextLevel = Math.ceil(((nextLevel / 0.2) ** 2) * 15.625);
            const expNeeded = expForNextLevel - profile['experience'];

            const shurikenTier = Math.floor(currentLevel / 16);
            const nextShurikenLevel = (shurikenTier + 1) * 16;
            const expForNextShuriken = Math.ceil(((nextShurikenLevel / 0.2) ** 2) * 15.625);
            const expNeededForShuriken = expForNextShuriken - profile['experience'];

            const shurikenEmoji = functions.shurikens[Math.floor(currentLevel / 16)];

            pingEm = new EmbedBuilder()
                .setColor(color)
                .setDescription(
                    `# **Name:** \`${profile['name']}\`\n` +
                    `**Level:** ${nf.format(currentLevel)}\n` +
                    `**Shuriken:** ${shurikenEmoji}\n` +
                    `**Exp:** ${nf.format(profile['experience'])} / ${currentLevel >= 240 ? nf.format(profile['experience']) : nf.format(expForNextLevel)}\n` +
                    `- **Next Lvl:** ${currentLevel >= 240 ? 'Max Level' : nf.format(Math.max(expNeeded, 0))}\n` +
                    `- **Next shuriken:** ${nextShurikenLevel > 240 ? 'N/A' : nf.format(Math.max(expNeededForShuriken, 0))}`
                )
        }

        await interaction.editReply({ embeds: [pingEm] });

    },
};