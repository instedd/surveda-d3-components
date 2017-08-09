import React, { Component } from 'react';
import * as d3 from 'd3'
import './Donut.css';

class Donut extends Component {

  componentDidMount() {
    this.d3Render(true)
  }

  componentDidUpdate() {
    this.d3Render()
  }

  d3Render(initial = false) {

    const { width, height, value, semi, weight} = this.props
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
                .attr("d", arc)

      d3.select(this.refs.foreground)
                .datum({endAngle: angle - offset})
                .attr("d", arc)
    } else {
       d3.select(this.refs.background)
                .transition()
                .duration(transitionDuration)
                .attrTween("d", arcTween(tau - offset))

      d3.select(this.refs.foreground)
                .transition()
                .duration(transitionDuration)
                .attrTween("d", arcTween(angle - offset))
    }
  }
  

  render() {

    const {width, height, semi, color} = this.props
    const radius = Math.min(width/2, semi?height : height/2)

    return (
      <svg className="donut" width={width} height={height}>
        <g ref="container" transform={`translate(${radius}, ${radius})`}>
          <path className="background" ref="background"/>
          <path className={color} ref="foreground"/>
        </g>
      </svg>
    )
  }
}


export default Donut