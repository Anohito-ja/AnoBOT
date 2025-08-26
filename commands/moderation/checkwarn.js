const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('checkwarn')
    .setDescription('自身の、または指定したユーザーの警告回数を確認します。')
    .addUserOption(option =>
      option.setName('target')
        .setDescription('警告回数を確認したいユーザー')
        .setRequired(false)),
  async execute(interaction, client) {
    const targetUser = interaction.options.getUser('target') || interaction.user;
    const warningCount = client.warnings[targetUser.id] || 0;
    
    if (targetUser.id === interaction.user.id) {
      await interaction.reply({ content: `あなたの現在の警告数は **${warningCount}** 回です。`, ephemeral: true });
    } else {
      await interaction.reply({ content: `${targetUser.tag} の現在の警告数は **${warningCount}** 回です。`, ephemeral: false });
    }
  },
};