const { SlashCommandBuilder, PermissionsBitField, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('slowmode')
        .setDescription('Set slowmode in a channel.')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where you want to set slowmode.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The duration for the slowmode.')
                .setRequired(true)
                .addChoices(
                    { name: 'None', value: '0' },
                    { name: '5 seconds', value: '5' },
                    { name: '10 seconds', value: '10' },
                    { name: '30 seconds', value: '30' },
                    { name: '1 minute', value: '60' },
                    { name: '2 minutes', value: '120' }
                )),
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const duration = parseInt(interaction.options.getString('duration'), 10);

        if (![ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.GuildForum].includes(channel.type)) {
            return await interaction.reply({ content: 'Please select a valid channel type (text channel, thread, or forum).', ephemeral: true });
        }

        try {
            if (channel.type === ChannelType.GuildForum) {
                return await interaction.reply({ content: 'Slowmode setting is not supported directly on forums at this moment.', ephemeral: true });
            } else {
                await channel.setRateLimitPerUser(duration);

                if (duration === 0) {
                    await interaction.reply({ content: `Slowmode has been removed in ${channel.name}.`, ephemeral: false });
                } else {
                    await interaction.reply({ content: `Slowmode set to ${duration} seconds in ${channel.name}.`, ephemeral: false });
                }
            }
        } catch (error) {
            console.error('Error setting slowmode:', error);
            await interaction.reply({ content: 'Failed to set slowmode. Please try again later.', ephemeral: true });
        }
    },
};
