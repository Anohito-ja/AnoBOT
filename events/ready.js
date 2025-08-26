const { Events } = require('discord.js');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {
    console.log(`[bot] Logged in as ${client.user.tag}`);
  },
<<<<<<< HEAD
};
=======
};
>>>>>>> 847512c7e09a4c27175b8ed36990db4821422739
