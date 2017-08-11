import React, { Component } from 'react';
import SuccessRate from './SuccessRate'
import QueueSize from './QueueSize'
import * as d3 from 'd3'
import RetriesHistogram from './RetriesHistogram'

class App extends Component {

  constructor() {
    super()
    this.state = this.getState(0)
  }

  onClick(x) {
    this.setState(this.getState(x))
  }

  getState(x) {
    const value = 0.14
    const width = x? this.state.width + x : 660
    const height = x? this.state.height + x : 330
    var max = 200+Math.random()*400
    const schedule = [{type:"voice", delay:0}, {type:"voice", delay:0.1, label:"10m"}, {type:"sms", delay:74, label:"74h"}, {type:"sms", delay:4, label:"4h"}, {type:"discard", delay:26, label:"26h"}]
    const length = d3.sum(schedule, step => step.delay)
    const actives = Array.from({length}, v => Math.random() > 0.5? Math.random()*max : 0)
    const completes = Array.from({length}, v => Math.random() > 0.5? Math.random()*max*.1 : 0)
    return {value, width, height, schedule, actives, completes}
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.onClick(0)}>Shuffle</button>
        <button onClick={() => this.onClick(12)}>Expand</button>
        <button onClick={() => this.onClick(-12)}>Shrink</button>
        <div>
          <RetriesHistogram schedule={this.state.schedule} actives={this.state.actives} completes={this.state.completes} width={this.state.width*2} weight={24}/>
        </div>
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
