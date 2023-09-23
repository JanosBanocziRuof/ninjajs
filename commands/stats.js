const functions = require('../global-functions.js')

const fetch = require('node-fetch');
const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const nf = new Intl.NumberFormat('en-US')

function jsonProfileCruncher(json, killsJson) {
    var clan = 'Freelancer'
    var topWeaponString = ''
    var currentTopWeapon = 0
    var currentTopKill = 0
    // if killsJson is null, let top weapon be -------
    if (killsJson == null) { 
        topWeaponString = '-------'
    } else {
        // finds the "id" of the weapon with the most "kills"
        for(var i = 0; i < killsJson.length; i++) {
            if (parseInt(killsJson[i]['kills']) > currentTopKill) {
                currentTopWeapon = killsJson[i]['id']
                currentTopKill = killsJson[i]['kills']
            }
        }
        // var of all the weapons and their ids
        var weapons = {
            '-1': 'Fists',
            '1': 'Shotgun',
            '2': 'SMG',
            '3': 'M79',
            '4': 'Barrett',
            '5': 'Shock Rifle',
            '6': 'Pulse Gun',
            '7': 'Flamer',
            '8': 'RPG',
            '9': 'Rifle',
            '10': 'Lasergun',
            '12': 'AK-47',
            '20': 'Hand Grenade',
            '21': 'Cluster Grenade',
            '23': 'Shuriken',
            '24': 'Deagles',
            '25': 'Snowballs',
            '26': 'Minigun',
            '27': 'X75',
            '28': 'MAC-10',
            '29': 'Bow',
            '30': 'Avenger',
            '31': 'Carbine',
            '204': 'Chainsaw',
            '213': 'Link Gun',
            '33': 'Boomerang',
            '35': 'Uzi',
            '34': 'M60'
        }
        // maps the id to the weapon name
        topWeaponString = `${weapons[currentTopWeapon]} - ${nf.format(currentTopKill)} kills`

    }
    if (json['clan_id'] != null) { clan = `${json['clan_role']} of ${json['clan_name']}(${json['clan_id']})` }
    return `**Username:** \`${json['name']}\`
            **UserID:** ${json['id']}
            **Status:** ${json['status']}
            **Level:** ${functions.levelMaker(json['experience'])}
            **Exp:** ${nf.format(json['experience'])}
            **Level Rank:** ${nf.format(json['ranking'])}
            **Kills:** ${nf.format(json['kills'])}
            **Deaths:** ${nf.format(json['deaths'])}
            **K/D Ratio:** ${Math.round(1000 * (parseInt(json['kills']) / parseInt(json['deaths']))) / 1000 || 0}
            **Flag Captures:** ${nf.format(json['caps'])}
            **Title:** ${functions.mapToRankTitles(json['skill'])}
            **Skill Points:** ${nf.format(json['skill'])}
            **Skill Rank:** ${nf.format(json['skill_ranking'])}
            **Top Weapon:** ${topWeaponString}
            Created on <t:${(Date.parse(json['created']) / 1000) - 18000}:D>
            Last seen <t:${(Date.parse(json['seen']) / 1000) - 18000}:R>\n${clan}`
}

// 
function weaponStatsMakeup(json, name) {
    var i = 0
    var weaponDict = {}
    while (i < json.length) {
        weaponDict[json[i]['id']] = json[i]['kills']
        i = i + 1
    }
    var title = `\`${name}\` has gotten the following kills:\n`
    var send = `**Fists:** ${nf.format(weaponDict['-1'])}
                **Shotgun:** ${nf.format(weaponDict['1'])}
                **SMG:** ${nf.format(weaponDict['2'])}
                **M79:** ${nf.format(weaponDict['3'])}
                **Barrett:** ${nf.format(weaponDict['4'])}
                **Shock Rifle:** ${nf.format(weaponDict['5'])}
                **Pulse Gun:** ${nf.format(weaponDict['6'])}
                **Flamer:** ${nf.format(weaponDict['7'])}
                **RPG:** ${nf.format(weaponDict['8'])}
                **Rifle:** ${nf.format(weaponDict['9'])}
                **Lasergun:** ${nf.format(weaponDict['10'])}
                **AK-47:** ${nf.format(weaponDict['12'])}
                **Hand Grenade:** ${nf.format(weaponDict['20'])}
                **Cluster Grenade:** ${nf.format(weaponDict['21'])}
                **Shuriken:** ${nf.format(weaponDict['23'])}
                **Deagles:** ${nf.format(weaponDict['24'])}
                **Snowballs:** ${nf.format(weaponDict['25'])}
                **Minigun:** ${nf.format(weaponDict['26'])}
                **X75:** ${nf.format(weaponDict['27'])}
                **MAC-10:** ${nf.format(weaponDict['28'])}
                **Bow:** ${nf.format(weaponDict['29'])}
                **Avenger:** ${nf.format(weaponDict['30'])}
                **Carbine:** ${nf.format(weaponDict['31'])}
                **Chainsaw:** ${nf.format(weaponDict['204'])}
                **Link Gun:** ${nf.format(weaponDict['213'])}
                **Boomerang:** ${nf.format(weaponDict['33'])}
                **Uzi:** ${nf.format(weaponDict['35'])}
                **M60:** ${nf.format(weaponDict['34'])}`

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

        var color, profile, pingEm, EmWithTopWeapon, row, weaponStats = ''

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
            await interaction.editReply({ embeds: [pingEm]});
        } else if (profile == 'badName') {
            pingEm = new EmbedBuilder()
                .setColor(interaction.guild.members.me.displayHexColor)
                .setDescription('I could not find a player with that name, please double check your spelling.\nIf you unsure of the spelling, you can try searching for them using </search:1051343380069752909>.')
            await interaction.editReply({ embeds: [pingEm]});
        } else {
            pingEm = new EmbedBuilder()
                .setColor(color)
                .setDescription(jsonProfileCruncher(profile, null))
            row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('expand')
                        .setStyle('Secondary')
                        .setLabel(`View ${profile['name']}'s weapon statistics`)
                        .setDisabled(false))
            await interaction.editReply({ embeds: [pingEm], components: [row] });

            // pause for a tenth of a second
            await new Promise(r => setTimeout(r, 100));
            // proactively fetch the weapon stats, and store them in a variable
            weaponStats = await functions.getWeaponStats(profile['id'])
            EmWithTopWeapon = new EmbedBuilder()
                .setColor(color)
                .setDescription(jsonProfileCruncher(profile, weaponStats))
            await interaction.editReply({ embeds: [EmWithTopWeapon], components: [row] });
            
        }

        


        const filter = i => i.customId === 'expand' && i.user.id == interaction.user.id;

        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 15000 });

        collector.on('collect', async i => {
            if (i.customId === 'expand') {
                try {
                    await i.deferUpdate();
                } catch (error) {
                    console.log(error)
                }
                var editedEm = new EmbedBuilder()
                    .setColor(color)
                    .setDescription(weaponStatsMakeup(weaponStats, profile['name']))

                await i.editReply({ embeds: [editedEm], components: [] });
            }
        });

        //when the collector ends, edit the message so that the button is disabled
        collector.on('end', async collected => {
            if (collected.size == 0) {
                await interaction.editReply({ components: [] });
            }
        });
    },
};