const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
// Ensure your model imports are correct
const { UserWarning, UserNote, UserMute, UserBan } = require('../../database'); // Adjust the path as necessary

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Provides information about a user.')
        .addUserOption(option =>
            option.setName('user')
                .setDescription('The user you want to get information about')
                .setRequired(true)),
    requiredPermissions: ['ManageMessages'],
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have the required permission (Manage Messages) to use this command.", ephemeral: true });
        }

        const user = interaction.options.getUser('user');
        let member;
        try {
            member = await interaction.guild.members.fetch(user.id);
        } catch (error) {
            console.error('Failed to fetch member:', error);
            return interaction.reply({ content: 'Failed to fetch user from the guild. They may not be a member.', ephemeral: true });
        }

        // Fetch counts for warnings and notes
        let numberOfWarnings, numberOfNotes;
        try {
            numberOfWarnings = await UserWarning.count({ where: { userId: user.id } });
            numberOfNotes = await UserNote.count({ where: { userId: user.id } });
        } catch (error) {
            console.error('Error fetching moderation data:', error);
            return interaction.reply({ content: 'Failed to fetch moderation data. Please try again later.', ephemeral: true });
        }

        const embed = new EmbedBuilder()
            .setTitle(`${user.username}'s Information`)
            .setDescription(`Details about ${user.username}`)
            .setColor(0x3498db)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                // User details
                { name: 'Name', value: user.username, inline: true },
                { name: 'ID', value: user.id, inline: true },
                { name: 'Bot Account', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: 'Animated Avatar', value: user.avatar && user.avatar.startsWith('a_') ? 'Yes' : 'No', inline: true },
                { name: 'Avatar URL', value: `[Click Here](${user.displayAvatarURL()})`, inline: true },
                { name: 'Profile Link', value: `[Profile Link](https://discord.com/users/${user.id})`, inline: true },
                { name: 'Nickname', value: member.nickname || 'None', inline: true },
                { name: 'Joined Server', value: member.joinedAt ? member.joinedAt.toDateString() : 'N/A', inline: true },
                { name: 'Account Created', value: user.createdAt.toDateString(), inline: true },
                { name: 'Warnings', value: numberOfWarnings.toString(), inline: true },
                { name: 'Notes', value: numberOfNotes.toString(), inline: true },
            )
            .setFooter({ text: `Requested by ${interaction.user.username}`, iconURL: interaction.user.displayAvatarURL() });

        // Buttons for individual actions
        const warningsButton = new ButtonBuilder()
            .setCustomId(`view_warnings_${user.id}`)
            .setLabel('View Warnings')
            .setStyle(ButtonStyle.Secondary);

        const notesButton = new ButtonBuilder()
            .setCustomId(`view_notes_${user.id}`)
            .setLabel('View Notes')
            .setStyle(ButtonStyle.Secondary);

        // Button for viewing all moderation actions
        const viewAllButton = new ButtonBuilder()
            .setCustomId(`view_moderation_${user.id}`)
            .setLabel('View All Moderation Actions')
            .setStyle(ButtonStyle.Primary);

        // Action row setup
        const actionRow = new ActionRowBuilder()
            .addComponents(warningsButton, notesButton, viewAllButton);

        await interaction.reply({ embeds: [embed], components: [actionRow] });
    },
};
