const { SlashCommandBuilder, ContextMenuCommandBuilder, ApplicationCommandType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, PermissionsBitField } = require('discord.js');
const { UserWarning, UserNote, UserMute, UserBan } = require('../../database');

module.exports = {
    // Define both the slash command and context menu command
    data: [
        new SlashCommandBuilder()
            .setName('info')
            .setDescription('Provides information about a user.')
            .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
            .addUserOption(option =>
                option.setName('user')
                    .setDescription('The user you want to get information about')
                    .setRequired(true)),
        new ContextMenuCommandBuilder()
            .setName('Info')
            .setType(ApplicationCommandType.User)
            .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    ],

    requiredPermissions: ['ManageMessages'],
    category: 'moderation',

    async execute(interactionOrMessage, args) {
        const isInteraction = interactionOrMessage.isCommand !== undefined;
        let isEphemeral = false; // Default: not ephemeral

        // If it's an interaction (slash command)
        if (isInteraction) {
            const interaction = interactionOrMessage;

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: "You don't have the required permission (Manage Messages) to use this command.", ephemeral: true });
            }

            const user = interaction.options.getUser('user');
            await this.handleInfo(interaction, user, isEphemeral);

        // If it's a message (prefix command)
        } else if (interactionOrMessage.isContextMenuCommand !== undefined) {
            // Handle the context menu command
            const interaction = interactionOrMessage;
            isEphemeral = true; // Set to ephemeral for context menu

            if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
            }

            const user = interaction.targetUser;
            await this.handleInfo(interaction, user, isEphemeral);
        } else {
            const message = interactionOrMessage;

            if (!message.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                return message.reply("You don't have the required permission (Manage Messages) to use this command.");
            }

            const user = message.mentions.users.first() || message.guild.members.cache.get(args[0]);

            if (!user) {
                return message.reply('Please mention a valid user or provide their user ID.');
            }

            await this.handleInfo(message, user, isEphemeral);
        }
    },

    async handleInfo(context, user, isEphemeral) {
        let member;
        try {
            member = await context.guild.members.fetch(user.id);
        } catch (error) {
            console.error('Failed to fetch member:', error);
            return context.reply({ content: 'Failed to fetch user from the guild. They may not be a member.', ephemeral: true });
        }
    
        let numberOfWarnings = 0, numberOfNotes = 0, numberOfMutes = 0, numberOfBans = 0;
        try {
            numberOfWarnings = await UserWarning.count({ where: { userId: user.id } }) || 0;
            numberOfNotes = await UserNote.count({ where: { userId: user.id } }) || 0;
            numberOfMutes = await UserMute.count({ where: { userId: user.id } }) || 0;
            numberOfBans = await UserBan.count({ where: { userId: user.id } }) || 0;
        } catch (error) {
            console.error('Error fetching moderation data:', error);
            return context.reply('Failed to fetch moderation data. Please try again later.', { ephemeral: isEphemeral });
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
    
        await context.reply({ embeds: [embed], components: [actionRow], ephemeral: isEphemeral });
    }
};
