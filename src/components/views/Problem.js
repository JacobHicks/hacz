import {Layout, Breadcrumb, notification, Spin, Skeleton, Row, Col, Tooltip, Tag, Popconfirm} from 'antd';
import {Link, Redirect} from 'react-router-dom'
import 'antd/dist/antd.css';
import 'katex/dist/katex.min.css';
import './Problem.css';

import {
    Upload, message, Button, Icon,
} from 'antd';
import NavBar from "./NavBar";
import Foot from "./Foot";

const React = require('react');
const Latex = require('react-latex');
const {Content} = Layout;
const serverIp = 'http://76.183.184.63:5000'; //IP of server here 76.183.184.63

const uploadprop = {
    name: 'file',
    withCredentials: true
};

export default class Problem extends React.Component {

    constructor(props) {
        super(props);
        this.onLogin = this.onLogin.bind(this);
        this.onLogout = this.onLogout.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.editRedirect = this.editRedirect.bind(this);
        this.delete = this.delete.bind(this);
        this.state = {
            info: {},
            tags: [],
            collapsed: true,
            isLoading: false,
            requesting: false,
            solved: false,
            problem: -1,
            setInfo: [],
            username: "",
            redirectEdit: false
        };
    }

    componentDidMount() {
        const {params} = this.props.match;
        this.setState({
            isLoading: true,
            id: params.id,
            set: params.set
        });

        fetch(serverIp + '/problem/' + params.id, {
            credentials: 'include'
        })
            .then(response => {
                if(response.status === 200) {
                    let data = response.json();
                    this.setState({
                        info: data,
                        collapsed: true,
                        isLoading: false
                    }, this.onLogin);
                }
                else if(response.status === 403) { //TODO show message on redirect
                    this.setState({
                        redirectTrain: true,
                        isLoading: false
                    });
                }
                else if(response.status === 404) {
                    this.setState({
                        redirectTrain: true,
                        isLoading: false
                    });
                }
            });
    }

    onLogin() {
        if (this.state.id !== undefined) {

            if(this.state.set === undefined) {
                fetch(serverIp + '/problem/' + this.state.id, {
                    credentials: 'include'
                })
                    .then(response => response.json())
                    .then(data => {
                        this.setState({
                            info: data
                        })
                    });
            }
            else {
                fetch(serverIp + "/set/" + this.state.set + '/problem/' + this.state.id, {
                    credentials: 'include'
                })
                    .then(response => response.json())
                    .then(data => {
                        this.setState({
                            info: data
                        })
                    });
            }

            fetch(serverIp + "/userSubmissions/" + this.state.id, {
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        submissions: data
                    })
                });
            this.getTags();
            fetch(serverIp + "/isSolved/" + this.state.id, {
                credentials: 'include'
            }).then(response => response.json())
                .then(data => this.setState({
                    solved: data[0] === "true"
                }));
        }
    }

    onLogout() {
        let newInfo = this.state.info;
        newInfo.testCases = [];
        this.setState({
            info: newInfo,
            submissions: [],
            solved: false,
            username: ""
        });
        this.getTags();
    }

    onUpload = (props) => {
        if (props.file.status === 'done') {
            message.success("File uploaded", 2);
            window.scrollTo(0, 0);
            let AC = true;
            let valid = false;
            let updatePromises = [];
            let newInfo = this.state.info;
            newInfo.testCases = [];

            const preCheck = async () => {
                this.setState({
                    requesting: true
                });
                const response = await fetch(serverIp + '/update/', {
                    credentials: 'include'
                });
                const check = await response.json();
                if (check[0] === "valid") {
                    valid = true;
                } else if (check[0] === "badcomp") {
                    message.error("Compilation error");
                } else if (check[0] === "badlang") {
                    message.error("File type not supported")
                } else if (check[0] === "badserver") {
                    message.error("Judging server could not be reached")
                } else if (check[0] === "badid") {
                    message.error("Invalid problem id")
                } else if (check[0] === "badsize") {
                    message.error("Submission file sizes must be under 1 MB")
                } else if (check[0] === "badname") {
                    message.error("Submission file name must not start with a special character")
                }
                if (!valid) {
                    this.setState({
                        requesting: false
                    })
                }
            };

            updatePromises.push(preCheck());
            Promise.all(updatePromises).then(() => {
                if (valid) {
                    const updateRequest = async () => {
                        let newCase = [];
                        this.setState({
                            info: newInfo
                        });
                        const response = await fetch(serverIp + '/update/', {
                            credentials: 'include'
                        });
                        const message = await response.json();
                        newCase.push(message[0]);
                        if (message[0] !== 'correct') {
                            AC = false;
                        }
                        if (message[0] === 'correct' || message[0] === 'tle' || message[0] === 'wrong') {
                            newCase.push(message[1]);
                        }
                        newInfo.testCases.push(newCase);
                        this.setState({
                            info: newInfo,
                            requesting: false
                        });
                    };

                    updatePromises = [];

                    for (let i = 0; i < this.state.info.numberOfTestCases; i++) {
                        updatePromises.push(updateRequest());
                    }
                    Promise.all(updatePromises).then(() => {
                        if (AC) {
                            notification["success"]({
                                placement: "bottomRight",
                                duration: 6,
                                message: 'All Correct!',
                                description:
                                    'Your submission has passed all test cases. You can submit another solution or move on to the next problem' //TODO show number of points gained
                            });
                            this.setState({
                                solved: true
                            });
                            this.getTags();
                        }
                        fetch(serverIp + "/userSubmissions/" + this.state.id, {
                            credentials: 'include'
                        })
                            .then(response => response.json())
                            .then(data => {
                                this.setState({
                                    submissions: data
                                })
                            });
                    })
                }
            });
        } else if (props.file.status === "error") {
            if (props.file.error.status === 400) {
                this.setState({
                    isLogin: true,
                    loginModalName: "Please Log in to Submit",
                    loginModalVisible: true
                })
            } else if (props.file.error.status === 500) {
                message.error("Unexpected upload error");
            } else if (props.file.error.status === 409) {
                message.error("Please wait until your last submission has been graded");
            }
        }
    };

    getTags() {
        fetch(serverIp + "/problem/tags/" + this.state.id, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => this.setState({
                tags: data
            }));
    }

    padTwo(number) {
        if (number <= 9) return "0" + number;
        return number;
    }

    render() {
        if (this.state.isLoading) {    //Skeleton loading
            return (
                <Layout className="layout">
                    <NavBar usernameSetter={this.getUsername}/>
                    <Content style={{marginLeft: 64, marginTop: 64, minWidth: 0, marginRight: 0}}>

                        <div>
                            <Row gutter={64} type="flex" align="top">
                                <Col span={16}>
                                    <div className="problem">
                                        <Skeleton/>
                                    </div>
                                </Col>

                                <Col span={7}>
                                    <div className="testCases"/>
                                </Col>
                            </Row>
                        </div>
                    </Content>
                    <Foot/>
                </Layout>
            )
        }
        let cases = [];
        for (let i = 0; i < this.state.info.numberOfTestCases; i++) {
            if (this.state.info.testCases[i] == null || this.state.info.testCases[i][0] === "untested") {
                cases.push(
                    <Row key={i}>
                        <div className="unTested">
                            <span className="testCaseText">Testcase {i + 1}</span>
                        </div>
                    </Row>
                );
            } else if (this.state.info.testCases[i][0] === "correct") {
                cases.push(
                    <Row key={i}>
                        <Tooltip placement="topLeft" title={"Correct"}>
                            <div className="correct">
                                <Icon className="caseIcons" type="check"/>
                                <span
                                    className="testCaseText">Testcase {i + 1} ({this.state.info.testCases[i][1]}ms)</span>
                            </div>
                        </Tooltip>
                    </Row>
                );
            } else if (this.state.info.testCases[i][0] === "wrong") {
                cases.push(
                    <Row key={i}>
                        <Tooltip placement="topLeft" title={"Wrong Answer"}>
                            <div className="wrong">
                                <Icon className="caseIcons" type="close"/>
                                <span
                                    className="testCaseText">Testcase {i + 1} ({this.state.info.testCases[i][1]}ms)</span>
                            </div>
                        </Tooltip>
                    </Row>
                );
            } else if (this.state.info.testCases[i][0] === "error") {
                cases.push(
                    <Row key={i}>
                        <Tooltip placement="topLeft" title={"Runtime error"}>
                            <div className="wrong">
                                <Icon className="caseIcons" type="exclamation"/>
                                <span className="testCaseText">Testcase {i + 1}</span>
                            </div>
                        </Tooltip>
                    </Row>
                );
            } else if (this.state.info.testCases[i][0] === "tle") {
                cases.push(
                    <Row key={i}>
                        <Tooltip placement="topLeft" title={"Time limit exceeded"}>
                            <div className="wrong">
                                <Icon className="caseIcons" type="clock-circle"/>
                                <span
                                    className="testCaseText">Testcase {i + 1} ({this.state.info.testCases[i][1]}ms)</span>
                            </div>
                        </Tooltip>
                    </Row>
                );
            } else if (this.state.info.testCases[i][0] === "mle") {
                cases.push(
                    <Row key={i}>
                        <Tooltip placement="topLeft" title={"Memory limit exceeded"}>
                            <div className="wrong">
                                <Icon className="caseIcons" type="database"/>
                                <span className="testCaseText">Testcase {i + 1}</span>
                            </div>
                        </Tooltip>
                    </Row>
                );
            } else if (this.state.info.testCases[i][0] === "hack") {
                cases.push(
                    <Row key={i}>
                        <Tooltip placement="topLeft" title={"Unauthorized activity"}>
                            <div className="hack">
                                <Spin indicator={<Icon type="stop" style={{fontSize: 12}}/>}/>
                                <span className="whiteTestCaseText">Testcase {i + 1}</span>
                            </div>
                        </Tooltip>
                    </Row>
                );
            } else if (this.state.info.testCases[i][0] === "unk") {
                cases.push(
                    <Row key={i}>
                        <Tooltip placement="topLeft" title={"Unknown error"}>
                            <div className="unknown">
                                <Spin indicator={<Icon type="question" style={{fontSize: 12}} spin/>}/>
                                <span className="testCaseText">Testcase {i + 1}</span>
                            </div>
                        </Tooltip>
                    </Row>
                );
            }
        }

        let tagsMarkup;
        let tags = [];
        for (let i = 0; i < this.state.tags.length; i++) {
            let color;

            if ((i - 1) % 11 === 0) {
                color = "magenta";
            } else if ((i - 1) % 11 === 1) {
                color = "red";
            } else if ((i - 1) % 11 === 2) {
                color = "volcano";
            } else if ((i - 1) % 11 === 3) {
                color = "orange";
            } else if ((i - 1) % 11 === 4) {
                color = "gold";
            } else if ((i - 1) % 11 === 5) {
                color = "lime";
            } else if ((i - 1) % 11 === 6) {
                color = "green";
            } else if ((i - 1) % 11 === 7) {
                color = "cyan";
            } else if ((i - 1) % 11 === 8) {
                color = "blue";
            } else if ((i - 1) % 11 === 9) {
                color = "geekblue";
            } else {
                color = "purple";
            }

            tags.push(
                <Tag color={color} key={i} style={{margin: 4}}>
                    {this.state.tags[i]}
                </Tag>
            );
        }
        if (tags.length !== 0) {
            tagsMarkup =
                <div style={{paddingTop: 16}}>
                    <div className="subField">
                        <div className="auxheading">Tags</div>
                        <hr style={{marginTop: 0, marginBottom: 0}}/>
                        <div style={{marginBottom: 4, marginLeft: 3}}>
                            {tags}
                        </div>
                    </div>
                </div>
        }

        let submissionMarkup;
        let submissions = [];
        if (this.state.submissions != null && this.state.submissions.length > 0) {
            for (let i = 0; i < this.state.submissions.length; i++) {
                let submission = this.state.submissions[i];
                let submissionTime = new Date(submission.timeStamp);
                let verdictMarkups = [];
                let corrects = submission.verdicts.correct;
                let wrongs = submission.verdicts.wrong;
                let tles = submission.verdicts.tle;
                let mles = submission.verdicts.mle;
                let errors = submission.verdicts.error;
                let hacks = submission.verdicts.hack;
                if (corrects === this.state.info.numberOfTestCases) {
                    verdictMarkups.push(
                        <div className="acText" key={i}>
                            Correct!
                        </div>
                    )
                } else {
                    if (corrects != null) {
                        verdictMarkups.push(<div key={i}>
                            <Icon type="check"/> {corrects}/{this.state.info.numberOfTestCases}
                        </div>);
                    } else if (wrongs != null) {
                        verdictMarkups.push(<div key={i}>
                            <Icon type="close"/> {wrongs}/{this.state.info.numberOfTestCases}
                        </div>);
                    } else if (tles != null) {
                        verdictMarkups.push(<div key={i}>
                            <Icon type="clock-circle"/> {tles}/{this.state.info.numberOfTestCases}
                        </div>);
                    } else if (mles != null) {
                        verdictMarkups.push(<div key={i}>
                            <Icon type="database"/> {mles}/{this.state.info.numberOfTestCases}
                        </div>);
                    } else if (errors != null) {
                        verdictMarkups.push(<div key={i}>
                            <Icon type="exclamation"/> {errors}/{this.state.info.numberOfTestCases}
                        </div>);
                    } else if (hacks != null) {
                        verdictMarkups.push(<div key={i}>
                            <Icon type="stop"/> {hacks}/{this.state.info.numberOfTestCases}
                        </div>);
                    }
                }

                submissions.unshift(
                    <div className="verdictCell" key={submissions.length}>
                        {verdictMarkups}
                    </div>
                );
                submissions.unshift(
                    <div className="timeCell" key={submissions.length}>
                        {"" + submissionTime.toLocaleString("en-US", {month: "short"}) + "/" + submissionTime.getDate() + "/" + submissionTime.getFullYear()}
                        <br/>
                        {"" + this.padTwo(submissionTime.getHours()) + ":" + this.padTwo(submissionTime.getMinutes())}
                    </div>
                );
                submissions.unshift(
                    <div className="idCell" key={submissions.length}>
                        <Link to={"/submission/" + submission.id}>
                            {"" + submission.id}
                        </Link>
                    </div>
                );
            }
            submissionMarkup =
                <div style={{paddingTop: 16}}>
                    <div className="subField">
                        <div className="auxheading">Submissions</div>
                        <div className="submissionGrid">
                            <div className="titleIdCell">
                                #
                            </div>
                            <div className="titleTimeCell">
                                Time
                            </div>
                            <div className="titleVerdictCell">
                                Verdict
                            </div>
                            {submissions}
                        </div>
                    </div>
                </div>
        }
        return (              //Active
            <Layout className="layout">
                {this.renderRedirect()}
                <NavBar onLogin={this.onLogin} onLogout={this.onLogout} usernameSetter={this.getUsername}/>
                <Content style={{marginLeft: 32, minWidth: 0, marginRight: 0}}>
                    <Breadcrumb style={{margin: "4px 0px 8px 0"}}>
                        <Breadcrumb.Item>
                            <Link to="/train/"> Train </Link>
                        </Breadcrumb.Item>
                        {(this.state.info.setName !== null) ?
                            <Breadcrumb.Item>
                                <Link to={"/problem-set/" + this.state.set}>{this.state.info.setName}</Link>
                            </Breadcrumb.Item> : null}
                        <Breadcrumb.Item>{this.state.info.name}</Breadcrumb.Item>
                    </Breadcrumb>
                    <div>
                        <div style={{display: "flex"}}>
                            <div className="problem">
                                <div className="title">{this.state.info.name}</div>
                                <div className="info">By: {this.state.info.author}<br/>Time
                                    Limit: {this.state.info.timeLimit} second(s)<br/>Memory
                                    Limit: {this.state.info.memoryLimit}KB
                                </div>
                                <div className="subheading">Problem Statement</div>
                                <div className="description">
                                    <Latex>{"" + this.state.info.description}</Latex>
                                </div>
                                <hr className="divider"/>
                                <div className="subheading">Input</div>
                                <div className="description">
                                    <Latex>{"" + this.state.info.inputDescription}</Latex>
                                </div>
                                <hr className="divider"/>
                                <div className="subheading">Output</div>
                                <div className="description">
                                    <Latex>{"" + this.state.info.outputDescription}</Latex>
                                </div>
                                <hr className="divider"/>
                                <div className="subheading">Sample Cases</div>
                                {this.renderSamples()}
                                <hr className="divider"/>
                                <div align="right">
                                    <Upload
                                        action={serverIp + '/problem/' + this.state.id} {...uploadprop}
                                        onChange={this.onUpload} showUploadList={false}>
                                        <Button>
                                            <Icon type="upload"/>Submit
                                        </Button>
                                    </Upload>
                                    {this.renderEditButtons()}
                                </div>
                            </div>

                            <div style={{width: "20%", minWidth: 250}}>
                                <div className="subField">
                                    <div className="auxheading">Test Cases</div>
                                    <Spin spinning={this.state.requesting} indicator={<Icon type="loading"/>}>
                                        <div>
                                            {cases}
                                        </div>
                                    </Spin>
                                </div>

                                <div style={{paddingTop: 16}}>
                                    <div className="subField">
                                        <div className="auxheading">Solution</div>
                                        <hr style={{marginTop: 0}}/>
                                        <div align="center">
                                            <div className="testCaseText">This button will take you to an editorial
                                                page where you can also compare your answer to other solutions. You
                                                may need to solve the problem before accessing the page
                                            </div>
                                            <div className="solutionButton">
                                                <Link to={"/solution/" + this.state.id}>
                                                    <Button disabled={!this.state.solved}>
                                                        Take me to the solution page
                                                    </Button>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {tagsMarkup}
                                {submissionMarkup}

                            </div>
                        </div>
                    </div>
                </Content>
                <Foot/>
            </Layout>
        )
    }

    renderSample(index, input, output) {
        /*
        for (let i = 57; i < input.length - 1; i += 61) {
            input = input.substring(0, i) + "...\n" + input.substring(i);
        }
        for (let i = 57; i < output.length - 1; i += 61) {
            output = output.substring(0, i) + "...\n" + output.substring(i);
        }
         */
        return (
            <div className="sampleCase" key={index}>
                <div className="sampleName">Case #{index}</div>
                <div style={{display: "flex"}}>
                    <div style={{borderRight: "1px solid #e8e8e8"}}>
                        <div className="ioTitle" style={{borderLeft: "1px solid #d9d9d9"}}>Input</div>
                        <div className="io" style={{borderLeft: "1px solid #d9d9d9"}}>{input}</div>
                    </div>
                    <div>
                        <div className="ioTitle" style={{borderRight: "1px solid #d9d9d9"}}>Output</div>
                        <div className="io" style={{borderRight: "1px solid #d9d9d9"}}>{output}</div>
                    </div>
                </div>
            </div>
        )
    }

    renderSamples() {
        if (this.state.info.sampleCases !== undefined && !this.state.isLoading) {
            let sampleMarkups = [];
            for (let i = 0; i < this.state.info.sampleCases.length; i++) {
                sampleMarkups.push(this.renderSample(this.state.info.sampleCases[i].tcIndex + 1, this.state.info.sampleCases[i].input, this.state.info.sampleCases[i].output));
            }
            return (
                <div style={{marginLeft: -12}}>
                    {sampleMarkups}
                </div>
            );
        }
    }

    renderEditButtons() {
        if (this.state.username === this.state.info.author) {
            return (
                <div style={{display: "contents"}}>
                    <Button style={{marginLeft: 8}} onClick={this.editRedirect}>
                        <Icon type="edit"/>Edit Problem
                    </Button>

                    <Popconfirm
                        title={"Are you sure you want to delete \"" + this.state.info.name + "\""}
                        onConfirm={this.delete}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button style={{marginLeft: 8}} type="danger">
                            <Icon type="delete"/>Delete Problem
                        </Button>
                    </Popconfirm>
                </div>
            )
        }
    }

    delete() {
        fetch(serverIp + "/delete/" + this.state.id, {
            method: "POST",
            credentials: "include"
        })
            .then(response => {
                if(response.status === 200) {
                    this.setState({
                        redirectTrain: true
                    })
                }
            })
    }

    getUsername(username) {
        this.setState({
            username: username
        });
    }

    editRedirect() {
        this.setState({
            redirectEdit: true
        })
    }

    renderRedirect() {
        if (this.state.redirectEdit) {
            return <Redirect to={"/edit/problem/" + this.state.id}/>
        }
        else if (this.state.redirectTrain) {
            return <Redirect to={"/train"}/>
        }
    }
}