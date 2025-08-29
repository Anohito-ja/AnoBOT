const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setlinkrestrict')
    .setDescription('リンク禁止チャンネルを設定します。')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('リンクを禁止するチャンネル')
        .setRequired(true)),
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '管理者権限が必要です。', ephemeral: true });
    }
    
    const channel = interaction.options.getChannel('channel');
    if (!client.settings.linkRestrictChannels.includes(channel.id)) {
      client.settings.linkRestrictChannels.push(channel.id);
      client.saveData('settings');
      await interaction.reply({ content: `✅ ${channel.name} をリンク禁止チャンネルに設定しました。`, ephemeral: false });
    } else {
      await interaction.reply({ content: `🚫 ${channel.name} はすでにリンク禁止チャンネルです。`, ephemeral: true });
    }
  },
};
