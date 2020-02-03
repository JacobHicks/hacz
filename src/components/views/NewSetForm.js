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
            testCases: []
        };
    };

    componentDidMount() {
        this.addTestcase()
    }

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

    render() {
        const {getFieldDecorator, getFieldValue} = this.props.form;

        getFieldDecorator('keys', {initialValue: []});
        const keys = getFieldValue('keys');
        const formItems = keys.map((k, index) => (
            <div key={index}>
                <div>Problem #{index + 1}</div>
                <div>
                    <div style={{display: "flex", width: "100%"}}>
                        <Form.Item>
                            {getFieldDecorator(`id[${k}]`, {
                                rules: [
                                    {
                                        required: true,
                                        message: "Please enter a problems id (last number in the url of a problem)."
                                    }
                                ]
                            })(
                                <InputNumber min={0} step={1} style={{width: 100, marginRight: 16}}
                                             placeholder="Problem id"/>
                            )}
                        </Form.Item>

                        <Form.Item>
                            {getFieldDecorator(`weight[${k}]`, {
                                rules: [
                                    {
                                        required: false,
                                    }
                                ]
                            })(
                                <InputNumber min={0} step={1} style={{marginRight: 16}} placeholder="Weight"/>
                            )}
                        </Form.Item>

                        <Form.Item>
                            {getFieldDecorator(`decay[${k}]`, {
                                rules: [
                                    {
                                        required: false,
                                    }
                                ]
                            })(
                                <InputNumber min={0} step={1} style={{marginRight: 16, width: 100}} placeholder="Point Decay"/>
                            )}
                        </Form.Item>

                        <Form.Item>
                            {getFieldDecorator(`partialCredit[${k}]`, {
                                rules: [
                                    {
                                        required: false,
                                    }
                                ]
                            })(
                                <div>
                                    <div style={{lineHeight: 0, fontSize: 12}}>Partial Credit</div>
                                    <Checkbox align="right" style={{marginLeft: 26}}/>
                                </div>
                            )}
                        </Form.Item>

                        {
                            keys.length > 1 ?
                                <Icon
                                    className="dynamic-delete-button"
                                    type="minus-circle-o"
                                    onClick={() => {
                                        this.removeTestcase(k);
                                    }}
                                    style={{color: "#cf1322", marginLeft: 8, marginRight: 16, marginTop: 12, height: 14}}
                                />
                                : null}
                    </div>
                </div>
            </div>
        ));

        return (
            <div>
                {this.renderRedirect()}
                <Form onSubmit={this.handleSubmit}>
                    <Form.Item>
                        Problem Set Name
                        {getFieldDecorator('name', {
                            rules: [
                                {
                                    required: true,
                                    message: "Please enter a name."
                                },
                                {
                                    max: 32,
                                    message: "Set names must be no more then 32 characters"
                                }
                            ]
                        })(
                            <Input
                                placeholder="A simple name is easier to remember and find"
                            />,
                        )}
                    </Form.Item>

                    <Form.Item>
                        <div>Description</div>
                        {getFieldDecorator('description', {
                            rules: [
                                {
                                    required: true,
                                    message: "A description is required."
                                },
                                {
                                    max: 3000,
                                    message: "Problem set descriptions must be no more then 3000 characters"
                                }
                            ]
                        })(
                            <TextArea
                                placeholder="Explain your problem set in detail."
                                autosize={{minRows: 8}}
                            />
                        )}
                    </Form.Item>

                    <Form.Item>
                        Tags
                        {getFieldDecorator('tags', {
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

                    <Button type="dashed" onClick={this.addTestcase}
                            style={{marginLeft: "85%", minWidth: 144}}>
                        <Icon type="plus"/> Add Problem
                    </Button>

                    <Form.Item>
                        <Button type="primary" htmlType="submit">
                            Publish Problem Set
                        </Button>
                    </Form.Item>
                </Form>
            </div>
        );
    }

    validateTags(rule, value, callback) {
        if (value.length > 16) {
            callback("Please use no more then 16 tags")
        }
        callback();
    }

    handleSubmit = e => {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                values.keys = undefined;
                console.log(values);
                fetch(serverIp + (this.props.id === undefined ? '/new/set' : ('/edit/set/' + this.props.id)), {
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
        if (this.state.redirect !== -1) return <Redirect to={"/problem-set/" + this.state.redirect}/>
    }
}