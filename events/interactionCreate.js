const { EmbedBuilder } = require('discord.js');
const { UserInfraction, UserNote } = require('../database/index'); // Update the import paths as necessary.
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
            if (interaction.customId.startsWith('view_infractions')) {
                const userId = interaction.customId.split('_')[2];
                try {
                    const infractions = await UserInfraction.findAll({
                        where: { userId: userId },
                    });

                    const embed = new EmbedBuilder()
                        .setTitle('User Infractions')
                        .setColor(0xff0000);

                    if (infractions.length > 0) {
                        infractions.forEach((infraction, index) => {
                            const date = infraction.date ? new Date(infraction.date).toLocaleDateString() : 'Unknown date';
                            embed.addFields({ name: `Infraction #${index + 1}`, value: `Reason: ${infraction.reason}\nDate: ${date}\nIssued by: ${infraction.issuerName}`, inline: false });
                        });
                    } else {
                        embed.setDescription('No infractions found for this user.');
                    }

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error(`Error fetching infractions for user ID: ${userId}`, error);
                    await interaction.reply({ content: 'Failed to fetch infractions. Please try again later.', ephemeral: true });
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
                            embed.addFields({ name: `Note #${index + 1}`, value: `Content: ${note.note}\nDate: ${date}\nCreated by: ${note.createdBy}`, inline: false });
                        });
                    } else {
                        embed.setDescription('No notes found for this user.');
                    }

                    await interaction.reply({ embeds: [embed], ephemeral: true });
                } catch (error) {
                    console.error(`Error fetching notes for user ID: ${userId}`, error);
                    await interaction.reply({ content: 'Failed to fetch notes. Please try again later.', ephemeral: true });
                }
            } else if (interaction.customId.startsWith('class_role_')) {
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
            // String select menu interaction logic
            if (interaction.customId === 'selectCommand') {
                await interaction.deferUpdate(); // Ensure immediate acknowledgement of the interaction

                const selectedCommandName = interaction.values[0];
                const command = client.commands.get(selectedCommandName);
                if (!command) {
                    await interaction.followUp({ content: `Sorry, I couldn't find a command named "${selectedCommandName}".`, ephemeral: true });
                    return;
                }

                try {
                    const embed = new EmbedBuilder()
                        .setColor('#0099ff')
                        .setTitle(`Command: /${command.data.name}`)
                        .setDescription(command.data.description);
                    // If your command includes options or additional details, add them to the embed here

                    await interaction.editReply({ embeds: [embed], components: [] });
                } catch (error) {
                    console.error(`Error handling select menu interaction: ${error}`);
                }
            }
        }
    },
};
