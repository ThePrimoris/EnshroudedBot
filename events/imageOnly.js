const { Events } = require('discord.js');

const specifiedChannelId = '1046840542006345841';

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Check if the message is in the specified channel and is not from a bot
        if (message.channel.id === specifiedChannelId && !message.author.bot) {
            // Check if the message has an image attachment
            const hasImageAttachment = message.attachments.some(attachment => attachment.contentType.startsWith('image/'));

            if (!hasImageAttachment) {
                // Delete the message
                await message.delete();

                // Send a response to the user
                await message.channel.send({
                    content: `${message.author}, your message was removed as this channel is image only. Please use #creative-corner for conversation.`,
                    allowedMentions: { users: [message.author.id] }
                });
            }
        }
    },
};
