import axios from "axios"
import {Config} from "@en/config"
const serverInstance = axios.create({
	baseURL: `/api/v1`,
	timeout: 50000,
})

serverInstance.interceptors.request.use((config) => {
	config.headers.set('X-Custom-Header', 'foobar')
	return config;
})

serverInstance.interceptors.response.use((response) => {
	return response.data;
})


const aiInstance = axios.create({
	baseURL: `/api/ai/v1`,
	timeout: 50000,
})

aiInstance.interceptors.request.use((config) => {
	config.headers.set('X-Custom-Header', 'foobar')
	return config;
})


aiInstance.interceptors.response.use((response) => {
	return response.data;
})


export {
	serverInstance,
	aiInstance,
}
