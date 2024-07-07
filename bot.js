require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection, ActivityType } = require('discord.js');
// const commandHandler = require('./handlers/command-handler');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        //GatewayIntentBits.MessageContent,
    ]
});

client.commands = new Collection();
client.events = new Collection();

const commandFolders = ['prefix-commands', 'slash-commands']; // Updated folders

for (const folder of commandFolders) {
    const subfolders = ['general', 'moderation']; // Subfolders inside each command folder

    for (const subfolder of subfolders) {
        const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder, subfolder)).filter(file => file.endsWith('.js'));

        for (const file of commandFiles) {
            const command = require(`./commands/${folder}/${subfolder}/${file}`);
            client.commands.set(command.data.name, command);
        }
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

client.login(process.env.DISCORD_BOT_TOKEN);
