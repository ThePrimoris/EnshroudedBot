const { ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { UserWarning, UserNote, UserMute, UserBan } = require('../../database');

module.exports = {
    // Define the context menu command
    data: new ContextMenuCommandBuilder()
        .setName('Info')  // This is the name that will appear in the right-click menu
        .setType(ApplicationCommandType.User)
        .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages),

    requiredPermissions: ['ManageMessages'],
    category: 'context',

    async execute(interaction) {
        // Ensure the command is from a context menu
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have the required permission (Manage Messages) to use this command.", ephemeral: true });
        }

        const user = interaction.targetUser; // Fetches the user being right-clicked

        // Acknowledge the interaction immediately
        await interaction.deferReply({ ephemeral: true });

        await this.handleInfo(interaction, user); // Call handleInfo function to get user details
    },

    async handleInfo(context, user) {
        let member;
        try {
            member = await context.guild.members.fetch(user.id);
        } catch (error) {
            console.error('Failed to fetch member:', error);
            return context.editReply({ content: 'Failed to fetch user from the guild. They may not be a member.', ephemeral: true });
        }

        let numberOfWarnings = 0, numberOfNotes = 0, numberOfMutes = 0, numberOfBans = 0;
        try {
            numberOfWarnings = await UserWarning.count({ where: { userId: user.id } }) || 0;
            numberOfNotes = await UserNote.count({ where: { userId: user.id } }) || 0;
            numberOfMutes = await UserMute.count({ where: { userId: user.id } }) || 0;
            numberOfBans = await UserBan.count({ where: { userId: user.id } }) || 0;
        } catch (error) {
            console.error('Error fetching moderation data:', error);
            return context.editReply({ content: 'Failed to fetch moderation data. Please try again later.', ephemeral: true });
        }

        const roleNames = member.roles.cache
            .filter(role => role.id !== context.guild.id)
            .map(role => `<@&${role.id}>`)
            .join(' ') || 'None';

        const embed = new EmbedBuilder()
            .setTitle(`${user.username || 'Unknown User'}'s Information`)
            .setDescription(`Details about ${user.username || 'Unknown User'}`)
            .setColor(0x3498db)
            .setThumbnail(user.displayAvatarURL())
            .addFields(
                { name: '👤 Name', value: user.username || 'Unknown', inline: true },
                { name: '🆔 ID', value: user.id || 'Unknown', inline: true },
                { name: '🤖 Bot Account', value: user.bot ? 'Yes' : 'No', inline: true },
                { name: '🎭 Animated Avatar', value: user.avatar && user.avatar.startsWith('a_') ? 'Yes' : 'No', inline: true },
                { name: '🔗 Avatar URL', value: `[Click Here](${user.displayAvatarURL()})`, inline: true },
                { name: '🔖 Profile Link', value: `<@${user.id}>`, inline: true }
            )
            .addFields(
                { name: '🏷️ Nickname', value: member.nickname || 'None', inline: true },
                { name: '📅 Joined Server', value: member.joinedAt ? member.joinedAt.toDateString() : 'N/A', inline: true },
                { name: '🗓️ Account Created', value: user.createdAt ? user.createdAt.toDateString() : 'N/A', inline: true },
                { name: '🔖 Roles', value: roleNames, inline: false },
                { name: '📜 Moderation Summary', value: `⚠️ ${numberOfWarnings} Warnings\n📝 ${numberOfNotes} Notes\n🔇 ${numberOfMutes} Mutes\n🚫 ${numberOfBans} Bans`, inline: false }
            )
            .setFooter({ text: `Requested by ${context.member.user.username}`, iconURL: context.member.user.displayAvatarURL() });

        const warningsButton = new ButtonBuilder()
            .setCustomId(`view_warnings:${user.id}`)
            .setLabel('View Warnings')
            .setStyle(ButtonStyle.Secondary);

        const notesButton = new ButtonBuilder()
            .setCustomId(`view_notes:${user.id}`)
            .setLabel('View Notes')
            .setStyle(ButtonStyle.Secondary);

        const viewAllButton = new ButtonBuilder()
            .setCustomId(`view_moderation:${user.id}`)
            .setLabel('View All Moderation Actions')
            .setStyle(ButtonStyle.Primary);

        const warnButton = new ButtonBuilder()
            .setCustomId(`warn_user:${user.id}`)
            .setLabel('Warn')
            .setStyle(ButtonStyle.Danger);

        const banButton = new ButtonBuilder()
            .setCustomId(`ban_user:${user.id}`)
            .setLabel('Ban')
            .setStyle(ButtonStyle.Danger);

        const actionRow = new ActionRowBuilder()
            .addComponents(warningsButton, notesButton, viewAllButton, warnButton, banButton);

        // Edit the original deferred reply with the embed and buttons
        await context.editReply({ embeds: [embed], components: [actionRow] });
    }
};
