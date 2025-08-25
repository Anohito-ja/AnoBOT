const { SlashCommandBuilder, ChannelType, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('新しいサポートチケットを作成します。'),
  async execute(interaction, client) {
    await interaction.deferReply({ ephemeral: true });
    
    const guild = interaction.guild;
    const member = interaction.member;
    const existingTicket = client.tickets.find(t => t.creatorId === member.id);
    
    if (existingTicket) {
      return interaction.followUp({ content: `既にチケットが開かれています: <#${existingTicket.channelId}>`, ephemeral: true });
    }
    
    const channelName = `ticket-${member.user.username.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
    
    const everyoneRole = guild.roles.everyone;
    const channel = await guild.channels.create({
      name: channelName,
      type: ChannelType.GuildText,
      permissionOverwrites: [
        {
          id: everyoneRole.id,
          deny: [PermissionsBitField.Flags.ViewChannel],
        },
        {
          id: member.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
        {
          id: client.user.id,
          allow: [PermissionsBitField.Flags.ViewChannel, PermissionsBitField.Flags.SendMessages],
        },
      ],
    });
    
    const ticketEmbed = new EmbedBuilder()
      .setTitle('🎫 新しいチケット')
      .setDescription('担当者が対応するまでお待ちください。')
      .setColor(0x00ff00)
      .setFooter({ text: `チケット作成者: ${member.user.tag}` });
      
    await channel.send({ content: `${member}`, embeds: [ticketEmbed] });
    
    client.tickets.set(channel.id, {
      channelId: channel.id,
      creatorId: member.id,
    });
    
    await interaction.followUp({ content: `チケットを作成しました: <#${channel.id}>`, ephemeral: true });
  },
};
