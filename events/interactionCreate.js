const { PermissionsBitField, EmbedBuilder } = require('discord.js');
const { UserWarning, UserNote, UserMute, UserBan } = require('../database/index'); 
const classes = ['survivor', 'beastmaster', 'ranger', 'assassin', 'battlemage', 'healer', 'wizard', 'trickster', 'athlete', 'barbarian', 'warrior', 'tank'];

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
            // Button interaction logic
            if (interaction.customId.startsWith('view_warnings')) {
                const userId = interaction.customId.split('_')[2];
                try {
                    const warnings = await UserWarning.findAll({
                        where: { userId: userId },
                    });
            
                    const embed = new EmbedBuilder()
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
            } else if (interaction.customId.startsWith('view_notes')) {
                const userId = interaction.customId.split('_')[2];
                try {
                    const notes = await UserNote.findAll({
                        where: { userId: userId },
                    });
            
                    const embed = new EmbedBuilder()
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
            } else if (interaction.customId.startsWith('view_moderation')) {
                const userId = interaction.customId.split('_')[2];
                try {
                    const warnings = await UserWarning.findAll({ where: { userId: userId } });
                    const notes = await UserNote.findAll({ where: { userId: userId } });
                    const mutes = await UserMute.findAll({ where: { userId: userId } });
                    const bans = await UserBan.findAll({ where: { userId: userId } });
            
                    const embed = new EmbedBuilder().setTitle('User Moderation Actions').setColor(0x3498db);
            
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
            }            
            
            else if (interaction.customId.startsWith('class_role_')) {
                const roleName = interaction.customId.replace('class_role_', '').replaceAll('_', ' ');
                const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);

                if (!role) {
                    await interaction.reply({ content: `The role "${roleName}" does not exist.`, ephemeral: true });
                    return;
                }

                try {
                    const memberRoles = interaction.member.roles.cache;
                    const classRoleIds = interaction.guild.roles.cache.filter(r => classes.includes(r.name.toLowerCase())).map(r => r.id);
                    const rolesToRemove = memberRoles.filter(r => classRoleIds.includes(r.id));

                    await interaction.member.roles.remove(rolesToRemove);
                    await interaction.member.roles.add(role);
                    await interaction.reply({ content: `You have been assigned to the ${roleName} class!`, ephemeral: true });
                } catch (error) {
                    console.error(error);
                    await interaction.reply({ content: "Failed to update your class role. Please contact an administrator.", ephemeral: true });
                }
            }
        } else if (interaction.isStringSelectMenu()) {
            if (interaction.customId === 'selectCommand') {
                await interaction.deferUpdate(); // Ensure immediate acknowledgement of the interaction
        
                const selectedCommandName = interaction.values[0];
                const command = client.commands.get(selectedCommandName);
                if (!command) {
                    await interaction.followUp({ content: `Sorry, I couldn't find a command named "${selectedCommandName}".`, ephemeral: true });
                    return;
                }
        
                // Check if the user has the required permissions for this command
                if (command.requiredPermissions) {
                    const missingPermissions = command.requiredPermissions.filter(perm => 
                        !interaction.member.permissions.has(PermissionsBitField.Flags[perm])
                    );
        
                    if (missingPermissions.length > 0) {
                        // Inform the user they lack necessary permissions
                        await interaction.followUp({ 
                            content: `You don't have permission to use this command. Missing: ${missingPermissions.join(', ')}`, 
                            ephemeral: true 
                        });
                        return;
                    }
                }
        
                try {
                    // Start with the command name
                    let usage = `/${command.data.name}`;
        
                    // Iterate over command options to build the usage instructions
                    command.data.options?.forEach(option => {
                        if (option.required) {
                            usage += ` <${option.name}>`; // Angle brackets for required options
                        } else {
                            usage += ` [${option.name}]`; // Square brackets for optional options
                        }
                    });
        
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`Command: /${command.data.name}`)
                        .setDescription(command.data.description)
                        .addFields({ name: 'Usage', value: usage }); // Display usage in the embed
        
                    await interaction.editReply({ embeds: [embed], components: [] });
                } catch (error) {
                    console.error(`Error handling select menu interaction: ${error}`);
                }
            }
        }        
    },
};
