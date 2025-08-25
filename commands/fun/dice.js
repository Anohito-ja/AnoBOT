const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('1から6のサイコロを振ります。'),
  async execute(interaction) {
    const diceRoll = Math.floor(Math.random() * 6) + 1;
    await interaction.reply(`🎲 あなたのサイコロは **${diceRoll}** です！`);
  },
};