const functions = require('../global-functions.js')

const fetch  = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const nf = new Intl.NumberFormat('en-US')

function jsonProfileCruncher(json) {
	var clan = 'Freelancer'
	if (json['clan_id'] != null) {clan = `${json['clan_role']} of ${json['clan_name']}(${json['clan_id']})`}
	return `**Username:** \`${json['name']}\`\n**UserID:** ${json['id']}\n**Status:** ${json['status']}\n**Level:** ${functions.levelMaker(json['experience'])}\n**Exp:** ${nf.format(json['experience'])}\n**Level Rank:** ${nf.format(json['ranking'])}\n**Kills:** ${nf.format(json['kills'])}\n**Deaths:** ${nf.format(json['deaths'])}\n**K/D Ratio:** ${Math.round(1000*(parseInt(json['kills'])/parseInt(json['deaths'])))/1000 || 0}\n**Flag Captures:** ${nf.format(json['caps'])}\n**Title:** ${functions.mapToRankTitles(json['skill'])}\n**Skill Points:** ${nf.format(json['skill'])}\n**Skill Rank:** ${nf.format(json['skill_ranking'])}\nCreated on <t:${(Date.parse(json['created'])/1000)-18000}:D>\nLast seen <t:${(Date.parse(json['seen'])/1000)-18000}:R>\n${clan}`
}

// 
function weaponStatsMakeup(json, name) {
	var i = 0
	var weaponDict = {}
	while (i<json.length) {
		weaponDict[json[i]['id']] = json[i]['kills']
		i=i+1
	}
   var title = `\`${name}\` has gotten the following kills:\n`
	var send = `**Fists:** ${nf.format(weaponDict['-1'])}\n**Shotgun:** ${nf.format(weaponDict['1'])}\n**SMG:** ${nf.format(weaponDict['2'])}\n**M79:** ${nf.format(weaponDict['3'])}\n**Barrett:** ${nf.format(weaponDict['4'])}\n**Shock Rifle:** ${nf.format(weaponDict['5'])}\n**Pulse Gun:** ${nf.format(weaponDict['6'])}\n**Flamer:** ${nf.format(weaponDict['7'])}\n**RPG:** ${nf.format(weaponDict['8'])}\n**Rifle:** ${nf.format(weaponDict['9'])}\n**Lasergun:** ${nf.format(weaponDict['10'])}\n**AK-47:** ${nf.format(weaponDict['12'])}\n**Hand Grenade:** ${nf.format(weaponDict['20'])}\n**Cluster Grenade:** ${nf.format(weaponDict['21'])}\n**Shuriken:** ${nf.format(weaponDict['23'])}\n**Deagles:** ${nf.format(weaponDict['24'])}\n**Snowballs:** ${nf.format(weaponDict['25'])}\n**Minigun:** ${nf.format(weaponDict['26'])}\n**X75:** ${nf.format(weaponDict['27'])}\n**MAC-10:** ${nf.format(weaponDict['28'])}\n**Bow:** ${nf.format(weaponDict['29'])}\n**Avenger:** ${nf.format(weaponDict['30'])}\n**Carbine:** ${nf.format(weaponDict['31'])}\n**Chainsaw:** ${nf.format(weaponDict['204'])}\n**Link Gun:** ${nf.format(weaponDict['213'])}\n**Boomerang:** ${nf.format(weaponDict['33'])}\n**Uzi:** ${nf.format(weaponDict['35'])}\n**M60:** ${nf.format(weaponDict['34'])}`

   send = title + send;
   
   return send
}

module.exports = {
   // build the slash command
	data: new SlashCommandBuilder()
   .setName('stats')
   .setDescription('Get the stats of a given player.')
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
   try {
      await interaction.deferReply()
   } catch (error) {
      console.log(error)
   }

   var color, profile, pingEm, row = ''

   if (interaction.options.getBoolean('id')) {
      profile = await functions.getProfile('ID', interaction.options.getString('name'))
      color = await functions.getAura('ID', interaction.options.getString('name'))
   } else {
      profile = await functions.getProfile('name', interaction.options.getString('name'))
      color = await functions.getAura('name', interaction.options.getString('name'))
   }

   if (profile == 'invalid'){
      pingEm = new EmbedBuilder()
         .setColor(interaction.guild.members.me.displayHexColor)
         .setDescription('Something went critically wrong. Please try again later.')

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
      

      const filter = i => i.customId === 'expand' && i.user.id == interaction.user.id;

      const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

      collector.on('collect', async i => {
         if (i.customId === 'expand') {
            await i.deferUpdate();
            var editedEm = new EmbedBuilder()
					.setColor(color)
					.setDescription(weaponStatsMakeup(await functions.getWeaponStats(profile['id']), profile['name']))

            await i.editReply({ embeds: [editedEm], components: [] });
      }});

      //when the collector ends, edit the message so that the button is disabled
      collector.on('end', async collected => {
         if (collected.size == 0) {
            await interaction.editReply({ components: [] });
         }
      });            
	},
};