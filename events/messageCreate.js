const { addXP } = require('../database/index');

module.exports = {
    name: 'messageCreate',
    async execute(message) {
        // Ignore messages from bots
        if (message.author.bot) return;

        // Generate a random amount of XP to add, between 1 and 10
        const xpToAdd = Math.floor(Math.random() * 10) + 1;
        addXP(message.author.id, xpToAdd)
            .then(() => {
                console.log(`Added ${xpToAdd} XP to user ${message.author.id}`);
            })
            .catch(error => {
                console.error('Failed to add XP:', error);
            });
    },
};
