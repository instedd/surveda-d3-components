import React, { Component } from 'react';
import * as d3 from 'd3'
import Donut from './Donut'
import './SuccessRate.css';

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

    return (
      <svg className="successRate" width={width+margin.left+margin.right} height={height+margin.top+margin.bottom}>
        <g ref="arc" transform={`translate(${(width+margin.left+margin.right-arcRadius*2)/2}, ${(height+margin.top+margin.bottom-arcRadius)/2})`}>
          <path className="initial" d={`M0 ${arcRadius}
                                                      a${arcRadius} ${arcRadius} 0 1 1 ${arcRadius*2} 0
                                                      h${-weight}
                                                      a${arcRadius-weight} ${arcRadius-weight} 0 1 0 ${-arcRadius*2+weight*2} 0
                                                      z`}/>
          <path className="actual" d={`M${weight} ${arcRadius}
                                                      a${arcRadius-weight/2} ${arcRadius-weight/2} 0 1 1 ${arcRadius*2-weight} 0
                                                      h${-weight} 0
                                                      a${arcRadius-weight} ${arcRadius-weight} 0 1 0 ${-arcRadius*2+weight*2} 0
                                                      z`}/>
          <text className="icon" x={arcRadius} y={arcRadius/2 + margin.bottom * 3}>info_outline</text>
          <text x={arcRadius} y={arcRadius/2 + margin.bottom} className="label">estimated success rate</text>
          <text x={arcRadius} y={arcRadius/2} className="percent large">{d3.format(".1%")(estimated)}</text>
          <g ref="progress" transform={`translate(${arcRadius-donutRadius},${arcRadius-donutRadius})`}>
              <Donut value={progress} width={donutRadius*2} height={donutRadius} color="progress" weight="24" semi/>
              <text x={donutRadius} y={donutRadius} className="progress label">Progress</text>
              <text x={donutRadius} y={donutRadius-margin.bottom} className="progress percent">{d3.format(".1%")(progress)}</text>
          </g>
          <g ref="initial" transform={`translate(${(weight+arcRadius-donutRadius)/2-donutRadius/2},${arcRadius-donutRadius-margin.bottom})`}>
              <Donut value={initial} width={donutRadius} height={donutRadius} color="initial" weight="12" />
              <text x={donutRadius/2} y={donutRadius + margin.bottom} className="initial label">initial success rate</text>
              <text x={donutRadius/2} y={donutRadius/2} className="initial percent middle">{d3.format(".1%")(initial)}</text>
          </g>
          <g ref="actual" transform={`translate(${(arcRadius*3+donutRadius-weight)/2-donutRadius/2},${arcRadius-donutRadius-margin.bottom})`}>
              <Donut value={actual} width={donutRadius} height={donutRadius} color="actual" weight="12" />
              <text x={donutRadius/2} y={donutRadius + margin.bottom} className="actual label">Actual success rate</text>
              <text x={donutRadius/2} y={donutRadius/2} className="actual percent middle">{d3.format(".1%")(actual)}</text>
          </g>
          <g transform={`translate(${arcRadius},${arcRadius})`}>
            <g ref="line" >
              <path className="dottedLine" d={`M${-donutRadius} 0 h${-arcRadius+donutRadius}`}/>
              <text ref="backgroundLabel" className="initial label" transform={`translate(${-arcRadius-offset}, 0) rotate(-90)`}/>
              <text ref="foregroundLabel" className="actual label hanging" transform={`translate(${weight-arcRadius+offset}, 0) rotate(-90)`}/>
            </g>
          </g>
        </g>
      </svg>
    )
  }
}


export default SuccessRate