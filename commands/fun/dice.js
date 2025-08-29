const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('dice')
    .setDescription('サイコロを振ります。')
    .addIntegerOption(option =>
      option.setName('sides')
        .setDescription('サイコロの面の数')
        .setRequired(false))
    .addIntegerOption(option =>
      option.setName('number')
        .setDescription('振るサイコロの数')
        .setRequired(false)),
  async execute(interaction) {
    const sides = interaction.options.getInteger('sides') || 6;
    const number = interaction.options.getInteger('number') || 1;
    let results = [];
    let total = 0;

    if (sides < 1 || number < 1) {
      return interaction.reply({ content: 'サイコロの面と数は1以上である必要があります。', ephemeral: true });
    }

    for (let i = 0; i < number; i++) {
      const roll = Math.floor(Math.random() * sides) + 1;
      results.push(roll);
      total += roll;
    }

    const resultMessage = `🎲 ${number}d${sides}を振りました。\n結果: ${results.join(', ')}\n合計: ${total}`;

    await interaction.reply({ content: resultMessage, ephemeral: false });
  },
};
