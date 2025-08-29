const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');

const quizFilePath = path.join(__dirname, '../../data/quizzes.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('quizadd')
    .setDescription('新しいクイズ問題を追加します。')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageChannels)
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

    // クイズデータを読み込む
    let quizzes = [];
    if (fs.existsSync(quizFilePath)) {
      const fileData = fs.readFileSync(quizFilePath, 'utf8');
      if (fileData) {
        quizzes = JSON.parse(fileData);
      }
    }

    // 新しいクイズオブジェクトを作成
    const newQuiz = {
      question: question,
      correct_answer: correctAnswer,
      wrong_answers: wrongAnswers
    };

    // 配列に追加
    quizzes.push(newQuiz);

    // JSONファイルに書き込む
    fs.writeFileSync(quizFilePath, JSON.stringify(quizzes, null, 2), 'utf8');

    await interaction.reply({
      content: '✅ クイズ問題が追加されました。',
      ephemeral: true
    });
  },
};
