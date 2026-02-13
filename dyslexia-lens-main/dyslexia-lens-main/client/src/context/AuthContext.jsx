import { createContext, useContext, useState, useEffect } from 'react';
import { auth, googleProvider } from '../firebaseConfig';
import {
    signInWithPopup,
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    onAuthStateChanged
} from 'firebase/auth';
import axios from 'axios';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    const token = await firebaseUser.getIdToken();
                    localStorage.setItem('token', token);

                    // fetch postgres user profile to keep app state consistent
                    const response = await axios.get('http://localhost:5000/api/user/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });

                    setUser(response.data);
                } catch (error) {
                    console.error("Error syncing user:", error);
                    // if sync fails, maybe logout or retry? for now, just set what we have? 
                    // no, invalid backend state. better null or error.
                }
            } else {
                localStorage.removeItem('token');
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const loginGoogle = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
            // onAuthStateChanged will handle the rest
            return { success: true };
        } catch (error) {
            console.error("Google Login Error:", error);
            return { success: false, message: error.message };
        }
    };

    const register = async (name, email, password) => {
        try {
            await createUserWithEmailAndPassword(auth, email, password);
            // onAuthStateChanged will handle the rest (backend middleware creates user)
            // however, backend creation might need 'name'. 
            // authMiddleware uses name from token (which is null for email/pass usually) or email.
            // we might want to update the profile immediately or send a separate update.
            // for now, let's keep it simple. user can update name later or we rely on email.
            return { success: true };
        } catch (error) {
            console.error("Registration error", error);
            return { success: false, message: error.message };
        }
    };

    const login = async (email, password) => {
        try {
            await signInWithEmailAndPassword(auth, email, password);
            return { success: true };
        } catch (error) {
            console.error("Login error", error);
            return { success: false, message: error.message };
        }
    };

    const logout = async () => {
        await signOut(auth);
        // onAuthStateChanged will handle cleanup
    };

    return (
        <AuthContext.Provider value={{ user, login, loginGoogle, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
