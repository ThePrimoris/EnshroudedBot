require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, EmbedBuilder } = require('discord.js');
const { UserInfraction, UserNote, UserLevel, addXP } = require('./database/index'); // Adjust this path as necessary

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();
const classes = ['survivor', 'beastmaster', 'ranger', 'assassin', 'battlemage', 'healer', 'wizard', 'trickster', 'athlete', 'barbarian', 'warrior', 'tank'];

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
    if (!interaction.isCommand() && !interaction.isButton()) return;

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
        // Button interaction handling for Infractions
        if (interaction.customId.startsWith('view_infractions')) {
            const userId = interaction.customId.split('_')[2];
            try {
                const infractions = await UserInfraction.findAll({
                    where: { userId: userId },
                });

                const embed = new EmbedBuilder()
                    .setTitle('User Infractions')
                    .setColor(0xff0000); // Red color for infractions

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
        }
        // Button interaction handling for Notes
        else if (interaction.customId.startsWith('view_notes')) {
            const userId = interaction.customId.split('_')[2];
            try {
                const notes = await UserNote.findAll({
                    where: { userId: userId },
                });

                const embed = new EmbedBuilder()
                    .setTitle('User Notes')
                    .setColor(0x00ff00); // Green color for notes

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
        }
        // Handling class role assignments
        else if (interaction.customId.startsWith('class_role_')) {
            const roleName = interaction.customId.replace('class_role_', '').replaceAll('_', ' ');
            const role = interaction.guild.roles.cache.find(r => r.name.toLowerCase() === roleName);

            if (!role) {
                await interaction.reply({ content: `The role "${roleName}" does not exist.`, ephemeral: true });
                return;
            }

            try {
                // Remove other class roles first
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
    }
});

client.on('messageCreate', async message => {
    if (message.author.bot) return;

    const xpToAdd = 10; // Adjust as needed
    addXP(message.author.id, xpToAdd)
        .then(() => {
            console.log(`Added ${xpToAdd} XP to user ${message.author.id}`);
        })
        .catch(error => {
            console.error('Failed to add XP:', error);
        });
});

client.login(process.env.DISCORD_BOT_TOKEN);
