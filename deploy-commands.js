require('dotenv').config();
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = process.env.CLIENT_ID;
const token = process.env.DISCORD_BOT_TOKEN;
const fs = require('fs');
const path = require('path');

// Array to hold commands (both slash and context menu)
const commands = [];
const commandFolders = ['general', 'moderation'];

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        
        // Handle if command.data is an array (to handle multiple commands per file, if needed)
        if (Array.isArray(command.data)) {
            command.data.forEach((cmd) => {
                if (cmd && cmd.toJSON) {
                    commands.push(cmd.toJSON());
                } else {
                    console.error(`The command at './commands/${folder}/${file}' does not properly export a command instance.`);
                }
            });
        } else if (command.data && command.data.toJSON) {
            // Push to commands if it has a .toJSON() method (this works for both slash and context menu commands)
            commands.push(command.data.toJSON());
        } else {
            console.error(`The command at './commands/${folder}/${file}' does not properly export a command instance.`);
        }
    }
}

const rest = new REST({ version: '9' }).setToken(token);

console.log(JSON.stringify(commands, null, 2)); // Print commands being registered

rest.put(Routes.applicationCommands(clientId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
