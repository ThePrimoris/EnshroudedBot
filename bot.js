const envFile = `.env.${process.argv[2] || 'dev'}`;
require('dotenv').config({ path: envFile });
const fs = require('fs');
const path = require('path');
const config = require('./config.js');
const { Client, GatewayIntentBits, Collection, ActivityType, EmbedBuilder, Partials } = require('discord.js');

// Constants
const logChannelId = config.channels.logChannelId;
const RATE_LIMIT_COOLDOWN = 1 * 60 * 1000; // 1 minute cooldown for DMs
const COMMAND_FOLDERS = ['general', 'moderation', 'context'];
const ACTIVITIES = [
    { name: 'Enshrouded', type: ActivityType.Playing },
    { name: 'the Discord server 👀', type: ActivityType.Watching }
];

// Client initialization
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [Partials.Channel, Partials.Message]
});

client.commands = new Collection();
client.events = new Collection();
client.activeChannels = new Map();
client.cooldowns = new Map();
const rateLimit = new Map(); // Stores last message time for each user

// Load commands
for (const folder of COMMAND_FOLDERS) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        client.commands.set(command.data.name, command);
    }
}

// Load events
const eventFiles = fs.readdirSync(path.join(__dirname, 'events')).filter(file => file.endsWith('.js'));
for (const file of eventFiles) {
    const event = require(`./events/${file}`);
    if (event.once) {
        client.once(event.name, (...args) => event.execute(...args, client));
    } else {
        client.on(event.name, (...args) => event.execute(...args, client));
    }
}

// Set bot activity
client.once('ready', () => {
    console.log(`${client.user.tag} has been lit!`);
    let i = 0;
    client.user.setActivity(ACTIVITIES[i].name, { type: ACTIVITIES[i].type });

    setInterval(() => {
        i = (i + 1) % ACTIVITIES.length;
        client.user.setActivity(ACTIVITIES[i].name, { type: ACTIVITIES[i].type });
    }, 10 * 60 * 1000); // Change activity every 10 minutes
});

// Handle voice state updates
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

// Handle direct messages (DMs) with rate limiting
client.on('messageCreate', async (message) => {
    if (message.guild === null && !message.author.bot) { // Check if it's a DM and not from a bot
        const userId = message.author.id;
        const now = Date.now();

        if (rateLimit.has(userId)) {
            const lastMessageTime = rateLimit.get(userId);

            if (now - lastMessageTime < RATE_LIMIT_COOLDOWN) {
                // Notify the user that they are being rate-limited
                try {
                    await message.author.send('You are sending messages too quickly. Please wait a bit before sending another message.');
                } catch (error) {
                    console.error('Error sending rate limit notification: ', error);
                }
                return;
            }
        }

        // Update last message time
        rateLimit.set(userId, now);

        console.log(`Received DM from ${message.author.tag}: ${message.content}`);

        try {
            const logChannel = await client.channels.fetch(logChannelId);

            const dmEmbed = new EmbedBuilder()
                .setColor('#3498db')
                .setTitle('📩 New Direct Message')
                .setAuthor({ name: message.author.tag, iconURL: message.author.displayAvatarURL() })
                .setDescription(`**Message:**\n${message.content}`)
                .setTimestamp();

            await logChannel.send({ embeds: [dmEmbed] });

        } catch (error) {
            console.error('Error fetching the log channel or sending the message: ', error);
        }
    }
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
    console.log(`Logging out of ${client.user.tag}.. Shutting down.`);
    client.destroy(); // Perform any necessary cleanup
    process.exit(0);
});

// Login to Discord
client.login(process.env.DISCORD_BOT_TOKEN);
