const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const user_class = require('../classes/user_class.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('test')
        .setDescription('dev test command'),
    async execute(interaction) {
        let embed_description = "One, two, three o'clock, four o'clock, rock\nFive, six, seven o'clock, eight o'clock, rock\nNine, ten, eleven o'clock, twelve o'clock, rock\nWe're gonna rock around the clock tonight";

        const pingEm = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setDescription(embed_description);
        await interaction.reply({ embeds: [pingEm], ephemeral: false });

        try {
            let user = new user_class("40008", "id");
            // wait until the user object is fully initialized (change available is set)
            while (!user.change_available) {
                await new Promise(resolve => setTimeout(resolve, 10));
            }
            embed_description = user.print_profile();

            // edit the reply with the new embed
            const newEm = new EmbedBuilder()
                .setColor(interaction.guild.members.me.displayHexColor)
                .setDescription(embed_description)
                .setTimestamp(new Date(user.current_epoch));
            await interaction.editReply({ embeds: [newEm] });


        } catch (error) {
            if (error instanceof TypeError) {
                embed_description = "TypeError: " + error.message;
            } else {
                embed_description = "Error: " + error.message;
            }
        }
    },
};