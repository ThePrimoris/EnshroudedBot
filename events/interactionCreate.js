const { EmbedBuilder, PermissionsBitField, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const { UserWarning, UserNote, UserMute, UserBan } = require('../database/index');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;
            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing command: ${interaction.commandName}`, error);
                if (!interaction.replied) {
                    await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(console.error);
                }
            }
        } else if (interaction.isButton()) {
            const customIdParts = interaction.customId.split(':');
            const userId = customIdParts[1];
            const actionType = customIdParts[0]; // 'warn_user', 'ban_user', 'view_warnings', etc.

            if (actionType === 'warn_user' || actionType === 'view_warnings' || actionType === 'view_notes' || actionType === 'view_moderation') {
                // Check if the user has the ManageMessages permission
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
                    return interaction.reply({ content: 'You do not have permission to issue warnings.', ephemeral: true });
                }
            } else if (actionType === 'ban_user') {
                // Check if the user has the BanMembers permission
                if (!interaction.member.permissions.has(PermissionsBitField.Flags.BanMembers)) {
                    return interaction.reply({ content: 'You do not have permission to ban users.', ephemeral: true });
                }
            }

            switch (actionType) {
                case 'warn_user':
                case 'ban_user':
                    const modal = new ModalBuilder()
                        .setCustomId(`${actionType}_modal:${userId}`)
                        .setTitle(`Reason for ${actionType === 'warn_user' ? 'Warning' : 'Banning'} User`);

                    const reasonInput = new TextInputBuilder()
                        .setCustomId('reason')
                        .setLabel('Enter your reason')
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true);

                    const actionRow = new ActionRowBuilder().addComponents(reasonInput);
                    modal.addComponents(actionRow);

                    await interaction.showModal(modal);
                    break;

                case 'view_warnings':
                    try {
                        const warnings = await UserWarning.findAll({
                            where: { userId: userId },
                        });
                
                        const embed = new EmbedBuilder()
                            .setTitle('User Warnings')
                            .setColor('Red');
                
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
                
                        await interaction.reply({ embeds: [embed], ephemeral: false });
                    } catch (error) {
                        console.error(`Error fetching warnings for user ID: ${userId}`, error);
                        await interaction.reply({ content: 'Failed to fetch warnings. Please try again later.', ephemeral: true });
                    }
                    break;

                case 'view_notes':
                    try {
                        const notes = await UserNote.findAll({
                            where: { userId: userId },
                        });
                
                        const embed = new EmbedBuilder()
                            .setTitle('User Notes')
                            .setColor('Green');
                
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
                
                        await interaction.reply({ embeds: [embed], ephemeral: false });
                    } catch (error) {
                        console.error(`Error fetching notes for user ID: ${userId}`, error);
                        await interaction.reply({ content: 'Failed to fetch notes. Please try again later.', ephemeral: true });
                    }
                    break;

                case 'view_moderation':
                    try {
                        const warnings = await UserWarning.findAll({ where: { userId: userId } });
                        const notes = await UserNote.findAll({ where: { userId: userId } });
                        const mutes = await UserMute.findAll({ where: { userId: userId } });
                        const bans = await UserBan.findAll({ where: { userId: userId } });
                
                        const embed = new EmbedBuilder().setTitle('User Moderation Actions').setColor('Blurple');
                
                        warnings.forEach((warning, index) => {
                            embed.addFields({ 
                                name: `Warning #${index + 1}`, 
                                value: `Reason: ${warning.reason || 'No reason provided'}\nDate: ${warning.date}\nIssued by: ${warning.issuerName} (${warning.issuerId})`, 
                                inline: false 
                            });
                        });

                        notes.forEach((note, index) => {
                            embed.addFields({ 
                                name: `Note #${index + 1}`, 
                                value: `Note: ${note.note}\nDate: ${note.date}\nCreated by: ${note.issuerName} (${note.issuerId})`, 
                                inline: false 
                            });
                        });

                        mutes.forEach((mute, index) => {
                            embed.addFields({ 
                                name: `Mute #${index + 1}`, 
                                value: `Duration: ${mute.duration}\nReason: ${mute.reason || 'No reason provided'}\nDate: ${mute.date}\nIssued by: ${mute.issuerName} (${mute.issuerId})`, 
                                inline: false 
                            });
                        });

                        bans.forEach((ban, index) => {
                            embed.addFields({ 
                                name: `Ban #${index + 1}`, 
                                value: `Reason: ${ban.reason || 'No reason provided'}\nDate: ${ban.date}\nIssued by: ${ban.issuerName} (${ban.issuerId})`, 
                                inline: false 
                            });
                        });

                        if (warnings.length === 0 && notes.length === 0 && mutes.length === 0 && bans.length === 0) {
                            embed.setDescription('No moderation actions found for this user.');
                        }

                        await interaction.reply({ embeds: [embed], ephemeral: false });
                    } catch (error) {
                        console.error(`Error fetching moderation actions for user ID: ${userId}`, error);
                        await interaction.reply({ content: 'Failed to fetch moderation actions. Please try again later.', ephemeral: true });
                    }
                    break;
            }
        } else if (interaction.isModalSubmit()) {
            const customIdParts = interaction.customId.split(':');
            const actionType = customIdParts[0]; // This will now correctly be 'warn_user_modal' or 'ban_user_modal'
            const userId = customIdParts[1];
            
            console.log(`Modal submit detected for action type: ${actionType} and user ID: ${userId}`);
            
            try {
                const user = await client.users.fetch(userId);
                console.log(`User fetched successfully: ${user.username}`);
                
                const reason = interaction.fields.getTextInputValue('reason');
                const issuerId = interaction.user.id;
                const issuerName = interaction.user.username;
                console.log(`Data from modal: Reason: ${reason}, Issuer ID: ${issuerId}, Issuer Name: ${issuerName}`);
                
                if (actionType === 'warn_user_modal') {
                    await UserWarning.create({ userId, reason, issuerId, issuerName });
                    console.log(`Warning created in database for user ID: ${userId}`);
                    
                    await user.send(`You have been warned for: ${reason}`)
                        .then(() => console.log(`Warning DM sent to user ${user.username}`))
                        .catch(error => console.error(`Could not send DM to user ${userId}`, error));
                    
                    await interaction.reply({ content: `User <@${userId}> has been warned for: ${reason}`, ephemeral: false });
                    console.log(`Interaction replied successfully for warning.`);
                } else if (actionType === 'ban_user_modal') {
                    await user.send(`You are being banned for: ${reason}`)
                        .then(() => console.log(`Ban notification DM sent to user ${user.username}`))
                        .catch(error => console.error(`Could not send DM to user ${userId}`, error));
                    
                    await interaction.guild.members.ban(userId, { reason });
                    console.log(`User ${userId} banned successfully.`);
                    
                    await UserBan.create({ userId, reason, issuerId, issuerName });
                    console.log(`Ban recorded in database for user ID: ${userId}`);
                    
                    await interaction.reply({ content: `User <@${userId}> has been banned for: ${reason}`, ephemeral: false });
                    console.log(`Interaction replied successfully for ban.`);
                }
            } catch (error) {
                console.error(`Error processing ${actionType} action for user ID: ${userId}`, error);
                await interaction.reply({ content: `Failed to ${actionType === 'warn_user_modal' ? 'issue warning' : 'ban user'}. Please try again later.`, ephemeral: true });
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

                    const embed = new EmbedBuilder()
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
    },
};
