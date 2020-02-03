import {Form, Layout} from "antd";
import NavBar from "./NavBar";
import {Redirect} from "react-router";
import NewProblemForm from "./NewProblemForm";
import "./New.css";
import Foot from "./Foot";

const React = require('react');
const {Content} = Layout;

const ProblemForm = Form.create({ name: 'problem_form' })(NewProblemForm);
export default class NewProblem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            redirect: false
        }
    }

    render(){
        return (
            <Layout style={{minHeight: "100vh"}}>
                {this.renderRedirect()}
                <NavBar onLogin={this.redirect} onLogout={this.redirect}/>
                <Content className="content">
                    <ProblemForm/>
                </Content>
                <Foot/>
            </Layout>
        );
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