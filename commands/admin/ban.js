const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('指定したユーザーをBANします。')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('BANするユーザー')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('BANの理由')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'BAN権限がありません。', flags: 64 });
    }

    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '理由が指定されていません。';
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ content: 'ユーザーが見つかりませんでした。', flags: 64 });
    }

    if (!member.bannable) {
      return interaction.reply({ content: 'このユーザーはBANできません。', flags: 64 });
    }

    await member.ban({ reason });
    await interaction.reply({ content: `${targetUser.tag} をBANしました。\n理由: ${reason}`, flags: 0 });
  },
};
