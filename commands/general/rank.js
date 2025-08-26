<<<<<<< HEAD
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('発言数（XP）のランキングを表示します。'),
  async execute(interaction, client) {
    const sortedXP = Object.entries(client.xp).sort(([, xpA], [, xpB]) => xpB - xpA);
    
    if (sortedXP.length === 0) {
      return interaction.reply('まだ誰も発言していません。');
    }
    
    const top5 = sortedXP.slice(0, 5);
    const rankList = top5.map(([userId, xp], index) => {
      const user = client.users.cache.get(userId);
      return `${index + 1}. ${user ? user.tag : '不明なユーザー'} - XP: ${xp}`;
    }).join('\n');
    
    const rankEmbed = new EmbedBuilder()
      .setTitle('🏆 発言数ランキング')
      .setDescription(rankList)
      .setColor(0xffa500);
      
    await interaction.reply({ embeds: [rankEmbed] });
  },
=======
const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('rank')
    .setDescription('発言数（XP）のランキングを表示します。'),
  async execute(interaction, client) {
    const sortedXP = Object.entries(client.xp).sort(([, xpA], [, xpB]) => xpB - xpA);
    
    if (sortedXP.length === 0) {
      return interaction.reply('まだ誰も発言していません。');
    }
    
    const top5 = sortedXP.slice(0, 5);
    const rankList = top5.map(([userId, xp], index) => {
      const user = client.users.cache.get(userId);
      return `${index + 1}. ${user ? user.tag : '不明なユーザー'} - XP: ${xp}`;
    }).join('\n');
    
    const rankEmbed = new EmbedBuilder()
      .setTitle('🏆 発言数ランキング')
      .setDescription(rankList)
      .setColor(0xffa500);
      
    await interaction.reply({ embeds: [rankEmbed] });
  },
>>>>>>> 847512c7e09a4c27175b8ed36990db4821422739
};