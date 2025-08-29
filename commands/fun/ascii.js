const { SlashCommandBuilder } = require('discord.js');
const figlet = require('figlet'); // figletライブラリをインストールする必要があります

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ascii')
    .setDescription('テキストをASCIIアートに変換します。')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('ASCIIアートに変換するテキスト')
        .setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');

    figlet.text(text, (err, data) => {
      if (err) {
        console.error('ASCIIアートの生成中にエラーが発生しました:', err);
        return interaction.reply('エラーが発生しました。もう一度お試しください。');
      }

      if (data.length > 2000) {
        return interaction.reply('生成されたASCIIアートが長すぎます。もっと短いテキストを試してください。');
      }
      
      interaction.reply({ content: `\`\`\`\n${data}\n\`\`\`` });
    });
  },
};
