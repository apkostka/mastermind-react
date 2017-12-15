**Components**
- Settings
  - length of code
  - allow duplicates in code
- Game reset Button
- stats / History
  - wins / losses %
  - average number of guesses
- Game board
  - Player guess form
    - 1 dropdown for each place in the code
    - submit Button
  - History
    - line for each player guess
      - 1 peg for each place in code
      - key pegs: same # as length of code, white pegs if correct color, red pegs if in correct place

**Behavior**
- Game initializes
  - imports settings
  - creates random code using CODE_LENGTH setting: `n` random numbers between 1 - `CODE_LENGTH`, use number to access a color from the array of colors constant. If duplicates are not allowed, remove that color from the array (cloned) and reset the random number range
- Player input
  - Player selects 
