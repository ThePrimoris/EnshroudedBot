const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('mmute')
        .setDescription('Mutes multiple users for a specified duration')
        .addStringOption(option =>
            option.setName('users')
                .setDescription('The users to mute, mentioned as @user1 @user2 etc.')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The duration of the mute (#d for days, #h for hours, #m for minutes)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('reason')
                .setDescription('The reason for the mute')
                .setRequired(false)), // Corrected here
    category: 'moderation',
    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
        }

        await interaction.deferReply({ ephemeral: false });
        const userMentions = interaction.options.getString('users');
        const durationString = interaction.options.getString('duration');
        const reason = interaction.options.getString('reason') || 'No reason provided';

        const duration = parseDuration(durationString);
        if (!duration) {
            return interaction.followUp({ content: "Invalid time format. Use #d for days, #h for hours, or #m for minutes.", ephemeral: true });
        }

        const muteRole = interaction.guild.roles.cache.find(role => role.name === 'Muted');
        if (!muteRole) {
            return interaction.followUp({ content: "Mute role not found. Please create a 'Muted' role.", ephemeral: true });
        }

        const userIds = userMentions.match(/<@!?(\d+)>/g)?.map(mention => mention.replace(/\D/g, ''));
        if (!userIds) {
            return interaction.followUp({ content: "No valid users mentioned.", ephemeral: true });
        }

        userIds.forEach(async (userId) => {
            try {
                const member = await interaction.guild.members.fetch(userId);
                await member.roles.add(muteRole, reason);
                await member.user.send(`You have been muted in ${interaction.guild.name} for ${durationString}. Reason: ${reason}`).catch(console.error);

                setTimeout(async () => {
                    try {
                        const freshMember = await interaction.guild.members.fetch(userId);
                        if (freshMember.roles.cache.has(muteRole.id)) {
                            await freshMember.roles.remove(muteRole, 'Mute duration expired');
                            await member.user.send(`You have been unmuted in ${interaction.guild.name}.`).catch(console.error);
                            interaction.followUp({ content: `${member.user.username} has been unmuted.`, ephemeral: false });
                        }
                    } catch (error) {
                        console.error('Failed to unmute:', error);
                    }
                }, duration);
            } catch (error) {
                console.error(`Failed to mute ${userId}:`, error);
            }
        });

        interaction.followUp({ content: `Muting users for ${durationString}.`, ephemeral: false });
    },
};

function parseDuration(time) {
    const regex = /^(\d+)([dhm])$/;
    const match = time.match(regex);
    if (!match) return null;

    const duration = parseInt(match[1], 10);
    const unit = match[2];
    switch (unit) {
        case 'd': return duration * 86_400_000; // days in milliseconds
        case 'h': return duration * 3_600_000;  // hours in milliseconds
        case 'm': return duration * 60_000;     // minutes in milliseconds
        default: return null;
    }
}