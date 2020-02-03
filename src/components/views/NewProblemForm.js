import {Button, Checkbox, Form, Icon, Input, InputNumber, Select} from "antd";
import React from "react";
import {Redirect} from "react-router";

const {TextArea} = Input;
const {Option} = Select;
const serverIp = 'http://76.183.184.63:5000';

let id = 0;

export default class NewProblemForm extends React.Component {
    constructor(props) {
        super(props);
        this.addTestcase = this.addTestcase.bind(this);

        this.state = {
            redirect: -1,
            problemData: {},
            testCases: []
        };
    };

    removeTestcase = k => {
        const {form} = this.props;
        const keys = form.getFieldValue('keys');
        if (keys.length === 1) {
            return;
        }

        form.setFieldsValue({
            keys: keys.filter(key => key !== k),
        });
    };

    addTestcase = () => {
        const {form} = this.props;
        const keys = form.getFieldValue('keys');
        const nextKeys = keys.concat(id++);
        form.setFieldsValue({
            keys: nextKeys,
        });
    };

    componentDidMount() {
        if(this.props.id !== undefined) {
            fetch(serverIp + "/edit/problem/" + this.props.id, {
                credentials: 'include'
            })
                .then(response => response.json())
                .then(data => {
                    const {form} = this.props;
                    id = 0;
                    let keys = [];
                    for(let i = 0; i < data.tcInput.length; i++) {
                        keys = keys.concat(id++);
                    }

                    form.setFieldsValue({
                        keys: keys
                    });

                    this.setState({
                        problemData: data,
                    });
                })
        }
        if(this.props.id === undefined) {
            this.addTestcase();
        }
    }

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;

        getFieldDecorator('keys', {initialValue: []});
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
            <div key={index}>
                <div style={{display: "flex"}}>
                    <div>Testcase #{index + 1}</div>
                    <div style={{marginLeft: "auto", marginRight: 0}}>
                        Sample
                    </div>
                </div>
                <div style={{display: "flex", width: "100%"}}>
                    {keys.length > 1 ? (
                        <Icon
                            className="dynamic-delete-button"
                            type="minus-circle-o"
                            onClick={() => {
                                this.removeTestcase(k);
                            }}
                            style={{color: "#cf1322", marginLeft: -16, marginRight: 8, marginTop: 12}}
                        />
                    ) : null}

                    <div style={{width: "50%", marginRight: 32}}>
                        <Form.Item
                            required={false}
                            key={"i" + k}
                        >
                            {getFieldDecorator(`tcInput[${k}]`, {
                                initialValue: this.state.problemData.tcInput === undefined ? "" : this.state.problemData.tcInput[k],
                                validateTrigger: ['onChange', 'onBlur'],
                                rules: [
                                    {
                                        required: true,
                                        message: "Please input enter this case's input or delete the field.",
                                    },
                                ],
                            })(
                                <TextArea placeholder="Input" autosize={{maxRows: 8}}/>
                            )}
                        </Form.Item>
                    </div>

                    <div style={{width: "50%"}}>
                        <Form.Item
                            required={false}
                            key={"o" + k}
                        >
                            {getFieldDecorator(`tcOutput[${k}]`, {
                                initialValue: this.state.problemData.tcOutput === undefined ? "" : this.state.problemData.tcOutput[k],
                                validateTrigger: ['onChange', 'onBlur'],
                                rules: [
                                    {
                                        required: true,
                                        message: "Please input enter this case's output or delete the field.",
                                    },
                                ],
                            })(
                                <TextArea placeholder="Output" autosize={{maxRows: 8}}/>
                            )}
                        </Form.Item>
                    </div>

                    <Form.Item
                        required={false}
                        key={"s" + k}
                    >
                        {getFieldDecorator(`tcSample[${k}]`, {
                            initialValue: (this.state.problemData.tcSample === undefined)? false : this.state.problemData.tcSample[k],
                            valuePropName: "checked"
                        })(
                            <Checkbox style={{marginLeft: 16, marginRight: 15}}/>
                        )}
                    </Form.Item>
                </div>
            </div>
        ));

        return (
            <div>
                {this.renderRedirect()}
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item>
                        Problem Name
                        {getFieldDecorator('name', {
                            initialValue: this.state.problemData.name,
                            rules: [
                                {
                                    required: true,
                                    message: "Please enter a name."
                                },
                                {
                                    max: 32,
                                    message: "Problem names must be no more then 32 characters"
                                }
                            ]
                        })(
                            <Input
                                placeholder="A simple name is easier to remember and find"
                            />,
                        )}
                    </Form.Item>
                    <div style={{display: "flex"}}>
                        <Form.Item>
                            <div>
                                Time Limit in seconds
                            </div>
                            {getFieldDecorator('timeLimit', {
                                initialValue: this.state.problemData.timeLimit,
                                rules: [
                                    {
                                        required: true,
                                        message: "A time limit is required."
                                    },
                                    {
                                        validator: this.timeLimitValidate
                                    }
                                ]
                            })(
                                <InputNumber min={0.1} max={10} step={0.1} style={{width: 133, marginRight: 32}}/>
                            )}
                        </Form.Item>
                        <Form.Item>
                            <div>
                                Memory Limit in kilobytes
                            </div>
                            {getFieldDecorator('memoryLimit', {
                                initialValue: this.state.problemData.memoryLimit,
                                rules: [
                                    {
                                        required: true,
                                        message: "A memory limit is required."
                                    },
                                    {
                                        validator: this.memoryLimitValidate
                                    }
                                ]
                            })(
                                <InputNumber min={0} max={64000} step={1} style={{width: 160}}/>
                            )}
                        </Form.Item>
                    </div>
                    <Form.Item>
                        <div>Description</div>
                        {getFieldDecorator('description', {
                            initialValue: this.state.problemData.description,
                            rules: [
                                {
                                    required: true,
                                    message: "A description is required."
                                },
                                {
                                    max: 3000,
                                    message: "Problem descriptions must be no more then 3000 characters"
                                }
                            ]
                        })(
                            <TextArea
                                placeholder="Explain your problem concisely and include its constraints"
                                autosize={{minRows: 8}}
                            />
                        )}
                    </Form.Item>
                    <Form.Item>
                        Input Description
                        {getFieldDecorator('input', {
                            initialValue: this.state.problemData.input,
                            rules: [
                                {
                                    required: true,
                                    message: "An input description is required."
                                },
                                {
                                    max: 1000,
                                    message: "Input descriptions must be no more then 1000 characters"
                                }
                            ]
                        })(
                            <TextArea
                                placeholder="Explain the problems input and its format in detail"
                                autosize={{minRows: 4}}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        Output Description
                        {getFieldDecorator('output', {
                            initialValue: this.state.problemData.output,
                            rules: [
                                {
                                    required: true,
                                    message: "An output description is required."
                                },
                                {
                                    max: 1000,
                                    message: "Output descriptions must be no more then 1000 characters"
                                }
                            ]
                        })(
                            <TextArea
                                placeholder="Explain your problems output and its format in detail"
                                autosize={{minRows: 4}}
                            />,
                        )}
                    </Form.Item>
                    <Form.Item>
                        Tags
                        {getFieldDecorator('tags', {
                            initialValue: this.state.problemData.tags,
                            rules: [
                                {
                                    type: 'array'
                                },
                                {
                                    validator: this.validateTags
                                }
                            ],
                        })(
                            <Select mode="tags" placeholder="Select tags that describe your problem"/>,
                        )}
                    </Form.Item>
                    {formItems}
                    {formItems.length < 20 ?
                        <Button type="dashed" onClick={this.addTestcase}
                                style={{marginLeft: "85%", width: "15%"}}>
                            <Icon type="plus"/> Add TC
                        </Button>
                        : null
                    }
                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {this.props.id === undefined ? "Publish problem" : "Update problem"}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }

    timeLimitValidate(rule, value, callback) {
        if(value > 0) {
            if(value <= 5) {
                callback();
            }
            else {
                callback("For server performance reasons, time limits must be no more then 5 seconds")
            }
        }
        else if(value != null){
            callback("Time limits must be greater then 0 seconds");
        }
        callback();
    }

    memoryLimitValidate(rule, value, callback) {
        if(value >= 0) {
            if(value <= 262144) {
                callback();
            }
            else {
                callback("For server performance reasons, memory limits must be no more then 256 megabytes (262144KB)")
            }
        }
        else {
            callback("Memory limits cannot be negative (obviously)");
        }
    }

    validateTags(rule, value, callback) {
        if(value.length > 16) {
            callback("Please use no more then 16 tags")
        }
        callback();
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.keys = undefined;
                fetch(serverIp + (this.props.id === undefined ? '/new/problem' : ('/edit/problem/' + this.props.id)), {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: {
                        Accept: 'application/json',
                        'Content-type': 'application/json'
                    },
                    credentials: 'include'

                }).then(response => response.json())
                    .then(data => {
                        this.setState({
                            redirect: data[0]
                        }, () => window.scrollTo(0, 0));
                    });
            }
        });
    };

    renderRedirect() {
        if(this.state.redirect !== -1) return <Redirect to={"/problem/" + this.state.redirect}/>
    }
}