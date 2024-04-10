const { UserLevel } = require('../database/index'); 

const xpGainCooldown = new Map();
const userCache = new Map();
const cooldownTime = 60000; // 60 seconds

// Function to check if a user can gain XP (based on cooldown)
function canGainXP(user_id) {
    const now = Date.now();
    const lastMessageTime = xpGainCooldown.get(user_id) || 0;
    return now - lastMessageTime >= cooldownTime;
}

// Function to update user XP and level, includes cooldown and cache logic
async function updateUserLevelData(user_id, xpGained, user_name) {
    let userData = userCache.get(user_id);

    if (!userData) {
        userData = await UserLevel.findOne({ where: { user_id } });
        if (!userData) {
            userData = await UserLevel.create({ user_id, user_name, xp: xpGained, level: 1 });
        }
        userCache.set(user_id, userData);
    }

    if (userData.user_name !== user_name) {
        userData.user_name = user_name;
        console.log(`Username updated for user ${user_id}: ${user_name}`);
    }

    if (canGainXP(user_id)) {
        userData.xp += xpGained;
        let nextLevelXp = 100 * (userData.level ** 1.5);

        while (userData.xp >= nextLevelXp) {
            userData.level += 1;
            userData.xp -= nextLevelXp;
            nextLevelXp = 100 * (userData.level ** 1.5);
        }

        await userData.save();
        xpGainCooldown.set(user_id, Date.now());
        userCache.set(user_id, userData);
    } else {
        console.log(`User ${user_id} is on cooldown.`);
    }
}

// Your messageCreate event handler
module.exports = {
    name: 'messageCreate',
    execute: async (message) => {
        if (message.author.bot) return;

        const xpGained = Math.floor(Math.random() * 10) + 15; // Example XP gain calculation
        await updateUserLevelData(message.author.id, xpGained, message.author.username);
    },
};
