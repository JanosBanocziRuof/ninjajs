const fetch  = require('node-fetch');
const functions = require('../global-functions.js')
const { SlashCommandBuilder } = require('@discordjs/builders');
const Canvas = require('canvas');
const { MessageEmbed,  MessageAttachment } = require('discord.js');
const { createCanvas, loadImage } = require('canvas')

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('*ahem* testing testing 123'),
	async execute(interaction) {
		await interaction.deferReply()
        const profile = await functions.getProfile('ID', '40008')
		const custom = profile['customizations']
		var armrightlower = `armrightlower_${custom['armrightlower']['texture']}`
		var armleftlower = `armleftlower_${custom['armleftlower']['texture']}`
		var armleftupper = `armleftupper_${custom['armleftupper']['texture']}`
		var armrightupper = `armrightupper_${custom['armrightupper']['texture']}`
		var legrightupper = `legrightupper_${custom['legrightupper']['texture']}`
		var legleftupper = `legleftupper_${custom['legleftupper']['texture']}`
		var belt = `belt_${custom['belt']['texture']}`
		var hair = `hair_${custom['orb']['texture']}`
		var orb = `energy_shell_${custom['']['texture']}`
		var torso = `torso_${custom['torso']['texture']}`
		var legrightlower = `legrightlower_${custom['legrightlower']['texture']}`
		var legleftlower = `legleftlower_${custom['legleftlower']['texture']}`
		var face = `face_${custom['face']['texture']}`


        const attachment = new MessageAttachment(canvas.toBuffer(), 'profile-image.png');

		const pingEm = new MessageEmbed()
			.setColor(interaction.guild.me.displayHexColor)
			.setDescription('\'tis the season for-or testing, tralalalala lalalaaaaaaaa')
		await interaction.editReply({ embeds: [pingEm], files: [attachment] });
	},
};