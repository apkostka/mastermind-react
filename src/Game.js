import React, { Component } from 'react';
import CONSTANTS from './constants';
import logo from './logo.svg';
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
  const history = props.history.slice(0, props.history.length - 1).map((guess, i) => {
    return <li key={i}>
      <ul><PreviousGuessPegs pegs={guess.codePegs} id={i}/></ul>
      <span>{guess.keyPegs[0]} correct, {guess.keyPegs[1]} in place</span>
    </li>;
  });

  return <ul>{history}</ul>;
}

function PlayerInput(props) {
  const values = CONSTANTS.COLORS.slice(0, props.codeLength).map((color, i) => { return <option value={color} key={i}>{color}</option> });
  const inputs = props.current.codePegs.map((color, i) => {
    return <li>
      <Peg color={color} type="code" />
      <select key={i} name={i} value={color} onChange={props.handleInputChange}>{values}</select>
    </li>
  });

  return <div className="currentGuess">
      <ul>{inputs}</ul>
      <button onClick={() => props.onClick()}>Submit</button>
    </div>;
}

class Board extends Component {
  constructor(props) {
    super(props);
    this.state = {
      settings: props.settings,
      code: getNewCode(props.settings.CODE_LENGTH),
      history: [getEmptyGuess(props.settings.CODE_LENGTH)],
      guessNumber: 0
    }
  }

  render() {
    const history = this.state.history;
    const current = history[this.state.guessNumber];
    const guessNumber = this.state.guessNumber + 1;

    var endGame = false;

    if (current.keyPegs === true) {
      alert('winner!');
      endGame = true;
    }
    if (history.length >= CONSTANTS.NUMBER_OF_GUESSES) {
      alert('loser!');
      endGame = true;
    }

    if (endGame) {
      this.setState({
        settings: this.props.settings,
        code: getNewCode(this.props.settings.CODE_LENGTH),
        history: [getEmptyGuess(this.props.settings.CODE_LENGTH)],
        guessNumber: 0
      });
    }

    return <div>
      <PreviousGuesses
        history={history} />
      <PlayerInput
        current={current}
        codeLength={this.state.settings.CODE_LENGTH}
        onClick={(guess) => this.submitGuess(guess)}
        handleInputChange={(event) => this.handleInputChange(event)}/>
      <button
        className="renderNewBoard"
        onClick={i => this.reset()}>New Board</button>
      <p>Guess # {guessNumber}</p>
    </div>;
  }

  handleInputChange(event) {
    const history = this.state.history.slice();
    history[history.length - 1].codePegs[event.target.name] = event.target.value;
    this.setState({history: history});
  }

  submitGuess() {
    console.log(this);
    const history = this.state.history.slice();
    const current = history[history.length - 1];
    current.keyPegs = checkWinner(this.state.code, current.codePegs);
    this.setState({
      history: history.concat(JSON.parse(JSON.stringify(current))), // deep clone, fix?
      guessNumber: this.state.guessNumber + 1
    });
  }

  reset() {
    this.setState({guessNumber: CONSTANTS.NUMBER_OF_GUESSES + 1});
  }
}

class Game extends Component {
  render() {
    const settings = Object.assign({}, CONSTANTS.DEFAULT_SETTINGS);

    return (
      <div className="App">
        <Board settings={settings}>
        </Board>
      </div>
    );
  }
}

export default Game;

function getNewCode(codeLength) {
  return [...new Array(codeLength)]
    .map(() => CONSTANTS.COLORS[Math.floor((Math.random() * (codeLength)) + 1) - 1]);
}

function getEmptyGuess(codeLength) {
  return {
    codePegs: Array(codeLength).fill(CONSTANTS.COLORS[0]),
    keyPegs: [0,0]
  };
}

function checkWinner(code, guess) {
  const check = code.slice();
  var numCorrect = 0;
  var numInPlace = 0;

  for (var x in guess) {
    var match = check.indexOf(guess[x]);
    if (match >= 0) {
      check.splice(match, 1);
      numCorrect++;
    }
  }

  for (var x in guess) {
    if (guess[x] === code[x]) numInPlace++;
  }

  if (numInPlace === code.length) {
    return true;
  } else {
    return [numCorrect, numInPlace];
  }
}
