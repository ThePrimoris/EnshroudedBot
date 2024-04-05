const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { UserInfraction, UserNote } = require('../../database'); // Ensure this path is correct

module.exports = {
    data: {
        name: 'info',
        description: 'Provides information about a user.',
        options: [{
            name: 'user',
            type: 'USER',
            description: 'The user you want to get information about',
            required: true,
        }],
    },
    async execute(interaction) {
        if (!interaction.member.permissions.has('MANAGE_ROLES')) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        const member = await interaction.guild.members.fetch(user.id);

        // Fetch the actual number of infractions and notes for the user
        const numberOfInfractions = await UserInfraction.count({ where: { userId: user.id } });
        const numberOfNotes = await UserNote.count({ where: { userId: user.id } });

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Information`)
            .setDescription(`Details about ${user.username}`)
            .setColor(0x3498db)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: 'Name', value: user.username, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Bot Account', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Animated Avatar', value: user.avatar && user.avatar.startsWith('a_') ? 'Yes' : 'No', inline: true },
                { name: 'Avatar URL', value: `[Avatar URL](${user.displayAvatarURL()})`, inline: true },
                { name: 'Profile Link', value: `[Click Here](https://discord.com/users/${user.id})`, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Joined Server', value: member.joinedAt.toDateString(), inline: true },
                { name: 'Account Created', value: user.createdAt.toDateString(), inline: true },
                { name: 'Infractions', value: numberOfInfractions.toString(), inline: true },
                { name: 'Notes', value: numberOfNotes.toString(), inline: true }
            )
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        const infractionsButton = new ButtonBuilder()
            .setCustomId('view_infractions_' + user.id) // Append user ID to make the custom ID unique per user
            .setLabel('View Infractions')
            .setStyle(ButtonStyle.Secondary);

        const notesButton = new ButtonBuilder()
            .setCustomId('view_notes_' + user.id)
            .setLabel('View Notes')
            .setStyle(ButtonStyle.Secondary);

        const actionRow = new ActionRowBuilder()
            .addComponents(infractionsButton, notesButton);

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    },
};
