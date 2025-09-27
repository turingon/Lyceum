import axios from "axios";

const api = axios.create({
  baseURL: `https://lyceumapi.turingon.tech/`,
});

export default api
