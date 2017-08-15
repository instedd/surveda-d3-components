import React, { Component } from 'react';
import SuccessRate from './SuccessRate'
import QueueSize from './QueueSize'
import * as d3 from 'd3'
import RetriesHistogram from './RetriesHistogram'
import Forecasts from './Forecasts'

class App extends Component {

  constructor() {
    super()
    this.state = this.getState(0)
  }

  onClick(x) {
    this.setState(this.getState(x))
  }

  getState(x) {
    const value = Math.random()
    const width = x? this.state.width + x : 660
    const height = x? this.state.height + x : 330
    var max = 200+Math.random()*400
    const schedule = [{type:"voice", delay:0}, {type:"voice", delay:0.1, label:"10m"}, {type:"sms", delay:74, label:"74h"}, {type:"voice", delay:0.1, label:"10m"}, {type:"sms", delay:4, label:"4h"}, {type:"discard", delay:26, label:"26h"}]
    const length = d3.sum(schedule, step => step.delay? Math.ceil(step.delay) : 1)
    const actives = Array.from({length}, v => Math.random() > 0.5? Math.random()*max : 0)
    const completes = Array.from({length}, v => Math.random() > 0.5? Math.random()*max*.1 : 0)
    const start = new Date()
    const today = new Date(start.getTime() + Math.random() * 100 * 24 * 60 * 60 * 1000)
    const retriesHistogramReferences = [{label:"Trying", className:"trying"}, {label: "Stand by", className:"standby"}, {label:"Completes", className:"complete"}, {label: "Time window surveys", className: "timewindow"}]
    const forecastsReferences = [{label:"Female 18 - 34", color:"#673ab7"}, {label: "Female 35 - 49", color:"#009688"}, {label:"Male 18 - 34", color:"#ffc107"}, {label: "Male 35 - 49", color: "#ff5722"}]
    const forecasts = forecastsReferences.map(d => {
      const values = this.getValues(start, today)
      const initial = values[values.length-1].value
      const forecast = this.getForecast(today, new Date(today.getTime() + Math.round(Math.random() * 50 * 24 * 60 * 60 * 1000)), initial)
      return {...d, values, forecast}
    })
    return {value, width, height, schedule, actives, completes, forecasts, retriesHistogramReferences}
  }

  getValues(start, today) {
    const days = d3.timeDays(start, today, 1)
    var value = 0
    const values = days.map(time => {
      value += Math.round(Math.random() * 50)
      return {time, value}
    })
    return values
  }

  getForecast(today, end, initial) {
    const days = d3.timeDays(new Date(today.getTime() - 24 * 60 * 60 * 1000), end, 1)
    var value = initial
    const forecast = days.map(time => {
      var item = {time, value}
      value += Math.round(Math.random() * 50)
      return item
    })
    return forecast
  }

  render() {
    return (
      <div className="App">
        <button onClick={() => this.onClick(0)}>Shuffle</button>
        <button onClick={() => this.onClick(12)}>Expand</button>
        <button onClick={() => this.onClick(-12)}>Shrink</button>
        <div style={{marginBottom:50}}>
          <Forecasts data={this.state.forecasts} width={this.state.width*2} height={this.state.height}/>
        </div>
        <div>
          <RetriesHistogram schedule={this.state.schedule} actives={this.state.actives} completes={this.state.completes} width={this.state.width*2} weight={24} references={this.state.retriesHistogramReferences}/>
        </div>
        <p>
          <SuccessRate initial={Math.random()} actual={Math.random()} estimated={Math.random()} progress={this.state.value} width={this.state.width} height={this.state.height} weight={24}/>
        </p>
        <p>
          <QueueSize completes={105} pending={645} needed={37403} missing={3123} successRate={0.0017} multiplier={58} width={this.state.width} height={this.state.height} weight={24}/>
        </p>
      </div>
    );
  }
}

export default App
