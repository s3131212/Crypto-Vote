import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import { Container, Row, Col, Card, Button, CardTitle, CardText } from 'reactstrap';
import TokenModal from '../components/TokenModal'
import { getElectionsList } from '../../fetchapi';
class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            electionsList: { 'ongoing': [], 'ended': [] },
            votes: [],
            selected_election: -1,
            showModal: false
        };
        
        getElectionsList((data) => {
            this.setState({ electionsList: data });
        });
    }
    render() {
        return (
            <Container>
                <Row>
                    <Col sm="12" md={{ size: 8, offset: 2 }}>
                        <h1 className="text-center">Crypto-Vote</h1>
                        <h3>Ongoing Election(s):</h3>
                        <div>
                        {
                            this.state.electionsList.ongoing.map((val, idx) => (
                                    <Card body key={idx}>
                                        <CardTitle><h3>{val.title}</h3></CardTitle>
                                        <CardText>{val.description}</CardText>
                                        <Button
                                            color="primary"
                                            size="lg"
                                            block
                                            onClick={ () => this.setState( {showModal: true, selected_election: val.id } ) }
                                        >
                                            Vote
                                        </Button>
                                    </Card>
                                )
                            )
                        }
                        { (this.state.electionsList.ongoing.length === 0) ? (<p>None</p>) : (null) }
                        <hr className="my-2" />
                        <h3>Ended Election(s):</h3>
                        {
                            this.state.electionsList.ended.map((val, idx) => (
                                    <Card body key={idx}>
                                        <CardTitle><h3>{val.title}</h3></CardTitle>
                                        <CardText>{val.description}</CardText>
                                        <Link to={"/result/" + val.id}><Button color="secondary" size="lg" block>See Results</Button></Link>
                                    </Card>
                                )
                            )
                        }
                        { (this.state.electionsList.ended.length === 0) ? (<p>None</p>) : (null) }
                        </div>
                    </Col>
                </Row>
                <Row>
                    <Col sm={{ size: 6, offset: 3 }} md={{ size: 4, offset: 4 }}>
                    <Button block color="link" onClick={() => { localStorage.setItem("theme", "flatly"); window.location.href="/admin" }}>Admin</Button>
                    </Col>
                </Row>
                <TokenModal
                    show={this.state.showModal}
                    election_id={this.state.selected_election}
                    closeModal={() => { this.setState({ showModal: false }) }}
                    history={this.props.history}
                />
            </Container>
        );
    }
}
export default Home;