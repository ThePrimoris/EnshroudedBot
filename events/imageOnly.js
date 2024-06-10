const { Events, PermissionsBitField } = require('discord.js');

const specifiedChannelId = '1046840542006345841';
const creativeCornerChannelId = '1235270718577578085'; // #creative-corner channel ID

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Check if the message is in the specified channel and is not from a bot
        if (message.channel.id === specifiedChannelId && !message.author.bot) {
            // Check if the author is a moderator (has MANAGE_MESSAGES permission)
            const isModerator = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);

            // Check if the message has an image attachment or if the author is a moderator
            const hasImageAttachment = message.attachments.some(attachment => attachment.contentType && attachment.contentType.startsWith('image/'));

            if (!hasImageAttachment && !isModerator) {
                // Delete the message
                await message.delete();

                // Send a response to the user
                await message.channel.send({
                    content: `${message.author}, your message was removed as this channel is image only. Please use <#${creativeCornerChannelId}> for conversation.`,
                    allowedMentions: { users: [message.author.id] }
                });
            }
        }
    },
};
