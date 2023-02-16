import React, { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, ListGroup,Badge } from "react-bootstrap";
import "../App.css";
import Help from "../helpers/Help";

class Msg extends Component {
    constructor(props) {
        super(props);
        this.state = {
            AllUsers:[]
        };
    }
    
    async GetAllUsers() {
        var users = await Help.API.get("/msg/users");
        if (users && users.data && users.data.data) {
            this.setState({ AllUsers: users.data.data });
        }
    }
    async componentDidMount() {
        this.GetAllUsers();
    }
    
    render() {
        return (
            <>
                <Col xs="12" md="6">
                    <ListGroup as="ol" >


                        {this.state.AllUsers.map((data) => {

                            var name = data.first_name || data.last_name ? data.first_name + " " + data.last_name + " (" + data.username + ")" : data.username;
                            return (
                                <ListGroup.Item
                                    as="li"
                                    className="d-flex justify-content-between align-items-start cursor-pointer hover-brig"
                                    onClick={(e)=>{
                                        this.props.navigate('/msg/'+data.id, {state: {toggle: true,user_id:data.id}});
                                    }}
                                >
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold">{name}</div>
                                        [{data.note}]
                                    </div>
                                    <Badge bg="primary" pill>
                                        {data.unread_count}
                                    </Badge>
                                </ListGroup.Item>
                            );

                        })}


                    </ListGroup>
                </Col>
            </>
        );
    }
}
function WithNavigate(props) {
    return (
        <Msg navigate={useNavigate()} location={useLocation()} {...props} />
    );
}
export default WithNavigate;
