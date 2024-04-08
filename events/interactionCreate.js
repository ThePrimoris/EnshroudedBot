const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, SelectMenuBuilder } = require('discord.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        // Command handling
        if (interaction.isCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }

            try {
                await command.execute(interaction, client);
            } catch (error) {
                console.error(`Error executing command: ${error}`);
                await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch(console.error);
            }
        } 
        // Select menu interaction handling
        else if (interaction.isSelectMenu()) {
            if (interaction.customId === 'selectCommand') {
                const selectedCommandName = interaction.values[0];
                const command = client.commands.get(selectedCommandName);

                if (!command) {
                    await interaction.reply({ content: `Sorry, I couldn't find a command named "${selectedCommandName}".`, ephemeral: true });
                    return;
                }

                const embed = new EmbedBuilder()
                    .setColor('#0099ff')
                    .setTitle(`Command: /${command.name}`)
                    .setDescription(command.description)
                    .addFields(
                        command.options.map(option => ({
                            name: option.name,
                            value: option.description,
                            inline: true
                        }))
                    );

                await interaction.update({ embeds: [embed], components: [] }).catch(console.error);
            }
        }
    },
};
