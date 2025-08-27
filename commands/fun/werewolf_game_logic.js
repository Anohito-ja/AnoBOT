const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createWerewolfGame(channelId, user) {
  const game = {
    isActive: true,
    channelId: channelId,
    players: new Map(),
    state: 'recruiting',
    lastVictim: null,
  };
  game.players.set(user.id, { id: user.id, username: user.username, role: null, isAlive: true });
  return game;
}

function assignRoles(game) {
  const players = Array.from(game.players.values());
  const numPlayers = players.length;
  const numWerewolves = Math.max(1, Math.floor(numPlayers / 5));
  const numSeers = 1;
  const numGuards = 1;
  const numVillagers = numPlayers - numWerewolves - numSeers - numGuards;
  const roles = [...Array(numWerewolves).fill('人狼'), ...Array(numSeers).fill('占い師'), ...Array(numGuards).fill('騎士'), ...Array(numVillagers).fill('村人')];
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  players.forEach((player, index) => { player.role = roles[index]; });
}

async function startNight(interaction, client) {
  const game = client.werewolfGame;
  game.state = 'night';
  const players = Array.from(game.players.values()).filter(p => p.isAlive);
  const nightActions = new Map();
  
  const embed = new EmbedBuilder().setColor(0x000080).setTitle('🌙 夜になりました...').setDescription('村人たちは眠りにつきました。\n役職を持つ人々は行動を開始してください。').setTimestamp();
  await interaction.channel.send({ embeds: [embed] });

  const werewolfPlayers = players.filter(p => p.role === '人狼');
  if (werewolfPlayers.length > 0) {
    const buttonRow = new ActionRowBuilder().addComponents(
      players.filter(p => p.role !== '人狼').map(p => new ButtonBuilder().setCustomId(`werewolf_vote_kill_${p.id}`).setLabel(p.username).setStyle(ButtonStyle.Danger))
    );
    for (const werewolf of werewolfPlayers) {
      const user = await client.users.fetch(werewolf.id);
      await user.send({ content: '今夜誰を襲撃しますか？', components: [buttonRow] });
    }
  }

  const seerPlayers = players.filter(p => p.role === '占い師');
  if (seerPlayers.length > 0) {
    const buttonRow = new ActionRowBuilder().addComponents(
      players.map(p => new ButtonBuilder().setCustomId(`werewolf_vote_seer_${p.id}`).setLabel(p.username).setStyle(ButtonStyle.Primary))
    );
    for (const seer of seerPlayers) {
      const user = await client.users.fetch(seer.id);
      await user.send({ content: '今夜誰を占いますか？', components: [buttonRow] });
    }
  }

  const guardPlayers = players.filter(p => p.role === '騎士');
  if (guardPlayers.length > 0) {
    const buttonRow = new ActionRowBuilder().addComponents(
      players.map(p => new ButtonBuilder().setCustomId(`werewolf_vote_guard_${p.id}`).setLabel(p.username).setStyle(ButtonStyle.Success))
    );
    for (const guard of guardPlayers) {
      const user = await client.users.fetch(guard.id);
      await user.send({ content: '今夜誰を護衛しますか？', components: [buttonRow] });
    }
  }

  const collector = interaction.channel.createMessageComponentCollector({ filter: i => i.customId.startsWith('werewolf_vote_'), time: 60000 });
  
  collector.on('collect', async i => {
    const [_, __, action, targetId] = i.customId.split('_');
    const player = players.find(p => p.id === i.user.id);
    if (!player) return;

    if (action === 'kill' && player.role === '人狼') {
      nightActions.set('werewolf', targetId);
      await i.update({ content: `✅ ${players.find(p => p.id === targetId).username} を襲撃対象に選びました。`, components: [] });
    } else if (action === 'seer' && player.role === '占い師') {
      const target = players.find(p => p.id === targetId);
      await i.update({ content: `✅ ${target.username} を占いました。\n彼の役職は **${target.role}** です。`, components: [] });
    } else if (action === 'guard' && player.role === '騎士') {
      nightActions.set('guard', targetId);
      await i.update({ content: `✅ ${players.find(p => p.id === targetId).username} を護衛します。`, components: [] });
    }
  });

  collector.on('end', async () => {
    const victimId = nightActions.get('werewolf');
    const guardTargetId = nightActions.get('guard');
    let victim = null;
    if (victimId && victimId !== guardTargetId) {
      victim = players.find(p => p.id === victimId);
      if (victim) {
        victim.isAlive = false;
        game.lastVictim = victim;
      }
    } else {
      game.lastVictim = null;
    }
    if (game.lastVictim) {
      await interaction.channel.send(`⚔️ 夜が明けました。\n昨夜の犠牲者は... **${game.lastVictim.username}** でした。\n彼の正体は... **${game.lastVictim.role}** でした！`);
    } else {
      await interaction.channel.send('平和な夜でした。人狼は襲撃に失敗しました。');
    }
    if (checkWinCondition(game)) {
      endGame(interaction, game);
    } else {
      await startDay(interaction, client);
    }
  });
}

async function startDay(interaction, client) {
  const game = client.werewolfGame;
  game.state = 'day';
  const alivePlayers = Array.from(game.players.values()).filter(p => p.isAlive);
  const alivePlayerList = alivePlayers.map(p => `・${p.username}`).join('\n');
  const embed = new EmbedBuilder().setColor(0x008000).setTitle('☀️ 昼になりました...').setDescription(`議論を始めて、追放する人物を決めてください。\n生存者: \n${alivePlayerList}`).setTimestamp();
  await interaction.channel.send({ embeds: [embed] });

  const buttonRow = new ActionRowBuilder().addComponents(
    alivePlayers.map(p => new ButtonBuilder().setCustomId(`werewolf_vote_exile_${p.id}`).setLabel(p.username).setStyle(ButtonStyle.Primary))
  );
  await interaction.channel.send({ content: '処刑したい人物に投票してください。', components: [buttonRow] });

  const dayVoteMap = new Map();
  const collector = interaction.channel.createMessageComponentCollector({ filter: i => i.customId.startsWith('werewolf_vote_exile_') && alivePlayers.some(p => p.id === i.user.id), time: 60000 });
  
  collector.on('collect', async i => {
    const targetId = i.customId.split('_')[3];
    if (dayVoteMap.has(i.user.id)) {
      return i.reply({ content: '⚠️ 投票は一人一回です。', ephemeral: true });
    }
    dayVoteMap.set(i.user.id, targetId);
    await i.reply({ content: `✅ ${alivePlayers.find(p => p.id === targetId).username} に投票しました。`, ephemeral: true });
    if (dayVoteMap.size === alivePlayers.length) {
      collector.stop();
    }
  });

  collector.on('end', async () => {
    if (dayVoteMap.size > 0) {
      const voteCounts = {};
      dayVoteMap.forEach(targetId => { voteCounts[targetId] = (voteCounts[targetId] || 0) + 1; });
      const exiledId = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a])[0];
      const exiled = alivePlayers.find(p => p.id === exiledId);
      exiled.isAlive = false;
      await interaction.channel.send(`⚖️ 議論の結果、**${exiled.username}** が追放されました。\n彼の正体は... **${exiled.role}** でした！`);
    } else {
      await interaction.channel.send('投票がありませんでした。誰も追放されません。');
    }
    if (checkWinCondition(game)) {
      endGame(interaction, game);
    } else {
      await startNight(interaction, client);
    }
  });
}

function checkWinCondition(game) {
  const allPlayers = Array.from(game.players.values());
  const alivePlayers = allPlayers.filter(p => p.isAlive);
  const werewolves = alivePlayers.filter(p => p.role === '人狼');
  const villagers = alivePlayers.filter(p => p.role !== '人狼');

  if (werewolves.length === 0) {
    return 'villagers';
  } else if (werewolves.length >= villagers.length) {
    return 'werewolves';
  }
  return null;
}

async function endGame(interaction, game) {
  const result = checkWinCondition(game);
  const alivePlayers = Array.from(game.players.values()).filter(p => p.isAlive);
  
  const embed = new EmbedBuilder().addFields({ name: '生存者', value: alivePlayers.map(p => `・${p.username} (正体: ${p.role})`).join('\n') || 'なし' });
  
  if (result === 'villagers') {
    embed.setColor(0x00ff00).setTitle('🎉 村人の勝利です！').setDescription('すべての人狼を追放しました！');
  } else {
    embed.setColor(0xff0000).setTitle('🐺 人狼の勝利です！').setDescription('人狼の数が村人たちと同数になりました。');
  }
  
  await interaction.channel.send({ embeds: [embed] });
  game.isActive = false;
}

module.exports = {
  createWerewolfGame,
  assignRoles,
  startNight,
  startDay,
  checkWinCondition,
};
