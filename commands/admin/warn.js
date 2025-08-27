const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('特定のユーザーに警告を与えます。')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('警告を与えるユーザー')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('警告の理由')
        .setRequired(false)),
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
      return interaction.reply({ content: 'BAN権限以上のユーザーのみ警告を与えられます。', flags: 64 });
    }

    const targetUser = interaction.options.getUser('target');
    const reason = interaction.options.getString('reason') || '理由が指定されていません。';

    client.warnings[targetUser.id] = (client.warnings[targetUser.id] || 0) + 1;
    client.saveData('warnings');

    await interaction.reply({
      content: `${targetUser.tag} に警告を与えました。\n理由: ${reason}\n現在の警告数: ${client.warnings[targetUser.id]}`,
      flags: 0
    });
  },
};
