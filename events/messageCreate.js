const { addXP } = require('../database/index');
const xpCommand = require('../commands/general/xp');

const { client } = xpCommand;

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Generate a random amount of XP to add, between 1 and 10
        const xpToAdd = Math.floor(Math.random() * 10) + 1;
        addXP(message.author.id, xpToAdd)
            .then(async () => {
                console.log(`Added ${xpToAdd} XP to user ${message.author.id}`);
                // Call the execute function from xp.js to check if the user has leveled up
                await xpCommand.execute(message);
            })
            .catch(error => {
                console.error('Failed to add XP:', error);
            });
    },
};

client.on('levelUp', async (user, level, channel) => {
    try {
        const message = `Congratulations! You have leveled up to level ${level}. Keep it up!`;
        await channel.send({ content: message, ephemeral: true });
    } catch (error) {
        console.error('Error sending ephemeral message:', error);
    }
});
