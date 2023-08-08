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
const {cache} = require("express/lib/application");

let guesses = [];
let wordleStart = false;
let correctWord = '';

let twentyQsStart = false;
let anagramStart = false;
let setupPlayers = false;

let gameChannel = '';

let player1 = ''
let player2 = ''
let secretWord = ''
let currentQNum = 1;
let randomLetter = [];


client.once(Events.ClientReady, c => {
    console.log('Bot is ready to speak!!!');
    gameChannel = client.channels.cache.get('1133762136917676145');

    //this code line will use the api to get the definition and if it doens't exist it will say:
    // {
    //     title: 'No Definitions Found',
    //     message: "Sorry pal, we couldn't find definitions for the word you were looking for.",
    //     resolution: 'You can try the search again at later time or head to the web instead.'
    // }


    //fetch(url).then(res => res.json()).then(result => isInDictionary(result));
});

const playWordleButton = new ButtonBuilder()
    .setCustomId('playWordleButton')
    .setLabel('Play Wordle')
    .setStyle(1);

const playTwentyQsButton = new ButtonBuilder()
    .setCustomId('playTwentyQsButton')
    .setLabel('Play 20 Questions')
    .setStyle(1);

const playAnagram = new ButtonBuilder()
    .setCustomId('playAnagram')
    .setLabel('Play Anagram')
    .setStyle(1);

const gameMenu = new ActionRowBuilder()
    .addComponents(playWordleButton)
    .addComponents(playTwentyQsButton)
    .addComponents(playAnagram);


const row2 = new ActionRowBuilder()
for (let i = 0; i < 5; i++) {
    row2.addComponents(new ButtonBuilder()
        .setCustomId('noGuess' + i)
        .setLabel('_')
        .setStyle(2)
        .setDisabled(true));
}

let anagramList = ['', ''];

async function settingUpPlayers(senderID, gameType, msg) {
    console.log("players are currently being setup")
    // Respond to the private message
    if (msg.author.id === client.user.id) {
        return;
    }

    const opponent = fetchId(msg.content.trim())

    console.log(opponent);
    if (gameChannel.guild.members.cache.has(opponent)
        && opponent !== '1133762136917676145') {
        player1 = senderID;
        player2 = opponent;
        await client.users.send(player1, 'Your opponent is: ' +
            msg.content + '\n Request Sent! Waiting for opponent response');
        await client.users.send(opponent,{
            content: msg.author.username.toString() + ' has challenged you to' + gameType,
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
        if (gameType === '20 Question') {
            twentyQsStart = false;
        } else {
            anagramStart = false;
        }
    }
    setupPlayers = false;
}

client.on('messageCreate', async (msg) => {

    if (msg.content.startsWith("!quit")) {
        twentyQsStart = false;
        anagramStart = false;
        wordleStart = false;
        playWordleButton.setDisabled(false);
        playTwentyQsButton.setDisabled(false);
        playAnagram.setDisabled(false);
    }

    if (msg.channel instanceof DMChannel) {
        if (msg.author.id === client.user.id) {
            return;
        }
        console.log("received dm")
        if (setupPlayers === true) {
            if (twentyQsStart) {
                await settingUpPlayers(msg.author.id, '20 Question', msg)
            } else {
                await settingUpPlayers(msg.author.id, 'Anagrams', msg)
            }
        } else {
            if (anagramStart === true) {
                console.log(anagramList)

                if (anagramList.includes((msg.content.trim().toLowerCase()))) {
                    console.log("good word")
                    await msg.react("👍")
                } else {
                    console.log("bad word")
                    await msg.react("👎")
                }
            }
            if (twentyQsStart === true) {
                if (secretWord === '') {
                    console.log("players have been setup, choosing secret word")
                    await client.users.send(player1, 'Enter secret word: ')
                    secretWord = msg.content.trim();
                    console.log("Secret Word is: " + secretWord)
                    await client.users.send(player1, "Waiting for first question...");
                    await client.users.send(player2, "Opponent has chosen a word! Ask question or enter the correct word");
                } else {
                    if (msg.author.id === player2 && currentQNum < 21) {
                        await client.users.send(player1, {
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

    if (msg.content.startsWith("!guess")) {
        const currentGuess = (msg.content.substring(msg.content.indexOf("!guess") + 6)).trim().toLowerCase();
        await main(currentGuess);
        //fetch(url+currentGuess).then(res => res.json()).then(result => isInDictionary(result));
    }
})

async function checkIfInDictionary(word) {
    // const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`;
    // const response = await fetch(url);
    // const data = await response.json();
    // return data.title; // Assuming the API returns an object with a property indicating if the word is in the dictionary


    if (word.size === 3) {
        fs.readFile('3-letter-words.txt',  (err, data) => {
            if (err) throw err;
            if (data.includes(word)) {
                return true;
            }
        })
    } else if (word.size === 4) {
        if (readAndParseFile('4-letter-words.txt').toString().includes(word.toUpperCase())) {
            return true;
        }
    } else {
        if (readAndParseFile('fiveLetters.txt').toString().includes(word)) {
            return true;
        }
    }

    return false;
}

function readAndParseFile(filePath) {
    const stringBuilder = [];

    try {
        const fileContent = fs.readFileSync(filePath, "utf-8");
        stringBuilder.push(fileContent);
    } catch (error) {
        console.error("Error reading file:", error);
    }

    return stringBuilder.join("");
}


function generateAnagrams(word, length) {
    if (length === 0) {
        return [''];
    }

    const anagrams = [];
    for (let i = 0; i < word.length; i++) {
        const char = word[i];
        const remainingChars = word.slice(0, i) + word.slice(i + 1);
        const subAnagrams = generateAnagrams(remainingChars, length - 1);
        for (const subAnagram of subAnagrams) {
            anagrams.push(char + subAnagram);
        }
    }
    return anagrams;
}

async function main(input) {
    const inputLetters = input.toLowerCase().replace(/\s/g, '');
    console.log(inputLetters)

    const anagrams3 = generateAnagrams(inputLetters, 3);
    const anagrams4 = generateAnagrams(inputLetters, 4);
    const anagrams5 = generateAnagrams(inputLetters, 5);
    let x = 0;

    let actualAnagram = []
    console.log("\n3-Letter Anagrams in Dictionary:");
    for (const anagram of anagrams3) {
        const isInDictionary = await checkIfInDictionary(anagram);
        if (isInDictionary) {
            actualAnagram.push(anagram);
            console.log(x + anagram);
            x++
        }
    }

    console.log("\n4-Letter Anagrams in Dictionary:");
    for (const anagram of anagrams4) {
        const isInDictionary = await checkIfInDictionary(anagram);
        if (isInDictionary) {
            actualAnagram.push(anagram);
            console.log(x + anagram);
            x++
        }
    }

    console.log("\n5-Letter Anagrams in Dictionary:");
    for (const anagram of anagrams5) {
        const isInDictionary = await checkIfInDictionary(anagram);
        if (isInDictionary) {
            actualAnagram.push(anagram);
            console.log(x + anagram);
            x++
        }
    }


    console.log(actualAnagram)

    // console.log(allAnagrams.length)
    // let actualAnagram = await rateLimitedRequests(allAnagrams);
    console.log(actualAnagram);
    return actualAnagram;
}

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

    if (interaction.customId === 'playAnagram') {
        anagramStart = true;
        playAnagram.setDisabled()

        //non-vowel letters
        while (randomLetter.length < 3) {
            let s = String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65);
            if (s !== 'A' && s !== 'E' && s !== 'I' && s !== 'O' && s !== 'U') {
                randomLetter.push(s);
            }
        }

        while (randomLetter.length < 5) {
            let s = String.fromCharCode(Math.floor(Math.random() * (90 - 65 + 1)) + 65);
            if (s === 'A' || s === 'E' || s === 'I' || s === 'O' || s === 'U') {
                randomLetter.push(s);
            }
        }


        main(randomLetter.join('')).then(result => {
            anagramList = result
        })
        interaction.reply("Anagram has started. Please check DM for instruction")
        await interaction.user.send("Welcome to Anagram\n" +
            "Enter the username of your opponent from the server")
        gameChannel = client.channels.cache.get(interaction.channelId.toString());

        setupPlayers = true;
    }

    if (interaction.customId === 'reject20') {
        twentyQsStart = false;
        await client.users.send(player1, (await client.users.fetch(player2)).username + ' has rejected your request :(');
        interaction.reply('successfully rejected game request')
        setupPlayers = false;
    }
    if (interaction.customId === 'accept20') {
        await client.users.send(player1, (await client.users.fetch(player2)).username + ' has accepted your request\n')
        interaction.reply('successfully joined the game! Please wait')

        if (anagramStart === true) {
            await client.users.send(player1, 'The Letters Are:' + randomLetter.join(' ')
                + '\n Type Your Anagrams!');

            await client.users.send(player2, 'The Letters Are:' + randomLetter.join(' ')
                + '\n Type Your Anagrams!');

            let timerPlayer1 = await client.users.send(player1, 'Time Left: ' + timer)
            let timerPlayer2 = await client.users.send(player2, 'Time Left: ' + timer)
            const interval = setInterval(() => {
                timer--;
                timerPlayer1.edit('Time Left: ' + timer)
                timerPlayer2.edit('Time Left: ' + timer)
                if (timer === 0) {
                    clearInterval(interval);
                    client.users.send(player1, "Time's Up!")
                    client.users.send(player2, "Time's Up!")
                    anagramStart = false;
                }
            }, 1000)

    }

        setupPlayers = false;
    }

    if (interaction.customId === 'Yes20') {
        isTwentyQsOver();
        await client.users.send(player2, "Question " + currentQNum + " Answer: Yes")
        currentQNum++
        if (isTwentyQsOver()) {
            interaction.reply("They couldn't guess it! You won!")
            await client.users.send(player2, "You ran out of guesses! You Lost !\n"
                + "The secret word was: " + secretWord);
        } else {
            interaction.reply("You chose Yes. Waiting for new questions...")
        }
    }

    if (interaction.customId === 'No20') {
        await client.users.send(player2, "Question " + currentQNum + " Answer: No")
        currentQNum++
        if (isTwentyQsOver()) {
            interaction.reply("They couldn't guess it! You won!")
            await client.users.send(player2, "You ran out of guesses! You Lost !\n"
                + "The secret word was: " + secretWord);
        } else {
            interaction.reply("You chose No. Waiting for new questions...")
        }
    }

    if (interaction.customId === 'Sometimes20') {
        isTwentyQsOver();
        await client.users.send(player2, "Question " + currentQNum + " Answer: Maybe")
        currentQNum++
        if (isTwentyQsOver()) {
            interaction.reply("They couldn't guess it! You won!")
            await client.users.send(player2, "You ran out of guesses! You Lost !\n"
                + "The secret word was: " + secretWord);
        } else {
            interaction.reply("You chose Maybe. Waiting for new questions...")
        }
    }

    if (interaction.customId === 'YouGotIt') {
        isTwentyQsOver();
        interaction.reply("They got it! You lost :(")
        await client.users.send(player2, "You guessed it right! You Won !")
        twentyQsStart = false;
        currentQNum = 1;
    }

})

function isTwentyQsOver() {
    if (currentQNum === 21) {
        // client.users.send(player1, "They couldn't guess! You Won !")
        // client.users.send(player2, "You ran out of guesses! You Lost !\n"
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


