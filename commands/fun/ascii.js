const { SlashCommandBuilder } = require('discord.js');
const figlet = require('figlet');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ascii')
    .setDescription('入力されたテキストをアスキーアートに変換します。')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('アスキーアートに変換するテキスト')
        .setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');

    figlet.text(text, {
      font: 'Standard', // 他のフォントも利用可能です
      horizontalLayout: 'default',
      verticalLayout: 'default'
    }, function(err, data) {
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
      
      if (data.length > 2000) {
        return interaction.reply({ content: 'テキストが長すぎます。', ephemeral: true });
      }

      interaction.reply({ content: `\`\`\`\n${data}\n\`\`\`` });
    });
  },

const { SlashCommandBuilder } = require('discord.js');
const figlet = require('figlet');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ascii')
    .setDescription('入力されたテキストをアスキーアートに変換します。')
    .addStringOption(option =>
      option.setName('text')
        .setDescription('アスキーアートに変換するテキスト')
        .setRequired(true)),
  async execute(interaction) {
    const text = interaction.options.getString('text');

    figlet.text(text, {
      font: 'Standard', // 他のフォントも利用可能です
      horizontalLayout: 'default',
      verticalLayout: 'default'
    }, function(err, data) {
      if (err) {
        console.log('Something went wrong...');
        console.dir(err);
        return interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
      }
      
      if (data.length > 2000) {
        return interaction.reply({ content: 'テキストが長すぎます。', ephemeral: true });
      }

      interaction.reply({ content: `\`\`\`\n${data}\n\`\`\`` });
    });
  },
};