const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs-extra');
const path = require('path');

const xpFile = path.join(__dirname, '../../data/xp.json');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('あなたのランクと経験値を表示します。'),
  async execute(interaction) {
    const xpData = fs.readJsonSync(xpFile, { throws: false }) || {};
    const user = interaction.user;
    const userXP = xpData[user.id] || { xp: 0, level: 0 };
    
    // 現在のレベルと次のレベルに必要なXPを計算
    const currentLevel = userXP.level;
    const requiredXP = 5 * Math.pow(currentLevel, 2) + 50 * currentLevel + 100;
    const xpDifference = requiredXP - userXP.xp;

    const rankEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle(`${user.username}のランク`)
      .setThumbnail(user.displayAvatarURL({ dynamic: true }))
      .addFields(
        { name: '現在のレベル', value: `\`${currentLevel}\``, inline: true },
        { name: '現在のXP', value: `\`${userXP.xp}\``, inline: true },
        { name: '次のレベルまで', value: `\`${xpDifference}\` XP` }
      )
      .setFooter({ text: '会話することで経験値がたまります。' });

    await interaction.reply({ embeds: [rankEmbed], ephemeral: false });
  },
};
