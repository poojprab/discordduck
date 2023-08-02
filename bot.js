const {
    Client, Events, MessageActionRow, MessageButton, ButtonBuilder, GuildChannel, Message,
    ButtonStyle, ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder, DMChannel
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
let setupPlayers = false;

let gameChannel = '';

let questioner = ''
let questionee = ''
let secretWord = ''
let currentQNum = 1;


client.once(Events.ClientReady, c => {
    console.log('Bot is ready to speak!!!');
    gameChannel = client.channels.cache.get('1133762136917676145');
});

const playWordleButton = new ButtonBuilder()
    .setCustomId('playWordleButton')
    .setLabel('Play Wordle')
    .setStyle(1);

const playTwentyQsButton = new ButtonBuilder()
    .setCustomId('playTwentyQsButton')
    .setLabel('Play 20 Questions')
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

client.on('messageCreate', async (msg) => {

    if (msg.channel instanceof DMChannel) {
        if (msg.author.id === client.user.id) {
            return;
        }
        console.log("received dm")
        if (twentyQsStart === true) {
            console.log("twenty questions as started (button clicked)")
            if (setupPlayers === true) {
                console.log("players are currently being setup")
                // Respond to the private message
                if (msg.author.id === client.user.id) {
                    return;
                }

                const opponent = fetchId(msg.content.trim())

                console.log(opponent);
                if (gameChannel.guild.members.cache.has(opponent)
                    && opponent !== '1133762136917676145') {
                    questioner = msg.author.id;
                    questionee = opponent;
                    await msg.author.send('Your opponent is: ' +
                        msg.content + '\n Request Sent! Waiting for opponent response');
                    //await client.users.send(opponent, msg.author.username.toString() + ' has challenged you to 20 questions')
                    await client.users.send(opponent,{
                        content: msg.author.username.toString() + ' has challenged you to 20 questions',
                        components: [new ActionRowBuilder()
                            .addComponents(new ButtonBuilder()
                                .setCustomId('accept20')
                                .setLabel('Accept the Challenge')
                                .setStyle(1))
                            .addComponents(new ButtonBuilder()
                                .setCustomId('reject20')
                                .setLabel('Reject the Challenge')
                                .setStyle(2))
                        ]
                    } )
                } else {
                    await msg.author.send('This user are not available to play :( ')
                }
                setupPlayers = false;
            } else {
                if (secretWord === '') {
                    console.log("players have been setup, choosing secret word")
                    secretWord = msg.content.trim();
                    console.log("Secret Word is: " + secretWord)
                    await client.users.send(questioner, "Waiting for first question...");
                    await client.users.send(questionee, "Opponent has chosen a word! Ask question or enter the correct word");
                } else {
                    if (msg.author.id === questionee && currentQNum < 21) {
                        await client.users.send(questioner, {
                                content: "Question " + currentQNum + ": " + msg.content + "?",
                                components: [new ActionRowBuilder()
                                    .addComponents(new ButtonBuilder()
                                        .setCustomId('Yes20')
                                        .setLabel('Yes')
                                        .setStyle(2))
                                    .addComponents(new ButtonBuilder()
                                        .setCustomId('No20')
                                        .setLabel('No')
                                        .setStyle(4))
                                    .addComponents(new ButtonBuilder()
                                        .setCustomId('Sometimes20')
                                        .setLabel('Maybe')
                                        .setStyle(1))
                                    .addComponents(new ButtonBuilder()
                                        .setCustomId('YouGotIt')
                                        .setLabel('You Got It !')
                                        .setStyle(3))
                                ]
                            }
                            );
                    }
                }
            }
        }
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
        const currentGuess = (msg.content.substring(msg.content.indexOf("!guess") + 6)).trim().toLowerCase();
        if (currentGuess.length < 5 || currentGuess.length > 5) {
            await msg.reply("Invalid Guess");
        } else {
            guesses.unshift(currentGuess)
            await msg.reply("Your guesses so far: " + guesses);
        }


        for (let i = guesses.length; i > 0; i--) {
            gameChannel.send({ content: ' ', components: [generateRow(guesses[i - 1])] });
        }

        for (let i = 0; i < (5 - guesses.length); i++) {
            gameChannel.send({ content: ' ', components: [row2] });
        }

        if (guesses[0] === correctWord) {
            gameChannel.send('you won !');
            guesses = []
            wordleStart = false;
        } else if (guesses.length === 5 && guesses[0] !== correctWord) {
            gameChannel.send('you lost :(')
            guesses = []
            wordleStart = false;
        }
    }
})


function fetchId(desiredUserName) {

    let guildsUsers = [];
    let guildsUsersId = [];
    gameChannel.members.forEach(member => {
        guildsUsers.push(member.user.username.toString())
        guildsUsersId.push(member.user.id.toString())
    });

    for (let i = 0; i < guildsUsers.length; i++) {
        if (guildsUsers[i] === desiredUserName) {
            return guildsUsersId[i];
        }
    }
    return '1133762136917676145';
}

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
            //const channel = client.channels.cache.get('1133762136917676145');
            for (let i = 0; i < 5; i++) {
                gameChannel.send({ content: ' ', components: [row2] });
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
        playTwentyQsButton.setDisabled()
        twentyQsStart = true;
        interaction.reply("20 Questions has started. Please check DM for instruction")
        await interaction.user.send("Welcome to 20 Questions\n" +
            "Enter the username of your opponent from the server")
        gameChannel = client.channels.cache.get(
            interaction.channelId.toString());
        setupPlayers = true;
    }

    if (interaction.customId === 'reject20') {
        twentyQsStart = false;
        await client.users.send(questioner, (await client.users.fetch(questionee)).username + ' has rejected your request :(');
        interaction.reply('successfully rejected game request')
        setupPlayers = false;
    }
    if (interaction.customId === 'accept20') {
        await client.users.send(questioner, (await client.users.fetch(questionee)).username + ' has accepted your request\n')
        await client.users.send(questioner, 'Enter secret word: ')
        interaction.reply('successfully joined the game, please wait while opponent choose their secret word')
        setupPlayers = false;
    }

    if (interaction.customId === 'Yes20') {
        isTwentyQsOver();
        await client.users.send(questionee, "Question " + currentQNum + " Answer: Yes")
        currentQNum++
        if (isTwentyQsOver()) {
            interaction.reply("They couldn't guess it! You won!")
            await client.users.send(questionee, "You ran out of guesses! You Lost !\n"
                + "The secret word was: " + secretWord);
        } else {
            interaction.reply("You chose Yes. Waiting for new questions...")
        }
    }

    if (interaction.customId === 'No20') {
        await client.users.send(questionee, "Question " + currentQNum + " Answer: No")
        currentQNum++
        if (isTwentyQsOver()) {
            interaction.reply("They couldn't guess it! You won!")
            await client.users.send(questionee, "You ran out of guesses! You Lost !\n"
                + "The secret word was: " + secretWord);
        } else {
            interaction.reply("You chose No. Waiting for new questions...")
        }
    }

    if (interaction.customId === 'Sometimes20') {
        isTwentyQsOver();
        await client.users.send(questionee, "Question " + currentQNum + " Answer: Maybe")
        currentQNum++
        if (isTwentyQsOver()) {
            interaction.reply("They couldn't guess it! You won!")
            await client.users.send(questionee, "You ran out of guesses! You Lost !\n"
                + "The secret word was: " + secretWord);
        } else {
            interaction.reply("You chose Maybe. Waiting for new questions...")
        }
    }

    if (interaction.customId === 'YouGotIt') {
        isTwentyQsOver();
        interaction.reply("They got it! You lost :(")
        await client.users.send(questionee, "You guessed it right! You Won !")
        twentyQsStart = false;
        currentQNum = 1;
    }

})

function isTwentyQsOver() {
    if (currentQNum === 21) {
        // client.users.send(questioner, "They couldn't guess! You Won !")
        // client.users.send(questionee, "You ran out of guesses! You Lost !\n"
        //     + "The secret word was: " + secretWord);
        twentyQsStart = false;
        currentQNum = 1;
        return true;
    }
    return false;
}


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


