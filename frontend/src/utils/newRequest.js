import axios from "axios";
import Url from "../../baseUrl";
// import {Url} from "../../url.json";
const newRequest = axios.create({
  baseURL: Url,
  withCredentials: true,
});

export default newRequest;

//
