import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const useSessionTimer = (isActive = true) => {
    const [seconds, setSeconds] = useState(0);
    const { user } = useAuth();
    const [unsavedSeconds, setUnsavedSeconds] = useState(0);

    // 1. Timer logic
    useEffect(() => {
        let interval = null;
        if (isActive) {
            interval = setInterval(() => {
                setSeconds(s => s + 1);
                setUnsavedSeconds(s => s + 1);
            }, 1000);
        } else if (!isActive && seconds !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isActive, seconds]);

    // 2. Heartbeat logic (save every 10s or when unsaved > 10)
    useEffect(() => {
        const saveProgress = async () => {
            // console.log(`Checking timer... unsaved: ${unsavedSeconds}, user: ${user ? 'yes' : 'no'}`);
            if (unsavedSeconds >= 10 && user) {
                try {
                    // use stored token because 'user' is the postgres profile (plain object), not firebase user
                    const storedToken = localStorage.getItem('token');

                    if (!storedToken) {
                        console.error("No token found for saving time.");
                        return;
                    }

                    console.log(`Saving progress: ${unsavedSeconds}s for user ${user.id}`);
                    await axios.post('http://localhost:5000/api/user/update-time',
                        { seconds: unsavedSeconds },
                        { headers: { Authorization: `Bearer ${storedToken}` } }
                    );
                    setUnsavedSeconds(0);
                } catch (error) {
                    console.error("Failed to save time:", error);
                }
            } else if (unsavedSeconds >= 10 && !user) {
                console.warn("Timer ready to save but no user found in context.");
            }
        };

        const heartbeat = setInterval(saveProgress, 5000); // check every 5s
        return () => clearInterval(heartbeat);
    }, [unsavedSeconds, user]);

    // format time helper
    const formattedTime = () => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}m ${s}s`;
    };

    return { seconds, formattedTime };
};

export default useSessionTimer;
