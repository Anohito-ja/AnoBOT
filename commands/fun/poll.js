const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('複数選択肢の投票を作成します。')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('投票の質問を入力してください。')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('選択肢をカンマ(,)で区切って入力してください（最大10個）。')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options').split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (options.length > 10) {
      return interaction.reply({ content: '⚠️ 選択肢は10個までです。', ephemeral: true });
    }

    const emojiList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const formattedOptions = options.map((opt, index) => `${emojiList[index]} ${opt}`).join('\n');

    const pollEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('📊 投票')
      .setDescription(`**${question}**\n\n${formattedOptions}`)
      .setFooter({ text: 'リアクションで投票してください。' })
      .setTimestamp();

    const reply = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await reply.react(emojiList[i]);
    }
  },

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('複数選択肢の投票を作成します。')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('投票の質問を入力してください。')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('options')
        .setDescription('選択肢をカンマ(,)で区切って入力してください（最大10個）。')
        .setRequired(true)),
  async execute(interaction) {
    const question = interaction.options.getString('question');
    const options = interaction.options.getString('options').split(',').map(opt => opt.trim()).filter(opt => opt.length > 0);

    if (options.length > 10) {
      return interaction.reply({ content: '⚠️ 選択肢は10個までです。', ephemeral: true });
    }

    const emojiList = ['1️⃣', '2️⃣', '3️⃣', '4️⃣', '5️⃣', '6️⃣', '7️⃣', '8️⃣', '9️⃣', '🔟'];
    const formattedOptions = options.map((opt, index) => `${emojiList[index]} ${opt}`).join('\n');

    const pollEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('📊 投票')
      .setDescription(`**${question}**\n\n${formattedOptions}`)
      .setFooter({ text: 'リアクションで投票してください。' })
      .setTimestamp();

    const reply = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });

    for (let i = 0; i < options.length; i++) {
      await reply.react(emojiList[i]);
    }
  },
};