import {Breadcrumb, Button, Divider, Form, Layout, Modal, Collapse, Icon, Popconfirm} from "antd";
import {Link} from 'react-router-dom'
import './Solution.css';
import {Redirect} from "react-router";
import NavBar from "./NavBar";
import Foot from "./Foot";
import SolutionHistogram1D from "./SolutionHistogram1D";
import SolutionFormForm from "./SolutionForm";

const React = require('react');
const Latex = require('react-latex');
const {Content} = Layout;
const {Panel} = Collapse;
const serverIp = 'http://76.183.184.63:5000'; //IP of server here 76.183.184.63

const SolutionForm = Form.create({name: 'solution_form'})(SolutionFormForm);

export default class Solution extends React.Component {
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
        this.getUsername = this.getUsername.bind(this);
        this.getEditorials = this.getEditorials.bind(this);
        this.toggleSubmissionModal = this.toggleSubmissionModal.bind(this);
        this.state = {
            info: {},
            isLoading: true,
            id: -1,
            solved: true,
            editorials: [],
            times: [],
            submissionModalVisible: false,
            username: "",
            editData: {}
        };
    }

    componentDidMount() {
        const {params} = this.props.match;
        this.setState({
            isLoading: true,
            id: params.id
        }, () => {
            fetch(serverIp + '/solution/' + params.id)
                .then(response => response.json())
                .then(data => this.setState({
                    info: data
                }));
            fetch(serverIp + "/isSolved/" + params.id, {
                credentials: 'include'
            }).then(response => response.json())
                .then(data => {
                    this.setState({
                        solved: data[0] === "true"
                    }, () => {
                        this.getEditorials();
                    });
                });
            this.getTimes();
        });
    }

    getEditorials() {
        if (this.state.solved) {
            fetch(serverIp + "/solution/" + this.state.id + "/editorials", {
                credentials: 'include'
            }).then(response => response.json())
                .then(data => {
                    let newEditorials = [];
                    for (let i = 0; i < data.length; i++) {
                        newEditorials.push(
                            <Panel
                                key={i}
                                header={
                                    <div style={{display: "flex", width: "100%"}}>
                                        <div className="editorialTitle">
                                            {data[i].name}
                                        </div>
                                        <div className="editorialAuthor">
                                            By {data[i].author}
                                        </div>
                                        {
                                            data[i].author === this.state.username ? (
                                                <div align="right" style={{margin: "auto 0 auto auto"}}>
                                                    <Icon
                                                        type="edit"
                                                        style={{color: "#8c8c8c", marginRight: 12}}
                                                        onClick={event => {
                                                            event.stopPropagation();
                                                            this.setState({
                                                                editData: data[i],
                                                                submissionModalVisible: true
                                                            })
                                                        }}
                                                    />

                                                    <Popconfirm
                                                        title={"Are you sure you want to delete \"" + data[i].name + "\""}
                                                        onConfirm={event => {
                                                            event.stopPropagation();
                                                            fetch(serverIp + "/solution/" + this.state.id + "/" + data[i].name + "/delete", {
                                                                method: "POST",
                                                                credentials: "include"
                                                            })
                                                                .then(this.getEditorials);
                                                        }}
                                                        onCancel={event => {
                                                            event.stopPropagation();
                                                        }}
                                                        okText="Yes"
                                                        cancelText="No"
                                                    >
                                                        <Icon
                                                            type="delete"
                                                            style={{color: "#f5222d"}}
                                                            onClick={event => {
                                                                event.stopPropagation();
                                                            }}
                                                        />
                                                    </Popconfirm>
                                                </div>
                                            ) : null
                                        }
                                    </div>
                                }
                            >
                                <div>
                                    <Latex>
                                        {data[i].description}
                                    </Latex>
                                </div>
                                {this.renderPseudoCode(data[i])}
                                {this.renderComplexities(data[i])}
                            </Panel>
                        );
                    }
                    this.setState({
                        editorials: newEditorials
                    });
                });
        }
    }

    renderPseudoCode(data) {
        if (data.pseudoCode !== null) {
            let whitespace = new RegExp("\\s");
            let pseudo = "$";
            data.pseudoCode = data.pseudoCode.trim();
            for (let i = 0; i < data.pseudoCode.length; i++) {
                if (whitespace.test(data.pseudoCode.charAt(i))) {
                    pseudo += "$" + data.pseudoCode.charAt(i) + "$";
                } else if (data.pseudoCode.charAt(i) === "\\") {
                    let x;
                    for (x = i + 1; x < data.pseudoCode.length && data.pseudoCode.charAt(x) !== " "; x++) ;
                    pseudo += data.pseudoCode.substring(i, x + 1);
                    i = x;
                } else {
                    pseudo += data.pseudoCode.charAt(i);
                }
            }
            pseudo += "$";

            return (
                <div style={{whiteSpace: "pre"}}>
                    <Divider style={{margin: "8px 0"}}/>
                    <Latex>
                        {pseudo}
                    </Latex>
                </div>
            )
        }
        return null;
    }

    renderComplexities(data) {
        let res = [];
        if (data.timeBigO !== null || data.timeTheta !== null || data.timeOmega !== null) {
            res.push(<Divider style={{margin: "8px 0"}}/>);
            res.push("Time Complexity:");
            res.push(
                <div>
                    <div className="editorialComplexities">
                        <div className="complexity">
                            <Latex>
                                {data.timeBigO === null ? "" : "$" + data.timeBigO + "$"}
                            </Latex>
                            <div className="complexityLabel">
                                Worst
                            </div>
                        </div>

                        <div className="complexity">
                            <Latex>
                                {data.timeTheta === null ? "" : "$" + data.timeTheta + "$"}
                            </Latex>
                            <div className="complexityLabel">
                                Average
                            </div>
                        </div>

                        <div className="complexity">
                            <Latex>
                                {data.timeOmega === null ? "" : "$" + data.timeOmega + "$"}
                            </Latex>
                            <div className="complexityLabel">
                                Best
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        if (data.memoryBigO !== null || data.memoryTheta !== null || data.memoryOmega !== null) {
            res.push(
                <div style={{marginTop: 8}}>
                    Memory Complexity:
                </div>
            );
            res.push(
                <div className="editorialComplexities">
                    <div className="complexity">
                        <Latex>
                            {data.memoryBigO === null ? "" : "$" + data.memoryBigO + "$"}
                        </Latex>
                        <div className="complexityLabel">
                            Worst
                        </div>
                    </div>

                    <div className="complexity">
                        <Latex>
                            {data.memoryTheta === null ? "" : "$" + data.memoryTheta + "$"}
                        </Latex>
                        <div className="complexityLabel">
                            Average
                        </div>
                    </div>

                    <div className="complexity">
                        <Latex>
                            {data.memoryOmega === null ? "" : "$" + data.memoryOmega + "$"}
                        </Latex>
                        <div className="complexityLabel">
                            Best
                        </div>
                    </div>
                </div>
            );
        }

        return res;
    }

    renderRedirect() {
        if (!this.state.solved) {
            return <Redirect to={"/problem/" + this.state.id}/>
        }
    }

    render() {
        return (
            <div>
                {this.renderRedirect()}
                <Modal
                    title="Submit a solution explanation"
                    visible={this.state.submissionModalVisible}
                    onCancel={this.toggleSubmissionModal}
                    footer={null}
                    width="80%"
                >
                    <SolutionForm id={this.state.id} onSubmit={this.onSubmit} data={this.state.editData}/>
                </Modal>
                <Layout className="layout">
                    {this.renderRefresh()}
                    <NavBar onLogin={this.refresh} onLogout={this.refresh} usernameSetter={this.getUsername}/>
                    <Content style={{marginLeft: 64, marginRight: 64, minWidth: 800}}>

                        <Breadcrumb style={{margin: "4px 0px 8px 0"}}>
                            <Breadcrumb.Item>
                                <Link to="/train/"> Train </Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>
                                <Link to={"/problem/" + this.state.id}>{this.state.info.name}</Link>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>Solution</Breadcrumb.Item>
                        </Breadcrumb>

                        <div className="solution">
                            <div className="solutionTitle">Solutions to {this.state.info.name}</div>
                            <div className="authorText">By: {this.state.info.author}</div>

                            <Collapse>
                                {this.state.editorials}
                            </Collapse>

                            <div align="right">
                                <Button type="link" style={{marginBottom: 0, marginTop: 8}}
                                        onClick={this.toggleSubmissionModal}>My solution
                                    is not listed above</Button>
                            </div>
                            <Divider style={{marginTop: 0}}/>
                            <div style={{margin: "0 8px"}}>
                                <SolutionHistogram1D type="time" data={this.state.times} id={this.state.id}/>
                            </div>
                        </div>
                    </Content>
                    <Foot/>
                </Layout>
            </div>
        )
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

    getTimes() {
        if (this.state.id !== null) {
            console.log(this.state.id);
            fetch(serverIp + "/solution/" + this.state.id + "/time", {
                credentials: 'include'
            }).then(response => response.json())
                .then(data => {
                    this.setState({
                        times: data
                    })
                })
        }
    }

    toggleSubmissionModal() {
        this.setState({
            submissionModalVisible: !this.state.submissionModalVisible,
            editData: {}
        })
    }

    onSubmit() {
        this.toggleSubmissionModal();
        this.getEditorials();
    }

    getUsername(username) {
        this.setState({
            username: username
        });
    }
}