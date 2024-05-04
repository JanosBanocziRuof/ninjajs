let fetch;
import('node-fetch').then(module => {
    fetch = module.default;
});
const functions = require('../global-functions.js');

const nf = new Intl.NumberFormat('en-US')

const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

const weaponIDs = {
   'fists': -1,
   'shotgun': 1,
   'smg': 2,
   'm79': 3,
   'barrett': 4,
   'shock rifle': 5,
   'pulse gun': 6,
   'flamer': 7,
   'rpg': 8,
   'rifle': 9,
   'lasergun': 10,
   'ak-47': 12,
   'hand grenade': 20,
   'cluster grenade': 21,
   'shuriken': 23,
   'deagles': 24,
   'snowball': 25,
   'minigun': 26,
   'x75': 27,
   'mac-10': 28,
   'bow': 29,
   'avenger': 30,
   'carbine': 31,
   'chainsaw': 204,
   'link gun': 213,
   'boomerang': 33,
   'uzi': 35,
   'm60': 34
 };

const choices = ['experience', 'skill', 'barrett','m79','hand grenade','flamer','rpg','mac-10','shuriken','bow','avenger','smg','link gun','lasergun','shotgun','chainsaw','pulse gun','ak-47','minigun','carbine','deagles','x75','rifle','shock rifle','cluster grenade','snowball','boomerang','fists','uzi','m60']

async function getWeaponLeaderboard(type) {
   return fetch(`https://api2.ninja.io/user/weapon-ranking/${type}`)
      .then(res => {
         return res.json()
      })
  }

async function getSkillXPLeaderboard() {
    return fetch('https://api2.ninja.io/user/ranking')
        .then(res => {
            return res.json()
        })
}

async function getWeaponRanking() {
    return fetch('https://api2.ninja.io/user/weapon-ranking')
        .then(res => {
            return res.json()
        })
}

module.exports = {
   // build the slash command
   data: new SlashCommandBuilder()
      .setName('leaderboard')
      .setDescription('View the specified leaderboard')
      .addStringOption(option =>
         option.setName('type')
            .setDescription('The type of leaderboard to view')
            .setAutocomplete(true)
            .setRequired(true)),
   // autocomplete handler
   async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));

      let options;
      if (filtered.length > 25) {
         options = filtered.slice(0, 25);
      } else {
         options = filtered;
      }

		await interaction.respond(
			options.map(choice => ({ name: choice, value: choice })),
		);
	},

   // execute the command
   async execute(interaction) {
      await interaction.deferReply();

      type = interaction.options.getString('type')

      //if type is not in choices
      if(!choices.includes(type)) {
         const errorEM = new EmbedBuilder()
            .setColor(interaction.guild.members.me.displayHexColor)
            .setDescription(`**${type}** is not a valid leaderboard type. Please try again.`)
            await interaction.editReply({ embeds: [errorEM] });
      } else if(type == 'experience' || type == 'skill') {
         const xpSkill = await getSkillXPLeaderboard()

         if(xpSkill['success'] == true) {
            var formatedLeaderboard = ``
            if(type == 'experience') {
               leaderboard = xpSkill['level_ranking']
               for (i = 0; i < 10; i++) {
                  formatedLeaderboard += `**#${leaderboard[i]['ranking']}** ${leaderboard[i]['name']}\n᲼᲼\`${nf.format(leaderboard[i]['experience'])} experience\` - ${functions.levelMaker(leaderboard[i]['experience'])}\n`
               }
            } else if(type == 'skill') {
               leaderboard = xpSkill['skill_ranking']
               for (i = 0; i < 10; i++) {
                  formatedLeaderboard += `**#${leaderboard[i]['ranking']}** ${leaderboard[i]['name']}\n᲼᲼\`${nf.format(leaderboard[i]['skill'])} skill\` - ${functions.mapToRankTitles(leaderboard[i]['skill'])}\n`
               }
            }
            formatedLeaderboard = formatedLeaderboard.replace(/#1/, '🥇')
            formatedLeaderboard = formatedLeaderboard.replace(/#2/, '🥈')
            formatedLeaderboard = formatedLeaderboard.replace(/#3/, '🥉')
            
            const xpSkillEM = new EmbedBuilder()
               .setColor(interaction.guild.members.me.displayHexColor)
               .setTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`)
               .setDescription(formatedLeaderboard)

            await interaction.editReply({ embeds: [xpSkillEM] });
         } else {
            const errorEM = new EmbedBuilder()
               .setColor(interaction.guild.members.me.displayHexColor)
               .setDescription(xpSkill['error'])
               await interaction.editReply({ embeds: [errorEM] });
         }
      } else {
         var typeID = weaponIDs[type]

         const weapon = await getWeaponLeaderboard(typeID)

         if(weapon['success'] == true) {
            var formatedLeaderboard = ``
            leaderboard = weapon['ranking']
            if (leaderboard == null) {
               formatedLeaderboard = `Something went wrong. I apologize for the inconvenience.`
            } else{   
               for (i = 0; i < 10; i++) {
                  formatedLeaderboard += `**#${i + 1}** ${leaderboard[i]['name']}\n᲼᲼\`${nf.format(leaderboard[i]['kills'])} kills\`\n`
               }
            }
            formatedLeaderboard = formatedLeaderboard.replace(/#1/, '🥇')
            formatedLeaderboard = formatedLeaderboard.replace(/#2/, '🥈')
            formatedLeaderboard = formatedLeaderboard.replace(/#3/, '🥉')
            
            const weaponEM = new EmbedBuilder()
               .setColor(interaction.guild.members.me.displayHexColor)
               .setTitle(`${type.charAt(0).toUpperCase() + type.slice(1)} Leaderboard`)
               .setDescription(formatedLeaderboard)

            await interaction.editReply({ embeds: [weaponEM] });
         } else {
            const errorEM = new EmbedBuilder()
               .setColor(interaction.guild.members.me.displayHexColor)
               .setDescription(weapon['error'])
               await interaction.editReply({ embeds: [errorEM] });
         }
      }
   }
};