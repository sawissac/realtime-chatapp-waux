// /People

import axios from "axios";

const api = axios.create({
  baseURL: "http://services.odata.org/TripPinRESTierService/(S(3mslpb2bc0k5ufk24olpghzx))",
});

export default api;