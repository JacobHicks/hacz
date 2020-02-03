import NavBar from "./NavBar";
import {Layout, List, Button, Divider, Badge, Tag, Breadcrumb} from "antd";
import {Link} from 'react-router-dom'
import './ProblemSet.css';
import Foot from "./Foot";

const React = require('react');
const {Content} = Layout;


const serverIp = 'http://76.183.184.63:5000'; //IP of server here 76.183.184.63

export default class ProblemSet extends React.Component {
    constructor(props) {
        super(props);
        this.onLoginChange = this.onLoginChange.bind(this);
        this.state = {
            isLoading: true,
            name: "",
            author: "",
            description: "",
            problems: [],
            tags: []
        }
    }

    componentDidMount() {
        const {params} = this.props.match;
        this.setState({
            isLoading: true,
            id: params.id
        });
        fetch(serverIp + '/problem-set/' + params.id, {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    name: data.name,
                    author: data.author,
                    description: data.description,
                    problems: data.problems
                });
            });

        fetch(serverIp + '/problem-set/tags/' + params.id)
            .then(response => response.json())
            .then(data => {
                this.setState({
                    tags: data
                });
            });
    }

    onLoginChange() {
        if (this.state.id !== undefined) {
            fetch(serverIp + '/problem-set/' + this.state.id, {
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    this.setState({
                        name: data.name,
                        author: data.author,
                        description: data.description,
                        problems: data.problems
                    });
                });
        }
    }

    render() {
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
                <Tag color={color} key={i}>
                    {this.state.tags[i]}
                </Tag>
            );
        }
        if (tags.length !== 0) {
            tagsMarkup =
                <div style={{paddingTop: 16}}>
                    <div className="subField">
                        <div className="auxheading">Tags</div>
                        <hr style={{marginTop: 0, marginBottom: 7}}/>
                        <div style={{marginBottom: 10, marginLeft: 7, marginRight: 7}}>
                            {tags}
                        </div>
                    </div>
                </div>
        }

        return (
            <Layout className="layout">
                <NavBar onLogin={this.onLoginChange} onLogout={this.onLoginChange}/>
                <Divider style={{marginTop: 0, marginBottom: 0}}/>
                <Content style={{marginLeft: 32}}>
                    <Breadcrumb style={{margin: 0}}>
                        <Breadcrumb.Item>
                            <Link to="/train/"> Train </Link>
                        </Breadcrumb.Item>
                        <Breadcrumb.Item>{this.state.name}</Breadcrumb.Item>
                    </Breadcrumb>
                    <div style={{display: "flex"}}>
                        <List
                            style={{width: "80%", marginRight: 16}}
                            size="large"
                            split={false}
                            pagination={true}
                            header={
                                <List.Item className="listItem">
                                    <List.Item.Meta
                                        style={{marginLeft: 16}}
                                        title={<div className="problemNameText">{this.state.name}</div>}
                                        description={
                                            <div>
                                                <div className="problemInfoText">
                                                    {this.state.description}
                                                </div>
                                                <div>
                                                    By: {this.state.author}
                                                </div>
                                            </div>
                                        }
                                    />
                                </List.Item>
                            }
                            dataSource={this.state.problems}
                            renderItem={item =>
                                <div style={{marginTop: 18}}>
                                    <List.Item className="listItem">
                                        <List.Item.Meta
                                            style={{marginLeft: 16}}
                                            title={<div className="problemNameText">{item.name}</div>}
                                            description={
                                                <div>
                                                    <div className="problemInfoText">
                                                        Attempts: {item.attempts} {ProblemSet.getPercentage(item.attempts, item.solves)}
                                                    </div>
                                                    <div>
                                                        By: {item.author}
                                                    </div>
                                                </div>
                                            }
                                        />
                                        <div>
                                            {ProblemSet.renderTags(item.tags)}
                                        </div>
                                        <div style={{paddingRight: 16, paddingLeft: 16}}>
                                            <Badge
                                                count={ProblemSet.getPoints(item.incorrectUserAttempts, item.solved)}
                                                style={{
                                                    zIndex: 0,
                                                    backgroundColor: (item.solved ? "#52c41a" : "#f5222d")
                                                }}>
                                                <Link to={"/set/" + this.state.id + "/problem/" + item.id}>
                                                    <Button>Solve Problem</Button>
                                                </Link>
                                            </Badge>
                                        </div>
                                    </List.Item>
                                </div>
                            }
                        />
                        <div style={{width: "20%"}}>
                            {tagsMarkup}
                        </div>
                    </div>
                </Content>
                <Foot/>
            </Layout>
        )
    }

    static renderTags(tags) {
        let result = [];
        for (let i = 0; i < tags.length; i++) {
            result.push(<Tag key={i}>{tags[i]}</Tag>);
        }
        return result;
    }

    static getPoints(incorrects, isCorrect) { //TODO: weighted point values
        if (incorrects === 0 && isCorrect) {
            return "First Try!";
        } else if (incorrects !== 0 && isCorrect) {
            return "AC (-" + incorrects + ")";
        } else if (incorrects !== 0) {
            return "-" + incorrects;
        } else {
            return 0;
        }
    }

    static getPercentage(total, correct) {
        if (total === 0) {
            return "";
        } else if (correct === 0) {
            return "(0% AC)";
        } else {
            let percentRaw = correct / total * 100;
            if (percentRaw < 1) {
                return "(<1% AC)";
            } else {
                return "(" + percentRaw.toFixed(0) + "% AC)";
            }
        }
    }
}