const { Events } = require('discord.js');

const specificUserId = '1225491801322946675'; // User ID to scan for

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Check if the message is from the specific user, contains "portal knights", and is not from a bot
        if (message.author.id === specificUserId && !message.author.bot && message.content.toLowerCase().includes('test')) {
            // Reply to the user
            await message.channel.send("Test received!");

            // React to the message with :regional_indicator_o:, :regional_indicator_m:, :regional_indicator_g:
            await message.react('T');
        }
    },
};
