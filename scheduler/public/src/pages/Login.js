import React, { useState } from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Alert } from "react-bootstrap";
import Help from "../helpers/Help";
import Cookies from 'js-cookie';

function Login() {
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [LoginAlert, setLoginAlert] = useState([]);
    const navigate = useNavigate();
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const response = await Help.API.post("/auth", {
            username: username,
            password: password,
        });
        if (response.data.response === "success") {
            Cookies.set('token', response.data.data.token)
            Help.ls.set("userdata", response.data.data);
            Help.ls.set("token", response.data.data.token);
            Help.API.defaults.headers.authorization = "Bearer "+response.data.data.token;
            navigate("/");
        } else {
            setLoginAlert([{ msg: response.data.msg }]);
        }
    };

    return (
        <main className="form-signin">
            {LoginAlert.map((alert) => (
                <Alert variant={"danger"}>{alert.msg}</Alert>
            ))}

            <Form onSubmit={handleLoginSubmit}>
                <h1 className="h3 mb-3 fw-normal text-center">Войдите</h1>

                <Form.Group className="mb-3">
                    <Form.Label>Логин</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Логин"
                        onChange={(e) => setUserName(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Пароль</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Пароль"
                        onChange={(e) => setPassword(e.target.value)} 
                    />
                </Form.Group>
                <div className="d-grid gap-2">
                    <Button variant="primary" type="submit">
                        Войти
                    </Button>
                </div>
                <div className="d-grid gap-2">
                    <Link className={"nav-link"} to="/register">
                        Зарегистрироваться
                    </Link>
                </div>
            </Form>
        </main>
    );
}

export default Login;
