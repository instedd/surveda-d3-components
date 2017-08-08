import React, { Component } from 'react';
import * as d3 from 'd3'
import Donut from './Donut'

const margin = {left:18, top:18, right:18, bottom:18}

class SuccessRate extends Component {

  componentDidMount() {
    this.d3Render(true)
  }

  componentDidUpdate() {
    this.d3Render()
  }

  d3Render(initial = false) {

    const transitionDuration = initial ? 0 : 500

    d3.select(this.refs.line)
      .transition()
      .duration(transitionDuration)
      .attr("transform", "rotate(" + 180*this.props.progress + ")")

     d3.select(this.refs.backgroundLabel)
      .transition()
      .duration(transitionDuration)
      .text(d3.format(".2f")(1-this.props.progress))

     d3.select(this.refs.foregroundLabel)
      .transition()
      .duration(transitionDuration)
      .text(d3.format(".2f")(this.props.progress))
  }
  

  render() {

    const {progress, weight, initial, actual, estimated} = this.props
    const width = this.props.width - margin.left - margin.right
    const height = this.props.height - margin.top - margin.bottom
    const arcRadius = Math.min(width/2, height)
    const donutRadius = arcRadius/4
    const offset = 6
    const progressColor = "#4caf50"
    const initialColor = "#ffc106"
    const actualColor = "#ff5621"
    const backgroundColor = "#d6d6d6"

    return (
      <svg width={width+margin.left+margin.right} height={height+margin.top+margin.bottom}>
        <g ref="container" transform={`translate(${margin.top}, ${margin.left})`}>
          <path ref="background" fill={initialColor} d={`M0 ${arcRadius}
                                                      a${arcRadius} ${arcRadius} 0 1 1 ${arcRadius*2} 0
                                                      l${-weight} 0
                                                      a${arcRadius-weight} ${arcRadius-weight} 0 1 0 ${-arcRadius*2+weight*2} 0
                                                      z`}/>
          <path ref="foreground" fill={actualColor} d={`M${weight} ${arcRadius}
                                                      a${arcRadius-weight/2} ${arcRadius-weight/2} 0 1 1 ${arcRadius*2-weight} 0
                                                      l${-weight} 0
                                                      a${arcRadius-weight} ${arcRadius-weight} 0 1 0 ${-arcRadius*2+weight*2} 0
                                                      z`}/>
          <text className="info" x={arcRadius} y={arcRadius/2 + margin.bottom * 3}>info_outline</text>
          <text x={arcRadius} y={arcRadius/2 + margin.bottom}>estimated success rate</text>
          <text x={arcRadius} y={arcRadius/2} className="percent large">{d3.format(".1%")(estimated)}</text>
          <g transform={`translate(${arcRadius-donutRadius},${arcRadius-donutRadius})`}>
              <Donut value={progress} width={donutRadius*2} height={donutRadius} foreground={progressColor} background={backgroundColor} weight="24" semi/>
              <text x={donutRadius} y={donutRadius} fill={progressColor}>Progress</text>
              <text x={donutRadius} y={donutRadius-margin.bottom} fill={progressColor} className="percent">{d3.format(".1%")(progress)}</text>
          </g>
          <g transform={`translate(${(weight+arcRadius-donutRadius)/2-donutRadius/2},${arcRadius-donutRadius-margin.bottom})`}>
              <Donut value={initial} width={donutRadius} height={donutRadius} foreground={initialColor} background={backgroundColor} weight="12" />
              <text x={donutRadius/2} y={donutRadius + margin.bottom} fill={initialColor}>initial estimated success rate</text>
              <text x={donutRadius/2} y={donutRadius/2} fill={initialColor} className="percent" style={{alignmentBaseline:"middle"}}>{d3.format(".1%")(initial)}</text>
          </g>
          <g transform={`translate(${(arcRadius*3+donutRadius-weight)/2-donutRadius/2},${arcRadius-donutRadius-margin.bottom})`}>
              <Donut value={actual} width={donutRadius} height={donutRadius} foreground={actualColor} background={backgroundColor} weight="12" />
              <text x={donutRadius/2} y={donutRadius + margin.bottom} fill={actualColor}>Actual success rate</text>
              <text x={donutRadius/2} y={donutRadius/2} fill={actualColor} className="percent" style={{alignmentBaseline:"middle"}}>{d3.format(".1%")(actual)}</text>
          </g>
          <g transform={`translate(${arcRadius},${arcRadius})`}>
            <g ref="line" >
              <path className="dottedLine" d={`M${-donutRadius} 0 l${-arcRadius+donutRadius} 0`}/>
              <text ref="backgroundLabel" fill={initialColor} transform={`translate(${-arcRadius-offset}, 0) rotate(-90)`}/>
              <text ref="foregroundLabel" fill={actualColor} transform={`translate(${weight-arcRadius+offset}, 0) rotate(-90)`} style={{alignmentBaseline:"hanging"}}/>
            </g>
          </g>
        </g>
      </svg>
    )
  }
}


export default SuccessRate