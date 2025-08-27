const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('kick')
    .setDescription('指定したユーザーをキックします。')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('キックするユーザー')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('キックの理由')
        .setRequired(false)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.KickMembers)) {
      return interaction.reply({ content: 'キック権限がありません。', flags: 64 });
    }

    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '理由が指定されていません。';
    const member = interaction.guild.members.cache.get(targetUser.id);

    if (!member) {
      return interaction.reply({ content: 'ユーザーが見つかりませんでした。', flags: 64 });
    }

    if (!member.kickable) {
      return interaction.reply({ content: 'このユーザーはキックできません。', flags: 64 });
    }

    await member.kick({ reason });
    await interaction.reply({ content: `${targetUser.tag} をキックしました。\n理由: ${reason}`, flags: 0 });
  },
};
