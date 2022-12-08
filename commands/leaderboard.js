const fetch  = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton, MessageEmbed, ButtonInteraction } = require('discord.js');

function getWeaponLeaderboard(type) {
    return fetch(`https://api.ninja.io/user/weapon-ranking/${type}`)
      .then(res => {
        return res.json()
      })
  }
function getSkillXPLeaderboard() {
    return fetch('https://api.ninja.io/user/ranking')
        .then(res => {
            return res.json()
        })
}

function getWeaponRanking() {
    return fetch('https://api.ninja.io/user/weapon-ranking')
        .then(res => {
            return res.json()
        })
}

function getTitle(type, value) {
    if (type == "skill_ranking"){
        if (value < 1200){
            return('<:newbie:922321597229060126>')
        } else if (value < 2700){
            return('<:beginner:922321599552696461>')
        } else if (value < 4500){
            return('<:novice:922321599607238696>')
        } else if (value < 6600){
            return('<:initiated:922321599082942476>')
        } else if (value < 9000){
            return('<:trained:922321599569473666>')
        } else if (value < 11700){
            return('<:competent:922321599590432768>')
        } else if (value < 14700){
            return('<:adept:922321597447155742>')
        } else if (value < 18000){
            return('<:skilled:922321597291958322>')
        } else if (value < 21600){
            return('<:proficient:922321599334584321>')
        } else if (value < 25500){
            return('<:advanced:922321599531733072>')
        } else if (value < 29700){
            return('<:expert:922321597291986985>')
        } else if (value < 34200){
            return('<:elite:922321599603048488>')
        } else if (value < 39000){
            return('<:champion:922321597237428265>')
        } else if (value < 44100){
            return('<:master:922321599552696441>')
        } else if (value < 49500){
            return('<:grandmaster:922321599280087081>')
        } else {
            return('<:ninja:922321599401697311>')
        }
    } else if (type == "level_ranking"){
        if (value < 16){
            return('<:GreyShuriken:834903789810745404>')
        } else if (value < 32){
            return('<:GreyStarShuriken:834903789836173382>')
        } else if (value < 48){
            return('<:RedShuriken:834903789706149929>')
        } else if (value < 64){
            return('<:RedStarShuriken:834903789621215302>')
        } else if (value < 80){
            return('<:OrangeShuriken:834903789428539490>')
        } else if (value < 96){
            return('<:OrangeStarShuriken:834903789668270140>')
        } else if (value < 112){
            return('<:YellowShuriken:834903789223673868>')
        } else if (value < 128){
            return('<:YellowStarShuriken:834903789751369728>')
        } else if (value < 144){
            return('<:GreenShuriken:834903789659095100>')
        } else if (value < 160){
            return('<:GreenStarShuriken:834903789604438056>')
        } else {
            return('<:BlueShuriken:834903789131530291>')
        }
    }
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('leaderboard')
		.setDescription('Fetch a leaderboard.')
        .addSubcommand(subcommand =>
            subcommand
                .setName('weapon')
                .setDescription('Fetch a weapon leaderboard')
                .addStringOption(option =>
                    option.setName('leaderboard')
                        .setDescription('Select a leaderboard')
                        .setRequired(true)
                        .addChoice('Fists','-1')
                        .addChoice('Shotgun','1')
                        .addChoice('SMG','2')
                        .addChoice('M79','3')
                        .addChoice('Barrett','4')
                        .addChoice('Shock Rifle','5')
                        .addChoice('Pulse Gun','6')
                        .addChoice('Flamer','7')
                        .addChoice('RPG','8')
                        .addChoice('Rifle','9')
                        .addChoice('Lasergun','10')
                        .addChoice('AK-47','12')
                        .addChoice('Deagles','24')
                        .addChoice('Minigun','26')
                        .addChoice('X75','27')
                        .addChoice('MAC-10','28')
                        .addChoice('Bow','29')
                        .addChoice('Avenger','30')
                        .addChoice('Carbine','31')
                        .addChoice('Chainsaw','204')
                        .addChoice('Link Gun','213')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('throwable')
                .setDescription('Fetch a throwable leaderboard')
                .addStringOption(option =>
                    option.setName('leaderboard')
                        .setDescription('Select a leaderboard')
                        .setRequired(true)
                        .addChoice('Hand Grenade','20')
                        .addChoice('Cluster Grenade','21')
                        .addChoice('Shuriken','23')
                        .addChoice('Snowballs','25')))
        .addSubcommand(subcommand =>
            subcommand
                .setName('other')
                .setDescription('Fetch a skill or experience leaderboard')
                .addStringOption(option =>
                    option.setName('leaderboard')
                        .setDescription('Select a leaderboard')
                        .setRequired(true)
                        .addChoice('Skill','skill_ranking')
                        .addChoice('Experience','level_ranking')
                        .addChoice('Weapons','weapons'))),
	async execute(interaction) {
        await interaction.deferReply();
        const nf = new Intl.NumberFormat('en-US')
        const name = {'-1':'Fists','1':'Shotgun','2':'SMG','3':'M79','4':'Barrett','5':'Shock Rifle','6':'Pulse Gun','7':'Flamer','8':'RPG','9':'Rifle','10':'Lasergun','12':'AK-47','20':'Hand Grenade','21':'Cluster Grenade','23':'Shuriken','24':'Deagles','25':'Snowballs','26':'Minigun','27':'X75','28':'MAC-10','29':'Bow','30':'Avenger','31':'Carbine','204':'Chainsaw','213':'Link Gun'}
        const subCommand = interaction['options']['_subcommand']
        if (subCommand == 'weapon' || subCommand == 'throwable') {
            const lb = (await getWeaponLeaderboard(interaction['options']['_hoistedOptions'][0]['value']))['ranking']
            var whereItsAt = 0
            var max = 10
            var prntlst = ''
            while (whereItsAt < max) {
                prntlst = prntlst+`\n**${whereItsAt+1}**. ${nf.format(lb[whereItsAt]['kills'])} - \`${lb[whereItsAt]['name']}\``
                whereItsAt++
            }
            function bottomCheck(max) {
                if(max == 10) return true
                else return false
            }
            function topCheck(max) {
                if(max == 100) return true
                else return false
            }
            var bottomCheckVar = bottomCheck(max)
            var topCheckVar = topCheck(max)

            var leaderboardEm = new MessageEmbed()
                .setColor(interaction.guild.me.displayHexColor)
                .setTitle(`__**${name[interaction['options']['_hoistedOptions'][0]['value']]} Leaderboard**__`)
                .addField('**Rank.** Kills - Name', prntlst, true)
                .setFooter({text: 'Showing 1-10 out of 100'})
            var row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('first')
                        .setStyle('SECONDARY')
                        .setEmoji('<:start:909536580023238706>')
                        .setDisabled(bottomCheckVar),
                    new MessageButton()
                        .setCustomId('back')
                        .setStyle('SECONDARY')
                        .setEmoji('<:rewind:909536580111323166>')
                        .setDisabled(bottomCheckVar),
                    new MessageButton()
                        .setCustomId('forward')
                        .setStyle('SECONDARY')
                        .setEmoji('<:ff:909536579859669024>')
                        .setDisabled(topCheckVar),
                    new MessageButton()
                        .setCustomId('last')
                        .setStyle('SECONDARY')
                        .setEmoji('<:end:909536580128104478>')
                        .setDisabled(topCheckVar),
                    new MessageButton()
                        .setCustomId('stop')
                        .setStyle('DANGER')
                        .setEmoji('<:x_:909536634234630184>')
                        .setDisabled(false));
            await interaction.editReply({ embeds: [leaderboardEm], components: [row] })
            const messageid = interaction

            const filter = (btMasher) => {
                if(interaction.user.id === btMasher.user.id) return true
                return false
            };
            const collector = interaction.channel.createMessageComponentCollector({
                filter,
                max: 16,
                time: 16000
            })

            collector.on('collect', async i => {
                filter;
                i.deferUpdate()
                if(i.customId === 'stop') return interaction.editReply({components: []})
                else if (i.customId === 'forward') {
                    max = max+10
                    whereItsAt = max-10
                    prntlst = ''
                    bottomCheckVar = bottomCheck(max)
                    topCheckVar = topCheck(max)
                    while (whereItsAt < max) {
                        prntlst = prntlst+`\n**${whereItsAt+1}**. ${nf.format(lb[whereItsAt]['kills'])} - \`${lb[whereItsAt]['name']}\``
                        whereItsAt++
                    }
                    var editedEm = new MessageEmbed()
                        .setColor(interaction.guild.me.displayHexColor)
                        .setTitle(`__**${name[interaction['options']['_hoistedOptions'][0]['value']]} Leaderboard**__`)
                        .addField('**Rank.** Kills - Name', prntlst, true)
                        .setFooter({text: `Showing ${max-9}-${max} out of 100`})
                    var EditedRow = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('first')
                                .setStyle('SECONDARY')
                                .setEmoji('<:start:909536580023238706>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('back')
                                .setStyle('SECONDARY')
                                .setEmoji('<:rewind:909536580111323166>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('forward')
                                .setStyle('SECONDARY')
                                .setEmoji('<:ff:909536579859669024>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('last')
                                .setStyle('SECONDARY')
                                .setEmoji('<:end:909536580128104478>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('stop')
                                .setStyle('DANGER')
                                .setEmoji('<:x_:909536634234630184>')
                                .setDisabled(false));
                    return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                }else if (i.customId === 'back') {
                    max = max-10
                    whereItsAt = max-10
                    prntlst = ''
                    bottomCheckVar = bottomCheck(max)
                    topCheckVar = topCheck(max)
                    while (whereItsAt < max) {
                        prntlst = prntlst+`\n**${whereItsAt+1}**. ${nf.format(lb[whereItsAt]['kills'])} - \`${lb[whereItsAt]['name']}\``
                        whereItsAt++
                    }
                    var editedEm = new MessageEmbed()
                        .setColor(interaction.guild.me.displayHexColor)
                        .setTitle(`__**${name[interaction['options']['_hoistedOptions'][0]['value']]} Leaderboard**__`)
                        .addField('**Rank.** Kills - Name', prntlst, true)
                        .setFooter({text: `Showing ${max-9}-${max} out of 100`})
                    var EditedRow = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('first')
                                .setStyle('SECONDARY')
                                .setEmoji('<:start:909536580023238706>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('back')
                                .setStyle('SECONDARY')
                                .setEmoji('<:rewind:909536580111323166>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('forward')
                                .setStyle('SECONDARY')
                                .setEmoji('<:ff:909536579859669024>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('last')
                                .setStyle('SECONDARY')
                                .setEmoji('<:end:909536580128104478>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('stop')
                                .setStyle('DANGER')
                                .setEmoji('<:x_:909536634234630184>')
                                .setDisabled(false));
                    return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                }else if (i.customId === 'last') {
                    max = 100
                    whereItsAt = max-10
                    prntlst = ''
                    bottomCheckVar = bottomCheck(max)
                    topCheckVar = topCheck(max)
                    while (whereItsAt < max) {
                        prntlst = prntlst+`\n**${whereItsAt+1}**. ${nf.format(lb[whereItsAt]['kills'])} - \`${lb[whereItsAt]['name']}\``
                        whereItsAt++
                    }
                    var editedEm = new MessageEmbed()
                        .setColor(interaction.guild.me.displayHexColor)
                        .setTitle(`__**${name[interaction['options']['_hoistedOptions'][0]['value']]} Leaderboard**__`)
                        .addField('**Rank.** Kills - Name', prntlst, true)
                        .setFooter({text: `Showing ${max-9}-${max} out of 100`})
                    var EditedRow = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('first')
                                .setStyle('SECONDARY')
                                .setEmoji('<:start:909536580023238706>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('back')
                                .setStyle('SECONDARY')
                                .setEmoji('<:rewind:909536580111323166>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('forward')
                                .setStyle('SECONDARY')
                                .setEmoji('<:ff:909536579859669024>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('last')
                                .setStyle('SECONDARY')
                                .setEmoji('<:end:909536580128104478>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('stop')
                                .setStyle('DANGER')
                                .setEmoji('<:x_:909536634234630184>')
                                .setDisabled(false));
                    return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                }else if (i.customId === 'first') {
                    max = 10
                    whereItsAt = max-10
                    prntlst = ''
                    bottomCheckVar = bottomCheck(max)
                    topCheckVar = topCheck(max)
                    while (whereItsAt < max) {
                        prntlst = prntlst+`\n**${whereItsAt+1}**. ${nf.format(lb[whereItsAt]['kills'])} - \`${lb[whereItsAt]['name']}\``
                        whereItsAt++
                    }
                    var editedEm = new MessageEmbed()
                        .setColor(interaction.guild.me.displayHexColor)
                        .setTitle(`__**${name[interaction['options']['_hoistedOptions'][0]['value']]} Leaderboard**__`)
                        .addField('**Rank.** Kills - Name', prntlst, true)
                        .setFooter({text: `Showing ${max-9}-${max} out of 100`})
                    var EditedRow = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('first')
                                .setStyle('SECONDARY')
                                .setEmoji('<:start:909536580023238706>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('back')
                                .setStyle('SECONDARY')
                                .setEmoji('<:rewind:909536580111323166>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('forward')
                                .setStyle('SECONDARY')
                                .setEmoji('<:ff:909536579859669024>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('last')
                                .setStyle('SECONDARY')
                                .setEmoji('<:end:909536580128104478>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('stop')
                                .setStyle('DANGER')
                                .setEmoji('<:x_:909536634234630184>')
                                .setDisabled(false));
                    return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                }
            })
            collector.on('end', (btnInt) => {
                return interaction.editReply({components: []})
            })
        } 
        //weapons and nades ^^^^
        //others vvvvvv
        else {
            if(interaction['options']['_subcommand'] == 'other'){
                const otherSelect = interaction['options']['_hoistedOptions'][0]['value']
                if(otherSelect == 'level_ranking' || otherSelect == 'skill_ranking') {
                    const lbs = (await getSkillXPLeaderboard())
                    const lb = lbs[otherSelect]
                    const alt = {'level_ranking':'level', 'skill_ranking':'skill'}
                    var whereItsAt = 0
                    var max = 10
                    var prntlst = ''
                    while (whereItsAt < max) {
                        prntlst = prntlst+`\n**${whereItsAt+1}**.${getTitle(otherSelect, lb[whereItsAt][alt[otherSelect]])}${nf.format(lb[whereItsAt][alt[otherSelect]])} - \`${lb[whereItsAt]['name']}\``
                        whereItsAt++
                    }
                    function bottomCheck(max) {
                        if(max == 10) return true
                        else return false
                    }
                    function topCheck(max) {
                        if(max == 100) return true
                        else return false
                    }
                    var bottomCheckVar = bottomCheck(max)
                    var topCheckVar = topCheck(max)

                    var leaderboardEm = new MessageEmbed()
                        .setColor(interaction.guild.me.displayHexColor)
                        .setTitle(`__**${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} Leaderboard**__`)
                        .addField(`**Rank.** ${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} - Name`, prntlst, true)
                        .setFooter({text: 'Showing 1-10 out of 100'})
                    var row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('first')
                                .setStyle('SECONDARY')
                                .setEmoji('<:start:909536580023238706>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('back')
                                .setStyle('SECONDARY')
                                .setEmoji('<:rewind:909536580111323166>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('forward')
                                .setStyle('SECONDARY')
                                .setEmoji('<:ff:909536579859669024>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('last')
                                .setStyle('SECONDARY')
                                .setEmoji('<:end:909536580128104478>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('stop')
                                .setStyle('DANGER')
                                .setEmoji('<:x_:909536634234630184>')
                                .setDisabled(false));
                    await interaction.editReply({ embeds: [leaderboardEm], components: [row] })
                    const messageid = interaction

                    const filter = (btMasher) => {
                        if(interaction.user.id === btMasher.user.id) return true
                        return false
                    };
                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        max: 16,
                        time: 16000
                    })

                    collector.on('collect', async i => {
                        filter;
                        i.deferUpdate()
                        if(i.customId === 'stop') return interaction.editReply({components: []})
                        else if (i.customId === 'forward') {
                            max = max+10
                            whereItsAt = max-10
                            prntlst = ''
                            bottomCheckVar = bottomCheck(max)
                            topCheckVar = topCheck(max)
                            while (whereItsAt < max) {
                                prntlst = prntlst+`\n**${whereItsAt+1}**.${getTitle(otherSelect, lb[whereItsAt][alt[otherSelect]])}${nf.format(lb[whereItsAt][alt[otherSelect]])} - \`${lb[whereItsAt]['name']}\``
                                whereItsAt++
                            }
                            var editedEm = new MessageEmbed()
                                .setColor(interaction.guild.me.displayHexColor)
                                .setTitle(`__**${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} Leaderboard**__`)
                                .addField(`**Rank.** ${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} - Name`, prntlst, true)
                                .setFooter({text: `Showing ${max-9}-${max} out of 100`})
                            var EditedRow = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('first')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:start:909536580023238706>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('back')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:rewind:909536580111323166>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('forward')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:ff:909536579859669024>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('last')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:end:909536580128104478>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('stop')
                                        .setStyle('DANGER')
                                        .setEmoji('<:x_:909536634234630184>')
                                        .setDisabled(false));
                            return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                        }else if (i.customId === 'back') {
                            max = max-10
                            whereItsAt = max-10
                            prntlst = ''
                            bottomCheckVar = bottomCheck(max)
                            topCheckVar = topCheck(max)
                            while (whereItsAt < max) {
                                prntlst = prntlst+`\n**${whereItsAt+1}**.${getTitle(otherSelect, lb[whereItsAt][alt[otherSelect]])}${nf.format(lb[whereItsAt][alt[otherSelect]])} - \`${lb[whereItsAt]['name']}\``
                                whereItsAt++
                            }
                            var editedEm = new MessageEmbed()
                                .setColor(interaction.guild.me.displayHexColor)
                                .setTitle(`__**${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} Leaderboard**__`)
                                .addField(`**Rank.** ${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} - Name`, prntlst, true)
                                .setFooter({text: `Showing ${max-9}-${max} out of 100`})
                            var EditedRow = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('first')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:start:909536580023238706>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('back')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:rewind:909536580111323166>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('forward')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:ff:909536579859669024>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('last')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:end:909536580128104478>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('stop')
                                        .setStyle('DANGER')
                                        .setEmoji('<:x_:909536634234630184>')
                                        .setDisabled(false));
                            return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                        }else if (i.customId === 'last') {
                            max = 100
                            whereItsAt = max-10
                            prntlst = ''
                            bottomCheckVar = bottomCheck(max)
                            topCheckVar = topCheck(max)
                            while (whereItsAt < max) {
                                prntlst = prntlst+`\n**${whereItsAt+1}**.${getTitle(otherSelect, lb[whereItsAt][alt[otherSelect]])}${nf.format(lb[whereItsAt][alt[otherSelect]])} - \`${lb[whereItsAt]['name']}\``
                                whereItsAt++
                            }
                            var editedEm = new MessageEmbed()
                                .setColor(interaction.guild.me.displayHexColor)
                                .setTitle(`__**${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} Leaderboard**__`)
                                .addField(`**Rank.** ${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} - Name`, prntlst, true)
                                .setFooter({text: `Showing ${max-9}-${max} out of 100`})
                            var EditedRow = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('first')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:start:909536580023238706>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('back')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:rewind:909536580111323166>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('forward')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:ff:909536579859669024>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('last')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:end:909536580128104478>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('stop')
                                        .setStyle('DANGER')
                                        .setEmoji('<:x_:909536634234630184>')
                                        .setDisabled(false));
                            return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                        }else if (i.customId === 'first') {
                            max = 10
                            whereItsAt = max-10
                            prntlst = ''
                            bottomCheckVar = bottomCheck(max)
                            topCheckVar = topCheck(max)
                            while (whereItsAt < max) {
                                prntlst = prntlst+`\n**${whereItsAt+1}**.${getTitle(otherSelect, lb[whereItsAt][alt[otherSelect]])}${nf.format(lb[whereItsAt][alt[otherSelect]])} - \`${lb[whereItsAt]['name']}\``
                                whereItsAt++
                            }
                            var editedEm = new MessageEmbed()
                                .setColor(interaction.guild.me.displayHexColor)
                                .setTitle(`__**${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} Leaderboard**__`)
                                .addField(`**Rank.** ${alt[otherSelect][0].toUpperCase()+alt[otherSelect].slice(1)} - Name`, prntlst, true)
                                .setFooter({text: `Showing ${max-9}-${max} out of 100`})
                            var EditedRow = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('first')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:start:909536580023238706>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('back')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:rewind:909536580111323166>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('forward')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:ff:909536579859669024>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('last')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:end:909536580128104478>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('stop')
                                        .setStyle('DANGER')
                                        .setEmoji('<:x_:909536634234630184>')
                                        .setDisabled(false));
                            return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                        }
                    })
                    collector.on('end', (btnInt) => {
                        return interaction.editReply({components: []})
                    })
//#######################################################################
//#######################################################################
                } else if(otherSelect == 'weapons') {
                    const numberOWeapons = 25
                    const lbs = (await getWeaponRanking())
                    const lb = lbs['ranking']
                    var whereItsAt = 0
                    var max = 10
                    var prntlst = ''
                    while (whereItsAt < max) {
                        prntlst = prntlst+`\n**${whereItsAt+1}**. \`${name[lb[whereItsAt]['id']]}\` - ${nf.format(lb[whereItsAt]['kills'])}`
                        whereItsAt++
                    }
                    function bottomCheck(max) {
                        if(max == 10) return true
                        else return false
                    }
                    function topCheck(max) {
                        if(max == numberOWeapons) return true
                        else return false
                    }
                    var bottomCheckVar = bottomCheck(max)
                    var topCheckVar = topCheck(max)

                    var leaderboardEm = new MessageEmbed()
                        .setColor(interaction.guild.me.displayHexColor)
                        .setTitle(`__**Weapon Ranking**__`)
                        .addField(`**Rank.** Weapon - Kills`, prntlst, true)
                        .setFooter({text: `Showing 1-10 out of ${numberOWeapons}`})
                    var row = new MessageActionRow()
                        .addComponents(
                            new MessageButton()
                                .setCustomId('first')
                                .setStyle('SECONDARY')
                                .setEmoji('<:start:909536580023238706>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('back')
                                .setStyle('SECONDARY')
                                .setEmoji('<:rewind:909536580111323166>')
                                .setDisabled(bottomCheckVar),
                            new MessageButton()
                                .setCustomId('forward')
                                .setStyle('SECONDARY')
                                .setEmoji('<:ff:909536579859669024>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('last')
                                .setStyle('SECONDARY')
                                .setEmoji('<:end:909536580128104478>')
                                .setDisabled(topCheckVar),
                            new MessageButton()
                                .setCustomId('stop')
                                .setStyle('DANGER')
                                .setEmoji('<:x_:909536634234630184>')
                                .setDisabled(false));
                    await interaction.editReply({ embeds: [leaderboardEm], components: [row] })
                    const messageid = interaction

                    const filter = (btMasher) => {
                        if(interaction.user.id === btMasher.user.id) return true
                        return false
                    };
                    const collector = interaction.channel.createMessageComponentCollector({
                        filter,
                        max: 16,
                        time: 16000
                    })

                    collector.on('collect', async i => {
                        filter;
                        i.deferUpdate()
                        if(i.customId === 'stop') return interaction.editReply({components: []})
                        else if (i.customId === 'forward') {
                            if(max > numberOWeapons-10) {
                                max = numberOWeapons
                            } else {
                                max = max+10
                            }
                            whereItsAt = max-10
                            prntlst = ''
                            bottomCheckVar = bottomCheck(max)
                            topCheckVar = topCheck(max)
                            while (whereItsAt < max) {
                                prntlst = prntlst+`\n**${whereItsAt+1}**. \`${name[lb[whereItsAt]['id']]}\` - ${nf.format(lb[whereItsAt]['kills'])}`
                                whereItsAt++
                            }
                            var editedEm = new MessageEmbed()
                                .setColor(interaction.guild.me.displayHexColor)
                                .setTitle(`__**Weapon Ranking**__`)
                                .addField(`**Rank.** Weapon - Kills`, prntlst, true)
                                .setFooter({text: `Showing ${max-9}-${max} out of ${numberOWeapons}`})
                            var EditedRow = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('first')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:start:909536580023238706>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('back')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:rewind:909536580111323166>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('forward')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:ff:909536579859669024>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('last')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:end:909536580128104478>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('stop')
                                        .setStyle('DANGER')
                                        .setEmoji('<:x_:909536634234630184>')
                                        .setDisabled(false));
                            return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                        }else if (i.customId === 'back') {
                            if(max < 20) {
                                max = 10
                            } else {
                                max = max-10
                            }
                            whereItsAt = max-10
                            prntlst = ''
                            bottomCheckVar = bottomCheck(max)
                            topCheckVar = topCheck(max)
                            while (whereItsAt < max) {
                                prntlst = prntlst+`\n**${whereItsAt+1}**. \`${name[lb[whereItsAt]['id']]}\` - ${nf.format(lb[whereItsAt]['kills'])}`
                                whereItsAt++
                            }
                            var editedEm = new MessageEmbed()
                                .setColor(interaction.guild.me.displayHexColor)
                                .setTitle(`__**Weapon Ranking**__`)
                                .addField(`**Rank.** Weapon - Kills`, prntlst, true)
                                .setFooter({text: `Showing ${max-9}-${max} out of ${numberOWeapons}`})
                            var EditedRow = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('first')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:start:909536580023238706>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('back')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:rewind:909536580111323166>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('forward')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:ff:909536579859669024>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('last')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:end:909536580128104478>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('stop')
                                        .setStyle('DANGER')
                                        .setEmoji('<:x_:909536634234630184>')
                                        .setDisabled(false));
                            return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                        }else if (i.customId === 'last') {
                            max = numberOWeapons
                            whereItsAt = max-10
                            prntlst = ''
                            bottomCheckVar = bottomCheck(max)
                            topCheckVar = topCheck(max)
                            while (whereItsAt < max) {
                                prntlst = prntlst+`\n**${whereItsAt+1}**. \`${name[lb[whereItsAt]['id']]}\` - ${nf.format(lb[whereItsAt]['kills'])}`
                                whereItsAt++
                            }
                            var editedEm = new MessageEmbed()
                                .setColor(interaction.guild.me.displayHexColor)
                                .setTitle(`__**Weapon Ranking**__`)
                                .addField(`**Rank.** Weapon - Kills`, prntlst, true)
                                .setFooter({text: `Showing ${max-9}-${max} out of ${numberOWeapons}`})
                            var EditedRow = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('first')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:start:909536580023238706>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('back')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:rewind:909536580111323166>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('forward')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:ff:909536579859669024>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('last')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:end:909536580128104478>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('stop')
                                        .setStyle('DANGER')
                                        .setEmoji('<:x_:909536634234630184>')
                                        .setDisabled(false));
                            return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                        }else if (i.customId === 'first') {
                            max = 10
                            whereItsAt = max-10
                            prntlst = ''
                            bottomCheckVar = bottomCheck(max)
                            topCheckVar = topCheck(max)
                            while (whereItsAt < max) {
                                prntlst = prntlst+`\n**${whereItsAt+1}**. \`${name[lb[whereItsAt]['id']]}\` - ${nf.format(lb[whereItsAt]['kills'])}`
                                whereItsAt++
                            }
                            var editedEm = new MessageEmbed()
                                .setColor(interaction.guild.me.displayHexColor)
                                .setTitle(`__**Weapon Ranking**__`)
                                .addField(`**Rank.** Weapon - Kills`, prntlst, true)
                                .setFooter({text: `Showing ${max-9}-${max} out of ${numberOWeapons}`})
                            var EditedRow = new MessageActionRow()
                                .addComponents(
                                    new MessageButton()
                                        .setCustomId('first')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:start:909536580023238706>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('back')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:rewind:909536580111323166>')
                                        .setDisabled(bottomCheckVar),
                                    new MessageButton()
                                        .setCustomId('forward')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:ff:909536579859669024>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('last')
                                        .setStyle('SECONDARY')
                                        .setEmoji('<:end:909536580128104478>')
                                        .setDisabled(topCheckVar),
                                    new MessageButton()
                                        .setCustomId('stop')
                                        .setStyle('DANGER')
                                        .setEmoji('<:x_:909536634234630184>')
                                        .setDisabled(false));
                            return interaction.editReply({ embeds: [editedEm], components: [EditedRow] })
                        }
                    })
                    collector.on('end', (btnInt) => {
                        return interaction.editReply({components: []})
                    })
                }
            }
        };
	},
};