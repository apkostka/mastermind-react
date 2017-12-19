import React, { Component } from 'react';
import CONSTANTS from './constants';
import './Game.css';

// Covers both code and key pegs
function Peg(props) {
  let classes = `peg ${props.color} ${props.type} ${props.classes}`;
  return (
    <i className={classes} />
  );
}

// iterable list of pegs in a previous guess
function PreviousGuessPegs(props) {
  return props.pegs.map((peg, i) => {
    return <li key={i}><Peg color={peg} type="code"/></li>;
  });
}

// list of previous guesses with key pegs,
// includes guesses not yet made (empty) for the visuals
function PreviousGuesses(props) {
  let history = props.history.slice(0, props.history.length).map((guess, i) => {
    let keyPegs = [];
    guess.codePegs.forEach((peg, i) => { // codePegs length will be the same as code length here, right?
      let classes = (guess.keyPegs[0] > i ? ' correct' : '') + (guess.keyPegs[1] > i ? ' inPlace' : '');
      keyPegs.push(<li key={i}><Peg type="key" classes={classes} /></li>);
    });
    return <li key={i} className="PreviousGuess">
      <ul className="codePegs"><PreviousGuessPegs pegs={guess.codePegs} id={i}/></ul>
      <ul className="keyPegs">{keyPegs}</ul>
    </li>;
  });

  return <ul>{history}</ul>;
}

// guess input component
function PlayerInput(props) {
  const inputs = props.currentGuess.map((color, i) => {
    return <li key={i}  onClick={() => props.handlePegChange(i)}>
      <Peg color={color} type="code" />
    </li>;
  });

  return <div className="currentGuess">
      <ul>{inputs}</ul>
      <button onClick={props.submitGuess} disabled={props.submitDisabled} className="submitGuess">✓</button>
      <button className="resetGame" onClick={props.reset}>R</button>
    </div>;
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: props.settings,
      code: getNewCode(),
      history: getEmptyGuesses(),

      // state.currentGuess is an empty list the length of the code.
      // it's meant to be filled by clicking on an individual spot, which will change that peg color.
      //Persists between guesses for ease of use.
      currentGuess: Array(CONSTANTS.CODE_LENGTH).fill(null),
      guessNumber: 0
    }

    this.submitGuess = this.submitGuess.bind(this);
    this.reset = this.reset.bind(this);
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.guessNumber];

    // disable the submit button if not all currentGuess pegs are selected
    let submitDisabled = this.state.currentGuess.indexOf(null) >= 0;

    // TODO: better win / loss indicators than an alert box
    // Should I be changing the submitDisabled value in render()? Seems like it should be done earlier in the lifecycle
    if (this.state.guessNumber > 0 && history[this.state.guessNumber - 1].keyPegs[1] === CONSTANTS.CODE_LENGTH) {
      alert('You Won!');
      submitDisabled = true;
    } else if (this.state.guessNumber >= CONSTANTS.NUMBER_OF_GUESSES) {
      alert('You Lost!');
      submitDisabled = true;
    }

    return <div className="Board">
      <ul className="PreviousGuesses">
        <PreviousGuesses
          history={history}
          guessNumber={this.state.guessNumber} />
      </ul>
      <PlayerInput
        currentGuess={this.state.currentGuess}
        submitDisabled={submitDisabled}
        handlePegChange={(i) => this.handlePegChange(i)}
        submitGuess={this.submitGuess}
        reset={this.reset}/>
    </div>;
  }

  handlePegChange(i) {
    let currentGuess = this.state.currentGuess.slice();
    let match = CONSTANTS.COLORS.indexOf(currentGuess[i]);
    if (match === CONSTANTS.COLORS.length - 1 || match < 0) { // Current sleection is null, the last color in the list, or not found for some other reason
      currentGuess[i] = CONSTANTS.COLORS[0];
    } else {
      currentGuess[i] = CONSTANTS.COLORS[match + 1];
    }
    this.setState({ currentGuess: currentGuess });
  }

  submitGuess() {
    const history = this.state.history;
    history[this.state.guessNumber].codePegs = this.state.currentGuess.slice();
    history[this.state.guessNumber].keyPegs = checkWinner(this.state.code, history[this.state.guessNumber].codePegs);
    this.setState({
      history: history,
      guessNumber: ++this.state.guessNumber
    });
  }

  reset() {
    this.setState({
      settings: this.props.settings,
      code: getNewCode(),
      history: getEmptyGuesses(),
      currentGuess: Array(CONSTANTS.CODE_LENGTH).fill(null),
      guessNumber: 0
    });
  }
}

class App extends Component {
  // TODO: Implement settings

  constructor(props) {
    super(props);
    this.state = {
      settings: Object.assign({}, CONSTANTS.DEFAULT_SETTINGS),
      wins: 0,
      games: 0
    }
  }

  // TODO: Implement stats, maybe use localstorage?
  incrementWins(isWin) {
    this.setState({
      wins: isWin ? this.state.wins + 1 : this.state.wins,
      games: this.state.games + 1
    });
  }

  render() {
    const winAvg = this.state.games === 0 ? 0 : Math.round( (this.state.wins / this.state.games) * 100 );

    return (
      <div className="App">
        <Board
          settings={this.state.settings}
          incrementWins={i => this.incrementWins(i)} />
      </div>
    );
  }
}

export default App;

// Generate a new random code of a specified length. Returns an array of colors (strings).
function getNewCode() {
  return [...new Array(CONSTANTS.CODE_LENGTH)]
    .map(() => CONSTANTS.COLORS[Math.floor((Math.random() * (CONSTANTS.COLORS.length)) + 1) - 1]);
}

// Returns an array of empty guesses, the length of the number of allowed guesses.
// Used for showing the empty peg holes on the board instead of creating a new guess every time.
// Could possibly generate the empty ones in the Board render() call instead.
function getEmptyGuesses() {
  return [...new Array(CONSTANTS.NUMBER_OF_GUESSES)]
    .map(() => {
      return {
        codePegs: Array(CONSTANTS.CODE_LENGTH).fill(null),
        keyPegs: [0,0]
      }
    });
}

// Returns how many were the correct color and how many were in the correct place.
function checkWinner(code, guess) {
  const check = code.slice();
  let numCorrect = 0;
  let numInPlace = 0;

  for (let x in guess) {
    let match = check.indexOf(guess[x]);
    if (match >= 0) {
      check.splice(match, 1);
      numCorrect++;
    }
  }

  for (let x in guess) {
    if (guess[x] === code[x]) numInPlace++;
  }

  return [numCorrect, numInPlace];
}
