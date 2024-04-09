require('dotenv').config();

const { REST } = require('@discordjs/rest');
const { Routes } = require('discord-api-types/v9');
const clientId = process.env.CLIENT_ID;
const guildId = process.env.GUILD_ID;
const token = process.env.DISCORD_BOT_TOKEN;
const fs = require('fs');
const path = require('path');

const commands = [];
const commandFolders = ['general', 'moderation'];

for (const folder of commandFolders) {
    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands', folder)).filter(file => file.endsWith('.js'));
    for (const file of commandFiles) {
        const command = require(`./commands/${folder}/${file}`);
        // Check if the command.data is an instance of SlashCommandBuilder
        if (command.data && command.data.toJSON) {
            commands.push(command.data.toJSON());
        } else {
            console.error(`The command at './commands/${folder}/${file}' does not properly export a SlashCommandBuilder instance.`);
        }
    }
}

const rest = new REST({ version: '9' }).setToken(token);

rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands })
  .then(() => console.log('Successfully registered application commands.'))
  .catch(console.error);
