import {Form, Layout} from "antd";
import NavBar from "./NavBar";
import {Redirect} from "react-router";
import NewProblemForm from "./NewProblemForm";
import "./New.css";
import Foot from "./Foot";

const React = require('react');
const {Content} = Layout;

const ProblemForm = Form.create({ name: 'problem_form' })(NewProblemForm);

export default class EditProblem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false,
            id: -1,
            loading: true
        }
    }

    componentDidMount() {
        const {params} = this.props.match;
        this.setState({
            id: params.id,
            loading: false
        });
    }

    render(){
        if(!this.state.loading) {
            return (
                <Layout>
                    {this.renderRedirect()}
                    <NavBar onLogin={this.redirect} onLogout={this.redirect}/>
                    <Content className="content">
                        <ProblemForm id={this.state.id}/>
                    </Content>
                    <Foot/>
                </Layout>
            );
        }
        else {
            return (
                <div>Loading...</div>
            ) //TODO skeleton
        }
    }

    renderRedirect() {
        if (this.state.redirect) {
            return <Redirect to="/"/>
        }
    }

    redirect() {
        this.setState({
            redirect: true
        });
    }
}