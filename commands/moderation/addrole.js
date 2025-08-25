const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('addrole')
    .setDescription('リアクションでロールを付与するメッセージを作成します。')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('表示するメッセージ')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('role')
        .setDescription('付与するロール')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
      return interaction.reply({ content: 'ロールを管理する権限がありません。', ephemeral: true });
    }

    const message = interaction.options.getString('message');
    const role = interaction.options.getRole('role');

    const button = new ButtonBuilder()
      .setCustomId(`addrole_${role.id}`)
      .setLabel(`「${role.name}」ロールを付与`)
      .setStyle(ButtonStyle.Primary);

    const row = new ActionRowBuilder().addComponents(button);

    await interaction.channel.send({ content: message, components: [row] });
    await interaction.reply({ content: 'リアクションロールメッセージを作成しました。', ephemeral: true });
  },
};