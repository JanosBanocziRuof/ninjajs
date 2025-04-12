const { ActivityType } = require('discord.js');

module.exports = {
    name: 'ready',
    once: true,
    execute(client) {
        client.user.setStatus('online');
        console.log(`Ready! Logged in as ${client.user.tag}`);

        const arrayOfStatus = [
            `api.ninja.io`,
            `/help`,
            `${client.guilds.cache.size} servers`
        ]
        let index = 0
        setInterval(() => {
            if (index === arrayOfStatus.length) index = 0
            const status = arrayOfStatus[index]
            client.user.setActivity(status, { type: ActivityType.Watching });
            index++
        }, 5000)
    }
}