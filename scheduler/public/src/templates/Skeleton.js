import React, { Fragment } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "../App.css";
import Help from "../helpers/Help";
import {
    Row,
    Toast,
    Navbar,
    Container,
    Nav,
    ToastContainer,
} from "react-bootstrap";

class Skeleton extends React.Component {
    constructor(props) {
        super(props);
    }
    state = { open: false, alerts: [] };

    async GetNotification() {
        var users = await Help.API.get("/msg");
        if (
            users &&
            users.data &&
            users.data.data &&
            typeof users.data.data === "object"
        ) {
            this.setState({ alerts: users.data.data.concat(this.state.alerts) });
        }
    }

    async componentDidMount() {
        this.GetNotification();
        setInterval(() => {
            this.GetNotification(1);
        }, 10000);
    }
    render() {
        const { open } = this.state;

        return (
            <>
                <ToastContainer
                    position="top-end"
                    className="p-3"
                    style={{ zIndex: 9999 }}
                >
                    {this.state.alerts.map((data, index) => {
                        return (
                            <Toast
                                onClose={(e) => {
                                    var tmp = this.state.alerts;
                                    tmp.splice(index, 1);
                                    this.setState({ alerts: tmp });
                                }}
                            >
                                <Toast.Header>
                                    <img
                                        src="holder.js/20x20?text=%20"
                                        className="rounded me-2"
                                        alt=""
                                    />
                                    <strong className="me-auto">Внимание</strong>
                                </Toast.Header>
                                <Toast.Body>{data.text}</Toast.Body>
                            </Toast>
                        );
                    })}
                </ToastContainer>

                <Container fluid>
                    <Row>
                        <Navbar collapseOnSelect expand="lg" bg="dark" variant="dark">
                            <Container>
                                <Link className={"navbar-brand"} to="/">
                                    Расписание
                                </Link>
                                <Navbar.Toggle aria-controls="responsive-navbar-nav" />
                                <Navbar.Collapse id="responsive-navbar-nav">
                                    <Nav className="me-auto">
                                        <Link className={"nav-link"} to="/">
                                            Главная
                                        </Link>
                                        <Link className={"nav-link"} to="/create">
                                            Добавить
                                        </Link>
                                        <Link className={"nav-link"} to="/msg">
                                            Сообщения
                                        </Link>
                                    </Nav>
                                    <Nav>
                                        <Nav.Link
                                            href="/login"
                                            onClick={(e) => {
                                                Help.ls.remove("token");
                                                Help.ls.remove("userdata");
                                            }}
                                        >
                                            Выход
                                        </Nav.Link>
                                    </Nav>
                                </Navbar.Collapse>
                            </Container>
                        </Navbar>
                    </Row>
                    <br />
                    <Row className="justify-content-md-center" style={{ height: "80%" }}>
                        {this.props.page}
                    </Row>
                </Container>
            </>
        );
    }
}
function WithNavigate(props) {
    return (
        <Skeleton navigate={useNavigate()} location={useLocation()} {...props} />
    );
}
export default WithNavigate;
