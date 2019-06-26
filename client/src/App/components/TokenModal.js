import React, { Component } from 'react';
import SweetAlert from 'sweetalert-react';
import swal from 'sweetalert';
import { checkToken } from '../../fetchapi';
import 'sweetalert/dist/sweetalert.css';
class TokenModal extends Component {
    render(){
        return (
            <div>
                <SweetAlert
                    show={this.props.show}
                    title="Token"
                    text="Please enter token for this election."
                    type="input"
                    inputPlaceholder="Token"
                    onConfirm={(inputValue) => {
                        if (inputValue === '') {
                            swal.showInputError('You need to enter something!');
                            return;
                        }
                        checkToken(this.props.election_id, inputValue,(data) => {
                            if(data.available){
                                localStorage.setItem("token", inputValue);
                                localStorage.setItem("N", data.key.n);
                                localStorage.setItem("E", data.key.e);
                                this.props.closeModal();
                                this.props.history.push('/vote/' + this.props.election_id);
                            }else{
                                swal.showInputError('Error: ' + data.err);
                            } 
                        });
                        
                    }}
                    onEscapeKey={this.props.closeModal}
                    onOutsideClick={this.props.closeModal}
                />
            </div>
        )
    }
}

export default TokenModal;