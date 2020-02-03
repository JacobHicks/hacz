import {Button, Form, Input} from "antd";
import React from "react";

const {TextArea} = Input;
const serverIp = 'http://76.183.184.63:5000';

export default class SolutionForm extends React.Component {
    constructor(props) {
        super(props);
    };

    componentDidMount() {

    }

    render() {
        const {getFieldDecorator} = this.props.form;

        return (
            <div>
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item>
                        Solution Name
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please enter a name."
                                }
                            ],
                            initialValue: this.props.data.name
                        })(
                            <Input
                                placeholder="Use a descriptive name that tells your solution apart from others"
                            />,
                        )}
                    </Form.Item>
                    <div style={{marginBottom: 9}}>
                        Time Complexity
                    </div>
                    <div style={{display: "flex"}}>
                        <Form.Item style={{marginRight: 16}}>
                            {getFieldDecorator('timeBigO', {
                                rules: [
                                    {
                                        required: false
                                    }
                                ],
                                initialValue: this.props.data.timeBigO
                            })(
                                <Input placeholder="Worst case"/>
                            )}
                        </Form.Item>
                        <Form.Item style={{marginRight: 16}}>
                            {getFieldDecorator('timeTheta', {
                                rules: [
                                    {
                                        required: false
                                    }
                                ],
                                initialValue: this.props.data.timeTheta
                            })(
                                <Input placeholder="Average case"/>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('timeOmega', {
                                rules: [
                                    {
                                        required: false,
                                    }
                                ],
                                initialValue: this.props.data.timeOmega
                            })(
                                <Input placeholder="Best case"/>
                            )}
                        </Form.Item>
                    </div>

                    <div style={{marginBottom: 9}}>
                        Memory Complexity
                    </div>
                    <div style={{display: "flex"}}>
                        <Form.Item style={{marginRight: 16}}>
                            {getFieldDecorator('memoryBigO', {
                                rules: [
                                    {
                                        required: false
                                    }
                                ],
                                initialValue: this.props.data.memoryBigO
                            })(
                                <Input placeholder="Worst case"/>
                            )}
                        </Form.Item>
                        <Form.Item style={{marginRight: 16}}>
                            {getFieldDecorator('memoryTheta', {
                                rules: [
                                    {
                                        required: false
                                    }
                                ],
                                initialValue: this.props.data.memoryTheta
                            })(
                                <Input placeholder="Average case"/>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('memoryOmega', {
                                rules: [
                                    {
                                        required: false,
                                    }
                                ],
                                initialValue: this.props.data.memoryOmega
                            })(
                                <Input placeholder="Best case"/>
                            )}
                        </Form.Item>
                    </div>

                    <Form.Item>
                        <div>Description</div>
                        {getFieldDecorator('description', {
                            rules: [
                                {
                                    required: true,
                                    message: "A description is required."
                                },
                                {
                                    max: 1000,
                                    message: "Descriptions cannot exceed 1000 characters"
                                }
                            ],
                            initialValue: this.props.data.description
                        })(
                            <TextArea
                                placeholder="Explain your solution concisely and be sure to explain why your problem fits into the time and memory complexities you listed above."
                                autosize={{minRows: 6}}
                            />
                        )}
                    </Form.Item>

                    <Form.Item>
                        <div>Pseudo Code</div>
                        {getFieldDecorator('pseudoCode', {
                            rules: [
                                {
                                    required: false
                                },
                                {
                                    max: 1000,
                                    message: "Pseudo-code cannot exceed 1000 characters"
                                }
                            ],
                            initialValue: this.props.data.pseudoCode
                        })(
                            <TextArea
                                placeholder="Write the pseudo code for your solution and make sure it is correct"
                                autosize={{minRows: 6}}
                            />
                        )}
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            {this.props.data.name === undefined ? "Publish solution" : "Update solution"}
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                if(this.props.data.name === undefined) {
                    fetch(serverIp + "/solution/" + this.props.id + "/new", {
                        method: 'POST',
                        body: JSON.stringify(values),
                        headers: {
                            'Content-type': 'application/json'
                        },
                        credentials: 'include'
                    }).then(this.props.onSubmit)
                }
                else {
                    fetch(serverIp + "/solution/" + this.props.id + "/edit/" + this.props.data.name, {
                        method: 'POST',
                        body: JSON.stringify(values),
                        headers: {
                            'Content-type': 'application/json'
                        },
                        credentials: 'include'
                    }).then(this.props.onSubmit)
                }
            }
        });
    };
}