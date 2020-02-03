import ProblemTable from "./ProblemTable";
import {Layout} from "antd";
import Foot from "./Foot";
import NavBar from "./NavBar";
import SetTable from "./SetTable";
import "./Train.css";

const {Content} = Layout;
const React = require('react');

export default class Train extends React.Component {
    constructor(props) {
        super(props);
        this.refresh = this.refresh.bind(this);
        this.state = {
            refresh: false
        };
    }

    render() {
        return (
            <Layout style={{minHeight: "100vh"}}>
                {this.renderRefresh()}
                <NavBar onLogin={this.refresh} onLogout={this.refresh}/>
                <Content style={{marginLeft: 32, marginRight: 32}}>
                    <div className="field">
                        <ProblemTable/>
                    </div>

                    <div className="field">
                        <SetTable/>
                    </div>
                </Content>
                <Foot/>
            </Layout>
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
}