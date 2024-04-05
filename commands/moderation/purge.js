const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('purge')
        .setDescription('Deletes a specified number of recent messages from a user.')
        .addUserOption(option => 
            option.setName('user')
                .setDescription('The user whose messages to delete')
                .setRequired(true))
        .addIntegerOption(option => 
            option.setName('amount')
                .setDescription('Number of messages to delete')
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(100)), // Discord API allows a max of 100 messages to be targeted in a bulk delete operation
    async execute(interaction) {
        // Permission Check
        if (!interaction.member.permissions.has('MANAGE_MESSAGES')) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const targetUser = interaction.options.getUser('user');
        const amount = interaction.options.getInteger('amount');

        // Fetch Messages
        const messages = await interaction.channel.messages.fetch({ limit: 100 });
        const userMessages = messages.filter(m => m.author.id === targetUser.id).first(amount);

        if (userMessages.length === 0) {
            return interaction.reply({ content: `No messages found from ${targetUser.username} that can be deleted.`, ephemeral: true });
        }

        // Bulk Delete
        interaction.channel.bulkDelete(userMessages, true).then(deleted => {
            interaction.reply({ content: `Successfully deleted ${deleted.size} messages from ${targetUser.username}.`, ephemeral: false });
        }).catch(error => {
            console.error(error);
            interaction.reply({ content: 'There was an error trying to delete messages in this channel.', ephemeral: true });
        });
    },
};
