require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates, // Ensure this intent is included for voiceStateUpdate events
        GatewayIntentBits.DirectMessages, // Added for DM handling
        GatewayIntentBits.MessageContent // Added for content access in messages
    ],
    partials: ['CHANNEL'] // Allows the bot to access DMs
});

client.commands = new Collection();
client.events = new Collection();
client.activeChannels = new Map(); // Initialize activeChannels map globally
client.cooldowns = new Map(); // Initialize cooldowns map globally

const commandFolders = ['general', 'moderation'];
for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
    }
}

const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

const activities = [
    { name: 'Enshrouded', type: ActivityType.Playing },
    { name: 'the Discord server 👀', type: ActivityType.Watching }
];

client.once('ready', () => {
    console.log(`Logged in as ${client.user.tag}! Bot is online and ready!`);
    let i = 0;
    client.user.setActivity(activities[i].name, { type: activities[i].type });

    setInterval(() => {
        i = (i + 1) % activities.length;
        client.user.setActivity(activities[i].name, { type: activities[i].type });
    }, 10 * 60 * 1000);
});

// Listen for voice state updates globally
client.on('voiceStateUpdate', (oldState, newState) => {
    const oldChannelId = oldState.channelId;

    if (oldChannelId && client.activeChannels.has(oldChannelId)) {
        const voiceChannel = oldState.guild.channels.cache.get(oldChannelId);
        if (voiceChannel) {
            setTimeout(() => {
                if (voiceChannel.members.size === 0) {
                    voiceChannel.delete()
                        .then(() => {
                            console.log(`Deleted empty voice channel: ${voiceChannel.name}`);
                            const channelData = client.activeChannels.get(oldChannelId);
                            if (channelData) {
                                client.cooldowns.delete(channelData.ownerId); // Remove cooldown
                            }
                            client.activeChannels.delete(oldChannelId); // Remove from active channels map
                        })
                        .catch(console.error);
                }
            }, 30000); // 30-second grace period after last user leaves
        }
    }
});

// Listen for DMs and log them to a specified channel
client.on('messageCreate', async (message) => {
    if (message.guild === null && !message.author.bot) {
        const logChannelId = '1226803373328695306'; // Replace with your channel ID
        try {
            const logChannel = await client.channels.fetch(logChannelId);

            // Create an embed to format the log message
            const dmEmbed = new EmbedBuilder()
                .setColor('#0099ff')
                .setTitle('The Flame DM Log')
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription(message.content)
                .setTimestamp()
                .setFooter({ text: 'DM Log' });

            if (logChannel.isTextBased()) {
                logChannel.send({ embeds: [dmEmbed] });
            }

        } catch (error) {
            console.error('Error fetching the log channel: ', error);
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
