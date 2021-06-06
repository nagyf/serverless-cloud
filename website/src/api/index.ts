import axios from 'axios';

// const serverUrl = 'http://localhost:8080/';

// const serverUrl = !!process.env.REACT_APP_TEST ? 'http://localhost:8080/' : '';

const serverUrl = !!process.env.REACT_APP_TEST ? 'http://localhost:8080/' : 'http://Serve-Cloud-Z7DAHUX71JR9-568404238.us-east-1.elb.amazonaws.com';

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
