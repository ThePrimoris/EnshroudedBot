const { addXP } = require('../database/index'); // Adjust the path as needed

module.exports = {
    name: 'messageCreate',
    execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Add XP for the user who sent the message
        const xpToAdd = 10; // Adjust as needed
        addXP(message.author.id, xpToAdd)
            .then(() => {
                console.log(`Added ${xpToAdd} XP to user ${message.author.id}`);
            })
            .catch(error => {
                console.error('Failed to add XP:', error);
            });
    },
};
