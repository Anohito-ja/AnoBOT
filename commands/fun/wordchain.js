const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('wordchain')
    .setDescription('しりとりゲームを開始または終了します。')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('しりとりゲームを開始します。'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('stop')
        .setDescription('しりとりゲームを終了します。')),
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'start') {
      if (client.wordchainGame && client.wordchainGame.isActive) {
        return interaction.reply({ content: '⚠️ 既にゲームが進行中です。', ephemeral: true });
      }
      
      client.wordchainGame = {
        isActive: true,
        channelId: interaction.channel.id,
        lastWord: 'しりとり'
      };
      
      await interaction.reply('**しりとり**ゲームを開始します！\n最初の言葉は「**しりとり**」です。');
    
    } else if (subcommand === 'stop') {
      if (!client.wordchainGame || !client.wordchainGame.isActive) {
        return interaction.reply({ content: '⚠️ 進行中のゲームはありません。', ephemeral: true });
      }
      
      client.wordchainGame.isActive = false;
      await interaction.reply('しりとりゲームを終了しました。');
    }
  },
};