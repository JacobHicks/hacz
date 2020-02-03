import createPlotlyComponent from 'react-plotlyjs';
import Plotly from 'plotly.js/dist/plotly-cartesian';
import {Modal} from "antd";
import "./Histogram.css";

const React = require('react');
const serverIp = 'http://76.183.184.63:5000';

const Plot = createPlotlyComponent(Plotly);

export default class SolutionHistogram1D extends React.Component {
    constructor(props) {
        super(props);
        this.onClick = this.onClick.bind(this);
        this.disableSample = this.disableSample.bind(this);
        this.state = {
            sampleShowing: false,
            sampleCode: "",
            time: -1
        }
    }

    render() {
        if(this.props.data !== undefined && this.props.data.length !== 0) {
            let expadedData = [];
            let highlighted = [];
            for(let i = 0; i < this.props.data.length; i++) {
                for (let x = 0; x < this.props.data[i]; x++) {
                    if(i === this.props.speed) {
                        console.log(i);
                        highlighted.push(i);
                    }
                    else {
                        expadedData.push(i);
                    }
                }
            }

            let data = [
                {
                    type: 'histogram',
                    x: expadedData,
                    autobinx: false,
                    marker: {
                        color: this.props.type === "time" ? "rgba(47, 84, 235, 0.8)" : "rgba(212, 136, 6, 0.8)",
                        line: {
                            color: this.props.type === "time" ? "rgba(47, 84, 235, 1)" : "rgba(212, 136, 6, 1)",
                            width: 1
                        }
                    },
                    opacity: 0.5,
                    xbins: {
                        end: this.props.data.length,
                        size: 10,
                        start: 0
                    },
                    hoverinfo: "x"
                },

                {
                    x: highlighted,
                    type: "histogram",
                    opacity: 1,
                    marker: {
                        color: '#ffec3d'
                    },
                    xbins: {
                        end: this.props.data.length,
                        size: 10,
                        start: 0
                    },
                    hoverinfo: "x"
                }
            ];
            let layout = {
                xaxis: {
                    title: this.props.type === "time" ? 'Time (ms)' : 'Memory Use (KB)',
                    showticklabels: true,
                    fixedrange: true,
                    range: [0, this.props.data.length]
                },
                yaxis: {
                    title: '# of Submissions',
                    showticklabels: false,
                    showgrid: false,
                    fixedrange: true
                },
                margin: {
                    l: 48,
                    r: 32,
                    t: 0,
                    b: 40
                },
                showlegend: false
            };
            let config = {
                showLink: false,
                displayModeBar: false,
                responsive: true
            };
            return (
                <div style={{display: "inline-block", position: "relative", width: "100%"}}>
                    <Modal
                        title={"Sample code (" + this.state.time + "ms)"}
                        visible={this.state.sampleShowing}
                        onCancel={this.disableSample}
                        footer={null}
                        className="modal"
                    >
                        <pre className="sample">
                            {this.state.sampleCode}
                        </pre>
                    </Modal>
                    <div style={{marginTop: "25%"}}/>
                    <Plot data={data} layout={layout} config={config} onClick={this.onClick}
                          style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}/>
                </div>
            );
        }
        return <div/>
    }

    onClick = data => {
        let time = data.points[0].x;
        fetch(serverIp + "/solution/" + this.props.id + "/time/" + time, {
            credentials: 'include'
        }).then(response => response.json())
            .then(data => {
                this.setState({
                    sampleShowing: true,
                    sampleCode: data[0],
                    time: time
                })
            })
    };

    disableSample() {
        this.setState({
            sampleShowing: false
        })
    }
}