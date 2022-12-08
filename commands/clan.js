const fetch  = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

const nf = new Intl.NumberFormat('en-US')

function dhm(ms) {
    const months = Math.floor(ms / (30 * 24 * 60 * 60 * 1000));
    const monthsms = ms % (30 * 24 * 60 * 60 * 1000);
	const days = Math.floor(monthsms / (24*60*60*1000));
	const daysms = ms % (24*60*60*1000);
	const hours = Math.floor(daysms / (60*60*1000));
	const hoursms = ms % (60*60*1000);
	const minutes = Math.floor(hoursms / (60*1000));
	const minutesms = ms % (60*1000);
	const sec = Math.floor(minutesms / 1000);
	var send = ``
	if (months != 0) {send=`${months} month/s ago`} else if (days != 0) {send=`${days} day/s ago`} else if (hours != 0) {send=`${hours} hour/s ago`} else if (minutes != 0) {send=`${minutes} minute/s ago`} else if (sec != 0) {send=`${sec} second/s ago`} else {send='Sometime ago'}
	return send
}

function avglvl(xp, members){
    const avgxp = parseInt(xp) / parseInt(members);
    const shurikens = "<:GreyShuriken:834903789810745404> <:GreyStarShuriken:834903789836173382> <:RedShuriken:834903789706149929> <:RedStarShuriken:834903789621215302> <:OrangeShuriken:834903789428539490> <:OrangeStarShuriken:834903789668270140> <:YellowShuriken:834903789223673868> <:YellowStarShuriken:834903789751369728> <:GreenShuriken:834903789659095100> <:GreenStarShuriken:834903789604438056> <:BlueShuriken:834903789131530291>".split(" ")
	const lvl = Math.min(Math.max(Math.floor(.2 * Math.sqrt(avgxp / 15.625)), 1), 160)
	const sure = shurikens[Math.floor(lvl/16)]
	return sure+lvl
}

function avgTit(pts, members){
    const avgpts = parseInt(pts) / parseInt(members);
    const rankTitles="Newbie Beginner Novice Initiated Trained Competent Adept Skilled Proficient Advanced Expert Elite Champion Master Grandmaster Ninja".split(" ")
    return 49500<=avgpts?rankTitles[rankTitles.length-1]:rankTitles[Math.floor(1/30*(Math.sqrt(6*avgpts+11025)-135))+1]
}

function overview(data, leader){
    leader = leader?leader:'None'
    return `**Clan Name:** \`${data['clan']['name']}\`\n**Clan ID:** ${data['clan']['id']}\n**Status:** ${data['clan']['status']}\n**Leader:** ${leader}\n**Members:** ${nf.format(data['memberCount'])}\n**Avg. Level:** ${avglvl(data['clan']['experience'], data['memberCount'])}\n**Total Exp:** ${nf.format(data['clan']['experience'])}\n**Level Rank:** ${nf.format(data['clan']['experience_ranking'])}\n**Total Kills:** ${nf.format(data['clan']['kills'])}\n**Total Deaths:** ${nf.format(data['clan']['deaths'])}\n**Avg. K/D Ratio:** ${Math.round(1000*(parseInt(data['clan']['kills'])/parseInt(data['clan']['deaths'])))/1000 || 0}\n**Total Flag Captures:** ${nf.format(data['clan']['caps'])}\n**Avg. Title:** ${avgTit(data['clan']['skill'], data['memberCount'])}\n**Total Skill Points:** ${nf.format(data['clan']['skill'])}\n**Skill Rank:** ${nf.format(data['clan']['skill_ranking'])}\nFounded <t:${(Date.parse(data['clan']['created'])/1000)-18000}:R> on <t:${(Date.parse(data['clan']['created'])/1000)-18000}:D>`
}

function memberChunks(members){
    const chunks = []
    for (let i = 0; i < members.length; i+=16) {
        chunks.push(members.slice(i, i+16))
    }
    return chunks
}
function singlePage(memsOnPage){
    return memsOnPage.map(m=>`\`${m['name']}\` (${m['role']})`).join('\n')
}

function navButtons(index, maxPage){
    //if (index == 0) set bttom to true
    //if (index == maxPage) set top to true
    const top = index == 0?false:true
    const bottom = index == maxPage?false:true
    const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId('first')
                        .setStyle('SECONDARY')
                        .setEmoji('<:start:909536580023238706>')
                        .setDisabled(top),
                    new MessageButton()
                        .setCustomId('back')
                        .setStyle('SECONDARY')
                        .setEmoji('<:rewind:909536580111323166>')
                        .setDisabled(top),
                    new MessageButton()
                        .setCustomId('forward')
                        .setStyle('SECONDARY')
                        .setEmoji('<:ff:909536579859669024>')
                        .setDisabled(bottom),
                    new MessageButton()
                        .setCustomId('last')
                        .setStyle('SECONDARY')
                        .setEmoji('<:end:909536580128104478>')
                        .setDisabled(bottom),
                    new MessageButton()
                        .setCustomId('stop')
                        .setStyle('DANGER')
                        .setEmoji('<:x_:909536634234630184>')
                        .setDisabled(false))
}

module.exports = {
    data: new SlashCommandBuilder()
		.setName('clan')
		.setDescription('Get the stats/members of a given clan.')
		.addSubcommand(subcommand =>
			subcommand.setName('name')
			.setDescription('Get a clans\'s stats via its name.')
			.addStringOption(option =>
				option.setName('name')
				.setDescription('the clans\'s name.')
				.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('clanid')
			.setDescription('Get the stats\'s stats via its clan id.')
			.addIntegerOption(option =>
				option.setName('clanid')
				.setDescription('the clan\'s id.')
				.setRequired(true))),
    async execute(interaction) {
        await interaction.deferReply()
        const subCommand = interaction['options']['_subcommand']
        if (subCommand === 'name') {
            const clan = interaction['options']['_hoistedOptions'][0]['value']
            await interaction.editReply('The API currently has a bug. Please use the clan id instead.')
        } else if (subCommand === 'clanid') {
            const clanid = interaction['options']['_hoistedOptions'][0]['value']
            const mResponse = await fetch(`https://api.ninja.io/clan/${clanid}/members`)
            const mData = await mResponse.json()
            const members = mData['members']
            var index = 0
            const leader = members.find(i => i['role'] === 'leader')
            const leaderName = leader ? `\`${leader['name']}\`(${leader['id']})`: false
            const url = `https://api.ninja.io/clan/${clanid}/clan-id`
            const response = await fetch(url);
            const data = await response.json()
            if (data['success'] != true) {
                const error = new MessageEmbed()
                    .setColor(interaction.guild.me.displayHexColor)
                    .setTitle('Error')
                    .setDescription(data['error'])
                await interaction.editReply({ embeds: [error] })
                return
            } else {
                const embed = new MessageEmbed()
                    .setColor(interaction.guild.me.displayHexColor)
                    .setDescription(overview(data, leaderName))
                const botton = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                        .setCustomId('members')
                        .setStyle('SECONDARY')
                        .setLabel(`View ${data['clan']['name']}'s Members`)
                        .setDisabled(false)
                    )
                await interaction.editReply({ embeds: [embed], components: [botton]})

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
                    if(i.customId === 'members') {
                        var row = navButtons(index, memberChunks(members).length-1)
                        var editedEm = new MessageEmbed()
                            .setColor(interaction.guild.me.displayHexColor)
                            .setDescription(singlePage(memberChunks(members)[index]))
                        return interaction.editReply({ embeds: [editedEm], components: [row] })
                }})
                collector.on('end', (btnInt) => {
                    return interaction.editReply({components: []})
                })
            }
        }
    },
};