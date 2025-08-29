const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quiz')
    .setDescription('簡単なクイズを出題します。')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('クイズの質問')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('correct_answer')
        .setDescription('正解の選択肢')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('wrong_answer1')
        .setDescription('不正解の選択肢1')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('wrong_answer2')
        .setDescription('不正解の選択肢2')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('wrong_answer3')
        .setDescription('不正解の選択肢3')
        .setRequired(false)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const correctAnswer = interaction.options.getString('correct_answer');
    const wrongAnswers = [
      interaction.options.getString('wrong_answer1'),
      interaction.options.getString('wrong_answer2'),
      interaction.options.getString('wrong_answer3')
    ].filter(Boolean); // nullや空文字列を除外

    const allAnswers = [correctAnswer, ...wrongAnswers];
    
    // 回答をランダムに並び替える
    for (let i = allAnswers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [allAnswers[i], allAnswers[j]] = [allAnswers[j], allAnswers[i]];
    }

    const buttons = allAnswers.map(answer => {
      const customId = answer === correctAnswer ? 'correct_answer' : 'wrong_answer';
      return new ButtonBuilder()
        .setCustomId(customId)
        .setLabel(answer)
        .setStyle(ButtonStyle.Primary);
    });

    const row = new ActionRowBuilder().addComponents(buttons);

    const quizEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('🧠 クイズの時間です！')
      .setDescription(`**質問:** ${question}`)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp()
      .setFooter({ text: '正解だと思うボタンを押してください。' });

    const reply = await interaction.reply({
      embeds: [quizEmbed],
      components: [row]
    });

    // ユーザーのリアクションを監視
    const filter = i => i.isButton() && i.user.id === interaction.user.id;
    const collector = reply.createMessageComponentCollector({ filter, time: 30000 });

    collector.on('collect', async i => {
      await i.deferUpdate();
      
      const selectedAnswer = i.customId === 'correct_answer';
      const resultEmbed = new EmbedBuilder();

      if (selectedAnswer) {
        resultEmbed
          .setColor(0x00ff00)
          .setTitle('✅ 正解！')
          .setDescription(`お見事です、<@${i.user.id}>！\n正解は「${correctAnswer}」でした。`);
      } else {
        resultEmbed
          .setColor(0xff0000)
          .setTitle('❌ 不正解！')
          .setDescription(`残念、<@${i.user.id}>。\n正解は「${correctAnswer}」でした。`);
      }

      // 最初のインタラクションを編集して結果を表示
      await interaction.editReply({
        embeds: [resultEmbed],
        components: [] // ボタンを削除
      });
      collector.stop();
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({
          embeds: [
            new EmbedBuilder()
              .setColor(0x808080)
              .setTitle('⏱️ 時間切れ！')
              .setDescription('制限時間内に回答がありませんでした。')
          ],
          components: [] // ボタンを削除
        });
      }
    });
  },
};
