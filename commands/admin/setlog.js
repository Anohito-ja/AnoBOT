const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlog')
    .setDescription('BOTのログチャンネルを設定します。')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('ログを送信するチャンネル')
        .setRequired(true)),
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '管理者権限が必要です。', ephemeral: true });
    }

    const channel = interaction.options.getChannel('channel');
    client.settings.logChannel = channel.id;
    client.saveData('settings');
    await interaction.reply({ content: `✅ ログチャンネルを ${channel} に設定しました。`, ephemeral: false });
  },
};
