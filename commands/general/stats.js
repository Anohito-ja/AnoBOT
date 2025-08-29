const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const os = require('os');
const moment = require('moment');
require('moment-duration-format');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('stats')
    .setDescription('Botとサーバーの統計情報を表示します。'),
  async execute(interaction) {
    const uptime = moment.duration(interaction.client.uptime).format('D [日], H [時間], m [分], s [秒]');
    const totalUsers = interaction.client.guilds.cache.reduce((acc, guild) => acc + guild.memberCount, 0);

    const statsEmbed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('Botとサーバーの統計')
      .setAuthor({ name: interaction.client.user.username, iconURL: interaction.client.user.displayAvatarURL() })
      .addFields(
        { name: 'Bot', value: `稼働時間: \`${uptime}\`\nユーザー数: \`${totalUsers}\`\nサーバー数: \`${interaction.client.guilds.cache.size}\`\nAPIレイテンシ: \`${Math.round(interaction.client.ws.ping)}ms\`` },
        { name: 'システム', value: `プラットフォーム: \`${os.platform()}\`\nCPU: \`${os.cpus().length}コア\nメモリ使用量: \`${(process.memoryUsage().heapUsed / 1024 / 1024).toFixed(2)}MB / ${(os.totalmem() / 1024 / 1024).toFixed(2)}MB\`` },
        { name: 'Discord.js', value: `バージョン: \`${require('discord.js').version}\`\nNode.jsバージョン: \`${process.version}\`` }
      )
      .setTimestamp()
      .setFooter({ text: 'この情報は定期的に更新されます。' });

    await interaction.reply({ embeds: [statsEmbed], ephemeral: true });
  },
};
