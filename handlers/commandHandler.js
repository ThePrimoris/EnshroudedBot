// commandHandler.js

const { Permissions } = require('discord.js');
const { prefix } = require('./config.json'); // Adjust this to your config file or directly use your prefix
const fs = require('fs');
const path = require('path');

module.exports = (client) => {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(path.join(__dirname, 'commands', file));

        // Assuming commands are structured with an 'execute' function
        client.commands.set(command.data.name, command);
    }

    client.on('messageCreate', async message => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();

        const command = client.commands.get(commandName)
            || client.commands.find(cmd => cmd.data.aliases && cmd.data.aliases.includes(commandName));

        if (!command) return;

        try {
            await command.execute(message, args);
        } catch (error) {
            console.error(error);
            message.reply({ content: 'There was an error executing that command.' });
        }
    });
};
