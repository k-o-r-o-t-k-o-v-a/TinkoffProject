import React, { Component } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Col, Button, Card, Modal } from "react-bootstrap";
import "../App.css";
import Help from "../helpers/Help";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import ruLocale from "@fullcalendar/core/locales/ru";
import interactionPlugin, { Draggable } from "@fullcalendar/interaction";

class Home extends Component {
    constructor(props) {
        super(props);
        this.state = {
            EventModalShow: false,
            EventModalData: {
                title: "",
                body: "",
                id: 0,
            },
            EventModalDelete: true,
        };
        this.eventClick = this.eventClick.bind(this);
        this.handleEventModalClose = this.handleEventModalClose.bind(this);
        this.DeleteEvent = this.DeleteEvent.bind(this);
    }
    calendarRef = React.createRef();

    handleEventModalClose() {
        this.setState({ EventModalShow: false });
    }

    DeleteEvent() {
        let calendarApi = this.calendarRef.current.getApi();
        var id = this.state.EventModalData.id; 
        if (window.confirm("Удалить?")) {
            Help.API.delete("/schedules/" + id).then(
                (response) => {
                    var data = response.data;
                    if (data.response === "success") {
                        this.setState({ EventModalShow: false });
                    }

                    alert(data.msg);
                    calendarApi.refetchEvents();
                },
                (error) => {
                    alert("Нельзя удалить")
                    return false;
                }
            );
        } else {
            return false;
        }
    }

    eventClick(event) {
        Help.API.get("/schedules/" + event.event.id).then(
            (response) => {
                if (response.data && response.data.data) {//
                    var data = response.data.data[0];
                    var title =
                        data.first_name || data.last_name
                            ? data.first_name +
                            " " +
                            data.last_name +
                            " (" +
                            data.username +
                            ")"
                            : data.username;
                    title = data.note ? title + " [" + data.note + "]" : title;
                    var body =
                        new Date(data.time_start * 1000).toLocaleDateString("ru-RU") +
                        " " +
                        new Date(data.time_start * 1000).toLocaleTimeString("ru-RU") +
                        " - " +
                        new Date(data.time_end * 1000).toLocaleDateString("ru-RU") +
                        " " +
                        new Date(data.time_end * 1000).toLocaleTimeString("ru-RU");
                    this.setState({ EventModalShow: true });
                    this.setState({
                        EventModalData: { title: title, body: body, id: data.id },
                    });
                    if (
                        (data.status === 0 && Help.GetData("role") === 1) ||
                        (data.status === 1 && Help.GetData("role") === 0)
                    ) {
                        this.setState({ EventModalDelete: true });
                    } else {
                        this.setState({ EventModalDelete: false });
                    }
                }
            },
            (error) => {
                return false;
            }
        );
    }

    GetEventSources = (e) => {
        var LONG = e.end.getTime() - e.start.getTime();
        var StartDate = e.start.getTime() / 1000;
        return Help.API.get(
            "/schedule/" +
            encodeURIComponent(e.startStr) +
            "/" +
            encodeURIComponent(e.endStr)
        ).then(
            (response) => {
                return response.data && response.data.data ? response.data.data : [];
            },
            (error) => {
                return false;
            }
        );
    };

    render() {
        return (
            <>
                <Modal
                    size="lg"
                    show={this.state.EventModalShow}
                    onHide={this.handleEventModalClose}
                >
                    <Modal.Header closeButton>
                        <Modal.Title>{this.state.EventModalData.title}</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>{this.state.EventModalData.body}</Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={this.handleEventModalClose}>
                            Закрыть
                        </Button>
                        <Button
                            className={this.state.EventModalDelete ? "" : "d-none"}
                            variant="danger"
                            onClick={this.DeleteEvent}
                        >
                            Удалить
                        </Button>
                    </Modal.Footer>
                </Modal>

                <Col sm="10" xs="12">
                    <Card style={{ height: "100%" }}>
                        <Card.Body style={{ height: "100%" }}>
                            <FullCalendar
                                ref={this.calendarRef}
                                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                                initialView="timeGridDay"
                                slotLabelFormat={{
                                    hour12: false,
                                    hour: "2-digit",
                                    minute: "2-digit",
                                    omitZeroMinute: false,
                                    meridiem: "short",
                                }}
                                nowIndicator={true}
                                editable={true}
                                eventDurationEditable={false}
                                selectable={true}
                                dateClick={this.dateClick}
                                eventClick={this.eventClick}
                                eventDrop={(e) => {
                                    e.revert();
                                }}
                                slotDuration="01:00"
                                slotLabelInterval="01:00"
                                slotMinTime="00:00"
                                slotMaxTime="24:00"
                                height="auto"
                                allDaySlot={false}
                                themeSystem="bootstrap"
                                headerToolbar={{
                                    left: "today",
                                    center: "prev,title,next",
                                    right: "dayGridMonth,timeGridWeek,timeGridDay",
                                }}
                                locale={ruLocale}
                                eventSources={this.GetEventSources}
                            />
                        </Card.Body>
                    </Card>
                </Col>
            </>
        );
    }
}
function WithNavigate(props) {
    return <Home navigate={useNavigate()} location={useLocation()} {...props} />;
}
export default WithNavigate;
