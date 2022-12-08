const functions = require('../global-functions.js')

const fetch  = require('node-fetch');
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');


const nf = new Intl.NumberFormat('en-US')
const rankTitles="Newbie Beginner Novice Initiated Trained Competent Adept Skilled Proficient Advanced Expert Elite Champion Master Grandmaster Ninja".split(" ")
function mapToRankTitles(skill) {
	return 49500<=skill?rankTitles[rankTitles.length-1]:rankTitles[Math.floor(1/30*(Math.sqrt(6*skill+11025)-135))+1]
}

function dhm(ms) {
	const years = Math.floor(ms / (12*4.34821428571*7*24*60*60*1000));
	const yearsms = ms % (12*4.34821428571*7*24*60*60*1000);
	const months = Math.floor(yearsms / (4.34821428571*7*24*60*60*1000));
	const monthsms = ms % (4.34821428571*7*24*60*60*1000);
	const weeks = Math.floor(monthsms / (7*24*60*60*1000));
	const weeksms = ms % (7*24*60*60*1000);
	const days = Math.floor(weeksms / (24*60*60*1000));
	const daysms = ms % (24*60*60*1000);
	const hours = Math.floor(daysms / (60*60*1000));
	const hoursms = ms % (60*60*1000);
	const minutes = Math.floor(hoursms / (60*1000));
	const minutesms = ms % (60*1000);
	const sec = Math.floor(minutesms / 1000);
	var send = ``
	if (years != 0) {send=`${years} year/s ${months} month/s ago`} else if (months != 0) {send=`${months} month/s ago`} else if (weeks != 0) {send=`${weeks} week/s ago`} else if (days != 0) {send=`${days} day/s ago`} else if (hours != 0) {send=`${hours} hour/s ago`} else if (minutes != 0) {send=`${minutes} minute/s ago`} else if (sec != 0) {send=`${sec} second/s ago`} else {send='Sometime ago'}
	return send
  }

const shurikens = "<:GreyShuriken:834903789810745404> <:GreyStarShuriken:834903789836173382> <:RedShuriken:834903789706149929> <:RedStarShuriken:834903789621215302> <:OrangeShuriken:834903789428539490> <:OrangeStarShuriken:834903789668270140> <:YellowShuriken:834903789223673868> <:YellowStarShuriken:834903789751369728> <:GreenShuriken:834903789659095100> <:GreenStarShuriken:834903789604438056><:BlueShuriken:834903789131530291>".split(" ")
function levelMaker(xp) {
	const lvl = Math.min(Math.max(Math.floor(.2*Math.sqrt(parseInt(xp)/15.625)),1),160)
	const sure = shurikens[Math.floor(lvl/16)]
	return sure+lvl
	
}

function jsonStatsCruncher(json, topClansPerson) {
	var status = 'active'
	var leader = ''
	if (json['clan']['status'] != 'active'){status = 'inactive'} else if (parseInt(json['memberCount']) < 1){status = 'disbanded', leader = 'no one to lead'} else if (topClansPerson['role'] != 'leader'){leader = 'leaderless'} else {leader = `\`${topClansPerson['name']}\` (ID = ${topClansPerson['id']})`}
	return `**Clan Name:** \`${json['clan']['name']}\` (ID = ${json['clan']['id']})\n**Leader:** ${leader}\n**Status:** ${status}\n**Number of Members:** ${json['memberCount']}\n**Founded:** ${json['clan']['created']}\n**Age:** ${dhm(Math.abs(Date.parse(json['clan']['created'])-Date.now()-18000000))}\n**Clan Experience:** ${nf.format(json['clan']['experience'])}\n**Clan Experience Rank:** ${nf.format(json['clan']['experience_ranking'])}\n**Clan Skill Points:** ${nf.format(json['clan']['skill'])}\n**Clan Skill Rank:** ${nf.format(json['clan']['skill_ranking'])}\n**Accumalative Kills:** ${nf.format(json['clan']['kills'])}\n**Accumalative Deaths:** ${nf.format(json['clan']['deaths'])}\n**Average K/D Ratio:** ${Math.round(1000*(parseInt(json['clan']['kills'])/parseInt(json['clan']['deaths'])))/1000}\n**Accumalative Flag Captures:**  ${nf.format(json['clan']['caps'])}`
}


module.exports = {
	data: new SlashCommandBuilder()
		.setName('clan')
		.setDescription('Get the stats and members of a given clan.')
		.addSubcommand(subcommand =>
			subcommand.setName('name')
			.setDescription('Get a clan\'s stats with its in game name')
			.addStringOption(option =>
				option.setName('name')
				.setDescription('Input the clan name.')
				.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('clanid')
			.setDescription('Get a clan\'s stats with their in game user ID')
			.addIntegerOption(option =>
				option.setName('clanid')
				.setDescription('Input the clan ID.')
				.setRequired(true))),
	async execute(interaction) {
		await interaction.deferReply()
		const subCommand = interaction['options']['_subcommand']
		var color, pingEm, stats, row, clanID, successSend, members, max, min, total, buttons = ''
		if (subCommand == 'name'){
            clanID = await functions.getClanID(interaction['options']['_hoistedOptions'][0]['value'])
		} else if (subCommand == 'clanid'){
            clanID = interaction['options']['_hoistedOptions'][0]['value']
		}
		if (clanID == 'invalid'){
			stats = 'invalid'
		} else {
			stats = await functions.getClanStats(clanID)
		}

		if (stats == 'invalid'){
			pingEm = new MessageEmbed()
				.setColor(interaction.guild.me.displayHexColor)
				.setDescription('Invalid name or ID. Please double check spelling (cApiTALizATiNG MaTtERs) and try again. If you are not sure how to spell a players name, you can search for it with `/search [query]`')
			successSend = { embeds: [pingEm] }

		} else {
			members = await functions.getClanMembers(clanID)
			pingEm = new MessageEmbed()
				.setColor(color)
				.setDescription(jsonStatsCruncher(stats, members['members'][0] || 'empty'))
			row = new MessageActionRow()
				.addComponents(
					new MessageButton()
					.setCustomId('expand')
					.setStyle('SECONDARY')
					.setLabel(`View ${stats['clan']['name']}'s members`)
					.setDisabled(false))
			successSend = { embeds: [pingEm], components: [row] }
		}
		await interaction.editReply(successSend)

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
			if(i.customId === 'expand') {
				var whereItsAt = 0
				max = 0
				total = members['members'].length
				if (total < 10){max = total, min = 1}else{max = 10, min = max-9}
				var prntlst = '**Member - Role**'
				while (whereItsAt < max) {
					prntlst = prntlst+`\n\`${members['members'][whereItsAt]['name']}\` - ${members['members'][whereItsAt]['role']}`
					whereItsAt++
				}
				if (total <10){
					buttons = []
				} else {
					function bottomCheck(max) {
						if(max == 10) return true
						else return false
					}
					function topCheck(max) {
						if(max == total) return true
						else return false
					}
					var bottomCheckVar = bottomCheck(max)
					var topCheckVar = topCheck(max)
					buttons = [new MessageActionRow()
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
                                .setDisabled(false)),]
				}
				var editedEm = new MessageEmbed()
					.setColor(color)
					.setTitle(`\`${stats['clan']['name']}\`'s Members`)
					.setDescription(prntlst)
					.setFooter(`Showing ${min}-${max} of ${total}`)
				return interaction.editReply({ embeds: [editedEm], components: buttons })
				
		}})
		collector.on('end', (btnInt) => {
			return interaction.editReply({components: []})
		})

            
	},
};