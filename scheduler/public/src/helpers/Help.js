import ls from "local-storage";
import axios from "axios";
import Cookies from 'js-cookie';

const API = axios.create({
    baseURL: "http://89.108.76.167:3000",
    timeout: 10000,
    headers: {
        authorization: "Bearer " + Cookies.get('token'),
        offset: -new Date().getTimezoneOffset() * 60,
    },
});

const Help = {
    ls: ls,
    GetData: function (e) {
        return ls.get("userdata") && ls.get("userdata")[e]
            ? ls.get("userdata")[e]
            : false;
    },
    API: API,
};

export default Help;
