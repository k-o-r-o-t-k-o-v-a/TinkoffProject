import React, { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Form, Button } from "react-bootstrap";
import "../App.css";
import Help from "../helpers/Help";

class Create extends Component {
    constructor(props) {
        super(props);
        this.state = {
            formDate: new Date().toISOString().split("T")[0],
            formTime:
                Number(new Date().getHours()) > 22
                    ? "0"
                    : Number(new Date().getHours()) + 1,
            formDateEnd: new Date().toISOString().split("T")[0],
            formTimeEnd:
                Number(new Date().getHours()) > 21
                    ? "0"
                    : Number(new Date().getHours()) + 2,
            formEmployes: 0,
            AllUsers: [],
            StopUsers:[]
        };
        this.handleCreateSubmit = this.handleCreateSubmit.bind(this);
        this.handleCreateSubmitUser = this.handleCreateSubmitUser.bind(this);
    }

    async GetAllUsers() {
        var users = await Help.API.get("/users");
        if (users && users.data && users.data.data) {
            this.setState({ AllUsers: users.data.data });
        }
    }

    async RebuildStopList(){
        await Help.API.get("/check/"+Number( Date.parse( this.state.formDate + " " + this.state.formTime + ":00:00Z" ) ) / 1000+'/'+Number( Date.parse( this.state.formDateEnd + " " + this.state.formTimeEnd + ":00:00Z" ) ) / 1000).then(
            (response) => {
                var data = response.data;
                if (data.response === "success") {
                    var result = data.data.map(key => (key.user_id));
                    this.setState({StopUsers:result})
                    this.GetAllUsers()
                }
            },
            (error) => {
                return false;
            }
        );
    }

    async componentDidMount() {
        this.RebuildStopList();
        this.GetAllUsers();
    }

    async handleCreateSubmitUser(e) {
        e.preventDefault();

        await Help.API.post("/schedule", {
            user_id: Help.GetData("id"),
            time_start:
                Number(
                    Date.parse(
                        this.state.formDate + " " + this.state.formTime + ":00:00Z"
                    )
                ) / 1000,
            time_end:
                Number(
                    Date.parse(
                        this.state.formDateEnd + " " + this.state.formTimeEnd + ":00:00Z"
                    )
                ) / 1000,
            status: 0,
        }).then(
            (response) => {
                var data = response.data;
                alert(data.msg);
                if (data.response === "success") {
                    this.props.navigate("/", { state: { toggle: true } });
                }
            },
            (error) => {
                return false;
            }
        );
    }

    async handleCreateSubmit(e) {
        e.preventDefault();
        await Help.API.post("/schedule", {
            user_id: this.state.formEmployes,
            time_start:
                Number(
                    Date.parse(
                        this.state.formDate + " " + this.state.formTime + ":00:00Z"
                    )
                ) / 1000,
            time_end:
                Number(
                    Date.parse(
                        this.state.formDateEnd + " " + this.state.formTimeEnd + ":00:00Z"
                    )
                ) / 1000,
            status: 1,
        }).then(
            (response) => {
                var data = response.data;
                alert(data.msg);
                if (data.response === "success") {
                    this.props.navigate("/", { state: { toggle: true } });
                }
            },
            (error) => {
                return false;
            }
        );
    }

    render() {
        return (
            <>
                <Col xs="12" md="6">
                    <Form
                        onSubmit={
                            Help.GetData("role") === 1
                                ? this.handleCreateSubmitUser
                                : this.handleCreateSubmit
                        }
                    >
                        <Form.Group className="mb-3">
                            <Form.Label>Дата начала</Form.Label>
                            <Form.Control
                                type="date"
                                value={this.state.formDate}
                                placeholder={new Date().toISOString().split("T")[0]}
                                onChange={(e) => {
                                    this.setState({ formDate: e.target.value });
                                    this.RebuildStopList();
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Время начала</Form.Label>
                            <Form.Select
                                value={this.state.formTime}
                                aria-label="Время начала"
                                onChange={(e) => {
                                    this.setState({ formTime: e.target.value });
                                    this.RebuildStopList();
                                }}
                            >
                                <option value="0">00:00</option>
                                <option value="1">01:00</option>
                                <option value="2">02:00</option>
                                <option value="3">03:00</option>
                                <option value="4">04:00</option>
                                <option value="5">05:00</option>
                                <option value="6">06:00</option>
                                <option value="7">07:00</option>
                                <option value="8">08:00</option>
                                <option value="9">09:00</option>
                                <option value="10">10:00</option>
                                <option value="11">11:00</option>
                                <option value="12">12:00</option>
                                <option value="13">13:00</option>
                                <option value="14">14:00</option>
                                <option value="15">15:00</option>
                                <option value="16">16:00</option>
                                <option value="17">17:00</option>
                                <option value="18">18:00</option>
                                <option value="19">19:00</option>
                                <option value="20">20:00</option>
                                <option value="21">21:00</option>
                                <option value="22">22:00</option>
                                <option value="23">23:00</option>
                            </Form.Select>
                        </Form.Group>
                        <hr />
                        <Form.Group className="mb-3">
                            <Form.Label>Дата окончания</Form.Label>
                            <Form.Control
                                type="date"
                                value={this.state.formDateEnd}
                                placeholder={new Date().toISOString().split("T")[0]}
                                onChange={(e) => {
                                    this.setState({ formDateEnd: e.target.value });
                                    this.RebuildStopList();
                                }}
                            />
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Время окончания</Form.Label>
                            <Form.Select
                                value={this.state.formTimeEnd}
                                aria-label="Время окончания"
                                onChange={(e) => {
                                    this.setState({ formTimeEnd: e.target.value });
                                    this.RebuildStopList();
                                }}
                            >
                                <option value="0">00:00</option>
                                <option value="1">01:00</option>
                                <option value="2">02:00</option>
                                <option value="3">03:00</option>
                                <option value="4">04:00</option>
                                <option value="5">05:00</option>
                                <option value="6">06:00</option>
                                <option value="7">07:00</option>
                                <option value="8">08:00</option>
                                <option value="9">09:00</option>
                                <option value="10">10:00</option>
                                <option value="11">11:00</option>
                                <option value="12">12:00</option>
                                <option value="13">13:00</option>
                                <option value="14">14:00</option>
                                <option value="15">15:00</option>
                                <option value="16">16:00</option>
                                <option value="17">17:00</option>
                                <option value="18">18:00</option>
                                <option value="19">19:00</option>
                                <option value="20">20:00</option>
                                <option value="21">21:00</option>
                                <option value="22">22:00</option>
                                <option value="23">23:00</option>
                            </Form.Select>
                        </Form.Group>
                        <hr />
                        <Form.Group
                            className={"mb-3 " + (Help.GetData("role") === 1 ? "d-none" : "")}
                            controlId="formGroupEmp"
                        >
                            <Form.Label>Сотрудник</Form.Label>
                            <Form.Select
                                value={this.state.formEmployes}
                                aria-label="Сотрудник"
                                onChange={(e) =>
                                    this.setState({ formEmployes: e.target.value })
                                }
                            >
                                <option></option>
                                {this.state.AllUsers.map((data) => {
                                    var name =
                                        data.first_name || data.last_name
                                            ? data.first_name +
                                            " " +
                                            data.last_name +
                                            " (" +
                                            data.username +
                                            ")"
                                            : data.username;
                                    name = data.note ? name + " [" + data.note + "]" : name;
                                    if(!this.state.StopUsers.includes(data.id)) {
                                        return <option value={data.id}>{name}</option>;
                                    }
                                })}
                            </Form.Select>
                        </Form.Group>
                        <hr className={Help.GetData("role") === 1 ? "d-none" : ""} />
                        <div className="d-grid gap-2">
                            <Button className={"btn-block"} variant="success" type="submit">
                                Сохранить
                            </Button>
                        </div>
                    </Form>
                </Col>
            </>
        );
    }
}
function WithNavigate(props) {
    return (
        <Create navigate={useNavigate()} location={useLocation()} {...props} />
    );
}
export default WithNavigate;
