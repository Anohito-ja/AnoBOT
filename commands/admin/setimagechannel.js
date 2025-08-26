<<<<<<< HEAD
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setimagechannel')
    .setDescription('画像専用チャンネルを設定します。')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('画像専用にするチャンネル')
        .setRequired(true)),
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '管理者権限が必要です。', ephemeral: true });
    }
    
    const channel = interaction.options.getChannel('channel');
    if (!client.settings.imageChannels.includes(channel.id)) {
      client.settings.imageChannels.push(channel.id);
      client.saveData('settings');
      await interaction.reply({ content: `✅ ${channel.name} を画像専用チャンネルに設定しました。`, ephemeral: false });
    } else {
      await interaction.reply({ content: `🚫 ${channel.name} はすでに画像専用チャンネルです。`, ephemeral: true });
    }
  },
=======
const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setimagechannel')
    .setDescription('画像専用チャンネルを設定します。')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('画像専用にするチャンネル')
        .setRequired(true)),
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '管理者権限が必要です。', ephemeral: true });
    }
    
    const channel = interaction.options.getChannel('channel');
    if (!client.settings.imageChannels.includes(channel.id)) {
      client.settings.imageChannels.push(channel.id);
      client.saveData('settings');
      await interaction.reply({ content: `✅ ${channel.name} を画像専用チャンネルに設定しました。`, ephemeral: false });
    } else {
      await interaction.reply({ content: `🚫 ${channel.name} はすでに画像専用チャンネルです。`, ephemeral: true });
    }
  },
>>>>>>> 847512c7e09a4c27175b8ed36990db4821422739
};