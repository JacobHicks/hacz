import {Layout} from "antd";
import "./Foot.css"

const Footer = Layout;
const React = require('react');
export default class ProblemSet extends React.Component {
    render() {
        return (
            <div style={{paddingTop: 16}}>
                <Footer className="footer" style={{textAlign: 'center'}}>
                    Code Site v.01 2019
                </Footer>
            </div>
        );
    }
}