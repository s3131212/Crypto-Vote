import React, { Component } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import SweetAlert from 'sweetalert-react';
import { Doughnut } from 'react-chartjs-2';
import { Container, Row, Col, Button, Badge, Table } from 'reactstrap';
import { getCandidateInfo, getVoteResult } from '../../fetchapi';
class VoteCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            candidates: [],
            candidatesMap: {},
            results: [],
            winner: -1,
            color: [],
            show: false
        };
        getCandidateInfo(this.props.info.id, data => {
            let candidatesMap = {};
            let color = []
            data.forEach(val => {
                candidatesMap[val.id] = val.name;
                color.push("rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")" );
            })

            this.props.setExportedDataCandidates(this.props.info.id, data);
            this.setState({ candidates: data, candidatesMap: candidatesMap, color: color });
        })
        getVoteResult(this.props.info.id, data => {
            let frequency = {};
            let max = -1;
            let winner = -1;
            for(let i = 0; i < data.length; i++){
                frequency[data[i].candidate_id] = (frequency[data[i].candidate_id] || 0) + 1;
                if(frequency[data[i].candidate_id] > max){
                    max = frequency[data[i].candidate_id];
                    winner = data[i].candidate_id;
                }
            }

            this.props.setExportedDataResults(this.props.info.id, data);
            this.setState({ results: data, winner: winner });
        })
    }
    render() {
        return (
            <Container fluid={true}>
                <Row>
                    <Col>
                        <h2 className="display-4">{this.props.info.title}</h2>
                        <p>{this.props.info.description}</p>
                        <Button block className="" color="primary" onClick={() => this.setState({ show: true })}>See all ballots</Button>
                    </Col>
                    <Col>
                    <Doughnut
                        data={{
                            labels: this.state.candidates.map(val => val.name),
                            datasets: [{
                                data: this.state.candidates.map(val => this.state.results.filter(ele => val.id === ele.candidate_id).length),
                                backgroundColor: this.state.color
                            }]
                        }}
                        options={{
                            tooltips: {
                                callbacks: {
                                    label: (item) => 
                                            this.state.candidatesMap[this.state.candidates[item.index].id] + ": "
                                            + (this.state.results.filter(ele => this.state.candidates[item.index].id === ele.candidate_id).length)
                                            + " votes"
                                }
                            }
                        }}
                    />
                    </Col>
                </Row><br />
                <Row>
                    {
                        this.state.candidates.map((val, idx) => (
                            <Col key={idx} className={(val.id === this.state.winner) ? "winner-container" : ""}>
                                <h3 className="text-center">
                                    <b className="text-danger">{val.code}</b> - {val.name}
                                </h3>
                                <h3 className="text-center">
                                    <Badge color={(val.id === this.state.winner) ? "primary" : "secondary" }>
                                        { this.state.results.filter(ele => val.id === ele.candidate_id).length }
                                    </Badge>
                                </h3>
                                { val.photo != null ? (<img src={val.photo} className="img-thumbnail img-fluid" alt="Avatar" />) : (null) }
                                <p>{val.description}</p>
                            </Col>
                        ))
                    }
                </Row>
                <SweetAlert
                    show={this.state.show}
                    animation={false}
                    title={ "Ballots of " + this.props.info.title }
                    html
                    text={renderToStaticMarkup(
                        <div>
                            <Table className="vote-table">
                                <thead>
                                    <tr>
                                        <th>Token</th>
                                        <th>Vote for</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {
                                        this.state.results.map((val, idx) => (
                                            <tr key={idx}>
                                                <td>{val.token}</td>
                                                <td>{ this.state.candidatesMap[val.candidate_id] }</td>
                                            </tr>
                                        ))
                                    }
                                </tbody>
                            </Table>
                        </div>
                    )}
                    onConfirm={() => this.setState({ show: false })}
                    onEscapeKey={() => this.setState({ show: false })}
                    onOutsideClick={() => this.setState({ show: false })}
                />
            </Container>
        );
    }
}
export default VoteCard;