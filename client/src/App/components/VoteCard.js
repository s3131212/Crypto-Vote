import React, { Component } from 'react';
import { Container, Row, Col, Button } from 'reactstrap';
import { getCandidateInfo } from '../../fetchapi';
class VoteCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            description: '',
            candidates: []
        };
        getCandidateInfo(this.props.info.id, data => {
            this.setState({ candidates: data });
        })
    }
    render() {
        return (
            <Container fluid={true}>
                <h2 className="display-4">{this.props.info.title}</h2>
                <p>{this.props.info.description}</p>
                <Row>
                    {
                        this.state.candidates.map((val, idx) => (
                            <Col key={idx}>
                                <h3 className="text-center"><b className="text-danger">{val.code}</b> - {val.name}</h3>
                                { val.photo != null ? (<img src={val.photo} className="img-thumbnail img-fluid" alt="avatar" />) : (null) }
                                <p>{val.description}</p>
                                <Button
                                    color={(this.props.chosen === val.id) ? "primary" : "secondary"}
                                    onClick={() => this.props.updateChosen(val.id)}
                                    block
                                >
                                    Vote for {val.code} - {val.name}
                                </Button>
                            </Col>
                        ))
                    }
                </Row>
            </Container>
        );
    }
}
export default VoteCard;