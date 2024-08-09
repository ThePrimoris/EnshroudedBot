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
                    { name: '2 minutes', value: '120' },
                    { name: '5 minutes', value: '300' },
                    { name: '10 minutes', value: '600' },
                    { name: '15 minutes', value: '900' },
                    { name: '30 minutes', value: '1800' },
                    { name: '1 hour', value: '3600' },
                    { name: '2 hours', value: '7200' },
                    { name: '6 hours', value: '21600' }
                )),
    requiredPermissions: ['ManageMessages'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return await interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const channel = interaction.options.getChannel('channel');
        const durationValue = interaction.options.getString('duration');

        if (![ChannelType.GuildText, ChannelType.PublicThread, ChannelType.PrivateThread, ChannelType.GuildForum].includes(channel.type)) {
            return await interaction.reply({ content: 'Please select a valid channel type (text channel, thread, or forum).', ephemeral: true });
        }

        // Map duration values to human-readable strings
        const durationMap = {
            '0': 'None',
            '5': '5 seconds',
            '10': '10 seconds',
            '30': '30 seconds',
            '60': '1 minute',
            '120': '2 minutes',
            '300': '5 minutes',
            '600': '10 minutes',
            '900': '15 minutes',
            '1800': '30 minutes',
            '3600': '1 hour',
            '7200': '2 hours',
            '21600': '6 hours'
        };

        const durationText = durationMap[durationValue];

        try {
            if (channel.type === ChannelType.GuildForum) {
                return await interaction.reply({ content: 'Slowmode setting is not supported directly on forums at this moment.', ephemeral: true });
            } else {
                await channel.setRateLimitPerUser(parseInt(durationValue, 10));

                const channelMention = `<#${channel.id}>`;
                if (durationValue === '0') {
                    await interaction.reply({ content: `Slowmode has been removed in ${channelMention}.`, ephemeral: false });
                } else {
                    await interaction.reply({ content: `Slowmode set to ${durationText} in ${channelMention}.`, ephemeral: false });
                }
            }
        } catch (error) {
            console.error('Error setting slowmode:', error);
            await interaction.reply({ content: 'Failed to set slowmode. Please try again later.', ephemeral: true });
        }
    },
};
