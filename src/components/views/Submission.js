import {Layout, Col, Row, Icon, Breadcrumb} from "antd";
import NavBar from "./NavBar";
import Foot from "./Foot";
import {UnControlled as Code} from 'react-codemirror2'
import "./Submission.css";
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/mdn-like.css';
import {Link, Redirect} from "react-router-dom";
import SolutionHistogram1D from "./SolutionHistogram1D";

const React = require('react');
const {Content} = Layout;
const serverIp = 'http://76.183.184.63:5000'; //IP of server here 76.183.184.63

require("codemirror/mode/clike/clike");

const CodeMirrorOptions = {
    lineNumbers: false,
    readOnly: "nocursor",
    mode: "text/x-java",
    theme: "mdn-like"
};

export default class Submission extends React.Component {
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.state = {
            id: -1,
            data: {},
            times: [],
            isLoading: true
        };
    }

    componentDidMount() {
        const {params} = this.props.match;
        this.setState({
            isLoading: true,
            id: params.id
        });

        fetch(serverIp + "/submission/" + params.id, {
            credentials: 'include'
        })
            .then(response => {
                if (response.status === 200) {
                    response.json().then(data => {
                        this.setState({
                            data: data,
                            isLoading: false
                        }, () => {
                            if (this.state.data.problemId !== undefined) {
                                fetch(serverIp + "/solution/" + this.state.data.problemId + "/time", {
                                    credentials: 'include'
                                }).then(response => {
                                    if(response.status === 200) {
                                        response.json().then(data => {
                                            this.setState({
                                                times: data
                                            })
                                        })
                                    }
                                })
                            }
                        })
                    });
                }
                else if (response.status === 404) {
                    this.setState({
                        isLoading: false
                    })
                }
            })
    }

    render() {
        if (!this.state.isLoading) {
            let verdicts = [];
            if(this.state.data.verdicts !== undefined) {
                if (this.state.data.verdicts !== null) {
                    for (let i = 1; this.state.data.verdicts[i] !== undefined; i++) {
                        verdicts.push(
                            <Col span={4} style={{marginTop: 10}} key={i - 1}>
                                <div className="testCaseDisplay"
                                     style={{background: this.state.data.verdicts[i][0] === "correct" ? "#b7eb8f" : "#ffa39e"}}
                                >
                                    <div className="testCaseTitleText">
                                        Testcase #{i}
                                        <div style={{
                                            lineHeight: "40px",
                                            color: this.state.data.verdicts[i][0] === "correct" ? "#092b00" : "#5c0011"
                                        }}>
                                            <Icon type={this.getIcon(this.state.data.verdicts[i][0])}/>
                                        </div>
                                    </div>
                                </div>
                            </Col>
                        );
                    }
                }
            }

            return (
                <Layout style={{minHeight: "100vh"}}>
                    {this.renderRedirect()}
                    {this.renderRefresh()}
                    <NavBar onLogin={this.refresh} onLogout={this.refresh}/>
                    <Content style={{marginLeft: 32, marginRight: 32}}>
                        <Breadcrumb style={{marginTop: "6px"}}>
                            <Breadcrumb.Item>
                                <Link to="/train/"> Train </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <Link to={"/problem/" + this.state.data.problemId}>{this.state.data.problemName}</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>Submissions</Breadcrumb.Item>
                            <Breadcrumb.Item>{this.state.id}</Breadcrumb.Item>
                        </Breadcrumb>

                        <div className="submissionField">
                            <div className="header">
                                <div className="idText">{this.state.id}</div>
                                <div className="titleText">
                                    : {"Submission for \"" + this.state.data.problemName + "\""}
                                </div>
                            </div>
                            <div className="submissionContent">
                                <div style={{marginTop: 8}}>
                                    <div className="codeHeader">
                                        <div className="codeHeaderText">
                                            Code
                                        </div>
                                    </div>
                                    <div className="codeContent">
                                        <Code
                                            value={this.state.data.code}
                                            options={CodeMirrorOptions}
                                        />
                                    </div>
                                </div>

                                <div style={{marginTop: 8}}>
                                    <Row gutter={8}>
                                        {verdicts}
                                    </Row>
                                </div>
                            </div>
                            {
                                this.state.times !== undefined ?
                                <div style={{margin: "0 8px"}}>
                                    <SolutionHistogram1D type="time" data={this.state.times}
                                                         id={this.state.data.problemId}
                                                         speed={this.state.data.speed}/>
                                </div>
                                : null
                            }
                        </div>
                    </Content>
                    <Foot/>
                </Layout>
            );

        } else {
            return (
                <div>Loading...</div> //TODO: skeleton
            )
        }
    }

    renderRedirect() {
        console.log(this.state);
        if (this.state.data.problemId !== null && this.state.data.code === null) {
            return <Redirect to={"/problem/" + this.state.data.problemId}/>
        }
        else if (this.state.isLoading && this.state.data.problemId === undefined) {
            return <Redirect to="/train"/>
        }
    }

    getIcon(s) {
        if (s === "correct") return "check";
        else if (s === "wrong") return "close";
        else if (s === "error") return "exclamation";
        else if (s === "tle") return "clock-circle";
        else if (s === "mle") return "database";
        else if (s === "hack") return "stop";
        else return "question";
    }

    renderRefresh() {
        if (this.state.refresh) {
            this.setState({
                refresh: false
            });
            window.location.reload();
        }
    }

    refresh() {
        this.setState({
            refresh: true
        });
    }
}