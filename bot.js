require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildVoiceStates // Add this intent for voice state updates
    ]
});

client.commands = new Collection();
client.events = new Collection();
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

// Centralized voiceStateUpdate listener for monitoring voice channels
const activeChannels = new Map(); // Store active channels and their metadata
const cooldowns = new Map();

client.on('voiceStateUpdate', (oldState, newState) => {
    const oldChannelId = oldState.channelId;

    if (oldChannelId && activeChannels.has(oldChannelId)) {
        const voiceChannel = oldState.guild.channels.cache.get(oldChannelId);
        if (voiceChannel) {
            setTimeout(() => {
                if (voiceChannel.members.size === 0) {
                    voiceChannel.delete()
                        .then(() => {
                            console.log(`Deleted empty voice channel: ${voiceChannel.name}`);
                            cooldowns.delete(activeChannels.get(oldChannelId).ownerId); // Remove cooldown
                            activeChannels.delete(oldChannelId); // Remove from active channels map
                        })
                        .catch(console.error);
                }
            }, 30000); // 30-second grace period after last user leaves
        }
    }
});

client.login(process.env.DISCORD_BOT_TOKEN);
