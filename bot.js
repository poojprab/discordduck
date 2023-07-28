const { Client, Events, GatewayIntentBits } = require('discord.js');
const dotenv = require('dotenv');

dotenv.config();

const client = new Client({
    intents: [
        'Guilds', 'GuildMessages', 'MessageContent']
})

const channel = client.channels.cache.get('1133762136917676145');

const axios = require('axios');
const {response} = require("express");
const fs = require('fs');
const readline = require('readline');
const {stringify} = require("nodemon/lib/utils");

let guesses = [];
let wordleStart = false;
let correctWord = '';


client.once(Events.ClientReady, c => {
    console.log('Bot is ready to speak!!!');
});


client.on('messageCreate', async (msg) => {
    if (msg.author.id === client.user.id) {
        return;
    }
    if (msg.content.includes("hi duck")) {
        await msg.reply("hi zoe and pooja")
    }
    if (msg.content.startsWith("!play")) {
        await msg.reply({
            content: 'Select Games',
            components: [gameMenu]
        });
    }
    if (msg.content.startsWith("!guess") && wordleStart) {
        const channel = client.channels.cache.get('1133762136917676145');
        const currentGuess = (msg.content.substring(msg.content.indexOf("!guess") + 6)).trim().toLowerCase();
        if (currentGuess.length < 5 || currentGuess.length > 5) {
            await msg.reply("Invalid Guess");
        } else {
            guesses.unshift(currentGuess)
            await msg.reply("Your guesses so far: " + guesses);
        }

        console.log("LENGTH OF THE ARRAY: " + guesses.length)


        for (let i = guesses.length; i > 0; i--) {
            console.log("HI")
            channel.send({ content: ' ', components: [generateRow(guesses[i - 1])] });
        }

        for (let i = 0; i < (5 - guesses.length); i++) {
            channel.send({ content: ' ', components: [row2] });
        }

        if (guesses[0] === correctWord) {
            channel.send('you won !');
            guesses = []
            wordleStart = false;
        } else if (guesses.length === 5 && guesses[0] !== correctWord) {
            channel.send('you lost :(')
            guesses = []
            wordleStart = false;
        }
    }
})

function generateRow(guessedWord) {
    const row3 = new ActionRowBuilder();

    for (let i = 0; i < 5; i++)  {
        const cwLetter = correctWord.charAt(i)
        const gwLetter = guessedWord.charAt(i)
        console.log(cwLetter + " " + gwLetter + " " + i)
        if (cwLetter === gwLetter) {
            row3.addComponents(new ButtonBuilder()
                .setCustomId('gradedButtonGreen' + i)
                .setLabel(guessedWord.charAt(i).toUpperCase())
                .setStyle(3)
                .setDisabled(true))
        } else if (correctWord.includes(gwLetter)) {
            row3.addComponents(new ButtonBuilder()
                .setCustomId('gradedButtonBlue' + i)
                .setLabel(guessedWord.charAt(i).toUpperCase())
                .setStyle(1)
                .setDisabled(true));
        } else {
            row3.addComponents(new ButtonBuilder()
                .setCustomId('gradedButtonGrey' + i)
                .setLabel(guessedWord.charAt(i).toUpperCase())
                .setStyle(2)
                .setDisabled(true))
        }
    }
    return row3;
}

client.on('interactionCreate', async (interaction) => {
    if (interaction.customId === 'playWordleButton') {
        interaction.reply("Game has started")
        wordle().then( (randomWord) => {
            const channel = client.channels.cache.get('1133762136917676145');
            for (let i = 0; i < 5; i++) {
                channel.send({ content: ' ', components: [row2] });
            }
            wordleStart = true;
            //playWordleButton.setDisabled(true);
            correctWord = randomWord;
        })
            .catch((err) => {
                console.error('Error:', err);
            });
    }
})

function wordle() {
    return new Promise((resolve, reject) => {
        read((err, data) => {
            if (err) {
                console.error('Error:', err);
                reject(err);
            } else {
                const wordsArray = data.trim().split('\n');
                const randomNum = Math.floor(Math.random() * wordsArray.length);
                resolve(wordsArray[randomNum]);
            }
        });
    });
}

function read(callback) {
    fs.readFile('nyt.txt', 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading the file:', err);
            callback(err, null);
        } else {
            callback(null, data);
        }
    });
}


//npm run devStart

client.login(process.env.DISCORD_TOKEN);


