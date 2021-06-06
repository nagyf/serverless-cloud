import { useEffect } from 'react';
import api from '../api';

function testCall(): Promise<any> {
    const url = '/api/test';
    return api.get(url).then(response => response.data);
}

export function Dashboard() {

    useEffect(() => {
        testCall().then(response => console.log(response));
    }, []);

    return <h1>Dashboard</h1>;
}