const { Events, PermissionsBitField } = require('discord.js');
const config = require('../config.js');

const screenshotsChannelId = config.channels.screenshotsChannelId;
const creativeCornerChannelId = config.channels.creativeCornerChannelId;
const selfPromoChannelId = config.channels.selfPromoChannelId; // Add your self-promo channel here

module.exports = {
    name: Events.MessageCreate,
    async execute(message) {
        // Check if the message is in the screenshots channel and is not from a bot
        if (message.channel.id === screenshotsChannelId && !message.author.bot) {
            // Check if the author is a moderator (has MANAGE_MESSAGES permission)
            const isModerator = message.member.permissions.has(PermissionsBitField.Flags.ManageMessages);

            // Check if the message has an image attachment or if the author is a moderator
            const hasImageAttachment = message.attachments.some(attachment => attachment.contentType && attachment.contentType.startsWith('image/'));

            if (!hasImageAttachment && !isModerator) {
                // Log the message deletion to the console
                console.log(`Deleted message from ${message.author.tag} (ID: ${message.id}) in ${message.channel.name}.`);

                // Delete the message
                await message.delete();

                // Send a response to the user
                const responseMessage = await message.channel.send({
                    content: `${message.author}, your message was removed as this channel is image only. Please use <#${creativeCornerChannelId}> for conversation.`,
                    allowedMentions: { users: [message.author.id] }
                });

                // Delete the bot's response after a few seconds (e.g., 10 seconds)
                setTimeout(() => {
                    responseMessage.delete().catch(console.error);
                }, 10000); // 10 seconds
            }
        }

        // Check if the message is in the self-promo channel
        if (message.channel.id === selfPromoChannelId && !message.author.bot) {
            const requiredTimeInServer = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
            const minimumMessagesRequired = 100; // Set minimum messages for active members

            // Check if the member has been in the server long enough
            const memberJoinDuration = Date.now() - message.member.joinedTimestamp;

            // Check if the user has posted a minimum number of messages in the server
            const messageCount = await message.guild.members.fetch(message.author.id)
                .then(member => member.user.lastMessageCount || 0); // This is just a placeholder, you may need a custom solution to track user message count

            if (memberJoinDuration < requiredTimeInServer || messageCount < minimumMessagesRequired) {
                // Log the message deletion to the console
                console.log(`Deleted message from ${message.author.tag} (ID: ${message.id}) in ${message.channel.name} due to insufficient activity.`);

                // Delete the message
                await message.delete();

                // Send a response to the user
                const responseMessage = await message.channel.send({
                    content: `${message.author}, the self-promo channel is for active members only. Please participate in the community before promoting your content.`,
                    allowedMentions: { users: [message.author.id] }
                });

                // Delete the bot's response after a few seconds (e.g., 10 seconds)
                setTimeout(() => {
                    responseMessage.delete().catch(console.error);
                }, 10000); // 10 seconds
            }
        }
    },
};
