import { useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import api from '../api';

function useQuery(): URLSearchParams {
    return new URLSearchParams(useLocation().search);
}

function verifyAuthorizationCode(code: string): Promise<any> {
    const url = '/auth/verify';
    return api
        .post(url, code, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
        .then((response) => response.data);
}

export function Login(props: any) {
    const history = useHistory();
    const authorizationCode: string = useQuery().get('code') as string;

    useEffect(() => {
        if (!!authorizationCode) {
            verifyAuthorizationCode(authorizationCode).then((result) => {
                const idToken = result['id_token'];
                const accessToken = result['access_token'];
                const refreshToken = result['refresh_token'];
                const expiresIn = result['expires_in'];
                const tokenType = result['token_type'];
                localStorage.setItem(
                    'tokens',
                    JSON.stringify({
                        idToken,
                        accessToken,
                        refreshToken,
                        expiresIn,
                        tokenType,
                    })
                );
                history.push('/');
            });
        }
    }, []);

    return <h1>Token received from Cognito: {authorizationCode}</h1>;
}
