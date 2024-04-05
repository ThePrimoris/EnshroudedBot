require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const { UserInfraction, UserNote } = require('./database'); // Adjust this path as necessary

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();

// Dynamically load commands from the 'commands' folder
const commandFolders = ['general', 'moderation'];
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
    }
}

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}! Bot is online and ready!`);
});

client.on('interactionCreate', async interaction => {
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
        await interaction.deferReply({ ephemeral: true });

        if (interaction.customId.startsWith('view_infractions')) {
            const userId = interaction.customId.split('_')[2]; // Ensure this matches the customId structure you've set
            try {
                const infractions = await UserInfraction.findAll({
                    where: { userId: userId },
                });

                let responseText = infractions.length > 0 ? '**Infractions:**\n' : 'No infractions found for this user.';
                infractions.forEach((infraction, index) => {
                    const date = infraction.date ? new Date(infraction.date).toDateString() : 'Unknown date';
                    responseText += `Infraction #${index + 1}:\n- Reason: ${infraction.reason}\n- Date: ${date}\n\n`;
                });

                await interaction.followUp({ content: responseText, ephemeral: true });
            } catch (error) {
                console.error(`Error fetching infractions for user ID: ${userId}`, error);
                await interaction.followUp({ content: 'Failed to fetch infractions. Please try again later.', ephemeral: true });
            }
        } else if (interaction.customId.startsWith('view_notes')) {
            const userId = interaction.customId.split('_')[2]; // Adjust based on your customId structure
            try {
                const notes = await UserNote.findAll({
                    where: { userId: userId },
                });

                let responseText = notes.length > 0 ? '**Notes:**\n' : 'No notes found for this user.';
                notes.forEach((note, index) => {
                    const date = note.date ? new Date(note.date).toDateString() : 'Unknown date';
                    responseText += `Note #${index + 1}:\n- Content: ${note.note}\n- Created By: ${note.createdBy}\n- Date: ${date}\n\n`;
                });

                await interaction.followUp({ content: responseText, ephemeral: true });
            } catch (error) {
                console.error(`Error fetching notes for user ID: ${userId}`, error);
                await interaction.followUp({ content: 'Failed to fetch notes. Please try again later.', ephemeral: true });
            }
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);