require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
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
    i = (i + 1) % activities.length; // Increase i and loop back to 0 when it exceeds the length of the activities array
    client.user.setActivity(activities[i].name, { type: activities[i].type });
}, 10 * 60 * 1000); // 10 minutes in milliseconds
});

client.login(process.env.DISCORD_BOT_TOKEN);
