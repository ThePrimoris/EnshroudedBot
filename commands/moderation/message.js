const { SlashCommandBuilder, PermissionsBitField, ChannelType, EmbedBuilder } = require('discord.js');
const config = require('../../config.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('message')
    .setDescription('Send a message to a specified channel or DM a user')
    .setDefaultMemberPermissions(PermissionsBitField.Flags.ManageMessages)
    // Required option first
    .addStringOption(option =>
      option.setName('message')
        .setDescription('The message to send')
        .setRequired(true))
    // Optional options follow
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('The channel to send the message to')
        .addChannelTypes(ChannelType.GuildText)) // Optional
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The user to DM (leave empty to send to a channel)')), // Optional
  requiredPermissions: ['ManageMessages'],
  category: 'utility',
  async execute(interaction) {
    if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
      return interaction.reply({ content: "You don't have permission to use this command.", ephemeral: true });
    }

    const targetChannel = interaction.options.getChannel('channel');
    const targetUser = interaction.options.getUser('user');
    const message = interaction.options.getString('message');
    const user = interaction.user;
    const logChannelId = config.channels.logChannelId;

    try {
      let targetDescription = '';

      // Defer reply to give more time for async tasks
      await interaction.deferReply({ ephemeral: true });

      // If a channel is specified
      if (targetChannel) {
        await targetChannel.send(message);
        targetDescription = `Message sent to ${targetChannel}:\n**Message:**\n${message}`;
      }

      // If a user is specified (and a channel was not specified)
      if (targetUser) {
        await targetUser.send(message);
        targetDescription = `DM sent to ${targetUser.tag}:\n**Message:**\n${message}`;
      }

      // Ensure the log channel exists and targetDescription is not empty
      if (logChannelId && targetDescription) {
        const replyChannel = await interaction.client.channels.fetch(logChannelId);
        if (replyChannel) {
          const logEmbed = new EmbedBuilder()
            .setColor('#3498db')
            .setTitle('📨 Message')
            .setAuthor({ name: user.tag, iconURL: user.displayAvatarURL() })
            .setDescription(targetDescription)
            .setTimestamp();

          await replyChannel.send({ embeds: [logEmbed] });
        } else {
          console.error(`Log channel with ID ${logChannelId} not found.`);
        }
      } else {
        console.error('No valid logChannelId or no message to log.');
      }

      // Final reply to the interaction
      if (!targetChannel && !targetUser) {
        await interaction.editReply({ content: 'You must specify either a channel or a user to message.' });
      } else {
        await interaction.editReply({ content: 'Message sent successfully.' });
      }

    } catch (error) {
      console.error('Error executing message command:', error);
      await interaction.editReply({ content: 'Failed to send the message. Please make sure I have the right permissions and try again.' });
    }
  },
};
