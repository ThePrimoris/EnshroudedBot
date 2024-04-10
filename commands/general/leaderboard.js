const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { UserLevel } = require('../../database');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the server leaderboard.'),
    category: 'general',
    async execute(interaction) {
        async function fetchDisplayName(userId, guild) {
            try {
                const member = await guild.members.fetch(userId);
                return member.displayName;
            } catch {
                return 'Unknown Member'; // Return this if the user has left the server or cannot be fetched
            }
        }

        // Function to create the leaderboard embed and components based on the current page
        async function createLeaderboard(page) {
            const users = await UserLevel.findAll({ order: [['xp', 'DESC']] });
            const pageSize = 10; // Adjust the page size if needed
            const totalEntries = users.length;
            const totalPages = Math.ceil((totalEntries + 1) / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;

            let pageUsers = users.slice(startIndex, endIndex);
            const userIndex = users.findIndex(user => user.user_id === interaction.user.id);
            if (userIndex >= startIndex && userIndex < endIndex) {
                // If the invoking user is within the page range, no adjustment needed
            } else {
                // If not, replace the last user on the page with the invoking user
                pageUsers[pageSize - 1] = users[userIndex];
            }

            // Asynchronously fetch display names and generate leaderboard entries
            const leaderboardEntriesPromises = pageUsers.map(async (user, index) => {
                const rank = startIndex + index + 1;
                const displayName = await fetchDisplayName(user.user_id, interaction.guild);
                return `${rank}. ${displayName} - Level ${user.level}, ${user.xp} XP`;
            });
            const leaderboardEntries = await Promise.all(leaderboardEntriesPromises);

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.guild.name} Leaderboard - Page ${page} of ${totalPages}`)
                .setDescription(leaderboardEntries.join('\n'))
                .setFooter({ text: `Your Rank: #${userIndex + 1}` });

            const components = [
                new ActionRowBuilder().addComponents(
                    new ButtonBuilder()
                        .setCustomId(`leaderboard_prev_${page}`)
                        .setLabel('Previous')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page <= 1),
                    new ButtonBuilder()
                        .setCustomId(`leaderboard_next_${page}`)
                        .setLabel('Next')
                        .setStyle(ButtonStyle.Primary)
                        .setDisabled(page >= totalPages)
                )
            ];

            return { embeds: [embed], components, ephemeral: true };
        }

        const initialPage = 1;
        const response = await createLeaderboard(initialPage);
        await interaction.reply(response);

        const filter = i => i.user.id === interaction.user.id;
        collector.on('collect', async i => {
            // Acknowledge the button interaction immediately, indicating a deferred update
            // This is necessary for updating ephemeral messages
            await i.deferUpdate();
        
            // Extract the intended new page number from the button's custom ID
            const [, direction, currentPage] = i.customId.split('_');
            const newPage = direction === 'next' ? parseInt(currentPage, 10) + 1 : parseInt(currentPage, 10) - 1;
        
            // Generate the updated leaderboard for the new page
            const updatedLeaderboard = await createLeaderboard(newPage);
        
            // Edit the original interaction reply with the new leaderboard content
            // Since the message was originally sent as ephemeral, it remains ephemeral
            await i.editReply(updatedLeaderboard).catch(console.error);
        });
        
        
    },
};
