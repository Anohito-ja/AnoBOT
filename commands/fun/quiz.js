const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('ランダムなクイズを出題します。'),
  async execute(interaction, client) {
    if (client.quizzes.length === 0) {
      return interaction.reply({ content: 'クイズが登録されていません。`/quizadd`で追加してください。', ephemeral: true });
    }
    
    const quiz = client.quizzes[Math.floor(Math.random() * client.quizzes.length)];
    const quizEmbed = new EmbedBuilder()
      .setTitle('🧠 クイズ')
      .setDescription(quiz.question)
      .setColor(0x00ff00);
      
    await interaction.reply({ embeds: [quizEmbed] });
    
    const filter = response => response.author.id === interaction.user.id && response.content.toLowerCase() === quiz.answer.toLowerCase();
    
    try {
      const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
      const correctGuess = collected.first();
      await interaction.followUp(`🎉 ${correctGuess.author.tag} が正解しました！答えは「${quiz.answer}」でした！`);
    } catch (err) {
      await interaction.followUp(`時間切れです！正解は「${quiz.answer}」でした！`);
    }
  },
};