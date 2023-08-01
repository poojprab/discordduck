const {
    Client, Events, MessageActionRow, MessageButton, ButtonBuilder, GuildChannel, Message,
    ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder
} = require('discord.js');
const dotenv = require('dotenv');


dotenv.config();

const client = new Client({
    intents: [
        'Guilds', 'GuildMessages', 'MessageContent', 'DirectMessages']
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

let twentyQsStart = false;

let gameChannel = '';


client.once(Events.ClientReady, c => {
    console.log('Bot is ready to speak!!!');
});

const playWordleButton = new ButtonBuilder()
    .setCustomId('playWordleButton')
    .setLabel('Play Wordle')
    .setStyle(1);

const gameMenu = new ActionRowBuilder()
    .addComponents(playWordleButton)
    .addComponents(playTwentyQsButton);


const row2 = new ActionRowBuilder()
for (let i = 0; i < 5; i++) {
    row2.addComponents(new ButtonBuilder()
        .setCustomId('noGuess' + i)
        .setLabel('_')
        .setStyle(2)
        .setDisabled(true));
}

//const allowedUserIds = ['353053962922098700', '744654927283880012']; // Replace with the actual IDs of the two members you want to allow
const allowedUserIds = []; // Replace with the actual IDs of the two members you want to allow


client.on('messageCreate', async (msg) => {

    if (msg.channel instanceof DMChannel) {
        // Respond to the private message
        if (msg.author.id === client.user.id) {
            return;
        }

        //const channel = client.channels.cache.get('1133762136917676145');

        const opponent = fetchId(msg.content)

        console.log("received dm")
        console.log(opponent);
        if (gameChannel.guild.members.cache.has(opponent)
        && fetchId(msg.content) !== '1133762136917676145') {
            msg.author.send('Your opponent is: ' +
                msg.content);
        } else {
            msg.author.send('This user are not available to play :( ')
        }
    }

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
        interaction.reply("Wordle has started")
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
    if (interaction.customId === 'playTwentyQsButton') {
        twentyQsStart = true;
        interaction.reply("20 Questions has started. Please check DM for instruction")
        await interaction.user.send("Welcome to 20 Questions\n" +
            "Enter the username of your opponent from the server")
        gameChannel = client.channels.cache.get(
            interaction.channelId.toString());

        // if (allowedUserIds.includes(interaction.user.id) && twentyQsStart) {
        //     await interaction.user.send(interaction.user.toString + "is an allowed user")
        // }
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


