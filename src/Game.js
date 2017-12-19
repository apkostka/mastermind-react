import React, { Component } from 'react';
import CONSTANTS from './constants';
import './Game.css';

function Peg(props) {
  const classes = `peg ${props.color} ${props.type}`;
  return (
    <i className={classes} />
  );
}

function PreviousGuessPegs(props) {
  return props.pegs.map((peg, i) => {
    return <li key={i}><Peg color={peg} type="code"/></li>;
  });
}

function PreviousGuesses(props) {
  const history = props.history.slice(0, props.history.length).map((guess, i) => {
    const keyPegs = [];
    guess.codePegs.forEach((peg, i) => { // codePegs length will be the same as code length here, right?
      let classes = 'peg key' + (guess.keyPegs[0] > i ? ' correct' : '') + (guess.keyPegs[1] > i ? ' inPlace' : '');
      keyPegs.push(<li className={classes} key={i} />);
    });
    return <li key={i} className="PreviousGuess">
      <ul className="codePegs"><PreviousGuessPegs pegs={guess.codePegs} id={i}/></ul>
      <ul className="keyPegs">{keyPegs}</ul>
    </li>;
  });

  return <ul>{history}</ul>;
}

function PlayerInput(props) {
  const inputs = props.currentGuess.map((color, i) => {
    return <li key={i}  onClick={() => props.handlePegChange(i)}>
      <Peg color={color} type="code" />
    </li>;
  });

  return <div className="currentGuess">
      <ul>{inputs}</ul>
      <button onClick={props.submitGuess} disabled={props.submitDisabled} className="submitGuess">✓</button>
    </div>;
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: props.settings,
      code: getNewCode(),
      history: getEmptyGuesses(),
      currentGuess: Array(CONSTANTS.CODE_LENGTH).fill(null),
      guessNumber: 0
    }

    this.submitGuess = this.submitGuess.bind(this);
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.guessNumber];

    const submitDisabled = this.state.currentGuess.indexOf(null) >= 0;

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
        submitGuess={this.submitGuess}/>
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
    const history = this.state.history.slice();
    const current = history[this.state.guessNumber];
    current.codePegs = this.state.currentGuess.slice();
    current.keyPegs = checkWinner(this.state.code, current.codePegs);

    var endGame = false;
    console.log(this.state.guessNumber);

    if (current.keyPegs === true) {
      alert('winner!');
      endGame = true;
    }
    if ((this.state.guessNumber + 1) >= CONSTANTS.NUMBER_OF_GUESSES) {
      alert('loser!');
      endGame = true;
    }

    if (endGame) {
      this.setState({
        settings: this.props.settings,
        code: getNewCode(),
        history: getEmptyGuesses(),
        currentGuess: Array(CONSTANTS.CODE_LENGTH).fill(null),
        guessNumber: 0
      });
      this.props.incrementWins(current.keyPegs === true);
      return;
    }

    this.setState({
      history: history,
      guessNumber: this.state.guessNumber + 1
    });
  }
}

function Settings(props) {
 return <div></div>;
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
        {/*
        <Settings setting={this.state.settings} />
        <div className="stats">{this.state.wins} Wins, {this.state.losses} Losses, {winAvg}%</div>
        */}
      </div>
    );
  }
}

export default App;

function getNewCode() {
  return [...new Array(CONSTANTS.CODE_LENGTH)]
    .map(() => CONSTANTS.COLORS[Math.floor((Math.random() * (CONSTANTS.COLORS.length)) + 1) - 1]);
}

function getEmptyGuesses() {
  let guesses = [];
  for (let i = 0; i < CONSTANTS.NUMBER_OF_GUESSES; i++){
    guesses.push({
      codePegs: Array(CONSTANTS.CODE_LENGTH).fill(null),
      keyPegs: [0,0]
    });
  };
  return guesses;
}

function checkWinner(code, guess) {
  const check = code.slice();
  var numCorrect = 0;
  var numInPlace = 0;

  for (let x in guess) {
    var match = check.indexOf(guess[x]);
    if (match >= 0) {
      check.splice(match, 1);
      numCorrect++;
    }
  }

  for (let x in guess) {
    if (guess[x] === code[x]) numInPlace++;
  }

  if (numInPlace === code.length) {
    return true;
  } else {
    return [numCorrect, numInPlace];
  }
}
