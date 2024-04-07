const functions = require('../global-functions.js')

const { SlashCommandBuilder,  EmbedBuilder, ActionRowBuilder, ButtonBuilder } = require('discord.js');

const nf = new Intl.NumberFormat('en-US')

function avglvl(xp, members){
   const avgxp = parseInt(xp) / parseInt(members);
   const shurikens = "<:GreyShuriken:834903789810745404> <:GreyStarShuriken:834903789836173382> <:RedShuriken:834903789706149929> <:RedStarShuriken:834903789621215302> <:OrangeShuriken:834903789428539490> <:OrangeStarShuriken:834903789668270140> <:YellowShuriken:834903789223673868> <:YellowStarShuriken:834903789751369728> <:GreenShuriken:834903789659095100> <:GreenStarShuriken:834903789604438056> <:BlueShuriken:834903789131530291>".split(" ")
	const lvl = Math.min(Math.max(Math.floor(.2 * Math.sqrt(avgxp / 15.625)), 1), 160)
	const sure = shurikens[Math.floor(lvl/16)]
	return sure+lvl
}

function avgTit(pts, members){
    const avgpts = parseInt(pts) / parseInt(members);
    return functions.mapToRankTitles(avgpts)
}

function overview(data, leader){
    leader = leader?leader:'None'
    return `**Clan Name:** \`${data['clan']['name']}\`\n**Clan ID:** ${data['clan']['id']}\n**Status:** ${data['clan']['status']}\n**Leader:** ${leader}\n**Members:** ${nf.format(data['memberCount'])}\n**Avg. Level:** ${avglvl(data['clan']['experience'], data['memberCount'])}\n**Total Exp:** ${nf.format(data['clan']['experience'])}\n**Level Rank:** ${nf.format(data['clan']['experience_ranking'])}\n**Total Kills:** ${nf.format(data['clan']['kills'])}\n**Total Deaths:** ${nf.format(data['clan']['deaths'])}\n**Avg. K/D Ratio:** ${Math.round(1000*(parseInt(data['clan']['kills'])/parseInt(data['clan']['deaths'])))/1000 || 0}\n**Total Flag Captures:** ${nf.format(data['clan']['caps'])}\n**Avg. Title:** ${avgTit(data['clan']['skill'], data['memberCount'])}\n**Total Skill Points:** ${nf.format(data['clan']['skill'])}\n**Skill Rank:** ${nf.format(data['clan']['skill_ranking'])}\nFounded <t:${(Date.parse(data['clan']['created'])/1000)-18000}:R> on <t:${(Date.parse(data['clan']['created'])/1000)-18000}:D>`
}

function memberChunks(members){
    const chunks = []
    if (members.length < 16) return members
    for (let i = 0; i < members.length; i+=16) {
        chunks.push(members.slice(i, i+16))
    }
    return chunks
}
function singlePage(memsOnPage){
   if (!memsOnPage) return 'No members found'
   let formatted = ''
   if (memsOnPage.length != undefined) {
      for (let i = 0; i < memsOnPage.length; i++) {
         formatted += `\`${memsOnPage[i]['name']}\` - ${memsOnPage[i]['role']}\n`
      }
   } else {formatted = `\`${memsOnPage['name']}\` - ${memsOnPage['role']}`}
   return formatted
}

function navButtons(index, maxPage){
    //if (index == 0) set bttom to true
    //if (index == maxPage) set top to true
    const top = index == 0?true:false;
    const bottom = index == maxPage?true:false;
    const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('first')
                        .setStyle('Secondary')
                        .setEmoji('<:start:909536580023238706>')
                        .setDisabled(top),
                    new ButtonBuilder()
                        .setCustomId('back')
                        .setStyle('Secondary')
                        .setEmoji('<:rewind:909536580111323166>')
                        .setDisabled(top),
                    new ButtonBuilder()
                        .setCustomId('forward')
                        .setStyle('Secondary')
                        .setEmoji('<:ff:909536579859669024>')
                        .setDisabled(bottom),
                    new ButtonBuilder()
                        .setCustomId('last')
                        .setStyle('Secondary')
                        .setEmoji('<:end:909536580128104478>')
                        .setDisabled(bottom),
                    new ButtonBuilder()
                        .setCustomId('stop')
                        .setStyle('Danger')
                        .setEmoji('<:x_:909536634234630184>')
                        .setDisabled(false));
      return row
}

module.exports = {
   // builds the slash command
   data: new SlashCommandBuilder()
		.setName('clan')
		.setDescription('Get the stats/members of a given clan.')
      .addStringOption(option =>
         option.setName('name')
            .setDescription('The name')
            .setRequired(true))
      .addBooleanOption(option =>
         option.setName('id')
            .setDescription('ID or not?')),

   // executes the slash command
   async execute(interaction) {
         // try to defer the reply
         try {
            await interaction.deferReply()
         } catch (error) {
            console.log(error)
         }

         var clan, members = ''

         if (interaction.options.getBoolean('id')){
            clan = await functions.getClanProfile(interaction.options.getString('name'))
            members = await functions.getClanMembers(interaction.options.getString('name'))
         } else {
            let clanID = await functions.getClanID(interaction.options.getString('name'))
            if (clanID == 'invalid') {
               clan = 'invalid'
            } else {
               clan = await functions.getClanProfile(clanID)
               members = await functions.getClanMembers(clanID)
            }
         }

         if (clan == 'invalid') {
            const error = new EmbedBuilder()
               .setColor(interaction.guild.members.me.displayHexColor)
               .setTitle('Error')
               .setDescription('Invalid clan name or ID.')
            await interaction.editReply({ embeds: [error] })
            return
         } else if (clan['success'] != true) {
            const error = new EmbedBuilder()
               .setColor(interaction.guild.members.me.displayHexColor)
               .setTitle('Error')
               .setDescription(clan['error'])
            await interaction.editReply({ embeds: [error] })
            return
         } else {
            leaderName = functions.getClanLeader(members)
            const embed = new EmbedBuilder()
               .setColor(interaction.guild.members.me.displayHexColor)
               .setDescription(overview(clan, leaderName))
            const button = new ActionRowBuilder()
               .addComponents(
                  new ButtonBuilder()
                     .setCustomId('members')
                     .setStyle('Secondary')
                     .setLabel(`View ${clan['clan']['name']}'s Members`)
                     .setDisabled(false)
               )
            await interaction.editReply({ embeds: [embed], components: [button]})

            const filter = i => (i.customId == 'members' || i.customId == 'first' || i.customId == 'back' || i.customId == 'forward' || i.customId == 'last' || i.customId == 'stop') && i.user.id === interaction.user.id;

            const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

            var index = 0

            collector.on('collect', async i => {

               if (i.customId === 'members') {
                  await i.deferUpdate()

                  const chuncks = memberChunks(members['members'])
                  const row = navButtons(index, chuncks.length-1)
                  const editedEm = new EmbedBuilder()
                     .setColor(interaction.guild.members.me.displayHexColor)
                     .setDescription(singlePage(chuncks[index]))
                     .setFooter({ text: `Page ${index+1} of ${chuncks.length}` })

                  await i.editReply({ embeds: [editedEm], components: [row] })
                  collector.resetTimer({ time: 15000 })
               } else if (i.customId === 'first') {
                  await i.deferUpdate()
                  index = 0
                  const chuncks = memberChunks(members['members'])
                  const row = navButtons(index, chuncks.length-1)
                  const editedEm = new EmbedBuilder()
                     .setColor(interaction.guild.members.me.displayHexColor)
                     .setDescription(singlePage(chuncks[index]))
                     .setFooter({ text: `Page ${index+1} of ${chuncks.length}` })

                  await i.editReply({ embeds: [editedEm], components: [row] })
                  collector.resetTimer({ time: 15000 })
               } else if (i.customId === 'back') {
                  await i.deferUpdate()
                  index--
                  const chuncks = memberChunks(members['members'])
                  const row = navButtons(index, chuncks.length-1)
                  const editedEm = new EmbedBuilder()
                     .setColor(interaction.guild.members.me.displayHexColor)
                     .setDescription(singlePage(chuncks[index]))
                     .setFooter({ text: `Page ${index+1} of ${chuncks.length}` })

                  await i.editReply({ embeds: [editedEm], components: [row] })
                  collector.resetTimer({ time: 15000 })
               } else if (i.customId === 'forward') {
                  await i.deferUpdate()
                  index++
                  const chuncks = memberChunks(members['members'])
                  const row = navButtons(index, chuncks.length-1)
                  const editedEm = new EmbedBuilder()
                     .setColor(interaction.guild.members.me.displayHexColor)
                     .setDescription(singlePage(chuncks[index]))
                     .setFooter({ text: `Page ${index+1} of ${chuncks.length}` })

                  await i.editReply({ embeds: [editedEm], components: [row] })
                  collector.resetTimer({ time: 15000 })
               } else if (i.customId === 'last') {
                  await i.deferUpdate()
                  index = memberChunks(members['members']).length - 1
                  const chuncks = memberChunks(members['members'])
                  const row = navButtons(index, chuncks.length-1)
                  const editedEm = new EmbedBuilder()
                     .setColor(interaction.guild.members.me.displayHexColor)
                     .setDescription(singlePage(chuncks[index]))
                     .setFooter({ text: `Page ${index+1} of ${chuncks.length}` })

                  await i.editReply({ embeds: [editedEm], components: [row] })
                  collector.resetTimer({ time: 15000 })
               } else if (i.customId === 'stop') {
                  await i.deferUpdate()
                  await i.editReply({ components: [] })
               }
            });

            collector.on('end', async collected => {
               await interaction.editReply({ components: [] })
            });
        }
    },
};