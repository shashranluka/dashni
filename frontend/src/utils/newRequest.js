import axios from "axios";

const newRequest = axios.create({
  // baseURL: "http://localhost:8800/api/",
  baseURL: "http://dashni.dosh.ge/api/",
  withCredentials: true,
});

export default newRequest;
