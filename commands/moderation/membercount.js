const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('serverinfo')
        .setDescription('Displays detailed information about the server'),
    requiredPermissions: ['BanMembers'], // Custom property for your command handler
    category: 'moderation', // Custom property for your command handler
    async execute(interaction) {
        // Permission check (if necessary)
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
            return interaction.reply({ content: 'You do not have permission to use this command.', ephemeral: true });
        }

        const guild = interaction.guild;

        // Gathering server data
        const serverName = guild.name;
        const serverId = guild.id;
        const owner = await guild.fetchOwner();
        const memberCount = guild.memberCount;
        const createdAt = guild.createdAt.toDateString();
        const onlineMembers = guild.members.cache.filter(member => member.presence?.status === 'online').size;
        const roleCount = guild.roles.cache.size;
        const channelCount = guild.channels.cache.size;
        const boostCount = guild.premiumSubscriptionCount;
        const boostLevel = guild.premiumTier;
        const maxMembers = guild.maximumMembers || 'Unlimited';
        const maxPresences = guild.maximumPresences || 'Unlimited';
        const features = guild.features.join(', ') || 'None';
        const isPartnered = guild.partnered ? 'Yes' : 'No';
        const isCommunity = guild.verified ? 'Yes' : 'No';
        const rulesChannel = guild.rulesChannel ? guild.rulesChannel.name : 'None';
        const systemChannel = guild.systemChannel ? guild.systemChannel.name : 'None';
        const defaultNotifications = guild.defaultMessageNotifications === 'ALL_MESSAGES' ? 'All Messages' : 'Only @mentions';
        const nsfwLevel = guild.nsfwLevel;
        const vanityUrlCode = guild.vanityURLCode || 'None';
        const applicationCommandCount = guild.commands.cache.size;
        const highestRole = guild.roles.highest.name;
        const inviteCount = await guild.invites.fetch().then(invites => invites.size);
        const standardEmojiCount = guild.emojis.cache.filter(emoji => !emoji.animated).size;
        const animatedEmojiCount = guild.emojis.cache.filter(emoji => emoji.animated).size;

        // Creating an embed for better presentation
        const serverInfoEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle(`Server Information for ${serverName}`)
            .setThumbnail(guild.iconURL({ dynamic: true }))
            .addFields(
                { name: 'Server ID', value: serverId, inline: true },
                { name: 'Owner', value: `${owner.user.tag}`, inline: true },
                { name: 'Created On', value: createdAt, inline: true },
                { name: 'Region', value: guild.preferredLocale || 'Default', inline: true },
                { name: 'Member Count', value: `${memberCount}`, inline: true },
                { name: 'Online Members', value: `${onlineMembers}`, inline: true },
                { name: 'Human Members', value: `${memberCount - guild.members.cache.filter(member => member.user.bot).size}`, inline: true },
                { name: 'Bot Count', value: `${guild.members.cache.filter(member => member.user.bot).size}`, inline: true },
                { name: 'Role Count', value: `${roleCount}`, inline: true },
                { name: 'Highest Role', value: `${highestRole}`, inline: true },
                { name: 'Channel Count', value: `${channelCount}`, inline: true },
                { name: 'Boost Count', value: `${boostCount}`, inline: true },
                { name: 'Boost Level', value: `${boostLevel}`, inline: true },
                { name: 'Max Members', value: `${maxMembers}`, inline: true },
                { name: 'Max Presences', value: `${maxPresences}`, inline: true },
                { name: 'Partnered', value: `${isPartnered}`, inline: true },
                { name: 'Community', value: `${isCommunity}`, inline: true },
                { name: 'Rules Channel', value: `${rulesChannel}`, inline: true },
                { name: 'System Channel', value: `${systemChannel}`, inline: true },
                { name: 'Default Notifications', value: `${defaultNotifications}`, inline: true },
                { name: 'NSFW Level', value: `${nsfwLevel}`, inline: true },
                { name: 'Vanity URL', value: `${vanityUrlCode}`, inline: true },
                { name: 'Application Commands', value: `${applicationCommandCount}`, inline: true },
                { name: 'Invite Count', value: `${inviteCount}`, inline: true },
                { name: 'Standard Emojis', value: `${standardEmojiCount}`, inline: true },
                { name: 'Animated Emojis', value: `${animatedEmojiCount}`, inline: true },
                { name: 'Server Features', value: `${features}`, inline: false }
            )
            .setTimestamp()
            .setFooter({ text: 'Server Info', iconURL: guild.iconURL({ dynamic: true }) });

        // Replying with the embed
        await interaction.reply({ embeds: [serverInfoEmbed], ephemeral: true });
    },
};
