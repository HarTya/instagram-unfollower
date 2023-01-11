import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import Eye from '../components/Eye';
import styles from '../styles/Home.module.scss';
import connect from 'socket.io-client';

export default function Home() {
    const button = useRef<HTMLButtonElement>(null);
    const [loggedIn, setLoggedIn] = useState(false);

    const [data, setData] = useState({
        username: '',
        password: ''
    });

    const [isPasswordVisible, setIsPasswordVisible] = useState(false);

    const [loading, setLoading] = useState(false);

    const [response, setResponse] = useState({
        visible: false,
        text: ''
    });

    const [error, setError] = useState({
        visible: false,
        text: ''
    });

    const resetStatus = () => {
        setError({ ...error, visible: false });
        setResponse({ ...response, visible: false });
    };

    const unfollower = (username: string, password: string) => {
        setLoading(true);
        resetStatus();

        axios.post('/api/unfollower', {
            username,
            password
        })
    };

    useEffect((): any => {
        const base_url = process.env.BASE_URL;
        const socket = connect(`${base_url}`, {
            path: '/api/socket',
        });

        socket.on('connect', () => {
            console.log('SOCKET CONNECTED!', socket.id);
        });

        socket.on('loggedInError', (text: string) => {
            setLoading(false);
            setError({ visible: true, text });
        });

        socket.on('loggedIn', (text: string) => {
            setLoading(false);
            setLoggedIn(true);
            setResponse({ visible: true, text });
        });

        socket.on('error', (text: string) => {
            setLoggedIn(false);
            setError({ visible: true, text });
        });

        socket.on('unfollow', (text: string) => {
            setResponse({ visible: true, text });
        });

        socket.on('unfollowError', (text: string) => {
            setError({ visible: true, text });
        });

        socket.on('doneError', (text: string) => {
            setLoggedIn(false);
            setError({ visible: true, text });
        });

        socket.on('done', (text: string) => {
            setLoggedIn(false);
            setResponse({ visible: true, text });
        });

        if (socket) return () => socket.disconnect();
    }, []);

    useEffect(() => {
        setResponse({ ...response, visible: false });
    }, [error.visible])

    return (
        <div className={styles.home}>
            <main>
                <div>
                    <input
                        autoFocus
                        value={data.username}
                        onChange={e => {
                            setData({ ...data, username: e.target.value });
                            resetStatus();
                        }}
                        placeholder={'Username'}
                        onKeyDown={(e) => {
                            if (button.current) {
                                if (e.key === 'Enter' && button.current.id === 'active') {
                                    unfollower(data.username, data.password);
                                }
                            }
                        }}
                    />
                </div>
                <div id={'input-password'}>
                    <input
                        value={data.password}
                        onChange={e => {
                            setData({ ...data, password: e.target.value });
                            resetStatus();
                        }}
                        type={isPasswordVisible ? 'text' : 'password'}
                        placeholder={'Password'}
                        onKeyDown={(e) => {
                            if (button.current) {
                                if (e.key === 'Enter' && button.current.id === 'active') {
                                    unfollower(data.username, data.password);
                                }
                            }
                        }}
                    />
                    <span
                        id={!data.password ? 'disabled' : 'active'}
                        onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    >
                        <Eye size={'2vw'} close={!isPasswordVisible} />
                    </span>
                </div>
                <button
                    ref={button}
                    onClick={() => unfollower(data.username, data.password)}
                    id={!data.username.trim() || !data.password || loading || loggedIn ? 'disabled' : 'active'}
                >
                    {loading ? 'Login...' : loggedIn ? 'Logged in' : 'Login'}
                </button>
                <p
                    onClick={() => setError({ ...error, visible: false })}
                    className={error.visible ? 'error active' : 'error'}
                >
                    {error.text}
                </p>
                <p
                    onClick={() => setResponse({ ...response, visible: false })}
                    className={response.visible ? 'response active' : 'response'}
                >
                    {response.text}
                </p>
            </main>
        </div>
    )
}