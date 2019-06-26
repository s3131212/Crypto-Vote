import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Link } from 'react-router-dom'
import { Container, Row, Col, Button } from 'reactstrap';
import SweetAlert from 'sweetalert-react';
import { getElectionInfo, getVoteInfo } from '../../fetchapi';
import ResultCard from '../components/ResultCard'
class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            description: '',
            votes: [],
            showExportData: false,
            exportedData: {
                title: "",
                description: "",
                votes: []
            }
        };
        getElectionInfo(this.props.location.pathname.substring("/result/".length), data => {
            if (data.length === 0) {
                this.props.history.push('/');
                return;
            }
            let exportedData = this.state.exportedData;
            exportedData.title = data[0].title;
            exportedData.description = data[0].description;

            this.setState({
                title: data[0].title,
                description: data[0].description,
                exportedData: exportedData
            });
        });
        getVoteInfo(this.props.location.pathname.substring("/result/".length), data => {
            let exportedData = this.state.exportedData;
            exportedData.votes = data;
            this.setState({ votes: data, exportedData: exportedData });
            console.log(exportedData);
        });
        this.setExportedDataResults = this.setExportedDataResults.bind(this);
        this.setExportedDataCandidates = this.setExportedDataCandidates.bind(this);
    }

    setExportedDataResults(vote_id, result){
        let exportedData = this.state.exportedData;
        exportedData.votes.map(val => {
            if(val.id === vote_id) val.result = result;
            return val;
        });
        this.setState({ exportedData: exportedData })
        console.log(exportedData);
    }
    setExportedDataCandidates(vote_id, candidates){
        let exportedData = this.state.exportedData;
        exportedData.votes.map(val => {
            if(val.id === vote_id) val.candidates = candidates;
            return val;
        });
        this.setState({ exportedData: exportedData })
        console.log(exportedData);
    }

    render() {
        return (
            <Container>
                <Row>
                    <Col sm="12" md={{ size: 8, offset: 2 }}>
                        <h1 className="text-center">Results of {this.state.title}</h1>
                        <hr className="my-2" />
                    </Col>
                </Row>
                {
                    this.state.votes.map((val, idx) => (
                        <div key={idx}>
                            <ResultCard info={val} setExportedDataResults={this.setExportedDataResults} setExportedDataCandidates={this.setExportedDataCandidates} />
                            <hr className="my-2" />
                        </div>
                    ))
                }
                <Row>
                    <Col sm="12" md={{ size: 6, offset: 3 }}>
                    <Link to="/"><Button block color="secondary">Back</Button></Link>
                    <Button block color="link" onClick={() => this.setState({ showExportData: true })}>Export Data</Button>
                    </Col>
                </Row>
                <SweetAlert
                    show={this.state.showExportData}
                    animation={false}
                    html
                    title="Export Data"
                    text={renderToStaticMarkup(
                        <textarea
                            readOnly
                            value={JSON.stringify(this.state.exportedData, undefined, 2)}
                            onChange={false}
                            style={{width: "100%", height: "300px", whiteSpace: "pre", overflow: "auto" }}>
                        </textarea>
                    )}
                    onConfirm={() => this.setState({ showExportData: false })}
                    onEscapeKey={() => this.setState({ showExportData: false })}
                    onOutsideClick={() => this.setState({ showExportData: false })}
                />
            </Container>
        )
    }
}
export default Results;