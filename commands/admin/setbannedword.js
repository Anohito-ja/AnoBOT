const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setbannedword')
    .setDescription('禁止ワードを設定/削除します。')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('禁止ワードを追加します。')
        .addStringOption(option =>
          option.setName('word')
            .setDescription('追加する禁止ワード')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('禁止ワードを削除します。')
        .addStringOption(option =>
          option.setName('word')
            .setDescription('削除する禁止ワード')
            .setRequired(true))),
  async execute(interaction, client) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
      return interaction.reply({ content: '管理者権限が必要です。', ephemeral: true });
    }

    const subcommand = interaction.options.getSubcommand();
    const word = interaction.options.getString('word').toLowerCase();

    if (subcommand === 'add') {
      if (client.bannedWords.includes(word)) {
        return interaction.reply({ content: `🚫 「${word}」は既に禁止ワードリストに存在します。`, ephemeral: true });
      }
      client.bannedWords.push(word);
      client.saveData('bannedWords');
      await interaction.reply({ content: `🚫 禁止ワード「${word}」を追加しました。`, ephemeral: false });
    } else if (subcommand === 'remove') {
      const index = client.bannedWords.indexOf(word);
      if (index > -1) {
        client.bannedWords.splice(index, 1);
        client.saveData('bannedWords');
        await interaction.reply({ content: `✅ 「${word}」を禁止リストから削除しました。`, ephemeral: false });
      } else {
        await interaction.reply({ content: `✅ 「${word}」は禁止リストに存在しませんでした。`, ephemeral: true });
      }
    }
  },
};