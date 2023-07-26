const { Client, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({ intents: [
    'Guilds', 'GuildMessages', 'MessageContent']})

client.once(Events.ClientReady, c => {
    console.log('Bot is ready to speak!!!');
});

client.on('messageCreate', msg => {
    if (msg.content === "ping") {
        msg.reply("Pong!")
    }
})

//npm run DevStart

client.login(process.env.DISCORD_TOKEN);


