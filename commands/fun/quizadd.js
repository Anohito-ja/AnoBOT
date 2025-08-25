const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quizadd')
    .setDescription('新しいクイズを追加します。')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('クイズの質問')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('answer')
        .setDescription('クイズの答え')
        .setRequired(true)),
  async execute(interaction, client) {
    const question = interaction.options.getString('question');
    const answer = interaction.options.getString('answer');
    
    client.quizzes.push({ question, answer });
    client.saveData('quizzes');
    
    await interaction.reply({ content: `✅ クイズを追加しました。\n質問: ${question}\n答え: ${answer}`, ephemeral: true });
  },
};