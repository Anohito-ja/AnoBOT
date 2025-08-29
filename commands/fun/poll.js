const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('投票を作成します。')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('投票の質問')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('choice1')
        .setDescription('選択肢1')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('choice2')
        .setDescription('選択肢2')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('choice3')
        .setDescription('選択肢3')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice4')
        .setDescription('選択肢4')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice5')
        .setDescription('選択肢5')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice6')
        .setDescription('選択肢6')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice7')
        .setDescription('選択肢7')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice8')
        .setDescription('選択肢8')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice9')
        .setDescription('選択肢9')
        .setRequired(false))
    .addStringOption(option =>
      option.setName('choice10')
        .setDescription('選択肢10')
        .setRequired(false)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const choices = [];
    for (let i = 1; i <= 10; i++) {
      const choice = interaction.options.getString(`choice${i}`);
      if (choice) {
        choices.push(choice);
      }
    }
    
    // 選択肢が2つ未満の場合はエラーを返す
    if (choices.length < 2) {
      return interaction.reply({ content: '投票には最低2つの選択肢が必要です。', ephemeral: true });
    }

    const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    let description = '';

    for (let i = 0; i < choices.length; i++) {
      description += `${emojiNumbers[i]} ${choices[i]}\n`;
    }

    const pollEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`📊 投票：${question}`)
      .setDescription(description)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setTimestamp()
      .setFooter({ text: '投票にリアクションしてください！' });

    // Embedを送信し、リアクションを追加
    const reply = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

    for (let i = 0; i < choices.length; i++) {
      await reply.react(emojiNumbers[i]);
    }
  },
};
