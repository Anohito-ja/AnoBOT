const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('五目並べを開始します。'),
  async execute(interaction) {
    const board = Array(9).fill(null);
    const players = [interaction.user.id, null];
    let currentPlayerIndex = 0;
    
    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('五目並べ')
      .setDescription('プレイヤー1 (❌) はあなたです。対戦相手が参加するのを待っています。');
      
    const buttons = [];
    for (let i = 0; i < 9; i++) {
      buttons.push(new ButtonBuilder()
        .setCustomId(`tictactoe_${i}`)
        .setLabel(' ')
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(true));
    }
    
    const row1 = new ActionRowBuilder().addComponents(buttons.slice(0, 3));
    const row2 = new ActionRowBuilder().addComponents(buttons.slice(3, 6));
    const row3 = new ActionRowBuilder().addComponents(buttons.slice(6, 9));
    
    const reply = await interaction.reply({
      embeds: [embed],
      components: [row1, row2, row3],
      fetchReply: true
    });

    const collectorFilter = i => i.customId === 'tictactoe_join' || (i.customId.startsWith('tictactoe_') && players.includes(i.user.id));
    const collector = reply.createMessageComponentCollector({ filter: collectorFilter, time: 300000 }); // 5分間待機

    const updateBoard = (i) => {
      const newButtons = [];
      for (let j = 0; j < 9; j++) {
        const customId = `tictactoe_${j}`;
        const label = board[j] === '❌' ? '❌' : board[j] === '⭕' ? '⭕' : ' ';
        const style = board[j] === '❌' ? ButtonStyle.Danger : board[j] === '⭕' ? ButtonStyle.Success : ButtonStyle.Secondary;
        newButtons.push(new ButtonBuilder()
          .setCustomId(customId)
          .setLabel(label)
          .setStyle(style)
          .setDisabled(board[j] !== null));
      }
      
      const newRow1 = new ActionRowBuilder().addComponents(newButtons.slice(0, 3));
      const newRow2 = new ActionRowBuilder().addComponents(newButtons.slice(3, 6));
      const newRow3 = new ActionRowBuilder().addComponents(newButtons.slice(6, 9));
      
      i.update({ components: [newRow1, newRow2, newRow3] });
    };

    const checkWin = (board) => {
      const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // 横
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // 縦
        [0, 4, 8], [2, 4, 6]            // 斜め
      ];
      
      for (const pattern of winPatterns) {
        const [a, b, c] = pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
          return board[a];
        }
      }
      return null;
    };
    
    const isBoardFull = (board) => !board.includes(null);

    const startJoinInteraction = new ButtonBuilder()
      .setCustomId('tictactoe_join')
      .setLabel('対戦に参加')
      .setStyle(ButtonStyle.Primary);
      
    const startRow = new ActionRowBuilder().addComponents(startJoinInteraction);
    
    interaction.editReply({ components: [startRow] });

    collector.on('collect', async i => {
      if (i.customId === 'tictactoe_join' && !players.includes(i.user.id)) {
        players[1] = i.user.id;
        const newEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('五目並べ')
          .setDescription(`プレイヤー1 (❌): <@${players[0]}>\nプレイヤー2 (⭕): <@${players[1]}>\n\n**<@${players[0]}>**の番です。`);
          
        const activeButtons = buttons.map(button => button.setDisabled(false));
        const activeRow1 = new ActionRowBuilder().addComponents(activeButtons.slice(0, 3));
        const activeRow2 = new ActionRowBuilder().addComponents(activeButtons.slice(3, 6));
        const activeRow3 = new ActionRowBuilder().addComponents(activeButtons.slice(6, 9));
        
        await i.update({
          embeds: [newEmbed],
          components: [activeRow1, activeRow2, activeRow3]
        });
        
        return;
      }
      
      if (!players.includes(i.user.id)) {
        await i.reply({ content: 'このゲームに参加していません。', ephemeral: true });
        return;
      }
      
      if (players[currentPlayerIndex] !== i.user.id) {
        await i.reply({ content: 'あなたの番ではありません。', ephemeral: true });
        return;
      }
      
      const position = parseInt(i.customId.split('_')[1]);
      const marker = currentPlayerIndex === 0 ? '❌' : '⭕';
      
      if (board[position] === null) {
        board[position] = marker;
        
        const winner = checkWin(board);
        if (winner) {
          const finalEmbed = new EmbedBuilder()
            .setColor(0x00ff00)
            .setTitle('ゲーム終了')
            .setDescription(`🎉 **<@${i.user.id}>**の勝利です！`)
            .setTimestamp();
          
          await i.update({ embeds: [finalEmbed], components: [] });
          collector.stop();
          return;
        }
        
        if (isBoardFull(board)) {
          const finalEmbed = new EmbedBuilder()
            .setColor(0x808080)
            .setTitle('ゲーム終了')
            .setDescription('引き分けです！');
          
          await i.update({ embeds: [finalEmbed], components: [] });
          collector.stop();
          return;
        }
        
        currentPlayerIndex = (currentPlayerIndex + 1) % 2;
        const nextPlayer = players[currentPlayerIndex];
        
        const nextEmbed = new EmbedBuilder()
          .setColor(0x0099ff)
          .setTitle('五目並べ')
          .setDescription(`プレイヤー1 (❌): <@${players[0]}>\nプレイヤー2 (⭕): <@${players[1]}>\n\n**<@${nextPlayer}>**の番です。`);
        
        await i.update({ embeds: [nextEmbed] });
        updateBoard(i);
        
      } else {
        await i.reply({ content: 'そのマスはすでに埋まっています。', ephemeral: true });
      }
    });

    collector.on('end', collected => {
      if (collected.size === 0) {
        interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x808080).setTitle('ゲーム終了').setDescription('対戦相手が見つからなかったため、ゲームを終了します。')], components: [] });
      } else if (collected.size > 0 && !checkWin(board) && !isBoardFull(board)) {
        interaction.editReply({ embeds: [new EmbedBuilder().setColor(0x808080).setTitle('ゲーム終了').setDescription('制限時間切れにより、ゲームを終了します。')], components: [] });
      }
    });
  },
};
