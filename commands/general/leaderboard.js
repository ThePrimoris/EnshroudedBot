const { SlashCommandBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { UserLevel } = require('../../database'); // Ensure this path matches your actual database file

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the server leaderboard.'),
    async execute(interaction) {
        // Helper function to fetch a user's display name
        async function fetchDisplayName(userId, guild) {
            try {
                const member = await guild.members.fetch(userId);
                return member.displayName || member.user.username; // Fallback to username if displayName is null
            } catch {
                return 'Unknown Member'; // Return this if the user has left the server or cannot be fetched
            }
        }

        // Function to create the leaderboard embed and components based on the current page
        async function createLeaderboard(page) {
            const users = await UserLevel.findAll({ order: [['xp', 'DESC']] });
            const pageSize = 10; // Adjust the page size if needed
            const totalEntries = users.length;
            const totalPages = Math.ceil(totalEntries / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = Math.min(startIndex + pageSize, totalEntries);

            let leaderboardEntries = await Promise.all(users.slice(startIndex, endIndex).map(async (user, index) => {
                const rank = startIndex + index + 1;
                const displayName = await fetchDisplayName(user.user_id, interaction.guild);
                return `${rank}. ${displayName} - Level ${user.level}, ${user.xp} XP`;
            }));

            const embed = new EmbedBuilder()
                .setTitle(`${interaction.guild.name} Leaderboard - Page ${page} of ${totalPages}`)
                .setDescription(leaderboardEntries.join('\n'))
                .setFooter({ text: `Page ${page} of ${totalPages}` });

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

            return { embeds: [embed], components };
        }

        // Display the initial leaderboard page
        const initialPage = 1;
        const response = await createLeaderboard(initialPage);
        await interaction.reply({ ...response, ephemeral: false });

        // Set up a collector to handle button interactions for pagination
        const filter = i => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async i => {
            await i.deferUpdate();

            const [, direction, currentPage] = i.customId.split('_');
            const newPage = direction === 'next' ? parseInt(currentPage, 10) + 1 : parseInt(currentPage, 10) - 1;
            const updatedLeaderboard = await createLeaderboard(newPage);

            await i.editReply({ ...updatedLeaderboard, ephemeral: false }).catch(console.error);
        });
    },
};
