const { Client, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({ intents: [
    'Guilds', 'GuildMessages', 'MessageContent']})

const axios = require('axios');



client.once(Events.ClientReady, c => {
    console.log('Bot is ready to speak!!!');
});


client.on('messageCreate', msg => {
    if (msg.content.includes("hi duck")) {
        msg.reply("hi zoe and pooja")
        //Example using Axios to get JSON data from a server
        axios.get('http://localhost:3000/data.json')
            .then((response) => {
                // response.data will contain the parsed JSON data
                console.log(response.data);
            })
            .catch((error) => {
                console.error('Error fetching JSON:', error);
            });
    }
})

//npm run devStart

client.login(process.env.DISCORD_TOKEN);


