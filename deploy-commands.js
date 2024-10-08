require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_BOT_TOKEN;
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFolders = ['general', 'moderation', 'context'];

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        // Check if command.data is an array (for multiple command types) or a single instance
        if (Array.isArray(command.data)) {
            for (const data of command.data) {
                if (data && data.toJSON) {
                    commands.push(data.toJSON());
                } else {
                    console.error(`The command at './commands/${folder}/${file}' does not properly export a valid command instance.`);
                }
            }
        } else if (command.data && command.data.toJSON) {
            commands.push(command.data.toJSON());
        } else {
            console.error(`The command at './commands/${folder}/${file}' does not properly export a valid command instance.`);
        }
    }
}

const rest = new REST({ version: '9' }).setToken(token);

console.log(JSON.stringify(commands, null, 2)); // This will print the commands being registered in a readable format

rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
