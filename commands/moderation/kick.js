const { EmbedBuilder } = require('discord.js');

module.exports = {
    data: {
        name: 'kick',
        description: 'Kick a user from the server.',
        options: [
            {
                name: 'user',
                type: 'USER',
                description: 'The user to be kicked.',
                required: true,
            },
            {
                name: 'reason',
                type: 'STRING',
                description: 'The reason for the kick (optional).',
                required: false,
            },
        ],
    },
    async execute(interaction) {
        // Check for KickMembers permission before proceeding with the /kick command
        if (!interaction.member.permissions.has('KICK_MEMBERS')) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const reason = interaction.options.getString('reason') || 'No reason provided';
        const member = await interaction.guild.members.fetch(user.id);

        if (!member) {
            return interaction.reply({ content: "Could not find the user in this server.", ephemeral: true });
        }

        // Additional checks to prevent kicking the bot or a user that cannot be kicked (higher role)
        if (member.id === interaction.client.user.id) {
            return interaction.reply({ content: "I cannot kick myself.", ephemeral: true });
        }

        if (!member.kickable) {
            return interaction.reply({ content: "I do not have permission to kick this user. They might have a higher role than me or I lack kick permissions.", ephemeral: true });
        }

        try {
            await member.kick(reason);
            await interaction.reply({ content: `${user.tag} has been kicked for: ${reason}`, ephemeral: false });

            // Optionally, send a DM to the kicked user
            await user.send(`You have been kicked from ${interaction.guild.name}. Reason: ${reason}`).catch(console.error);
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: "There was an error attempting to kick the user.", ephemeral: true });
        }
    },
};
