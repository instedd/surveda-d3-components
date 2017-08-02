import React, { Component } from 'react';
import Chart from './Chart'
import './App.css';

class App extends Component {

  constructor() {
    super()
    this.state = {
      height: 500,
      values: Array.from({length: 20}, () => Math.floor(Math.random() * 200))
    }
  }

  onClick(x) {
    this.setState({
      height: this.state.height + x,
      values: Array.from({length: 20}, () => Math.floor(Math.random() * 200))
    })
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.onClick(0)}>Shuffle</button>
        <button onClick={() => this.onClick(30)}>Expand</button>
        <button onClick={() => this.onClick(-30)}>Shrink</button>
        <p>
          <Chart values={this.state.values} height={this.state.height} width={1283} />
        </p>
      </div>
    );
  }
}

export default App
