import React, { Component } from 'react'
import * as d3 from 'd3'

const margin = {left:18, top:18, right:18, bottom:18}

export default class QueueSize extends Component {
 constructor(props) {
    super(props)
    this.recalculate = this.recalculate.bind(this)
    this.state = {
      width: 0,
      height: 0
    }
  }

  componentDidMount() {
    window.addEventListener('resize', this.recalculate)
    this.recalculate()
    this.alignContent()
  }

  componentDidUpdate() {
    this.alignContent()
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.recalculate)
  }

  recalculate() {
    const { container } = this.refs
    const containerRect = container.getBoundingClientRect()

    const width = Math.round(containerRect.width) - margin.left - margin.right
    const height = Math.round(width/2)

    this.setState({width, height})
  }

  alignContent() {
    const height = this.state.height - margin.top - margin.bottom
    const boundingBox = this.refs.content.getBBox()
    const offset = (height-boundingBox.height+this.props.weight)/2-boundingBox.y
    this.refs.content.setAttribute("transform", `translate(0,${offset})`)
  }

  connector(x1, y1, x2, y2, turn, cornerHeight) {
    const direction = x1 < x2? 1 : -1
    const cornerWidth = Math.min(Math.abs(x1-x2)/2, cornerHeight)

    return `M${x1} ${y1}
            v${turn-cornerHeight}
            q0 ${cornerHeight},${cornerWidth*direction} ${cornerHeight}
            h${x2-x1-cornerWidth*2*direction}
            q${cornerWidth*direction} 0,${cornerWidth*direction} ${cornerHeight}
            V${y2}`
  }

  render() {
    const {completes, pending, needed, missing, successRate, multiplier, weight} = this.props
    const width = Math.max(this.state.width - margin.left - margin.right, 0)
    const height = Math.max(this.state.height - margin.top - margin.bottom, 0)
    const scale = Math.min(1, width/needed, width/(completes+pending)/2)
    const offset = 12
    const corner = 6
    const left = {  x1: (completes-pending)*scale/2,
                    y1: weight,
                    x2: -needed*scale/2,
                    y2: height-weight}
    const right = { x1: (completes+pending)*scale/2,
                    y1: weight,
                    x2: needed*scale/2,
                    y2: height-weight}

    return (
      <div ref="container">
        <svg className="queueSize" width={width+margin.left+margin.right} height={height+margin.top+margin.bottom}>
          <g transform={`translate(${margin.top}, ${margin.left})`}>
            <g transform={`translate(${width/2},0)`}>
                <g transform={`translate(${-(pending+completes)*scale/2},0)`}>
                  <rect width={completes*scale} height={weight} className="progress"/>
                  <rect width={pending*scale} height={weight} x={completes*scale} className="background"/>
                  <text x={-offset} y={weight/2} className="progress label end">{completes} Completes</text>
                  <text x={(pending+completes)*scale+offset} y={weight/2} className="background label start">{pending} Pending</text>
                </g>
                <path style={{display:needed? "auto":"none"}} className="dottedLine" d={this.connector(left.x1, left.y1, left.x2, left.y2, weight-(left.x1 > left.x2 && right.x1 > right.x2?corner:0), corner)}/>
                <path style={{display:needed? "auto":"none"}} className="dottedLine" d={this.connector(right.x1, right.y1, right.x2, right.y2, weight, corner)}/>
                <g ref="content">
                  <text className="needed">{`${d3.format(",")(needed)} needed to complete target`}</text>
                  <text className="multiplier" y={18}>{`×${multiplier} (1/${d3.format(".3f")(successRate)} Estimated success rate`})</text>
                  {missing? <text className="missing" y={54} ><tspan className="icon">warning</tspan> {`${d3.format(",")(missing)} missing`}</text> : null}
                </g>
            </g>
            <g transform={`translate(0,${height-weight})`}>
                <rect width={needed*scale} height={weight} x={(width-needed*scale)/2}/>
                {missing? <rect className="missing" width={missing*scale} height={weight} x={width-missing*scale} />:null}
            </g>
          </g>
        </svg>
      </div>
    )
  }
}
