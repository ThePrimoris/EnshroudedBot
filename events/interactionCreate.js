const { EmbedBuilder, PermissionsBitField, ActionRowBuilder, ButtonBuilder, ButtonStyle, MessageEmbed } = require('discord.js');
const { UserWarning, UserNote, UserMute, UserBan, UserLevel } = require('../database/index'); 

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (!interaction.isCommand() && !interaction.isButton() && !interaction.isStringSelectMenu()) return;

        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            try {
                await command.execute(interaction);
            } catch (error) {
                console.error(`Error executing command: ${interaction.commandName}`, error);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(console.error);
                }
            }
        } else if (interaction.isButton()) {
            const customIdParts = interaction.customId.split('_');

            if (customIdParts[0] === 'view_warnings') {
                const userId = customIdParts[2];
                try {
                    const warnings = await UserWarning.findAll({
                        where: { userId: userId },
                    });
            
                    const embed = new MessageEmbed()
                        .setTitle('User Warnings')
                        .setColor(0xff0000);
            
                    if (warnings.length > 0) {
                        warnings.forEach((warning, index) => {
                            const date = warning.date ? new Date(warning.date).toLocaleDateString() : 'Unknown date';
                            embed.addFields({ 
                                name: `Warning #${index + 1}`, 
                                value: `Reason: ${warning.reason}\nDate: ${date}\nIssued by: ${warning.issuerName} (${warning.issuerId})`, 
                                inline: false 
                            });
                        });
                    } else {
                        embed.setDescription('No warnings found for this user.');
                    }
            
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error(`Error fetching warnings for user ID: ${userId}`, error);
                    await interaction.reply({ content: 'Failed to fetch warnings. Please try again later.', ephemeral: true });
                }
            } else if (customIdParts[0] === 'view_notes') {
                const userId = customIdParts[2];
                try {
                    const notes = await UserNote.findAll({
                        where: { userId: userId },
                    });
            
                    const embed = new MessageEmbed()
                        .setTitle('User Notes')
                        .setColor(0x00ff00);
            
                    if (notes.length > 0) {
                        notes.forEach((note, index) => {
                            const date = note.date ? new Date(note.date).toLocaleDateString() : 'Unknown date';
                            embed.addFields({ 
                                name: `Note #${index + 1}`, 
                                value: `Content: ${note.note}\nDate: ${date}\nCreated by: ${note.createdBy} (${note.issuerId})`, 
                                inline: false 
                            });
                        });
                    } else {
                        embed.setDescription('No notes found for this user.');
                    }
            
                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error(`Error fetching notes for user ID: ${userId}`, error);
                    await interaction.reply({ content: 'Failed to fetch notes. Please try again later.', ephemeral: true });
                }
            } else if (customIdParts[0] === 'view_moderation') {
                const userId = customIdParts[2];
                try {
                    const warnings = await UserWarning.findAll({ where: { userId: userId } });
                    const notes = await UserNote.findAll({ where: { userId: userId } });
                    const mutes = await UserMute.findAll({ where: { userId: userId } });
                    const bans = await UserBan.findAll({ where: { userId: userId } });
            
                    const embed = new MessageEmbed().setTitle('User Moderation Actions').setColor(0x3498db);
            
                   // Iterate over warnings and add each to the embed
                    warnings.forEach((warning, index) => {
                        embed.addFields({ 
                            name: `Warning #${index + 1}`, 
                            value: `Reason: ${warning.reason || 'No reason provided'}\nDate: ${warning.date}\nIssued by: ${warning.issuerName} (${warning.issuerId})`, 
                            inline: false 
                        });
                    });

                    // Iterate over notes and add each to the embed
                    notes.forEach((note, index) => {
                        embed.addFields({ 
                            name: `Note #${index + 1}`, 
                            value: `Note: ${note.note}\nDate: ${note.date}\nCreated by: ${note.issuerName} (${note.issuerId})`, 
                            inline: false 
                        });
                    });

                    // Iterate over mutes and add each to the embed
                    mutes.forEach((mute, index) => {
                        embed.addFields({ 
                            name: `Mute #${index + 1}`, 
                            value: `Duration: ${mute.duration}\nReason: ${mute.reason || 'No reason provided'}\nDate: ${mute.date}\nIssued by: ${mute.issuerName} (${mute.issuerId})`, 
                            inline: false 
                        });
                    });

                    // Iterate over bans and add each to the embed
                    bans.forEach((ban, index) => {
                        embed.addFields({ 
                            name: `Ban #${index + 1}`, 
                            value: `Reason: ${ban.reason || 'No reason provided'}\nDate: ${ban.date}\nIssued by: ${ban.issuerName} (${ban.issuerId})`, 
                            inline: false 
                        });
                    });

                    // If no actions found, add a description saying so
                    if (warnings.length === 0 && notes.length === 0 && mutes.length === 0 && bans.length === 0) {
                        embed.setDescription('No moderation actions found for this user.');
                    }

                    await interaction.reply({ embeds: [embed] }); // Do not set ephemeral to make it visible to everyone
                } catch (error) {
                    console.error(`Error fetching moderation actions for user ID: ${userId}`, error);
                    await interaction.reply({ content: 'Failed to fetch moderation actions. Please try again later.' }); // Not ephemeral
                }
            } else if (customIdParts[0] === 'leaderboard') {
                // This section handles the leaderboard pagination logic.
                const action = customIdParts[1]; // 'next' or 'prev'
                const currentPage = parseInt(customIdParts[2], 10);
                const newPage = action === 'next' ? currentPage + 1 : currentPage - 1;
            
                try {
                    const leaderboardResponse = await generateLeaderboardPage(newPage, interaction.user.id);
                    // Directly use interaction.update() for pagination without checking interaction.deferred or interaction.replied
                    await interaction.update({
                        embeds: [leaderboardResponse.embed],
                        components: leaderboardResponse.components
                    });
                } catch (error) {
                    console.error('Failed to update leaderboard:', error);
                    // The catch block is for handling exceptions from generateLeaderboardPage or interaction.update
                    // Consider handling unexpected errors that don't relate directly to interaction updates.
                    // interaction.followUp could be used if additional user feedback is necessary post-error.
                }
            }
            
            
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'selectCommand') {
                await interaction.deferUpdate();

                const selectedCommandName = interaction.values[0];
                const command = client.commands.get(selectedCommandName);
                if (!command) {
                    await interaction.followUp({ content: `Sorry, I couldn't find a command named "${selectedCommandName}".`, ephemeral: true });
                    return;
                }

                if (command.requiredPermissions) {
                    const missingPermissions = command.requiredPermissions.filter(perm => 
                        !interaction.member.permissions.has(PermissionsBitField.Flags[perm])
                    );

                    if (missingPermissions.length > 0) {
                        await interaction.followUp({ 
                            content: `You don't have permission to use this command. Missing: ${missingPermissions.join(', ')}`, 
                            ephemeral: true 
                        });
                        return;
                    }
                }

                try {
                    let usage = `/${command.data.name}`;

                    command.data.options?.forEach(option => {
                        if (option.required) {
                            usage += ` <${option.name}>`;
                        } else {
                            usage += ` [${option.name}]`;
                        }
                    });

                    const embed = new MessageEmbed()
                        .setColor('#0099ff')
                        .setTitle(`Command: /${command.data.name}`)
                        .setDescription(command.data.description)
                        .addFields({ name: 'Usage', value: usage });

                    await interaction.editReply({ embeds: [embed], components: [] });
                } catch (error) {
                    console.error(`Error handling select menu interaction: ${error}`);
                }
            }
        }
         // Function to generate the leaderboard page embed and components
        async function generateLeaderboardPage(page, userId) {
            // Fetch all users sorted by XP in descending order
            const users = await UserLevel.findAll({ order: [['xp', 'DESC']] });
            const pageSize = 10; // Including the invoking user, adjust as necessary
            const totalEntries = users.length;
            const totalPages = Math.ceil(totalEntries / pageSize);
            const startIndex = (page - 1) * pageSize;
            const endIndex = startIndex + pageSize;
            
            // Construct the leaderboard entries, making sure the invoking user is included
            let leaderboardEntries = users.slice(startIndex, endIndex).map((user, index) => {
                const rank = startIndex + index + 1;
                const userTag = interaction.guild.members.cache.get(user.user_id)?.user.tag || 'Unknown User';
                return `${rank}. ${userTag} - Level ${user.level}, ${user.xp} XP`;
            }).join('\n');

            // Embed for the leaderboard page
            const embed = new EmbedBuilder()
                .setTitle(`Server Leaderboard - Page ${page}`)
                .setDescription(leaderboardEntries)
                .setFooter({ text: `Page ${page} of ${totalPages}` });

            // Buttons for pagination
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

            return { embed, components };
        }
    },
};
