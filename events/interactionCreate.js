const { Events, PermissionsBitField } = require('discord.js');

module.exports = {
  name: Events.InteractionCreate,
  async execute(interaction, client) {
    if (interaction.isChatInputCommand()) {
      const command = client.commands.get(interaction.commandName);

      if (!command) {
        console.error(`No command matching ${interaction.commandName} was found.`);
        return;
      }

      try {
        await command.execute(interaction, client);
      } catch (error) {
        console.error(error);
        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'コマンドの実行中にエラーが発生しました！', ephemeral: true });
        } else {
          await interaction.reply({ content: 'コマンドの実行中にエラーが発生しました！', ephemeral: true });
        }
      }
    } else if (interaction.isButton()) {
        if (interaction.customId.startsWith('addrole_')) {
            const roleId = interaction.customId.split('_')[1];
            const role = interaction.guild.roles.cache.get(roleId);
            const member = interaction.member;

            if (role && member) {
                try {
                    await member.roles.add(role);
                    await interaction.reply({ content: `✅ ロール「${role.name}」を付与しました。`, ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: 'ロールの付与に失敗しました。BOTのロールがユーザーのロールより上位にあるか確認してください。', ephemeral: true });
                }
            } else {
                await interaction.reply({ content: 'ロールが見つかりませんでした。', ephemeral: true });
            }
        }
    }
  },
};