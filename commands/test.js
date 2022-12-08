const fetch  = require('node-fetch');
const functions = require('../global-functions.js')
const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed,  MessageAttachment, MessageActionRow, MessageButton} = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('*ahem* testing testing 123'),
	async execute(interaction) {
		await interaction.deferReply()
		//create a action row
		const row = new MessageActionRow()
			.addComponents(
				new MessageButton()
				.setLabel('back')
				.setStyle('SECONDARY')
				.setCustomId('back')
			)
			.addComponents(
				new MessageButton()
				.setLabel('next')
				.setStyle('SECONDARY')
				.setCustomId('next')
			)
		const pages = [
			'Hello',
			'World',
			'Foo',
			'Bar',
		]
		let index = 0
		//create embed
		const embed = new MessageEmbed()
			.setColor(interaction.guild.me.displayHexColor)
			.setDescription(pages[index])
			.setTitle('Test')
		const message = await interaction.editReply({ embeds: [embed], components: [row] })
		//create collector
		const collector = interaction.channel.createMessageComponentCollector({
			filter: (btMasher) => {
				if(interaction.user.id === btMasher.user.id) return true
				return false
			}
		})
		//listen for collector
		collector.on('collect', async (btMasher) => {
			if(btMasher.customId === 'back') {
				index--
				if(index < 0) index = pages.length - 1
				embed.setDescription(pages[index])
				await interaction.editReply({ embeds: [embed] })
			} else if(btMasher.customId === 'next') {
				index++
				if(index > pages.length - 1) index = 0
				embed.setDescription(pages[index])
				await interaction.editReply({ embeds: [embed] })
			}
		})
		collector.on('end', () => {
			interaction.editReply('Ended')
		}
		)
	}
}


/*const pingEm = new MessageEmbed()
			.setColor(interaction.guild.me.displayHexColor)
			.setDescription('\'tis the season for-or testing, tralalalala lalalaaaaaaaa')
		await interaction.editReply({ embeds: [pingEm]});*/