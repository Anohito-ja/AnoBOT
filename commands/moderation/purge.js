const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('purge')
    .setDescription('指定した数のメッセージを削除します。')
    .addIntegerOption(option =>
      option.setName('amount')
        .setDescription('削除するメッセージの数 (1-100)')
        .setRequired(true)),
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: 'メッセージを管理する権限がありません。', ephemeral: true });
    }

    const amount = interaction.options.getInteger('amount');
    if (amount < 1 || amount > 100) {
      return interaction.reply({ content: '削除するメッセージの数は1から100の間で指定してください。', ephemeral: true });
    }

    await interaction.channel.bulkDelete(amount, true);
    await interaction.reply({ content: `${amount} 件のメッセージを削除しました。`, ephemeral: true });
  },
};