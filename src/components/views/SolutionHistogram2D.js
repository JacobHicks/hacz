import createPlotlyComponent from 'react-plotlyjs';
import Plotly from 'plotly.js/dist/plotly-cartesian';

const React = require('react');

const Plot = createPlotlyComponent(Plotly);

export default class SolutionHistogram2D extends React.Component {
    render() {
        let sampleDataX = [];
        let sampleDataY = [];
        for (let i = 0; i < 1000; i++) {
            sampleDataX[i] = Math.random() * 64000;
            sampleDataY[i] = Math.random() * 1000;
        }

        let data = [
            {
                type: 'histogram2d',
                x: sampleDataX,
                y: sampleDataY,
                autobinx: false,
                autobinY: false,
                opacity: 0.5,
                xbins: {
                    size: 64000/200,
                    start: 0
                },
                ybins: {
                    size: 10,
                    start: 0
                },
                colorscale: [['0', 'rgba(0,0,255,0.1)'],  ['1', 'rgba(255,0,0,1)']],
                showscale: false,
                hovertemplate: '%{y: .0f}ms<br>%{x: .0f}KB<extra></extra>'
            }
        ];
        let layout = {
            xaxis: {
                title: 'Memory Use (KB)',
                showticklabels: false,
                showline: false,
                showgrid: false,
                zeroline: false,
                fixedrange: true,
                tickmode: "array",
                tickvals: []
            },
            yaxis: {
                title: 'Time (ms)',
                showticklabels: false,
                zeroline: false,
                showgrid: false,
                fixedrange: true,
                tickmode: "array",
                tickvals: []
            },
            margin: {
                l: 64,
                r: 32,
                t: 8
            }
        };
        let config = {
            showLink: false,
            displayModeBar: false,
            responsive: true
        };
        return (
            <div style={{display: "inline-block", position: "relative", width: "100%"}}>
                <div style={{marginTop: "50%"}}/>
                <Plot data={data} layout={layout} config={config} onClick={this.onClick} style={{position: "absolute", top: 0, bottom: 0, left: 0, right: 0}}/>
            </div>
        );
    }

    onClick(data) {
        console.log(data.points[0].x);
        console.log(data.points[0].y);
    }
}