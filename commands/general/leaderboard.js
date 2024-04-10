const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { UserLevel } = require('../../database'); // Ensure this path matches your structure

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the server leaderboard.'),
        category: 'general',
    async execute(interaction) {
        // Function to create the leaderboard embed and components based on the current page
        async function createLeaderboard(page) {
            const users = await UserLevel.findAll({ order: [['xp', 'DESC']] });
            const pageSize = 10; // Display up to 10 users, including the invoking user
            const totalEntries = users.length;
            const totalPages = Math.ceil((totalEntries + 1) / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            
            // Ensure the invoking user is displayed
            const userIndex = users.findIndex(user => user.user_id === interaction.user.id);
            if (userIndex >= startIndex && userIndex < endIndex) {
                // If the invoking user is naturally within the page range, slice normally
                var pageUsers = users.slice(startIndex, endIndex);
            } else {
                // Otherwise, include the invoking user at the end of the slice
                var pageUsers = users.slice(startIndex, endIndex - 1);
                pageUsers.push(users[userIndex]);
            }

            // Map user data to leaderboard entries
            const leaderboardEntries = pageUsers.map((user, index) => {
                const rank = startIndex + index + 1;
                const displayName = interaction.guild.members.cache.get(user.user_id)?.displayName || 'Unknown Member';
                return `${rank}. ${displayName} - Level ${user.level}, ${user.xp} XP`;
            }).join('\n');
            
            const embed = new EmbedBuilder()
                .setTitle(`Server Leaderboard - Page ${page} of ${totalPages}`)
                .setDescription(leaderboardEntries)
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
                        .setDisabled(page >= totalPages || users.length <= pageSize)
                )
            ];

            return { embeds: [embed], components, ephemeral: true };
        }

        const initialPage = 1;
        const response = await createLeaderboard(initialPage);
        await interaction.reply(response);

        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            if (!['leaderboard_prev', 'leaderboard_next'].includes(i.customId.split('_')[0])) return;

            const currentPage = parseInt(i.customId.split('_')[2]);
            const newPage = i.customId.includes('next') ? currentPage + 1 : currentPage - 1;
            const newResponse = await createLeaderboard(newPage);

            await i.update(newResponse);
        });
    },
};
