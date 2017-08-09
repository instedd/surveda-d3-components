import React, { Component } from 'react';
import * as d3 from 'd3'
import './QueueSize.css';


const margin = {left:18, top:18, right:18, bottom:18}

class QueueSize extends Component {  

  componentDidMount() {
    this.alignContent()
  }

  componentDidUpdate() {
    this.alignContent()
  }

  alignContent() {
    const height = this.props.height - margin.top - margin.bottom
    const boundingBox = this.refs.content.getBBox()
    const offset = (height-boundingBox.height+this.props.weight)/2-boundingBox.y
    this.refs.content.setAttribute("transform", `translate(0,${offset})`)
  }

  render() {

    const {completes, pending, needed, missing, successRate, multiplier, weight} = this.props
    const width = this.props.width - margin.left - margin.right
    const height = this.props.height - margin.top - margin.bottom
    const scale = width/needed
    const offset = 12
    const corner = 6

    return (
      <svg className="queueSize" width={width+margin.left+margin.right} height={height+margin.top+margin.bottom}>
        <g transform={`translate(${margin.top}, ${margin.left})`}>
          <g transform={`translate(${(width-pending*scale)/2},0)`}>
              <rect width={pending*scale} height={weight} className="background"/>
              <rect width={completes*scale} height={weight} x={-completes*scale} className="progress"/>
              <text x={-completes*scale-offset} y={weight/2} className="progress label end">{completes} Completes</text>
              <text x={pending*scale+offset} y={weight/2} className="background label start">{pending} Pending</text>
              <path className="dottedLine" d={`M0 0
                                                v${weight-corner}
                                                q0 ${corner},${-corner} ${corner}
                                                h${-(width-pending*scale)/2+corner*2}
                                                q${-corner} 0,${-corner} ${corner}
                                                v${height-weight*3}`} transform={`translate(0,${weight})`}/>
              <path className="dottedLine" d={`M0 0
                                                v${weight-corner}
                                                q0 ${corner},${corner} ${corner}
                                                h${(width-pending*scale)/2-corner*2}
                                                q${corner} 0,${corner} ${corner}
                                                v${height-weight*3}`} transform={`translate(${pending*scale},${weight})`}/>
              <g ref="content">
                <text className="needed">{`${d3.format(".3s")(needed)} needed to complete target`}</text>
                <text className="multiplier" y={18}>{`×${multiplier} (1/${successRate} Estimated success rate`})</text>
                {missing? <text className="missing" y={54} ><tspan className="icon">warning</tspan> {`${d3.format(".3s")(missing)} missing`}</text> : null}
              </g>
          </g>
          <g transform={`translate(0,${height-weight})`}>
              <rect width={width} height={weight}/>
              {missing? <rect className="missing" width={missing*scale} height={weight} x={width-missing*scale} />:null}
          </g>
        </g>
      </svg>
    )
  }
}


export default QueueSize