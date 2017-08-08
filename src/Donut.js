import React, { Component } from 'react';
import * as d3 from 'd3'


class Donut extends Component {

  componentDidMount() {
    this.d3Render(true)
  }

  componentDidUpdate() {
    this.d3Render()
  }

  d3Render(initial = false) {

    const { width, height, value, semi, weight, background, foreground } = this.props
    const tau = Math.PI * (semi? 1 : 2)
    const radius = Math.min(width/2, semi?height : height/2)
    const transitionDuration = initial ? 0 : 500
    const angle = value * tau
    const offset = semi? tau/2 : 0

    const arc = d3.arc()
                  .outerRadius(radius)
                  .innerRadius(radius - weight)
                  .startAngle(-offset)

    var arcTween = function(newAngle) {
      return function(d) {
        var interpolate = d3.interpolate(d.endAngle, newAngle)
        return function(t) {
          d.endAngle = interpolate(t)
          return arc(d)
        }
      }
    }

    if(initial) {
      d3.select(this.refs.background)
                .datum({endAngle: tau - offset})
                .style("fill", background)
                .attr("d", arc)

      d3.select(this.refs.foreground)
                .datum({endAngle: angle - offset})
                .style("fill", foreground)
                .attr("d", arc)
    } else {
       d3.select(this.refs.background)
                .style("fill", background)
                .transition()
                .duration(transitionDuration)
                .attrTween("d", arcTween(tau - offset))

      d3.select(this.refs.foreground)
                .style("fill", foreground)
                .transition()
                .duration(transitionDuration)
                .attrTween("d", arcTween(angle - offset))
    }
  }
  

  render() {

    const {width, height, semi} = this.props
    const radius = Math.min(width/2, semi?height : height/2)

    return (
      <svg width={width} height={height}>
        <g ref="container" transform={`translate(${radius}, ${radius})`}>
          <path ref="background"/>
          <path ref="foreground"/>
        </g>
      </svg>
    )
  }
}


export default Donut