const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('removewatch')
    .setDescription('監視チャンネル設定を解除します。')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('解除するチャンネル')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('type')
        .setDescription('解除する監視タイプ')
        .setRequired(true)
        .addChoices(
          { name: '画像専用', value: 'image' },
          { name: 'リンク禁止', value: 'link' }
        )),
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '管理者権限が必要です。', ephemeral: true });
    }
    
    const channelId = interaction.options.getChannel('channel').id;
    const type = interaction.options.getString('type');
    let message = '';
    
    if (type === 'image') {
      const index = client.settings.imageChannels.indexOf(channelId);
      if (index > -1) {
        client.settings.imageChannels.splice(index, 1);
        client.saveData('settings');
        message = '画像専用チャンネル設定を解除しました。';
      } else {
        message = 'このチャンネルは画像専用チャンネルではありません。';
      }
    } else if (type === 'link') {
      const index = client.settings.linkRestrictChannels.indexOf(channelId);
      if (index > -1) {
        client.settings.linkRestrictChannels.splice(index, 1);
        client.saveData('settings');
        message = 'リンク禁止チャンネル設定を解除しました。';
      } else {
        message = 'このチャンネルはリンク禁止チャンネルではありません。';
      }
    }
    
    await interaction.reply({ content: `✅ ${message}`, ephemeral: false });
  },
};