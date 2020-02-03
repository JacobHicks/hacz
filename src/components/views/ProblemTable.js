import {Badge, Table, Tag} from "antd";

const React = require('react');
const serverIp = 'http://76.183.184.63:5000';

const columns = [
    {
        title: "Id",
        dataIndex: "id",
        key: "id",
        defaultSortOrder: "ascend",
        sorter: (a, b) => a.id - b.id
    },
    {
        title: "Name",
        dataIndex: "name",
        sorter: (a, b) => a.name > b.name ? -1 : 1,
        render: (text, row) => {
            return (
                <div>
                    <Badge status={row.solved ? "success" : row.failed ? "error" : "default"}/>
                    <a href={"/problem/" + row.id}>{text}</a>
                </div>
            );
        }
    },
    {
        title: "Author",
        dataIndex: "author",
        key: "author",
        sorter: (a, b) => a.author > b.author ? -1 : 1
    },
    {
        title: "Total Submissions",
        dataIndex: "attempts",
        key: "attempts",
        sorter: (a, b) => a.attempts - b.attempts
    },
    {
        title: "% Correct",
        dataIndex: "percentCorrect",
        key: "percentCorrect",
        sorter: (a, b) => (isNaN(a.percentCorrect) ? 0 : a.percentCorrect) - (isNaN(b.percentCorrect) ? 0 : b.percentCorrect),
        render: percentCorrect => (
            <span>
            {ProblemTable.getPercent(percentCorrect)}
            </span>
        )
    },
    {
        title: "Tags",
        dataIndex: "tags",
        key: "tags",
        render: tags => (
            <span>
                {tags.map(tag => {
                    return (
                        <Tag key={tag}>
                            {tag}
                        </Tag>
                    );
                })}
            </span>
        )
    }
];

export default class ProblemTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        };
    }

    componentDidMount() {
        fetch(serverIp + '/train/problems', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(data => {
                this.setState({
                    data: data
                })
            });
    }

    render() {
        return (
            <div style={{marginLeft: "-.1%", width: "100.2%"}}>
                <Table bordered columns={columns} dataSource={this.state.data} size="small"
                       pagination={{defaultPageSize: 15}}
                       title={() => "Find individual problems to practice your coding skills"}
                />
            </div>
        );
    }

    static getPercent(p) {
        if (isNaN(p) || p === 0) {
            return "0%";
        }
        if (p < 1) {
            return "<1%";
        } else {
            return p.toFixed(0) + "%";
        }
    }
}