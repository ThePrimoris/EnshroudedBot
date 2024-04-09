const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes a specified number of recent messages. Optionally specify a user and/or channel.')
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose messages to delete')
                .setRequired(false)) // User is now optional
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to delete messages from')
                .setRequired(false) // Channel is now optional
                .addChannelTypes(ChannelType.GuildText)),
    requiredPermissions: ['ManageMessages'],
    category: 'moderation',
    async execute(interaction) {
        // Permission Check
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        // Retrieve options, considering they might not be provided
        const amount = interaction.options.getInteger('amount'); // Amount is still required
        const targetUser = interaction.options.getUser('user', false); // Second argument false makes it optional
        let channel = interaction.options.getChannel('channel', false); // Channel is optional

        // Use the interaction's channel as default if no channel is explicitly provided
        if (!channel) {
            channel = interaction.channel;
        }

        // The rest of your command logic here...

        // Adjust the message fetching and filtering logic to account for optional user
        try {
            const fetchedMessages = await channel.messages.fetch({ limit: 100 });
            let messagesToDelete;

            if (targetUser) {
                messagesToDelete = fetchedMessages.filter(m => m.author.id === targetUser.id).first(amount);
            } else {
                messagesToDelete = fetchedMessages.first(amount);
            }

            if (messagesToDelete.length === 0) {
                return interaction.reply({ content: `No messages found that can be deleted.`, ephemeral: true });
            }

            // Bulk Delete in the specified channel
            await channel.bulkDelete(messagesToDelete, true);
            return interaction.reply({ content: `Successfully deleted ${messagesToDelete.length} messages.`, ephemeral: false });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error trying to delete messages in this channel.', ephemeral: true });
        }
    },
};
