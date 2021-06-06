import axios from 'axios';

const hostname = window.location.hostname;
const serverUrl = !!process.env.REACT_APP_TEST ? 'http://localhost:8080/' : `https://api.${hostname}`;

const axiosInstance = axios.create({
    baseURL: serverUrl,
});

axiosInstance.interceptors.request.use(request => {
    let tokens = localStorage.getItem('tokens') as any;
    if (tokens) {
        tokens = JSON.parse(tokens) as any;
        request.headers['Authorization'] = `${tokens.tokenType} ${tokens.accessToken}`;
    }

    return request;
});

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (!!error && !!error.response && error.response.status === 403) {
            window.location = error.response.data;
        } else {
            return Promise.reject(error);
        }
    }
);

export default axiosInstance;
