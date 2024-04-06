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
        // Check for ManageRoles permission before proceeding with the /mute command
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageRoles)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const time = interaction.options.getString('time');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        let duration = parseDuration(time);
        if (!duration) {
            return interaction.reply({ content: "Invalid time format. Use #d for days or #m for minutes.", ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return interaction.reply({ content: "Mute role not found. Please create a 'Muted' role.", ephemeral: true });
        }

        await member.roles.add(muteRole, { reason: reason });

        await user.send(`You have been muted in ${interaction.guild.name} for ${time}. Reason: ${reason}`).catch(console.error);
        await interaction.reply({ content: `${user.username} has been muted for ${time}.`, ephemeral: true });

        setTimeout(async () => {
            await member.roles.remove(muteRole).catch(console.error);
            await user.send(`You have been unmuted in ${interaction.guild.name}.`).catch(console.error);
        }, duration);
    },
};

function parseDuration(time) {
    const match = time.match(/^(\d+)([dhm])$/);
    if (match) {
        const duration = parseInt(match[1], 10);
        const unit = match[2];
        switch (unit) {
            case 'd': return duration * 86400000; // days in milliseconds
            case 'h': return duration * 3600000; // hours in milliseconds
            case 'm': return duration * 60000; // minutes in milliseconds
            default: return 0;
        }
    }
    return null;
}
