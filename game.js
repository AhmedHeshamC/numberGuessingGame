const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

const difficultyLevels = {
  '1': { name: 'Easy', chances: 15 },
  '2': { name: 'Medium', chances: 12 },
  '3': { name: 'Hard', chances: 8 }
};

function runGameRound() {
  console.log("\n-----------------------------------");
  console.log("Starting a new round...");
  console.log("I'm thinking of a number between 1 and 100.");

  let targetNumber;
  let attemptsLeft;
  let currentAttempt = 0;
  let startTime;
  let selectedDifficulty;

  // Select difficulty
  console.log("\nPlease select the difficulty level:");
  Object.keys(difficultyLevels).forEach(key => {
    console.log(`${key}. ${difficultyLevels[key].name} (${difficultyLevels[key].chances} chances)`);
  });

  readline.question('\nEnter your choice: ', (difficultyChoice) => {
    // Sanitize and validate difficulty input
    difficultyChoice = difficultyChoice.trim();
    
    // Check if input is a valid difficulty level
    if (!Object.keys(difficultyLevels).includes(difficultyChoice)) {
      console.log('Invalid difficulty level. Please enter 1, 2, or 3.');
      askToPlayAgain(); // Ask to play again if difficulty choice is invalid
      return;
    }
    
    selectedDifficulty = difficultyLevels[difficultyChoice];

    attemptsLeft = selectedDifficulty.chances;
    targetNumber = Math.floor(Math.random() * 100) + 1;
    startTime = new Date();

    console.log(`\nGreat! You have selected the ${selectedDifficulty.name} difficulty level.`);
    console.log(`You have ${attemptsLeft} chances to guess the correct number.`);
    console.log("Let's start the game!\n");

    askForGuess();
  });

  function askForGuess() {
    if (attemptsLeft <= 0) {
      console.log(`Sorry, you've run out of chances. The number was ${targetNumber}.`);
      askToPlayAgain();
      return;
    }

    // Provide hints after 3 consecutive wrong guesses
    if (currentAttempt >= 3 && currentAttempt % 3 === 0) {
      if (targetNumber % 2 === 0) {
        console.log('Hint: The number is even.');
      } else {
        console.log('Hint: The number is odd.');
      }
    }
    // Provide more specific hints after 5 consecutive wrong guesses
    if (currentAttempt >= 5 && currentAttempt % 5 === 0) {
      if (targetNumber % 5 === 0) {
        console.log('Hint: The number is divisible by 5.');
      } else if (targetNumber % 3 === 0) {
        console.log('Hint: The number is divisible by 3.');
      }
    }

    readline.question(`Enter your guess (${attemptsLeft} attempts left): `, (guessInput) => {
      const guess = parseInt(guessInput);
      currentAttempt++;

      if (isNaN(guess)) {
        console.log('Invalid input. Please enter a number.');
        askForGuess(); // Ask again without decrementing attempts
        return;
      }
      
      // Validate that guess is within the valid range (1-100)
      if (guess < 1 || guess > 100) {
        console.log('Please enter a number between 1 and 100.');
        askForGuess(); // Ask again without decrementing attempts
        return;
      }

      attemptsLeft--;

      if (guess === targetNumber) {
        const endTime = new Date();
        const timeDiff = (endTime - startTime) / 1000; // in seconds
        console.log(`Congratulations! You guessed the correct number in ${currentAttempt} attempts in ${timeDiff.toFixed(1)} seconds.`);
        
        // Check and update high scores
        try {
          const fs = require('fs');
          let highscores = {};
          
          // Safely read the highscores file
          try {
            const fileData = fs.readFileSync('./highscores.json', 'utf8');
            highscores = JSON.parse(fileData);
          } catch (readError) {
            console.log('Creating new highscores file...');
            // If file doesn't exist or is corrupted, create a new one
            highscores = {};
          }
          
          // Ensure the difficulty level exists in the highscores
          if (!highscores[selectedDifficulty.name.toLowerCase()]) {
            highscores[selectedDifficulty.name.toLowerCase()] = {
              attempts: Infinity,
              time: Infinity
            };
          }
          
          const currentScore = highscores[selectedDifficulty.name.toLowerCase()];
          
          if (currentAttempt < currentScore.attempts || 
              (currentAttempt === currentScore.attempts && timeDiff < currentScore.time)) {
            highscores[selectedDifficulty.name.toLowerCase()] = {
                attempts: currentAttempt,
                time: timeDiff
            };
            
            // Safely write the updated highscores
            try {
              fs.writeFileSync('./highscores.json', JSON.stringify(highscores, null, 2));
              console.log('\n🎉 New high score! 🎉');
            } catch (writeError) {
              console.log('\nUnable to save high score due to an error.');
            }
          }
        } catch (error) {
          console.log('\nError handling highscores: ' + error.message);
          // Continue the game even if highscore handling fails
        }
        
        askToPlayAgain();
      } else if (guess < targetNumber) {
        console.log('Incorrect! The number is greater than ' + guess + '.');
        askForGuess();
      } else {
        console.log('Incorrect! The number is less than ' + guess + '.');
        askForGuess();
      }
    });
  }

  function askToPlayAgain() {
    readline.question('\nDo you want to play again? (yes/no): ', (answer) => {
      // Sanitize user input
      const sanitizedAnswer = answer.trim().toLowerCase();
      
      if (sanitizedAnswer === 'yes' || sanitizedAnswer === 'y') {
        runGameRound(); // Start a new round
      } else if (sanitizedAnswer === 'no' || sanitizedAnswer === 'n') {
        console.log('Thanks for playing! Goodbye.');
        readline.close(); // Close the interface if not playing again
      } else {
        console.log('Invalid input. Please enter "yes" or "no".');
        askToPlayAgain(); // Ask again for valid input
      }
    });
  }
}

// Initial game start
console.log("Welcome to the Number Guessing Game!");
runGameRound(); // Start the first round