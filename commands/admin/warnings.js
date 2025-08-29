const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

// 警告データを保存するファイルパスを定義
const warnFile = path.join(__dirname, '../../data/warnings.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warnings')
    .setDescription('ユーザーの警告を管理します。')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.KickMembers)
    .addSubcommand(subcommand =>
      subcommand
        .setName('give')
        .setDescription('ユーザーに警告を与えます。')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('警告を与えるユーザー')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('reason')
            .setDescription('警告の理由')
            .setRequired(false)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('check')
        .setDescription('ユーザーの警告回数を確認します。')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('警告回数を確認するユーザー')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('clear')
        .setDescription('ユーザーの警告回数をリセットします。')
        .addUserOption(option =>
          option.setName('user')
            .setDescription('警告をリセットするユーザー')
            .setRequired(true))),
  async execute(interaction) {
    const subcommand = interaction.options.getSubcommand();
    const targetUser = interaction.options.getUser('user');
    const warnings = fs.readJsonSync(warnFile, { throws: false }) || {};

    if (subcommand === 'give') {
      const reason = interaction.options.getString('reason') || '理由がありません。';
      warnings[targetUser.id] = (warnings[targetUser.id] || 0) + 1;
      fs.writeJsonSync(warnFile, warnings);

      const embed = new EmbedBuilder()
        .setColor(0xffa500)
        .setTitle('⚠️ 警告が与えられました')
        .setDescription(`**${targetUser.tag}** に警告を与えました。`)
        .addFields(
          { name: '警告者', value: interaction.user.tag, inline: true },
          { name: '現在の警告数', value: `${warnings[targetUser.id]}`, inline: true },
          { name: '理由', value: reason }
        )
        .setTimestamp();
      await interaction.reply({ embeds: [embed] });
      
    } else if (subcommand === 'check') {
      const warningCount = warnings[targetUser.id] || 0;
      const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setDescription(`**${targetUser.tag}** の警告回数は **${warningCount}** 回です。`);
      await interaction.reply({ embeds: [embed] });
      
    } else if (subcommand === 'clear') {
      delete warnings[targetUser.id];
      fs.writeJsonSync(warnFile, warnings);
      const embed = new EmbedBuilder()
        .setColor(0x00ff00)
        .setDescription(`✅ **${targetUser.tag}** の警告回数をリセットしました。`);
      await interaction.reply({ embeds: [embed] });
    }
  },
};
