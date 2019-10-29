import * as d3 from 'd3'
import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import {render} from 'react-dom'
import { SuccessRate, QueueSize, RetriesHistogram, Forecasts, Stats } from '../../src'
import './index.css'

var interval
var count = 0
var id = 0
const fix = -1


class Demo extends Component {
  constructor() {
    super()
    this.state = {...this.getData(), ...this.getSize(0)}
    setTimeout(this.start.bind(this), 500)
  }

  next() {
    this.nextHour()
  }

  start() {
    this.stop()
    interval = setInterval(() => {
      this.makeCalls()
      if(count === 20) {
        this.nextHour()
        count = 0
      }
      count++
    }, 20)
  }

  stop() {
    clearInterval(interval)
  }

  makeCalls() {
    var {actives, position, duration, pending, successRate, actual, initial, quota, queue, completes, totalCalls} = this.state
    const progress = (quota-pending)/quota
    const completesSum = d3.sum(completes, d => d.value)
    actual = completesSum / Math.max(1, totalCalls)
    successRate = (1-progress) * initial + progress * actual
    queue = Math.floor(pending / successRate)
    const activesSum = d3.sum(actives, d => d.value)
    const queueSize = Math.max(0, queue - activesSum)
    if(position < duration) {
      let calls = Math.min(queueSize, Math.round(Math.random()*75))
      totalCalls += calls
      actives[0].value += calls
    }
    this.setState({actives, queueSize, pending, successRate, actual, totalCalls})
    if(!pending) this.stop()
  }

  nextHour() {
    const {actives, completes, duration, flow, successRate, quota, totalCalls} = this.state
    var {position, pending, mean, dynamic, stats} = this.state
    if(dynamic) {
      mean = d3.mean(actives.filter(d => d && d.value > 0), d => d.value)
    }
    if(position < duration) {
      flow.forEach((step, i, array) => {
        if(actives[step.offset]) {
          switch(step.type) {
            case "sms":
              for (let i = step.offset, j = 1; i < actives.length - 1; i++, j++) {
                let done = Math.min(pending, Math.ceil(actives[i].value * successRate / d3.sum(flow, step => step.type === "discard"? 0 : 1) / j))
                actives[i].value -= done
                completes[i].value += done
                pending -= done
              }
            break
            case "voice":
              if(step.offset) {
                let selection = Math.ceil(Math.min((1 + Math.random()) * mean, actives[step.offset].value))
                actives[step.offset - 1].value += actives[step.offset].value - selection
                actives[step.offset].value = selection
              }
              let done = Math.min(pending, Math.ceil(actives[step.offset].value * successRate / d3.sum(flow, step => step.type === "discard"? 0 : 1)))
              actives[step.offset].value -= done
              completes[step.offset].value += done
              pending -= done
            break
            default:
          }
        }
      })
    } else {
      flow.forEach((step, i, array) => {
        switch(step.type) {
          case "discard":
            break
          default:
              if(step.offset) {
                dynamic = false
                actives[step.offset-1].value += actives[step.offset].value
                actives[step.offset].value = 0
              }
            break
        }
      })
    }
    actives.pop()
    actives.unshift({value:0, id:id})
    position++
    position %= 24
    id++
    const completesSum = d3.sum(completes, d => d.value)
    stats = [
      {value:quota, label:"Target"},
      {value:completesSum, label:"Completes"},
      {value:position < duration? Math.round(Math.random()*completesSum):stats[2].value, label:"Partials"},
      {value:totalCalls, label:"Contacted Respondents"}
    ]
    this.setState({stats, actives, completes, position, pending, mean, dynamic})
  }

  getSize(x) {
    const width = x? this.state.width + x : 660
    const height = x? this.state.height + x : 330
    return {width, height}
  }

  getData() {
    const retriesHistogramReferences = [{label:"Trying", className:"trying"}, {label: "Out of time window", className:"out"}, {label:"Completes", className:"complete"}]
    const quota = 5000
    const pending = 5000
    const initial = 0.02
    const actual = 0
    const successRate = 0.04
    const progress = 0
    const dynamic = true
    const totalCalls = 0
    //const flow = [{type:"voice", delay:0}, {type:"voice", delay:1/6, label:"10m"}, {type:"sms", delay:24, label:"24h"}, {type:"sms", delay:1/6, label:"10m"}, {type:"discard", delay:26, label:"26h"}]
    const flow = [{type:"voice", delay:0}, {type:"voice", delay:10, label:"10h"}, {type:"sms", delay:28, label:"28h"}, {type:"sms", delay:28, label:"28h"}, {type:"discard", delay:28, label:"28h"}]
    const length = d3.sum(flow, step => step.delay? Math.ceil(step.delay) : 1)
    const actives = Array.from({length}, (d, i) => ({value:0}))
    const completes = Array.from({length}, (d, i) => ({value:0}))
    const position = 0
    const duration = 12
    const schedule = {
        blockedDays: [new Date("2019-11-04"), "2019-11-13", "2019-11-22"],
        dayOfWeek: {mon: true, wed: true, tue: null, thu: false, sun: null, sat: null},
        endTime: "18:00:00",
        startTime: "09:00:00",
        timezone: "America/Buenos_Aires"
    }
    const start = new Date()
    const today = new Date(start.getTime() + Math.random() * 45 * 24 * 60 * 60 * 1000)
    const forecasts = [
      {label: "Female 18 - 34", color: "#673ab7", values: this.getValues(start, today)},
      {label: "Female 35 - 49", color: "#009688", values: this.getValues(start, today)},
      {label: "Male 18 - 34", color: "#ffc107", values: this.getValues(start, today)},
      {label: "Male 35 - 49", color: "#ff5722", values: this.getValues(start, today)}
    ]
    const stats = [
      {value:quota, label:"Target"},
      {value:0, label:"Completes"},
      {value:0, label:"Partials"},
      {value:0, label:"Contacted Respondents"}
    ]
    var offset = 0
    flow.forEach(step => {
      offset += step.delay
      step.offset = offset
    })
    return {stats, flow, actives, completes, forecasts, retriesHistogramReferences, position, duration, length, quota, pending, initial, actual, successRate, progress, dynamic, totalCalls}
  }

  getValues(start, today) {
    const days = d3.timeDays(start, today, 1)
    var value = 0
    let values = days.reduce((result, time) => {
      if(value == 100) {
        return result
      } else {
        value += Math.round(Math.random() * 4)
        value = d3.min([value, 100])
        return [...result, {time, value}]
      }
    }, [{time: days.shift(), value: 0}])
    return values
  }

  render() {
    const {actives, completes, pending, successRate, initial, actual, quota, stats, position, duration, width, height, forecasts, flow} = this.state
    const time = new Date(2017, 8, 22, 6+position)
    const hours = position >= duration? 24-position : duration-position
    const timewindows = actives.map(slot => false)

    let offset = 0
    flow.forEach(step => {
      let start = step.offset
      let end = step.offset-Math.max(1, step.delay)

      offset += step.delay
      step.offset = offset

      for (let i = start, j = position; i > end; i--, j++) {
        timewindows[i] = step.type === "discard" || j % 24 < duration
      }
    })

    return (
      <div className="app">
        <div className="header">
          <div className="title">Percent of completes</div>
          <div className="description">Count partials as completed</div>
        </div>
        <Stats data={stats}/>
        <Forecasts data={forecasts} ceil={100} forecast={true}/>
        <hr></hr>
        {/*<div>
          <button onClick={() => this.next()}>Next</button>
          <button onClick={() => this.start()}>Start</button>
          <button onClick={() => this.stop()}>Stop</button>
        </div>*/}
        <div>
          <div className="header">
            <div className="title">Retries histogram</div>
            <div className="description">Number of contacts in each stage of the retry flow</div>
          </div>
          <RetriesHistogram quota={quota} flow={flow} actives={actives} completes={completes} timewindows={timewindows} scheduleDescription={`${d3.timeFormat("%I:%M %p")(time)} ${position >= duration? "starts":"ends"} in ${hours} hour${hours === 1? "" : "s"} (Contact time window 9:00 AM to 6:00 PM ${d3.timeFormat("GMT%Z")(time)})`} references={this.state.retriesHistogramReferences}/>
        </div>
        <hr></hr>
        <div className="double">
          <div>
            <div className="header">
              <div className="title">Success rate</div>
              <div className="description">Estimated by combining initial and current values</div>
            </div>
            <SuccessRate initial={initial} actual={actual} estimated={successRate} progress={(quota-pending)/quota} weight={24}/>
          </div>
          <div>
            <div className="header">
              <div className="title">Queue size</div>
              <div className="description">Amount of respondents that are estimated we need to contact to reach the target completes.<br/>It increases when the success rate decreases and viceversa.</div>
            </div>
            <QueueSize completes={quota-pending} pending={pending} needed={pending*Math.ceil(1/successRate)} missing={0} successRate={successRate} multiplier={Math.ceil(1/successRate)} weight={24}/>
          </div>
        </div>
        <ReactTooltip  place="top" type="dark" effect="solid" className="tooltip"/>

        }
      </div>
    );
  }
}

render(<Demo/>, document.querySelector('#demo'))
