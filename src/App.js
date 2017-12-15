import React, { Component } from 'react';
import CONSTANTS from './constants';
import logo from './logo.svg';
import './App.css';

function Peg(props) {
  const classes = `peg ${props.color} ${props.type}`;
  return (
    <i className={classes} />
  );
}

function PegInput(props) {
  console.log(props.codeLength);
  const values = CONSTANTS.COLORS.slice(0, props.codeLength).map((color) => { return <option value={color}>{color}</option> });
    return <li>
      <Peg color={props.value} type="code" />
      <select name={props.id} value={props.value} onChange={(event) => props.handleInputChange(event.target.value)}>{values}</select>
    </li>
}

function PreviousGuesses() {

}

function PlayerInput(props) {
  const pegs = props.current.codePegs.map((place, i) => {
    return <PegInput
      value={place}
      id={i}
      codeLength={props.codeLength}
      handleInputChange={(val) => props.handleInputChange(i, val)} />
  });
  return <div className="currentGuess">
      <ol>{pegs}</ol>
    </div>;
}

class Game extends Component {
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
    console.log(this); // REMOVE

    const history = this.state.history;
    const current = history[this.state.guessNumber];

    console.log(current);

    return <div>
      <PlayerInput
        current={current}
        codeLength={this.state.settings.CODE_LENGTH}
        onClick={(guess) => this.submitGuess(guess)}
        handleInputChange={(i, val) => this.handleInputChange(i, val)}/>
      <button
        className="renderNewGame"
        onClick={i => this.reset()}>New Game</button>
      </div>;
  }

  handleInputChange(i, val) {
    const history = this.state.history.slice();
    history[history.length - 1].codePegs[i] = val;
    this.setState({history: history});
  }

  submitGuess() {
    const history = this.state.history.slice(0, this.state.guessNumber - 1);
    const current = history[history.length - 1];
    console.log(current);
  }

  reset() {
    this.setState({
      settings: this.props.settings,
      code: getNewCode(this.props.settings.CODE_LENGTH),
      history: [getEmptyGuess(this.props.settings.CODE_LENGTH)],
      guessNumber: 0
    });
  }
}

class App extends Component {
  render() {
    const settings = Object.assign({}, CONSTANTS.DEFAULT_SETTINGS);

    return (
      <div className="App">
        <Game settings={settings}>
        </Game>
      </div>
    );
  }
}

export default App;

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
