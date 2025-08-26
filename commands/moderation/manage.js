const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

const settingsFile = path.join(__dirname, '../../data/settings.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('manage')
    .setDescription('Botの管理設定を行います。')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
    .addSubcommand(subcommand =>
      subcommand
        .setName('unsetlog')
        .setDescription('ログチャンネルの設定を解除します。'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('banned_list')
        .setDescription('BANされているユーザーの一覧を表示します。')),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'unsetlog') {
      const settings = fs.readJsonSync(settingsFile, { throws: false }) || {};
      settings.logChannel = null;
      fs.writeJsonSync(settingsFile, settings);
      await interaction.reply('✅ ログチャンネルの設定を解除しました。');

    } else if (subcommand === 'banned_list') {
      const bans = await interaction.guild.bans.fetch();
      const bannedUsers = bans.map(ban => `- ${ban.user.tag} (理由: ${ban.reason || 'なし'})`).join('\n') || 'BANされているユーザーはいません。';
      await interaction.reply(`📜 **BANされているユーザー**\n${bannedUsers}`);
    }
  },
};