const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode in a channel.')
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where you want to set slowmode.')
                .setRequired(true)
                // Discord.js v14 currently does not support specifying channel types directly in SlashCommandBuilder
        )
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The duration for the slowmode.')
                .setRequired(true)
                .addChoices(
                    { name: '5 seconds', value: '5' },
                    { name: '10 seconds', value: '10' },
                    { name: '30 seconds', value: '30' },
                    { name: '1 minute', value: '60' },
                    { name: '2 minutes', value: '120' },
                    // Add more choices as needed
                )),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const duration = parseInt(interaction.options.getString('duration'), 10);

        if (!channel || channel.type !== 0) { // Ensure channel is a text channel; 0 = GUILD_TEXT
            return await interaction.reply({ content: 'Please select a valid text channel.', ephemeral: true });
        }

        try {
            await channel.setRateLimitPerUser(duration);
            await interaction.reply({ content: `Slowmode set to ${duration} seconds in ${channel.name}.`, ephemeral: false });
        } catch (error) {
            console.error('Error setting slowmode:', error);
            await interaction.reply({ content: 'Failed to set slowmode. Please try again later.', ephemeral: true });
        }
    },
};
