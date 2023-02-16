import React, { Component } from "react";
import { useLocation, useNavigate,useParams } from "react-router-dom";
import { Col } from "react-bootstrap";
import "../App.css";
import "../css/dialog.css";
import Help from "../helpers/Help";

class Dialog extends Component {
    constructor(props) {
        super(props);
        this.state = {
            MSGS:[],
            Message:''
        };
    }

    async SendMessage(){
        if(this.state.Message === ''){
            return false;
        }

        var send = await Help.API.post("/dialog/"+this.props.params.id,{
            msg: this.state.Message,
        });
        if (send && send.data && send.data.data) {
            this.setState({ MSGS: send.data.data });
            this.setState({ Message: '' });
            var element = document.getElementById("scrolling")
            element.scrollIntoView()
        }
    }

    async GetMessages(){
        var messages = await Help.API.get("/dialog/"+this.props.params.id);
        if (messages && messages.data && messages.data.data) {
            if(messages.data.data.length !== this.state.MSGS.length) {
                this.setState({MSGS: messages.data.data});
                var element = document.getElementById("scrolling")
                element.scrollIntoView()
            }
        }
    }

    async componentDidMount() {
        this.GetMessages();
        setInterval(() => {
            this.GetMessages();
        }, 4000);
    }

    render() {
        return (
            <>
                <Col xs="12" md="6">
                <div className="mesgs">
                    <div className="msg_history"  id={"convers"}>
                        {}
                        {this.state.MSGS.map((data) => {

                            if(data.from_id === this.props.params.id){

                                return (
                                    <div className="incoming_msg">
                                        <div className="incoming_msg_img"></div>
                                        <div className="received_msg">
                                            <div className="received_withd_msg">
                                                <p>{data.text}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            }else{

                                return (
                                    <div className="outgoing_msg">
                                        <div className="sent_msg">
                                            <p>{data.text}</p>
                                        </div>
                                    </div>
                                );
                            }
                        })}
<hr id={'scrolling'}/>
                    </div>
                    <div className="type_msg">
                        <div className="input_msg_write">
                            <input type="text" value={this.state.Message} className="write_msg" placeholder="Сообщение..." onChange={(e)=>{
                                this.setState({Message:e.target.value})
                            }}/>
                                <button className="msg_send_btn" type="button" onClick={(e)=>{
                                    this.SendMessage()
                                }}>
                                    <i className="fa fa-paper-plane-o" aria-hidden="true"></i>
                                </button>
                        </div>
                    </div>
                </div>
                </Col>
            </>
        );
    }
}
function WithNavigate(props) {
    return (
        <Dialog navigate={useNavigate()} location={useLocation()} params={useParams()} {...props} />
    );
}
export default WithNavigate;
