import {Button, Dropdown, Form, Icon, Menu, Modal} from "antd";
import "./NavBar.css";
import Login from "./Login";
import {Link, Redirect} from "react-router-dom";

const React = require('react');

const serverIp = 'http://76.183.184.63:5000';

const editMenu = (
    <Menu className="dropdown">
        <Menu.Item className="dropdown">
            <Link to={"/new/problem"}>
                Create a coding problem
            </Link>
        </Menu.Item>

        <Menu.Item className="dropdown">
            <Link to={"/new/set"}>
                Create a problem set
            </Link>
        </Menu.Item>
    </Menu>
);

export default class NavBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loginModalVisible: false,
            isLogin: true,
            loginModalName: "Log in",
            info: {},
            firstTime: true
        };
        this.updateModalName = this.updateModalName.bind(this);
        this.getInfo = this.getInfo.bind(this);
    }

    componentDidMount() {
        this.getInfo();
    }

    render() {
        const LoginForm = Form.create()(Login);
        return (
            <div>
                {this.renderRedirect()}
                <div style={{background: "#262626", width: "100%", height: 24, display: "flex", color: "#8c8c8c"}}>
                    <Link to="/">
                        <Icon type="home" style={{marginLeft: 6, color: "#bfbfbf"}}/>
                    </Link>
                    <div style={{display: "flex", marginLeft: 8}}>
                        <Link to="/train" className="ref">Train</Link>
                        <div className="vr"/>
                        <Dropdown className="ref" overlay={editMenu}>
                            <div>Create</div>
                        </Dropdown>
                    </div>
                    {this.renderUserButtons()}

                    <Modal
                        title={this.state.loginModalName}
                        visible={this.state.loginModalVisible}
                        onCancel={this.toggleLoginModal}
                        width="350px"
                        footer={null}
                    >
                        <LoginForm
                            loginSwitch={this.updateModalName}
                            isLogin={this.state.isLogin}
                            closeModal={this.toggleLoginModal}
                            ip={serverIp}
                        />
                    </Modal>
                </div>
            </div>
        );
    }

    login = () => {
        this.updateModalName(true);
        this.toggleLoginModal();
    };

    register = () => {
        this.updateModalName(false);
        this.toggleLoginModal();
    };

    logout = () => {
        fetch(serverIp + '/logout', {
            method: 'POST',
            credentials: 'include'
        });
        this.setState({
            info: {}
        }, () => {
            if (this.props.onLogout !== undefined) this.props.onLogout();
        })
    };

    updateModalName(isLogin) {
        this.setState({
            isLogin: isLogin,
            loginModalName: isLogin ? "Log In" : "Register"
        });
    }

    toggleLoginModal = () => {
        const modalVisible = !this.state.loginModalVisible;
        this.setState({
            loginModalVisible: modalVisible
        }, () => {
            if (!modalVisible) this.getInfo();
        });
    };

    getInfo() {
        fetch(serverIp + '/smallUserInfo', {
            headers: {
                Accept: 'application/json',
            },
            credentials: 'include'
        }).then(response => response.json())
            .then(data => this.setState({
                info: data
            }, () => {
                if (this.props.onLogin !== undefined && this.state.info.valid && !this.state.firstTime) this.props.onLogin();
                if(this.props.usernameSetter !== undefined) this.props.usernameSetter(this.state.info.username);
                this.setState({
                    firstTime: false
                });
            }));
    }

    renderUserButtons() {
        if (!this.state.info.valid) {
            return (
                <div style={{marginRight: 16, marginLeft: "auto", display: "flex"}}>
                    <Button className="Button" type="link" onClick={this.login}>Login</Button>
                    <div className="vr"/>
                    <Button className="Button" type="link" onClick={this.register}>Register</Button>
                </div>
            );
        } else {
            return (
                <div style={{marginRight: 16, marginLeft: "auto", display: "flex"}}>
                    <Button
                        className="Button"
                        type="link"
                        onClick={() => this.setState({redirectedToUser: true})}
                    >
                        {this.state.info.username}
                    </Button>

                    <div className="vr"/>

                    <Button
                        className="Button"
                        type="link"
                        onClick={this.logout}
                    >
                        Logout
                    </Button>
                </div>
            );
        }
    }

    renderRedirect() {
        if (this.state.redirectedToUser) {
            return <Redirect to={"/user/" + this.state.info.username}/>;
        }
    }
}