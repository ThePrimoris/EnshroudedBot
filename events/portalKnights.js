const { Events } = require('discord.js');

const specificUserId = '575756653090308136'; // User ID to scan for

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Check if the message is from the specific user, contains "portal knights", and is not from a bot
        if (message.author.id === specificUserId && !message.author.bot && message.content.toLowerCase().includes('portal knights')) {
            // Reply to the user
            await message.channel.send("Did someone say Portal Knights!?");

            // React to the message with :regional_indicator_o:, :regional_indicator_m:, :regional_indicator_g:
            await message.react('🇴');
            await message.react('🇲');
            await message.react('🇬');
        }
    },
};
