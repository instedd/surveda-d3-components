import React, { Component } from 'react';
import * as d3 from 'd3'
import './RetriesHistogram.css';


const margin = {left:18, top:36, right:18, bottom:18}
const references = [{label:"Trying", className:"trying"}, {label: "Stand by", className:"standby"}, {label:"Completes", className:"completes"}, {label: "Time window surveys", className: "timewindow"}]

class RetriesHistogram extends Component {  

  constructor(props) {
    super(props)
    this.state = this.calculateSize(props)
  }

  componentWillReceiveProps(nextProps) {

    this.setState(this.calculateSize(nextProps))
  }

  calculateSize(props) {
    var offset = 0
    props.schedule.forEach(step => {
      step.delay = step.delay || 0
      offset += step.delay
      step.offset = offset
    })
    const width = props.width - margin.left - margin.right
    const x = d3.scaleBand().domain(d3.range(0, d3.sum(props.schedule, item => item.delay)+1, 1)).rangeRound([0, width]).padding(0.1)
    const activesHeight = 72
    const yActives = d3.scaleLinear().domain([d3.max(props.values), 0]).range([0, activesHeight])
    const completesHeight = activesHeight - yActives(d3.max(props.completes))
    const yCompletes = d3.scaleLinear().domain([d3.max(props.completes), 0]).range([0, completesHeight])
    return {width, activesHeight, completesHeight, x, yActives, yCompletes}
  }

  componentDidMount() {
    this.renderD3(true)
  }

  componentDidUpdate() {
    this.renderD3()
  }

  renderD3(initial=false) {

    const {values, schedule, completes} = this.props
    const {x, yActives, yCompletes, activesHeight, completesHeight} = this.state
    
    d3.select(this.refs.masks)
      .selectAll(".mask")
      .data(schedule)
    .enter().append("rect")
      .attr("class", "mask")
      .merge(d3.select(this.refs.masks).selectAll(".mask"))
      .attr("x", d => (d.offset - d.delay + 1) * x.step())
      .attr("width", d => d.delay? (d.delay - 1) * x.step() - 1 : 0)
      .attr("height", activesHeight);
    
    d3.select(this.refs.bars)
      .selectAll(".bar")
      .data(values)
    .enter().append("rect")
      .attr("class", (d, i) => {
        return schedule.some(step => step.offset === i)? "bar trying" : "bar standby"
      })
      .merge(d3.select(this.refs.bars).selectAll(".bar"))
      .attr("x", (d, i) => x(i))
      .attr("y", d => yActives(d))
      .attr("width", x.bandwidth())
      .attr("height", d => activesHeight - yActives(d));

    d3.select(this.refs.completes)
      .selectAll(".bar")
      .data(completes)
    .enter().append("rect")
      .attr("class", "bar complete")
      .merge(d3.select(this.refs.completes).selectAll(".bar"))
      .attr("x", (d, i) => x(i))
      .attr("width", x.bandwidth())
      .attr("y", d => yCompletes(d))
      .attr("height", d => completesHeight - yCompletes(d));

    d3.select(this.refs.axis)
      .call(d3.axisLeft(yActives).ticks(3).tickSizeInner(0))
      .selectAll("text")
      .attr("fill", null)
      .attr("dy", null)

    d3.select(this.refs.grid)
      .call(d3.axisRight(yActives).ticks(3).tickSizeInner(values.length*x.step()-1))
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

  render() {
    const {schedule, values} = this.props
    const {width, completesHeight, activesHeight, x} = this.state
    const padding = 6

    return (
      <div className="retriesHistogram" style={{width:width+margin.left+margin.right}} >
        <svg ref="svg" width={width+margin.left+margin.right} height={activesHeight+completesHeight+margin.top+margin.bottom+padding}>
          <g transform={`translate(${margin.left},${margin.top})`}>
            <g ref="schedule"transform={`translate(0,${-margin.top/2})`}>
              {
                schedule.map((step, index) => {
                  return (
                    <g key={index} transform={`translate(${x(step.offset)},0)`}>
                      <text className={values[step.offset]? "icon trying" : "icon"}>{this.icon(step.type)}</text>
                      {step.delay ? this.arrow(step.label, step.delay * x.step()) : null}
                    </g>
                  )
                })
              }
            </g>
            <g ref="masks" transform={`translate(${x(0)},0)`}/>
            <g ref="bars"/>
            <g ref="axis" transform={`translate(${x(0)},0)`}/>
            <g ref="grid" transform={`translate(${x(0)},-1)`}/>
            <g ref="completes" transform={`translate(0,${activesHeight+padding})`}/>
          </g>
        </svg>
        <div className="references">
          <div className="timewindowStatus"><span className="icon">access_time</span> Contact time window 6:00 AM to 6:00 PM (ends in 11 hours)</div>
          <div>
            {

              references.map((reference, index, array) => {
                
                return (
                  <div key={index} className="reference"><div  className={`circle ${reference.className}`}/>{reference.label}</div>
                )
              })
            }
          </div>
        </div>
      </div>
    )
  }
}


export default RetriesHistogram