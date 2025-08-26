const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('werewolf')
    .setDescription('人狼ゲームを管理します。')
    .addSubcommand(subcommand =>
      subcommand
        .setName('start')
        .setDescription('人狼ゲームを開始します。'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('join')
        .setDescription('現在進行中のゲームに参加します。'))
    .addSubcommand(subcommand =>
      subcommand
        .setName('end')
        .setDescription('ゲームを強制終了します。')),
  async execute(interaction, client) {
    const subcommand = interaction.options.getSubcommand();
    
    if (subcommand === 'start') {
      if (client.werewolfGame && client.werewolfGame.isActive) {
        return interaction.reply({ content: '⚠️ 既にゲームが進行中です。', ephemeral: true });
      }

      client.werewolfGame = {
        isActive: true,
        channelId: interaction.channel.id,
        players: new Map(),
        state: 'recruiting',
        turn: 'recruiting',
        lastVictim: null,
      };
      
      client.werewolfGame.players.set(interaction.user.id, {
        id: interaction.user.id,
        username: interaction.user.username,
        role: null,
        isAlive: true
      });

      await interaction.reply({ content: `**人狼ゲーム**が開始されました！\n**${interaction.user.username}**さんが参加しました。\n「/werewolf join」コマンドで参加してください。`, fetchReply: true });

      setTimeout(() => {
        if (client.werewolfGame && client.werewolfGame.state === 'recruiting' && client.werewolfGame.players.size >= 4) {
          assignRolesAndStartGame(interaction, client);
        } else if (client.werewolfGame && client.werewolfGame.state === 'recruiting' && client.werewolfGame.players.size < 4) {
          interaction.channel.send('ゲームを開始するには4人以上のプレイヤーが必要です。ゲームを終了します。');
          client.werewolfGame.isActive = false;
          client.werewolfGame = null;
        }
      }, 60000);
    
    } else if (subcommand === 'join') {
      if (!client.werewolfGame || !client.werewolfGame.isActive || client.werewolfGame.state !== 'recruiting') {
        return interaction.reply({ content: '⚠️ 現在、参加者を募集しているゲームはありません。', ephemeral: true });
      }

      const player = interaction.user;
      if (client.werewolfGame.players.has(player.id)) {
        return interaction.reply({ content: '⚠️ あなたは既にゲームに参加しています。', ephemeral: true });
      }

      client.werewolfGame.players.set(player.id, {
        id: player.id,
        username: player.username,
        role: null,
        isAlive: true
      });

      await interaction.reply({ content: `✅ ${player.username}さんがゲームに参加しました！ (参加者数: ${client.werewolfGame.players.size})`, ephemeral: false });
    
    } else if (subcommand === 'end') {
      if (!client.werewolfGame || !client.werewolfGame.isActive) {
        return interaction.reply({ content: '⚠️ 進行中のゲームはありません。', ephemeral: true });
      }

      client.werewolfGame.isActive = false;
      client.werewolfGame = null;
      await interaction.reply('人狼ゲームを強制終了しました。');
    }
  },
};

// 役職を割り当ててゲームを開始する関数
async function assignRolesAndStartGame(interaction, client) {
  const players = Array.from(client.werewolfGame.players.values());
  const numPlayers = players.length;
  const numWerewolves = Math.max(1, Math.floor(numPlayers / 5)); // 5人あたり1人狼
  const numSeers = 1;
  const numGuards = 1;
  const numVillagers = numPlayers - numWerewolves - numSeers - numGuards;
  
  const roles = [
    ...Array(numWerewolves).fill('人狼'),
    ...Array(numSeers).fill('占い師'),
    ...Array(numGuards).fill('騎士'),
    ...Array(numVillagers).fill('村人')
  ];
  
  for (let i = roles.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [roles[i], roles[j]] = [roles[j], roles[i]];
  }
  
  players.forEach((player, index) => {
    player.role = roles[index];
  });
  
  for (const player of players) {
    const user = await client.users.fetch(player.id);
    user.send(`あなたの役職は **${player.role}** です。`);
    if (player.role === '人狼') {
      const werewolves = players.filter(p => p.role === '人狼' && p.id !== player.id).map(p => p.username).join(', ');
      user.send(`仲間は **${werewolves}** です。`);
    }
  }

  client.werewolfGame.state = 'playing';
  client.werewolfGame.turn = 'night';
  
  const embed = new EmbedBuilder()
    .setColor(0x000080)
    .setTitle('🌙 夜になりました...')
    .setDescription('村人たちは眠りにつきました。\n役職を持つ人々は行動を開始してください。')
    .setTimestamp();
  
  await interaction.channel.send({ embeds: [embed] });
  
  startNightPhase(interaction, client);
}

// 夜のターン
async function startNightPhase(interaction, client) {
  const players = Array.from(client.werewolfGame.players.values()).filter(p => p.isAlive);
  const werewolves = players.filter(p => p.role === '人狼');
  const seers = players.filter(p => p.role === '占い師');
  const guards = players.filter(p => p.role === '騎士');
  
  const nightActions = new Map();

  if (werewolves.length > 0) {
    const buttonRow = new ActionRowBuilder();
    players.forEach(p => {
      if (p.role !== '人狼') {
        const button = new ButtonBuilder()
          .setCustomId(`werewolf_vote_kill_${p.id}`)
          .setLabel(p.username)
          .setStyle(ButtonStyle.Danger);
        buttonRow.addComponents(button);
      }
    });

    for (const werewolf of werewolves) {
      const user = await client.users.fetch(werewolf.id);
      await user.send({
        content: '今夜誰を襲撃しますか？',
        components: [buttonRow]
      });
    }
  }

  if (seers.length > 0) {
    const buttonRow = new ActionRowBuilder();
    players.forEach(p => {
      const button = new ButtonBuilder()
        .setCustomId(`werewolf_vote_seer_${p.id}`)
        .setLabel(p.username)
        .setStyle(ButtonStyle.Primary);
      buttonRow.addComponents(button);
    });

    for (const seer of seers) {
      const user = await client.users.fetch(seer.id);
      await user.send({
        content: '今夜誰を占いますか？',
        components: [buttonRow]
      });
    }
  }

  if (guards.length > 0) {
    const buttonRow = new ActionRowBuilder();
    players.forEach(p => {
      const button = new ButtonBuilder()
        .setCustomId(`werewolf_vote_guard_${p.id}`)
        .setLabel(p.username)
        .setStyle(ButtonStyle.Success);
      buttonRow.addComponents(button);
    });

    for (const guard of guards) {
      const user = await client.users.fetch(guard.id);
      await user.send({
        content: '今夜誰を護衛しますか？',
        components: [buttonRow]
      });
    }
  }

  const filter = (i) => i.customId.startsWith('werewolf_vote_');
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });

  collector.on('collect', async i => {
    const [_, type, action, targetId] = i.customId.split('_');
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
        client.werewolfGame.lastVictim = victim;
      }
    } else {
      client.werewolfGame.lastVictim = null;
    }

    if (client.werewolfGame.lastVictim) {
      await interaction.channel.send(`⚔️ 夜が明けました。\n昨夜の犠牲者は... **${client.werewolfGame.lastVictim.username}** でした。\n彼の正体は... **${client.werewolfGame.lastVictim.role}** でした！`);
    } else {
      await interaction.channel.send('平和な夜でした。人狼は襲撃に失敗しました。');
    }

    await checkGameEnd(interaction, client);
    if (client.werewolfGame && client.werewolfGame.isActive) {
      startDayPhase(interaction, client);
    }
  });
}

// 昼のターン
async function startDayPhase(interaction, client) {
  client.werewolfGame.turn = 'day';
  
  const alivePlayers = Array.from(client.werewolfGame.players.values()).filter(p => p.isAlive);
  const alivePlayerList = alivePlayers.map(p => `・${p.username}`).join('\n');
  
  const embed = new EmbedBuilder()
    .setColor(0x008000)
    .setTitle('☀️ 昼になりました...')
    .setDescription(`議論を始めて、追放する人物を決めてください。\n生存者: \n${alivePlayerList}`)
    .setTimestamp();
  
  await interaction.channel.send({ embeds: [embed] });
  
  const buttonRow = new ActionRowBuilder();
  alivePlayers.forEach(p => {
    const button = new ButtonBuilder()
      .setCustomId(`werewolf_vote_exile_${p.id}`)
      .setLabel(p.username)
      .setStyle(ButtonStyle.Primary);
    buttonRow.addComponents(button);
  });
  
  await interaction.channel.send({ content: '処刑したい人物に投票してください。', components: [buttonRow] });
  
  const filter = (i) => i.customId.startsWith('werewolf_vote_exile_') && alivePlayers.some(p => p.id === i.user.id);
  const collector = interaction.channel.createMessageComponentCollector({ filter, time: 60000 });
  
  const dayVoteMap = new Map();
  
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
      dayVoteMap.forEach(targetId => {
        voteCounts[targetId] = (voteCounts[targetId] || 0) + 1;
      });
      
      const exiledId = Object.keys(voteCounts).sort((a, b) => voteCounts[b] - voteCounts[a])[0];
      const exiled = alivePlayers.find(p => p.id === exiledId);
      
      exiled.isAlive = false;
      
      await interaction.channel.send(`⚖️ 議論の結果、**${exiled.username}** が追放されました。\n彼の正体は... **${exiled.role}** でした！`);
      await checkGameEnd(interaction, client);
      if (client.werewolfGame && client.werewolfGame.isActive) {
        startNightPhase(interaction, client);
      }
    } else {
      await interaction.channel.send('投票がありませんでした。誰も追放されません。');
      startNightPhase(interaction, client);
    }
  });
}

// ゲーム終了判定
async function checkGameEnd(interaction, client) {
  const allPlayers = Array.from(client.werewolfGame.players.values());
  const alivePlayers = allPlayers.filter(p => p.isAlive);
  const werewolves = alivePlayers.filter(p => p.role === '人狼');
  const villagers = alivePlayers.filter(p => p.role !== '人狼');
  
  if (werewolves.length === 0) {
    const resultEmbed = new EmbedBuilder()
      .setColor(0x00ff00)
      .setTitle('🎉 村人の勝利です！')
      .setDescription('すべての人狼を追放しました！')
      .addFields({
        name: '生存者',
        value: alivePlayers.map(p => `・${p.username} (正体: ${p.role})`).join('\n') || 'なし'
      });
    await interaction.channel.send({ embeds: [resultEmbed] });
    client.werewolfGame.isActive = false;
    client.werewolfGame = null;

  } else if (werewolves.length >= villagers.length) {
    const resultEmbed = new EmbedBuilder()
      .setColor(0xff0000)
      .setTitle('🐺 人狼の勝利です！')
      .setDescription('人狼の数が村人たちと同数になりました。')
      .addFields({
        name: '生存者',
        value: alivePlayers.map(p => `・${p.username} (正体: ${p.role})`).join('\n') || 'なし'
      });
    await interaction.channel.send({ embeds: [resultEmbed] });
    client.werewolfGame.isActive = false;
    client.werewolfGame = null;
  }
}