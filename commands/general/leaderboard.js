const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { UserLevel } = require('../../database/index');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the XP leaderboard.'),
    category: 'general',
    async execute(interaction) {
        const userData = await UserLevel.findAll({
            order: [['xp', 'DESC']],
        });

        const totalPages = Math.ceil(userData.length / 10);
        let currentPage = 1;

        const generateEmbed = async (page) => {
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            const pageUsers = userData.slice(startIndex, endIndex);
        
            // Fetch user information from Discord for each user_id in pageUsers
            const leaderboardRowsPromises = pageUsers.map(async (user, index) => {
                const rank = startIndex + index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : '';
                const rankText = `${medal}${rank}`.padEnd(5, ' ');
        
                // Fetch the user from Discord using their ID
                const discordUser = await interaction.client.users.fetch(user.user_id).catch(console.error);
                const userName = discordUser ? discordUser.username : 'Unknown User';
                const trimmedName = (userName.length > 18 ? userName.substring(0, 15) + '...' : userName).padEnd(18, ' ');
                const level = `Lv. ${user.level}`;
                const xp = `${user.xp} XP`;
        
                return `\`${rankText}\` | ${trimmedName} | ${level} | ${xp}`;
            });
        
            // Resolve all promises from the map
            const leaderboardRows = await Promise.all(leaderboardRowsPromises).then(rows => rows.join('\n'));
        
            return new EmbedBuilder()
                .setTitle(`${interaction.guild.name} Leaderboard`)
                .setDescription(leaderboardRows)
                .setFooter({ text: `Page ${page} of ${totalPages}` })
                .setThumbnail(interaction.guild.iconURL());
        };
        

        const updateComponents = (page, totalPages) => new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous_page')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === 1),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(page === totalPages)
            );

        await interaction.reply({
            embeds: [await generateEmbed(currentPage)],
            components: [updateComponents(currentPage, totalPages)],
            ephemeral: true
        });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'previous_page' && currentPage > 1) {
                currentPage--;
            } else if (i.customId === 'next_page' && currentPage < totalPages) {
                currentPage++;
            }

            await i.update({
                embeds: [await generateEmbed(currentPage)],
                components: [updateComponents(currentPage, totalPages)]
            });
        });
    },
};
