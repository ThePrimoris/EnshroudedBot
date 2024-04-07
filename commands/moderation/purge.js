const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes a specified number of recent messages from a user in a specified channel.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose messages to delete')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel to delete messages from')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)),
    category: 'moderation',
    async execute(interaction) {
        // Permission Check
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');
        const channel = interaction.options.getChannel('channel');

        // Ensure the selected channel is a text channel where messages can be deleted
        if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: `The selected channel is not a text channel.`, ephemeral: true });
        }

        // Fetch Messages in the specified channel
        try {
            const fetchedMessages = await channel.messages.fetch({ limit: 100 });
            const userMessages = fetchedMessages.filter(m => m.author.id === targetUser.id).first(amount);

            if (userMessages.length === 0) {
                return interaction.reply({ content: `No messages found from ${targetUser.username} that can be deleted in the selected channel.`, ephemeral: true });
            }

            // Bulk Delete in the specified channel
            await channel.bulkDelete(userMessages, true);
            return interaction.reply({ content: `Successfully deleted ${userMessages.length} messages from ${targetUser.username}.`, ephemeral: true });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: 'There was an error trying to delete messages in this channel.', ephemeral: true });
        }
    },
};
