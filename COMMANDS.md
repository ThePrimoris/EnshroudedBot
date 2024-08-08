<h1 align="center">
  <br>
  <img  src="https://enshrouded.wiki.gg/images/8/8d/The_Flame.png" width="200px" height="200px" alt=The Flame>
  <br>
  The Flame
  <br>
</h1>

<h3 align=center>A versatile Discord bot for the Official Enshrouded Discord</h3>

<div align=center>

 [![Discord](https://img.shields.io/discord/658113349384667198.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/Enshrouded)

</div>

<p align="center">
  <a href="#question-about">About</a>
  •
  <a href="#exclamation-features">Features</a>
  •
  <a href="https://github.com/ThePrimoris/EnshroudedBot/blob/master/docs/COMMANDS.md">Commands</a>
</p>

# The Flame Bot Commands

## General Commands

| Command              | Description                                              | Usage                          |
|----------------------|----------------------------------------------------------|--------------------------------|
| `/help`              | Lists all available Slash commands.                     | `/help`                         |
| `/create-lobby`      | Creates a temporary voice channel with a specified number of users. | `/create-lobby <# of users>`    |
| `/faq`               | Lists available embeds for users to use.                 | `/faq <embed>`                  |

## Moderation Commands

| Command              | Description                                              | Usage                          |
|----------------------|----------------------------------------------------------|--------------------------------|
| `/mute`              | Mutes a specified user for a specified duration.        | `/mute @user 10m`              |
| `/mmute`             | Mutes multiple users for a specified duration.           | `/mmute @user1 @user2 10m`     |
| `/unmute`            | Unmutes a specified user.                                | `/unmute @user`                |
| `/munmute`           | Unmutes multiple users.                                  | `/munmute @user1 @user2`       |
| `/ban`               | Bans a specified user with a reason.                     | `/ban @user spamming`          |
| `/tempban`           | Temporarily bans a user for a specified duration.        | `/tempban @user 1d`            |
| `/forceban`          | Bans a user by user ID, even if they are not in the server. | `/forceban userID`            |
| `/mban`              | Bans multiple users by their user ID, with a reason.     | `/mban userID1 userID2 spamming` |
| `/unban`             | Unbans a specified user.                                | `/unban @user`                 |
| `/munban`            | Unbans multiple users.                                  | `/munban @user1 @user2`        |
| `/info`              | Provides information about a selected user.             | `/info @user`                  |
| `/warn`              | Warns a specified user with a reason and DMs the user.   | `/warn @user spamming`         |
| `/note`              | Adds a note on a specified user. Does not DM them.       | `/note @user needs improvement` |
| `/message`           | Sends a message with the bot to a specified channel.     | `/message #general Hello everyone!` |
| `/slowmode`          | Changes slowmode duration in a specified channel.        | `/slowmode #general 10s`       |
| `/purge`             | Deletes specified messages or messages from a specified user in a channel. | `/purge 10` or `/purge @user` |
| `/kick`              | Kicks a user from the server.                            | `/kick @user`                  |
