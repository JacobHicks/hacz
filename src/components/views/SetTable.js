import {Table, Tag} from "antd";

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
            return <a href={"/problem-set/" + row.id}>{text}</a>;
        }
    },
    {
        title: "Author",
        dataIndex: "author",
        key: "author",
        sorter: (a, b) => a.author > b.author ? -1 : 1
    },
    {
        title: "Description",
        dataIndex: "description",
        key: "description",
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
        fetch(serverIp + '/train/sets', {
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
                       pagination={{defaultPageSize: 5}}
                       title={() => "Find problem sets to enhance skills in a particular topic or prepare for a contest/interview"}
                />
            </div>
        );
    }
}