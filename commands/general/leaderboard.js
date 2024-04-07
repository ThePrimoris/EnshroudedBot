const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder } = require('discord.js');
const { UserLevel } = require('../../database/index'); // Ensure this path is correct

module.exports = {
    data: new SlashCommandBuilder()
        .setName('leaderboard')
        .setDescription('Displays the XP leaderboard.'),
    async execute(interaction) {
        const userData = await UserLevel.findAll({
            order: [['xp', 'DESC']],
        });

        // Find the invoking user's data
        const userRankData = userData.findIndex(user => user.user_id === interaction.user.id) + 1;
        const userXPData = userData.find(user => user.user_id === interaction.user.id);

        const totalPages = Math.ceil(userData.length / 10);
        let currentPage = 1;

        const generateEmbed = async (page) => {
            const startIndex = (page - 1) * 10;
            const endIndex = startIndex + 10;
            const pageUsers = userData.slice(startIndex, endIndex);

            const header = '**Rank | Name                         | Level | XP**';
            const leaderboardRows = await generateLeaderboardRows(pageUsers, startIndex);
            const invokingUserRow = await generateInvokingUserRow(interaction.user.id, userRankData, userXPData);

            const embed = new EmbedBuilder()
                .setTitle('XP Leaderboard')
                .setDescription(`${header}\n${leaderboardRows}\n${invokingUserRow}`)
                .setFooter({ text: `Page ${page} of ${totalPages}` });

            return embed;
        };

        const generateLeaderboardRows = async (pageUsers, startIndex) => {
            return Promise.all(pageUsers.map(async (user, index) => {
                const rank = startIndex + index + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank.toString().padEnd(2, ' ');
                const rankText = medal.padEnd(4, ' ');
                
                const member = await interaction.guild.members.fetch(user.user_id).catch(() => 'Unknown User');
                const name = member !== 'Unknown User' ? member.user.username : 'Unknown User';
                const trimmedName = name.padEnd(25, ' '); // Allowing more space for names
                const level = user.level.toString().padStart(5, ' ');
                const xp = user.xp.toString().padStart(4, ' ');

                return `\`${rankText}\`| ${trimmedName} | ${level} | ${xp}`;
            })).then(rows => rows.join('\n'));
        };

        const generateInvokingUserRow = async (userId, userRank, userXPData) => {
            if (!userXPData) return ''; // User not found in the leaderboard
            const name = interaction.user.username.padEnd(25, ' ');
            const level = userXPData.level.toString().padStart(5, ' ');
            const xp = userXPData.xp.toString().padStart(4, ' ');
            return `\nYour Rank: \`${userRank}\` | ${name} | ${level} | ${xp}`;
        };

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('previous_page')
                    .setLabel('Previous')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === 1),
                new ButtonBuilder()
                    .setCustomId('next_page')
                    .setLabel('Next')
                    .setStyle(ButtonStyle.Primary)
                    .setDisabled(currentPage === totalPages)
            );

        await interaction.reply({ embeds: [await generateEmbed(currentPage)], components: [row], ephemeral: true });

        const filter = (i) => i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, time: 120000 });

        collector.on('collect', async (i) => {
            if (i.customId === 'previous_page' && currentPage > 1) {
                currentPage--;
            } else if (i.customId === 'next_page' && currentPage < totalPages) {
                currentPage++;
            }

            await i.update({ embeds: [await generateEmbed(currentPage)], components: [row] });
        });
    },
};
