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
      option.setName('options')
        .setDescription('選択肢をカンマ(,)で区切って入力（例: A,B,C）')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options').split(',').map(s => s.trim()).filter(s => s.length > 0);
    
    if (options.length < 2) {
      return interaction.reply({ content: '少なくとも2つの選択肢が必要です。', ephemeral: true });
    }

    const emojiNumbers = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    if (options.length > emojiNumbers.length) {
      return interaction.reply({ content: `選択肢は最大${emojiNumbers.length}個までです。`, ephemeral: true });
    }

    const pollDescription = options.map((opt, i) => `${emojiNumbers[i]} ${opt}`).join('\n');

    const pollEmbed = new EmbedBuilder()
      .setTitle(`📊 投票: ${question}`)
      .setDescription(pollDescription)
      .setColor(0x0099ff);

    const reply = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await reply.react(emojiNumbers[i]);
    }
  },
};
