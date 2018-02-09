import React, { Component } from 'react'
import * as d3 from 'd3'
import { References } from '.'

const margin = {left:36, top:18, right:18, bottom:36}

export default class Forecasts extends Component {
  constructor(props) {
    super(props)
    this.recalculate = this.recalculate.bind(this)
    this.state = {
      width: 0,
      height: 0
    }
  }

  recalculate() {
    const { container } = this.refs
    const containerRect = container.getBoundingClientRect()

    const width = Math.round(containerRect.width) - margin.left - margin.right
    const height = Math.round(width/2)

    this.setState({width, height})
  }

  componentDidMount() {
    window.addEventListener('resize', this.recalculate)
    this.recalculate()
    this.renderD3(true)
  }

  componentDidUpdate() {
    this.renderD3()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculate)
  }

  renderD3(initial=false) {
    const {data} = this.props
    const {width, height} = this.state
    const flatten = Array.prototype.concat(...data.map(d => [...d.values, ...d.forecast]))
    const x = d3.scaleTime().domain(d3.extent(flatten, d => d.time)).range([0, width])
    const y = d3.scaleLinear().domain([d3.max(flatten, d => d.value), 0]).range([0, height])
    const line = d3.line()
      .x(d => x(d.time))
      .y(d => y(d.value))

    d3.select(this.refs.values)
        .selectAll("path")
        .data(data)
      .enter()
        .append("path")
        .merge(d3.select(this.refs.values).selectAll("path"))
        .attr("class", "line")
        .attr("stroke", d => d.color)
        .datum(d => d.values)
        .attr("d", line)

    d3.select(this.refs.forecasts)
        .selectAll("path")
        .data(data)
      .enter()
        .append("path")
        .merge(d3.select(this.refs.forecasts).selectAll("path"))
        .attr("class", "dotted line")
        .attr("stroke", d => d.color)
        .datum(d => {
          return d.forecast
        })
        .attr("d", line)

    d3.select(this.refs.x)
      .attr("class", "axis")
      .call(d3.axisBottom(x).ticks(width/120))
      .selectAll("text")
      .attr("fill", null)

    d3.select(this.refs.y)
      .attr("class", "axis")
      .call(d3.axisLeft(y).ticks(height/60).tickSizeInner(0).tickFormat(d3.format(".2s")))
      .selectAll("text")
      .attr("fill", null)
      .attr("dy", null)

    d3.select(this.refs.grid)
      .attr("class", "grid")
      .call(d3.axisRight(y).tickSizeInner(width).ticks(height/60))
      .selectAll("text")
      .remove()
  }

  render() {
    const {data} = this.props
    const {width, height} = this.state
    const padding = 6

    return (
      <div className="forecasts" ref='container'>
        <svg ref="svg" width={width + margin.left + margin.right} height={height + margin.top + margin.bottom + padding}>
          <g transform={`translate(${margin.left},${margin.top})`}>
            <g ref="grid"/>
            <g ref="values"/>
            <g ref="forecasts"/>
            <g ref="x" transform={`translate(0,${height})`}/>
            <g ref="y"/>
          </g>
        </svg>
        <div className="bottom">
          <div className="status"><span className="icon">event</span> 3 weeks to complete all quotas</div>
          <References data={data.map(serie => ({label: serie.label, color:serie.color}))}/>
        </div>
      </div>
    )
  }
}
