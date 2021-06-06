import { useEffect } from "react";
import { useHistory } from "react-router";

export function Logout() {
    const history = useHistory();
    useEffect(() => {
        localStorage.removeItem('tokens');
        history.push('/');
    }, []);

    return <h1>Logout</h1>;
}