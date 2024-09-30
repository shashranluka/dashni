import axios from "axios";
import Url from "../../baseUrl";
// import {Url} from "../../url.json";
console.log(Url)
const newRequest = axios.create({
  baseURL: Url,
  withCredentials: true,
});

export default newRequest;

//
