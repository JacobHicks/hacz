import {Form, Input, Spin, message} from "antd";
import Icon from "antd/es/icon";
import Checkbox from "antd/es/checkbox";
import Button from "antd/es/button";

import 'antd/dist/antd.css';
import './Login.css';

const React = require('react');

export default class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            registrationValid: true
        }
    }

    render() {
        const {getFieldDecorator} = this.props.form;
        if (this.props.isLogin) {
            return (
                <Spin spinning={this.state.loading} indicator={<Icon type="loading"/>}>
                    <Form onSubmit={this.handleLogin} className="login-form">
                        <Form.Item>
                            {getFieldDecorator('username', {
                                rules: [{
                                    required: true,
                                    message: 'Please input your username!'
                                }],
                            })(
                                <Input
                                    prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                    placeholder="Username"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('password', {
                                rules: [{
                                    required: true,
                                    message: 'Please input your password!'
                                }],
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                    type="password"
                                    placeholder="Password"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('rememberMe', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(<Checkbox>Remember me</Checkbox>)}
                            <Button onClick={this.handleLogin} type="primary" htmlType="submit"
                                    className="login-form-button">
                                Log in
                            </Button>
                            Or <Button onClick={this.toggleLoggingIn} type="link"
                                       style={{marginLeft: 0, paddingLeft: 0}}>register now!</Button>
                        </Form.Item>
                    </Form>
                </Spin>
            );
        } else {
            return (
                <Spin spinning={this.state.loading} indicator={<Icon type="loading"/>}>
                    <Form onSubmit={this.register} className="login-form">
                        <Form.Item>
                            {getFieldDecorator('email', {
                                rules: [
                                    {
                                        required: true,
                                        message: 'Please input an email!'
                                    },
                                    {
                                        type: 'email',
                                        message: 'The input is not valid E-mail!',
                                    },
                                    {
                                        max: 128,
                                        message: 'Sorry, but we do not support emails longer then 128 characters.'
                                    }
                                ],
                            })(
                                <Input
                                    prefix={<Icon type="mail" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                    placeholder="Email"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('username', {
                                validateTrigger: "onBlur",
                                rules: [
                                    {
                                        required: true,
                                        message: 'Please input a username!'
                                    },
                                    {
                                        validator: this.usernameValid,
                                    },
                                    {
                                        validator: this.usernameAvailable,
                                    }
                                ],
                            })(
                                <Input
                                    prefix={<Icon type="user" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                    placeholder="Username"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('password', {
                                rules: [
                                    {
                                        required: true,
                                        message: 'Please input a password!'
                                    },
                                    {
                                        validator: this.passwordValid
                                    }
                                ],
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                    type="password"
                                    placeholder="Password"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('confirm', {
                                rules: [
                                    {
                                        required: true,
                                        message: 'Please confirm your password!'
                                    },
                                    {
                                        validator: this.passwordMatches,
                                    }
                                ],
                            })(
                                <Input
                                    prefix={<Icon type="lock" style={{color: 'rgba(0,0,0,.25)'}}/>}
                                    type="password"
                                    placeholder="Confirm your Password"
                                />,
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('rememberMe', {
                                valuePropName: 'checked',
                                initialValue: true,
                            })(<Checkbox>Remember me</Checkbox>)}
                            <Button onClick={this.handleRegistration} type="primary" htmlType="submit"
                                    className="login-form-button">
                                Sign Up
                            </Button>
                            <Button onClick={this.toggleLoggingIn} type="link" style={{marginLeft: 0, paddingLeft: 0}}>I
                                already have an account</Button>
                        </Form.Item>
                    </Form>
                </Spin>
            )
        }
    }

    handleRegistration = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true,
                });
                fetch(this.props.ip + '/register', {
                    method: 'PUT',
                    body: JSON.stringify(values),
                    headers: {
                        Accept: 'application/json',
                        'Content-type': 'application/json'
                    },
                    credentials: 'include'

                }).then(response => {
                        if (response.status === 201) {
                            this.setState({
                                loading: false
                            }, this.props.closeModal);
                            message.success("Welcome " + values.username + ".");
                        }
                        else if (response.status === 400) {
                            message.error("Input not valid");
                            this.setState({
                                loading: false,
                            });
                        }
                    }
                );
            }
        });
    };

    handleLogin = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                this.setState({
                    loading: true
                });
                fetch(this.props.ip + '/login', {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: {
                        Accept: 'application/json',
                        'Content-type': 'application/json'
                    },
                    credentials: 'include'
                }).then(response => {
                        if (response.status === 200) {
                            this.setState({
                                loading: false
                            }, this.props.closeModal);
                            message.success("Welcome back " + values.username + ".");
                        } else {
                            this.setState({
                                loading: false
                            });
                            message.error("Username or password incorrect!")
                        }
                    }
                );
            }
        });
    };

    toggleLoggingIn = () => {
        this.props.loginSwitch(!this.props.isLogin);
    };

    passwordMatches = (rule, value, callback) => {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('password')) {
            callback('Does not match password!');
        } else {
            callback();
        }
    };

    usernameValid = (rule, value, callback) => {
        if(value.length >= 4 && value.length <= 24 && !(/[ ~`!#$%^&*+=\-[\]';,/{}|\\":<>?]/g.test(value))) {
            callback();
        }
        else {
            callback("Username must be at least 4 characters long and at most 24 characters long. Special characters are not allowed.");
        }
    };

    passwordValid = (rule, value, callback) => {
        if(value.length >= 8) {
            callback();
        }
        else {
            callback("Password must be at least 8 characters long");
        }
    };

    usernameAvailable = (rule, value, callback) => {
        if(value.length >= 4 && value.length <= 24 && !(/[ ~`!#$%^&*+=\-[\]';,/{}|\\":<>?]/.test(value))) {
            fetch(this.props.ip + '/user/' + value, {method: 'GET'})
                .then(response => {
                        if (response.status === 200) {
                            callback('Username not available!');
                        } else {
                            callback()
                        }
                    }
                );
        }
        else {
            callback();
        }
    };
}