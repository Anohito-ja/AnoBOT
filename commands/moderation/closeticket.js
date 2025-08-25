const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('closeticket')
    .setDescription('現在のチケットを閉じます。'),
  async execute(interaction, client) {
    if (!client.tickets.has(interaction.channel.id)) {
      return interaction.reply({ content: 'このチャンネルはチケットではありません。', ephemeral: true });
    }
    
    await interaction.deferReply();
    
    const ticketInfo = client.tickets.get(interaction.channel.id);
    const creator = interaction.guild.members.cache.get(ticketInfo.creatorId);
    
    await interaction.channel.delete('チケットが閉じられました。');
    
    client.tickets.delete(interaction.channel.id);
    
    if (creator) {
      creator.send('あなたのチケットが閉じられました。ありがとうございました。').catch(console.error);
    }
  },
};