import React, { Component } from 'react';
import * as d3 from 'd3'

const margin = {top: 20, right: 70, bottom: 70, left: 30}
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

class Donut extends Component {

  componentDidMount() {
    this.d3Render(true)
  }

  componentDidUpdate() {
    this.d3Render()
  }

  d3Render(initial = false) {
    const { width, height, values } = this.props
    const chartWidth = width - margin.left - margin.right
    const chartHeight = height - margin.top - margin.bottom
    const x = d3.scaleBand()
                .domain(d3.range(values.length))
                .range([0, chartWidth]).paddingInner(0.25).round(true)
    const y = d3.scaleLinear()
                .domain([0, d3.max(values)])
                .range([chartHeight, 0])
    const transitionDuration = initial ? 0 : 250

    const bars = d3.select(this.refs.barsContainer).selectAll(".bar").data(values)
    const xAxis = d3.select(this.refs.xAxis)
    const yAxis = d3.select(this.refs.yAxis)

    bars.enter()
      .append("rect")
      .attr("class", "bar")
      .merge(bars)
      .transition().duration(transitionDuration)
      .attr("x", (d, i) => x(i))
      .attr("width", x.bandwidth())
      .attr("y", d => y(d))
      .attr("height", d => chartHeight - y(d))

    bars.exit()
      .remove()

    xAxis
      .transition().duration(transitionDuration)
      .attr("transform", `translate(0, ${chartHeight})`)
      .call(d3.axisBottom(x).tickFormat(this.dateFormat))

    xAxis.selectAll(".tick text")
      .attr("transform", "rotate(-90)")
      .attr("dx", "-1em")
      .attr("dy", "-0.3em")
      .style("text-anchor", "end")

    yAxis
      .transition().duration(transitionDuration)
      .attr("transform", `translate(${chartWidth}, 0)`)
      .call(d3.axisRight(y))
  }


  dateFormat(d) {
    return MONTHS[d % 12]
  }

  render() {
    const {width, height} = this.props

    return (
      <svg width={width} height={height}>
        <g ref="container" transform={`translate(${margin.left}, ${margin.top})`}>
          <g ref="barsContainer" />
          <g className="x axis" ref="xAxis" />
          <g className="y axis" ref="yAxis" />
        </g>
      </svg>
    )
  }
}


export default Donut
