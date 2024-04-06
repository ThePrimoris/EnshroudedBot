const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: {
        name: 'mute',
        description: 'Mute a user for a specified duration.',
        options: [
            {
                name: 'user',
                type: 'USER',
                description: 'The user to be muted.',
                required: true,
            },
            {
                name: 'time',
                type: 'STRING',
                description: 'The duration of the mute (e.g., 1d, 2h, 30m).',
                required: true,
            },
            {
                name: 'reason',
                type: 'STRING',
                description: 'The reason for the mute (optional).',
                required: false,
            },
        ],
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const time = interaction.options.getString('time');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        const duration = parseDuration(time);
        if (duration === null) {
            return interaction.reply({ content: "Invalid time format. Use #d for days, #h for hours, or #m for minutes.", ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return interaction.reply({ content: "Mute role not found. Please create a 'Muted' role.", ephemeral: true });
        }

        try {
            await member.roles.add(muteRole, { reason: reason });
            await user.send(`You have been muted in ${interaction.guild.name} for ${time}. Reason: ${reason}`).catch(console.error);
            await interaction.reply({ content: `${user.username} has been muted for ${time}.`, ephemeral: false });

            // Schedule unmute
            setTimeout(async () => {
                try {
                    // Refetch the member to get the most current state
                    const freshMember = await interaction.guild.members.fetch(user.id);
                    
                    // Check if the user still has the muted role
                    if (freshMember.roles.cache.has(muteRole.id)) {
                        await freshMember.roles.remove(muteRole).catch(console.error);
                        await user.send(`You have been unmuted in ${interaction.guild.name}.`).catch(console.error);
                    }
                } catch (error) {
                    console.error('Failed to auto-unmute or send DM:', error);
                }
            }, duration);
        } catch (error) {
            console.error(error);
            await interaction.reply({ content: 'Failed to mute the user. Please make sure I have the right permissions and try again.', ephemeral: true });
        }
    },
};

function parseDuration(time) {
    const match = time.match(/^(\d+)([dhm])$/);
    if (!match) return null;

    const duration = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 'd': return duration * 86400000; // days in milliseconds
        case 'h': return duration * 3600000;  // hours in milliseconds
        case 'm': return duration * 60000;     // minutes in milliseconds
        default: return null;
    }
}
