import React, { Component } from 'react';
import { Container, Button, Row, Col, Alert} from 'reactstrap';
import SweetAlert from 'sweetalert-react';
import { getElectionInfo, getVoteInfo, signBallot, submitBallot } from '../../fetchapi';
import { unblind, blind, random_token, messageToHash } from '../../rsablind';
import VoteCard from '../components/VoteCard';

class Vote extends Component {
    constructor(props) {
        super(props);
        this.state = {
            title: '',
            description: '',
            showUnfinished: false,
            showSuccess: false,
            showError: false,
            modalMsg: '',
            votes: [],
            chosen: [],
            ballot: null
        };

        getElectionInfo(this.props.location.pathname.substring("/vote/".length), data => {
            if (data.length === 0) {
                this.props.history.push('/');
                return;
            }
            this.setState({
                title: data[0].title,
                description: data[0].description,
            });
        })
        getVoteInfo(this.props.location.pathname.substring("/vote/".length), data => {
            let chosen = new Array(data.length);
            chosen.fill(-1);
            this.setState({ votes: data, chosen: chosen });
        });

        this.updateChosen = this.updateChosen.bind(this);
        this.runSignBallot = this.runSignBallot.bind(this);
        this.submitVote = this.submitVote.bind(this);
    }

    componentDidMount(){
        this.runSignBallot();
    }

    updateChosen(idx, code){
        return (code) => {
            let chosen = this.state.chosen;
            chosen[idx] = code;
            this.setState({ chosen: chosen });
        }
    }

    runSignBallot(){
        let message = messageToHash(new TextDecoder("utf-8").decode(random_token()));
        const { blinded, r } = blind({
            message: message,
            N: localStorage.getItem('N'),
            E: localStorage.getItem('E')
        });
        signBallot(blinded.toString(), localStorage.getItem("token"), this.props.location.pathname.substring("/vote/".length), (data) => {
            this.setState({
                ballot: {
                    signed: unblind({
                        N: localStorage.getItem('N'),
                        r: r,
                        signed: data
                    }).toString(),
                    original: message
                }
            })
        })
    }

    submitVote(){
        if(this.state.chosen.indexOf(-1) >= 0){
            this.setState({ showUnfinished: true });
            return;
        }
        let vote_chosen_map = [];
        for(let i = 0; i < this.state.votes.length; i++){
            vote_chosen_map.push([this.state.votes[i].id, this.state.chosen[i]]);
        }
        submitBallot(vote_chosen_map, this.state.ballot.original, this.state.ballot.signed, this.props.location.pathname.substring("/vote/".length), (data) => {
            if(data.length === 6){
                this.setState({ showSuccess: true, modalMsg: data });
            }else{
                this.setState({ showError: true, modalMsg: data });
            }
        })
    }

    render() {
        return (
            <Container>
                <h1 className="display-2 text-center">{this.state.title}</h1>
                <p className="lead text-center">{this.state.description}</p>
                <hr className="my-2" />
                {
                    (this.state.ballot != null)
                    ? (<Alert color="success">Ballot verified</Alert>) 
                    : (<Alert color="warning">Verifying...</Alert>)
                }
                {
                    this.state.votes.map((val, idx) => (
                        <div key={idx}>
                            <VoteCard info={val} chosen={this.state.chosen[idx]} updateChosen={this.updateChosen(idx)} />
                            <hr className="my-2" />
                        </div>
                    ))
                }
                <Row>
                    <Col sm="12" md={{ size: 6, offset: 3 }}>
                        {
                            (this.state.ballot != null)
                            ? (<Button color="primary" onClick={this.submitVote} block>Submit</Button>) 
                            : (<Button color="primary" disabled block>Submit</Button>) 
                        }
                    </Col>
                </Row>
                <SweetAlert
                    type="warning"
                    show={this.state.showUnfinished}
                    title="You haven't finish the votes."
                    text="Make sure that none of the vote is empty."
                    onConfirm={() => this.setState({ showUnfinished: false })}
                    onEscapeKey={() => this.setState({ showUnfinished: false })}
                    onOutsideClick={() => this.setState({ showUnfinished: false })}
                />
                <SweetAlert
                    type="success"
                    show={this.state.showSuccess}
                    title="You have submitted your votes!"
                    text={"Here's your receipt: " + this.state.modalMsg + " , you can use this code as token to discard the original vote and vote again if you want."}
                    onConfirm={() => { this.setState({ showSuccess: false }); this.props.history.push('/'); }}
                    onEscapeKey={() => { this.setState({ showSuccess: false }); this.props.history.push('/'); }}
                    onOutsideClick={() => { this.setState({ showSuccess: false }); this.props.history.push('/'); }}
                />
                <SweetAlert
                    type="error"
                    show={this.state.showError}
                    title="Something goes wrong..."
                    text={this.state.modalMsg}
                    onConfirm={() => this.setState({ showError: false })}
                    onEscapeKey={() => this.setState({ showError: false })}
                    onOutsideClick={() => this.setState({ showError: false })}
                />
            </Container>
        );
    }
}
export default Vote;