const functions = require('../global-functions.js')

const fetch  = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');


const nf = new Intl.NumberFormat('en-US')
const rankTitles="Newbie Beginner Novice Initiated Trained Competent Adept Skilled Proficient Advanced Expert Elite Champion Master Grandmaster Ninja".split(" ")
function mapToRankTitles(skill) {
	return 49500<=skill?rankTitles[rankTitles.length-1]:rankTitles[Math.floor(1/30*(Math.sqrt(6*skill+11025)-135))+1]
}

function dhm(ms) {
	const days = Math.floor(ms / (24*60*60*1000));
	const daysms = ms % (24*60*60*1000);
	const hours = Math.floor(daysms / (60*60*1000));
	const hoursms = ms % (60*60*1000);
	const minutes = Math.floor(hoursms / (60*1000));
	const minutesms = ms % (60*1000);
	const sec = Math.floor(minutesms / 1000);
	var send = ``
	if (days != 0) {send=`${days} day/s ago`} else if (hours != 0) {send=`${hours} hour/s ago`} else if (minutes != 0) {send=`${minutes} minute/s ago`} else if (sec != 0) {send=`${sec} second/s ago`} else {send='Sometime ago'}
	return send
  }

const shurikens = "<:GreyShuriken:834903789810745404> <:GreyStarShuriken:834903789836173382> <:RedShuriken:834903789706149929> <:RedStarShuriken:834903789621215302> <:OrangeShuriken:834903789428539490> <:OrangeStarShuriken:834903789668270140> <:YellowShuriken:834903789223673868> <:YellowStarShuriken:834903789751369728> <:GreenShuriken:834903789659095100> <:GreenStarShuriken:834903789604438056> <:BlueShuriken:834903789131530291>".split(" ")
function levelMaker(xp) {
	const lvl = Math.min(Math.max(Math.floor(.2 * Math.sqrt(xp / 15.625)), 1), 160)
	const sure = shurikens[Math.floor(lvl/16)]
	return sure+lvl
	
}

function jsonProfileCruncher(json) {
	var clan = 'Freelancer'
	if (json['clan_id'] != null) {clan = `${json['clan_role']} of ${json['clan_name']}(${json['clan_id']})`}
	return `**Username:** \`${json['name']}\`\n**UserID:** ${json['id']}\n**Status:** ${json['status']}\n**Level:** ${levelMaker(json['experience'])}\n**Exp:** ${nf.format(json['experience'])}\n**Level Rank:** ${nf.format(json['ranking'])}\n**Kills:** ${nf.format(json['kills'])}\n**Deaths:** ${nf.format(json['deaths'])}\n**K/D Ratio:** ${Math.round(1000*(parseInt(json['kills'])/parseInt(json['deaths'])))/1000 || 0}\n**Flag Captures:** ${nf.format(json['caps'])}\n**Title:** ${mapToRankTitles(json['skill'])}\n**Skill Points:** ${nf.format(json['skill'])}\n**Skill Rank:** ${nf.format(json['skill_ranking'])}\nCreated on <t:${(Date.parse(json['created'])/1000)-18000}:D>\nLast seen <t:${(Date.parse(json['seen'])/1000)-18000}:R>\n${clan}`
}

function weaponStatsMakeup(json, name) {
	var i = 0
	var weaponDict = {}
	while (i<json.length) {
		weaponDict[json[i]['id']] = json[i]['kills']
		i=i+1
	}
	var send = `\`${name}\` has gotten the following kills:\n**Fists:** ${nf.format(weaponDict['-1'])}\n**Shotgun:** ${nf.format(weaponDict['1'])}\n**SMG:** ${nf.format(weaponDict['2'])}\n**M79:** ${nf.format(weaponDict['3'])}\n**Barrett:** ${nf.format(weaponDict['4'])}\n**Shock Rifle:** ${nf.format(weaponDict['5'])}\n**Pulse Gun:** ${nf.format(weaponDict['6'])}\n**Flamer:** ${nf.format(weaponDict['7'])}\n**RPG:** ${nf.format(weaponDict['8'])}\n**Rifle:** ${nf.format(weaponDict['9'])}\n**Lasergun:** ${nf.format(weaponDict['10'])}\n**AK-47:** ${nf.format(weaponDict['12'])}\n**Hand Grenade:** ${nf.format(weaponDict['20'])}\n**Cluster Grenade:** ${nf.format(weaponDict['21'])}\n**Shuriken:** ${nf.format(weaponDict['23'])}\n**Deagles:** ${nf.format(weaponDict['24'])}\n**Snowballs:** ${nf.format(weaponDict['25'])}\n**Minigun:** ${nf.format(weaponDict['26'])}\n**X75:** ${nf.format(weaponDict['27'])}\n**MAC-10:** ${nf.format(weaponDict['28'])}\n**Bow:** ${nf.format(weaponDict['29'])}\n**Avenger:** ${nf.format(weaponDict['30'])}\n**Carbine:** ${nf.format(weaponDict['31'])}\n**Chainsaw:** ${nf.format(weaponDict['204'])}\n**Link Gun:** ${nf.format(weaponDict['213'])}`
	return send
}

module.exports = {
	data: new SlashCommandBuilder()
		.setName('stats')
		.setDescription('Get the stats of a given player.')
		.addSubcommand(subcommand =>
			subcommand.setName('name')
			.setDescription('Get a user\'s stats with their in game name')
			.addStringOption(option =>
				option.setName('name')
				.setDescription('Input the in game name.')
				.setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand.setName('userid')
			.setDescription('Get a user\'s stats with their in game user ID')
			.addIntegerOption(option =>
				option.setName('userid')
				.setDescription('Input the user ID.')
				.setRequired(true))),
	async execute(interaction) {
		await interaction.deferReply()
		const subCommand = interaction['options']['_subcommand']
		var color, profile, pingEm, row = ''
		if (subCommand == 'name'){
			profile = await functions.getProfile('name', interaction['options']['_hoistedOptions'][0]['value'])
			color = await functions.getAura('name', interaction['options']['_hoistedOptions'][0]['value'])
		} else if (subCommand == 'userid'){
			profile = await functions.getProfile('ID', interaction['options']['_hoistedOptions'][0]['value'])
			color = await functions.getAura('ID', interaction['options']['_hoistedOptions'][0]['value'])
		}
		if (profile == 'invalid'){
			pingEm = new EmbedBuilder()
				.setColor(interaction.guild.members.me.displayHexColor)
				.setDescription('Invalid name or ID. Please double check spelling (cApiTALizATiNG MaTtERs) and try again. If you are not sure how to spell a players name, you can search for it with `/search [query]`')

		} else {
			pingEm = new EmbedBuilder()
				.setColor(color)
				.setDescription(jsonProfileCruncher(profile))
			row = new ActionRowBuilder()
				.addComponents(
					new ButtonBuilder()
					.setCustomId('expand')
					.setStyle('Secondary')
					.setLabel(`View ${profile['name']}'s weapon statistics`)
					.setDisabled(false))
		}
		await interaction.editReply({ embeds: [pingEm], components: [row] });

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
				var editedEm = new EmbedBuilder()
					.setColor(color)
					.setDescription(weaponStatsMakeup(await functions.getWeaponStats(profile['id']), profile['name']))
				return interaction.editReply({ embeds: [editedEm], components: [] })
		}})
		collector.on('end', (btnInt) => {
			return interaction.editReply({components: []})
		})

            
	},
};