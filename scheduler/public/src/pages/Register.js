import React, { useState } from "react";
import "../App.css";
import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import Help from "../helpers/Help";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";

function Register() {
    const [last_name, setLastName] = useState("");
    const [first_name, setFirstName] = useState("");
    const [username, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPasswordRepit] = useState("");
    const [phone, setPhone] = useState("");
    const [role, setRole] = useState(0);
    const [parent, setManager] = useState(0);
    const [managers, setManagers] = useState([]);
    const [note, setNote] = useState("");
    const navigate = useNavigate();

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        const response = await Help.API.post("/register", {
            username: username,
            password: password,
            password2: password2,
            phone: phone,
            role: role,
            parent: parent,
            first_name: first_name,
            last_name: last_name,
            note: note,
        });
        if (response.data.response === "success") {
            alert(response.data.msg);
            navigate("/login");
        } else {
            alert(response.data.msg);
        }
    };

    const GetAllManagers = async (e) => {
        Help.API.get("/managers/").then(
            (response) => {
                if (response.data.response === "success") {
                    setManagers(response.data.data);
                }
            },
            (error) => {
                return false;
            }
        );
    };
    return (
        <main className="form-signin2">
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

                <Form.Group className="mb-3">
                    <Form.Label>Повторите пароль</Form.Label>
                    <Form.Control
                        type="password"
                        placeholder="Пароль"
                        onChange={(e) => setPasswordRepit(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Должность</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Должность"
                        onChange={(e) => setNote(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Почта</Form.Label>
                    <Form.Control
                        type="email"
                        placeholder="@gmail.com"
                        onChange={(e) => setPhone(e.target.value)}
                    />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Имя</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Имя"
                        onChange={(e) => setLastName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Фамилия</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Фамилия"
                        onChange={(e) => setFirstName(e.target.value)}
                    />
                </Form.Group>
                <Form.Group className="mb-3">
                    <Form.Label>Роль</Form.Label>
                    <Form.Select
                        onChange={(e) => {
                            GetAllManagers();
                            setRole(e.target.value);
                        }}
                    >
                        <option value={0}>Менеджер</option>
                        <option value={1}>Работник</option>
                    </Form.Select>
                </Form.Group>

                <Form.Group
                    className={"mb-3 " + (role === 0 ? "d-none" : "")}

                >
                    <Form.Label>Менеджер</Form.Label>
                    <Form.Select
                        onChange={(e) => setManager(e.target.value)}
                    >
                        <option></option>
                        {managers.map((data) => {
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
                            return <option value={data.id}>{name}</option>;
                        })}
                    </Form.Select>
                </Form.Group>
                <div className="d-grid gap-2">
                    <Button variant="primary" type="submit">
                        Зарегистрироваться
                    </Button>
                </div>
            </Form>
        </main>
    );
}

export default Register;
