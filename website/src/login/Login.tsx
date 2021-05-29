import { useLocation } from 'react-router-dom';

import axios from 'axios';


function useQuery(): URLSearchParams {
    return new URLSearchParams(useLocation().search);
}

function getJWK(): Promise<any> {
    const url = 'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_NtKhKtUbx/.well-known/jwks.json';
    return axios.get(url).then(response => {
        return response.data;
    });
}

export function Login(props: any) {
    const idtoken: string = useQuery().get('idtoken') as string;
    getJWK().then(jwk => {
        const key = jwk.keys[0];
        console.log(jwk);
    });

    return <h1>Token received from Cognito: {idtoken}</h1>;
}
