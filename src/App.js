import React, { Component } from 'react';
import SuccessRate from './SuccessRate'
import QueueSize from './QueueSize'

class App extends Component {

  constructor() {
    super()
    this.state = {
      value:0.14,
      width:660,
      height:330
    }
  }

  onClick(x) {
    this.setState({
      value:Math.random(),
      width:this.state.width+x,
      height:this.state.height+x
    })
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.onClick(0)}>Shuffle</button>
        <button onClick={() => this.onClick(12)}>Expand</button>
        <button onClick={() => this.onClick(-12)}>Shrink</button>
        <p>
          <SuccessRate initial={0.012} actual={0.05} estimated={0.017} progress={this.state.value} width={this.state.width} height={this.state.height} weight={24}/>
        </p>
        <p>
          <QueueSize completes={105} pending={645} needed={37403} missing={3123} successRate={0.0017} multiplier={58} width={this.state.width} height={this.state.height} weight={24}/>
        </p>
      </div>
    );
  }
}

export default App
