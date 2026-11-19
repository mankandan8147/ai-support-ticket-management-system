import axios from 'axios';

const API = axios.create({
  baseURL: 'http://127.0.0.1:8000/api/',
});

export const getTickets = () => API.get('tickets/');

export const createTicket = (ticketData) =>
  API.post('tickets/', ticketData);

export const updateTicket = (id, ticketData) =>
  API.patch(`tickets/${id}/`, ticketData);

export const deleteTicket = (id) =>
  API.delete(`tickets/${id}/`);

export default API;