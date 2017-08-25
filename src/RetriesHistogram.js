import React, { Component } from 'react'
import * as d3 from 'd3'
import './RetriesHistogram.css'
import References from './References'

const margin = {left:36, top:36, right:18, bottom:18}
const fix = -1

class RetriesHistogram extends Component {  

  constructor(props) {
    super(props)
    this.state = this.calculateSize(props)
  }

  componentWillReceiveProps(nextProps) {
    this.setState(this.calculateSize(nextProps))
  }

  calculateSize(props) {
    const {duration, position, quota} = this.props
    const schedule = props.schedule.map(step => ({...step, delay:Math.ceil(step.delay)}))
    const timewindows = props.actives.map(slot => false)
    const actives = props.actives.map(slot => ({...slot}))
    const completes = props.completes.map(slot => ({...slot}))
    const width = props.width - margin.left - margin.right
    const activesHeight = 72
    const yActives = d3.scaleLinear().domain([Math.max(quota / d3.sum(schedule, step => step.type === "discard"? 0 : 1), d3.max(actives, d => d.value)), 0]).range([0, activesHeight])
    const completesHeight = activesHeight - yActives(d3.max(completes, d => d.value))
    const yCompletes = d3.scaleLinear().domain([d3.max(completes, d => d.value), 0]).range([0, completesHeight])
    const percent = 84 / width
    const delay = d3.sum(schedule, step => step.delay) * percent
    const count = d3.sum(schedule, step => step.delay < delay && step.delay? 1 : 0)
    const valid = d3.sum(schedule, step => step.delay > delay? step.delay : 0)
    const min = Math.ceil(valid * percent / (1 - percent * count))
    
    var offset = 0
    schedule.forEach(step => {
      let start = step.offset
      let end = step.offset-Math.max(1, step.delay)
      let length = step.delay? Math.max(0, min-step.delay) : 0
      step.delay += length
      offset += step.delay
      step.offset = offset
      for (let i = start, j = position; i > end; i--, j++) {
        timewindows[i] = step.type === "discard" || j % 24 < duration
      }
      if(length) {
        let insert = step.offset-step.delay+1
        timewindows.splice(insert, 0, ...new Array(length).fill(timewindows[insert]))
        actives.splice(insert, 0, ...new Array(length).fill({value:fix}))
        completes.splice(insert, 0, ...new Array(length).fill({value:fix}))
      }
    })
    const x = d3.scaleBand().domain(d3.range(0, d3.sum(schedule, step => step.delay)+1, 1)).rangeRound([0, width]).padding(0.1)

    return {actives, completes, schedule, width, activesHeight, completesHeight, x, yActives, yCompletes, timewindows}
  }

  componentDidMount() {
    this.renderD3(true)
  }

  componentDidUpdate() {
    this.renderD3()
  }

  handleMouseOver(e) {
    console.log(e.target.getAttribute("data"))
  }

  renderD3(initial=false) {

    const {x, yActives, actives} = this.state

    d3.select(this.refs.axis)
      .call(d3.axisLeft(yActives).ticks(3).tickSizeInner(0).tickFormat(d3.format(",")))
      .selectAll("text")
      .attr("fill", null)
      .attr("dy", null)

    d3.select(this.refs.grid)
      .call(d3.axisRight(yActives).ticks(3).tickSizeInner(actives.length*x.step()-1))
      .selectAll("text")
      .remove()
  }

  icon(type) {
    switch(type){
      case "voice":
        return "phone"
      case "sms":
        return "sms"
      case "discard":
        return "close"
      default:
        return "broken_image"
    }
  }

  arrow(label, width) {
    const padding = 24
    const size = 6

    return (
      <g>
        <path className="arrow" d={`M${-padding} 0
                                      l-5 5
                                      v-4
                                      h${-width + padding * 2 + size}
                                      v-2
                                      h${width - padding * 2 - size}
                                      v-4
                                      z`}/>
        <text x={-width/2} y={-6} className="label">{label}</text>
      </g>
    )
  }

  rect(x, y, width, height) {
    return `M${x} ${y}h${width}v${height}h${-width}z`
  }

  render() {
    const {references,duration, position, time, scheduleWindow} = this.props
    const {width, completesHeight, activesHeight, schedule, actives, completes, x, yActives, yCompletes, timewindows} = this.state
    const padding = 6
    const hours = position >= duration? 24-position : duration-position

    return (
      <div className="retriesHistogram" style={{width:width+margin.left+margin.right}} >
        <svg ref="svg" width={width+margin.left+margin.right} height={activesHeight+completesHeight+margin.top+margin.bottom+padding}>
          <g transform={`translate(${margin.left},${margin.top})`}>
            <g ref="actives">
              {
                actives.map((slot, index) => {

                let {position, duration} = this.props
                let isFix = slot.value === fix
                let isDiscard = schedule.some(step => step.offset === index && step.type === "discard")
                let isTrying = schedule.some(step => step.offset === index) && position < duration
                let className = "bar " + (isFix? "fix" : (isDiscard? "red" : (isTrying? "trying" : "standby")))

                  return (<rect key={index} 
                                className={className}
                                x={x(index)}
                                y={slot.value === fix? 0 : yActives(slot.value)}
                                width={slot.value === fix? x.step() : x.bandwidth()}
                                height={slot.value === fix? activesHeight : activesHeight - yActives(slot.value)}
                                data={slot.id}
                                onMouseEnter={slot.value === fix? null : this.handleMouseOver}/>)
                })
              }
            </g>
            <g ref="timewindows">
              <path fillRule="evenodd"
                    className="out"
                    d={this.rect(x(0), 0, timewindows.length * x.step(), activesHeight).concat(timewindows.map((slot, index, array) => {
                        return (slot? this.rect(x(index) + 1, 0, x.step() - (array[index + 1]? 0 : 1), activesHeight):"")
                      }).join(""))
                    }/>
            </g>
            <g ref="completes" transform={`translate(0,${activesHeight+padding})`}>
              {
                completes.map((slot, index) => {
                  return (<rect key={index} 
                                className="bar complete"
                                x={x(index)}
                                y={slot.value === fix? completesHeight : yCompletes(slot.value)}
                                width={x.bandwidth()}
                                height={slot.value === fix? 0 : completesHeight - yCompletes(slot.value)}/>)
                })
              }
            </g>
            <g ref="axis" transform={`translate(${x(0)},0)`}/>
            <g ref="grid" transform={`translate(${x(0)},-1)`}/>
            <g ref="schedule"transform={`translate(${x.step()/2},${-margin.top/2})`}>
              {
                schedule.map((step, index) => {
                  const {position, duration} = this.props
                  let isDiscard = step.type === "discard" && actives[step.offset].value
                  let isTrying = actives[step.offset].value > 0 && position < duration
                  let state = (isDiscard? "red" : (isTrying? "trying" : ""))
                  return (<g key={index} transform={`translate(${x(step.offset)},0)`}>
                    <text className={`icon ${state}`}>{this.icon(step.type)}</text>
                    {step.delay ? this.arrow(step.label, step.delay * x.step()) : null}
                    <path className={`dottedLine ${state}`} transform={`translate(0, ${margin.top/2-padding})`} d={`M0 0v${activesHeight+padding*2}`}/>
                  </g>)})
              }
            </g>
          </g>
        </svg>
        <div className="bottom">
          <div className="status"><span className="icon">access_time</span>{`${d3.timeFormat("%I:%M %p")(time)} ${position >= duration? "starts":"ends"} in ${hours} hour${hours === 1? "" : "s"} (${scheduleWindow} ${d3.timeFormat("GMT%Z")(time)}) `}</div>
          <References data={references}/>
        </div>
      </div>
    )
  }
}


export default RetriesHistogram