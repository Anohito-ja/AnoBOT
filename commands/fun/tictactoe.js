const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('BOTと三目並べゲームをします。'),
  async execute(interaction, client) {
    const board = Array(9).fill(null);
    let currentPlayer = 'X';
    const players = {
      'X': interaction.user.id,
      'O': client.user.id
    };

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('三目並べ')
      .setDescription('Botと勝負！あなたの番です (X)。')
      .setFooter({ text: 'ボタンを押してマスを選んでね。' });
      
    const getBoardRow = () => {
      const row = new ActionRowBuilder();
      for (let i = 0; i < 9; i++) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`tictactoe_${i}`)
            .setLabel(board[i] || ' ')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!!board[i])
        );
      }
      return row;
    };
    
    await interaction.reply({
      embeds: [embed],
      components: [getBoardRow()]
    });

    const filter = i => i.customId.startsWith('tictactoe_') && i.user.id === players[currentPlayer];
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async i => {
      const move = parseInt(i.customId.split('_')[1]);
      if (board[move] !== null) {
        return i.reply({ content: '⚠️ そのマスは既に埋まっています。', ephemeral: true });
      }

      board[move] = 'X';
      await i.update({
        embeds: [embed.setDescription('Botの番です (O)...')],
        components: [getBoardRow()]
      });

      const winner = checkWinner(board);
      if (winner) {
        embed.setDescription(`🎉 **${winner === 'X' ? 'あなたの勝利' : 'Botの勝利'}です！**`);
        collector.stop();
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
      }
      if (board.every(cell => cell !== null)) {
        embed.setDescription('🤝 **引き分けです！**');
        collector.stop();
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
      }

      // Botのターン
      setTimeout(async () => {
        const botMove = getBotMove(board);
        if (botMove !== -1) {
          board[botMove] = 'O';
        }

        const botWinner = checkWinner(board);
        if (botWinner) {
          embed.setDescription(`🎉 **${botWinner === 'X' ? 'あなたの勝利' : 'Botの勝利'}です！**`);
          collector.stop();
          await interaction.editReply({ embeds: [embed], components: [] });
          return;
        }
        if (board.every(cell => cell !== null)) {
          embed.setDescription('🤝 **引き分けです！**');
          collector.stop();
          await interaction.editReply({ embeds: [embed], components: [] });
          return;
        }

        embed.setDescription('あなたの番です (X)。');
        await interaction.editReply({ embeds: [embed], components: [getBoardRow()] });
      }, 1000);
    });

    collector.on('end', async () => {
      await interaction.editReply({ embeds: [embed], components: [] });
    });
  }
};

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function getBotMove(board) {
  // 勝利手があればそこを選ぶ
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const tempBoard = [...board];
      tempBoard[i] = 'O';
      if (checkWinner(tempBoard) === 'O') {
        return i;
      }
    }
  }
  // 相手の勝利手があればブロックする
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const tempBoard = [...board];
      tempBoard[i] = 'X';
      if (checkWinner(tempBoard) === 'X') {
        return i;
      }
    }
  }
  // 中央が空いていれば中央を選ぶ
  if (board[4] === null) return 4;
  // 角が空いていれば角を選ぶ
  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter(i => board[i] === null);
  if (emptyCorners.length > 0) {
    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
  }
  // それ以外はランダムな空いているマスを選ぶ
  const emptyCells = board.map((cell, i) => cell === null ? i : null).filter(val => val !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)] || -1;

const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('tictactoe')
    .setDescription('BOTと三目並べゲームをします。'),
  async execute(interaction, client) {
    const board = Array(9).fill(null);
    let currentPlayer = 'X';
    const players = {
      'X': interaction.user.id,
      'O': client.user.id
    };

    const embed = new EmbedBuilder()
      .setColor(0x0099ff)
      .setTitle('三目並べ')
      .setDescription('Botと勝負！あなたの番です (X)。')
      .setFooter({ text: 'ボタンを押してマスを選んでね。' });
      
    const getBoardRow = () => {
      const row = new ActionRowBuilder();
      for (let i = 0; i < 9; i++) {
        row.addComponents(
          new ButtonBuilder()
            .setCustomId(`tictactoe_${i}`)
            .setLabel(board[i] || ' ')
            .setStyle(ButtonStyle.Secondary)
            .setDisabled(!!board[i])
        );
      }
      return row;
    };
    
    await interaction.reply({
      embeds: [embed],
      components: [getBoardRow()]
    });

    const filter = i => i.customId.startsWith('tictactoe_') && i.user.id === players[currentPlayer];
    const collector = interaction.channel.createMessageComponentCollector({ filter, time: 600000 });

    collector.on('collect', async i => {
      const move = parseInt(i.customId.split('_')[1]);
      if (board[move] !== null) {
        return i.reply({ content: '⚠️ そのマスは既に埋まっています。', ephemeral: true });
      }

      board[move] = 'X';
      await i.update({
        embeds: [embed.setDescription('Botの番です (O)...')],
        components: [getBoardRow()]
      });

      const winner = checkWinner(board);
      if (winner) {
        embed.setDescription(`🎉 **${winner === 'X' ? 'あなたの勝利' : 'Botの勝利'}です！**`);
        collector.stop();
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
      }
      if (board.every(cell => cell !== null)) {
        embed.setDescription('🤝 **引き分けです！**');
        collector.stop();
        await interaction.editReply({ embeds: [embed], components: [] });
        return;
      }

      // Botのターン
      setTimeout(async () => {
        const botMove = getBotMove(board);
        if (botMove !== -1) {
          board[botMove] = 'O';
        }

        const botWinner = checkWinner(board);
        if (botWinner) {
          embed.setDescription(`🎉 **${botWinner === 'X' ? 'あなたの勝利' : 'Botの勝利'}です！**`);
          collector.stop();
          await interaction.editReply({ embeds: [embed], components: [] });
          return;
        }
        if (board.every(cell => cell !== null)) {
          embed.setDescription('🤝 **引き分けです！**');
          collector.stop();
          await interaction.editReply({ embeds: [embed], components: [] });
          return;
        }

        embed.setDescription('あなたの番です (X)。');
        await interaction.editReply({ embeds: [embed], components: [getBoardRow()] });
      }, 1000);
    });

    collector.on('end', async () => {
      await interaction.editReply({ embeds: [embed], components: [] });
    });
  }
};

function checkWinner(board) {
  const lines = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];
  for (const line of lines) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a];
    }
  }
  return null;
}

function getBotMove(board) {
  // 勝利手があればそこを選ぶ
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const tempBoard = [...board];
      tempBoard[i] = 'O';
      if (checkWinner(tempBoard) === 'O') {
        return i;
      }
    }
  }
  // 相手の勝利手があればブロックする
  for (let i = 0; i < 9; i++) {
    if (board[i] === null) {
      const tempBoard = [...board];
      tempBoard[i] = 'X';
      if (checkWinner(tempBoard) === 'X') {
        return i;
      }
    }
  }
  // 中央が空いていれば中央を選ぶ
  if (board[4] === null) return 4;
  // 角が空いていれば角を選ぶ
  const corners = [0, 2, 6, 8];
  const emptyCorners = corners.filter(i => board[i] === null);
  if (emptyCorners.length > 0) {
    return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
  }
  // それ以外はランダムな空いているマスを選ぶ
  const emptyCells = board.map((cell, i) => cell === null ? i : null).filter(val => val !== null);
  return emptyCells[Math.floor(Math.random() * emptyCells.length)] || -1;
}