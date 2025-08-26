const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('event')
    .setDescription('サーバーイベントを作成します。')
    .addStringOption(option =>
      option.setName('name')
        .setDescription('イベント名')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('description')
        .setDescription('イベントの説明')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('date')
        .setDescription('イベント開催日時 (例: 2025/12/25 19:00)')
        .setRequired(true)),
  async execute(interaction) {
    const eventName = interaction.options.getString('name');
    const eventDescription = interaction.options.getString('description');
    const eventDate = interaction.options.getString('date');
    
    const eventEmbed = new EmbedBuilder()
      .setColor(0x00aaff)
      .setTitle(`🎉 イベント: ${eventName}`)
      .setDescription(eventDescription)
      .addFields(
        { name: '日時', value: eventDate },
        { name: '作成者', value: interaction.user.tag }
      )
      .setTimestamp();
      
    await interaction.reply({ embeds: [eventEmbed] });
  },
};