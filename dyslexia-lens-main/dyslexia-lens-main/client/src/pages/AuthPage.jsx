import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { login, register, loginGoogle, loading: authLoading } = useAuth();
    // note: authLoading comes from context if we exposed it, otherwise local state

    const { name, email, password } = formData;
    const [localLoading, setLocalLoading] = useState(false);

    const onChange = (e) => {
        setFormData((prevState) => ({
            ...prevState,
            [e.target.name]: e.target.value,
        }));
    };

    const handleAuth = async (e) => {
        e.preventDefault();
        setError('');
        setLocalLoading(true);

        let result;
        if (isLogin) {
            result = await login(email, password);
        } else {
            result = await register(name, email, password);
        }

        if (result && result.success) {
            navigate('/dashboard');
        } else {
            setError(result?.message || 'Authentication failed');
        }
        setLocalLoading(false);
    };

    const handleGoogleLogin = async () => {
        setError('');
        setLocalLoading(true);
        const result = await loginGoogle();
        if (result && result.success) {
            navigate('/dashboard');
        } else {
            setError(result?.message || 'Google Login failed');
        }
        setLocalLoading(false);
    };

    return (
        <div className="min-h-screen bg-[linear-gradient(to_bottom,#FFF2D0,#595342)] flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* background/logo  */}
            <Link to="/" className="absolute top-8 left-8 flex items-center gap-3 hover:opacity-80 transition-opacity">
                <img src="/gold-search-icon.svg" alt="Dyslexia Lens Logo" className="w-8 h-8" />
                <span className="text-xl font-bold text-[#1A1A1A]">Dyslexia-Lens</span>
            </Link>

            {/* glassmorphism card  */}
            <div className="w-full max-w-md bg-white/20 backdrop-blur-xl border border-white/40 rounded-3xl shadow-2xl p-8 md:p-12 relative overflow-hidden">
                {/* toggle header  */}
                <div className="flex justify-center gap-8 mb-10">
                    <button
                        onClick={() => { setIsLogin(false); setError(''); }}
                        className={`text-2xl font-bold transition-colors ${!isLogin ? 'text-[#897949]' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Sign-Up
                    </button>
                    <button
                        onClick={() => { setIsLogin(true); setError(''); }}
                        className={`text-2xl font-bold transition-colors ${isLogin ? 'text-[#897949]' : 'text-gray-500 hover:text-gray-700'
                            }`}
                    >
                        Login
                    </button>
                </div>

                {/* error message  */}
                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative mb-4 text-center">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* form  */}
                <form className="space-y-6" onSubmit={handleAuth}>
                    {!isLogin && (
                        <div>
                            <input
                                type="text"
                                placeholder="Name"
                                name="name"
                                value={name}
                                onChange={onChange}
                                className="w-full px-6 py-3 rounded-full bg-white/30 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#897949]/50 placeholder-gray-500 text-[#4A4A4A] transition-all"
                            />
                        </div>
                    )}

                    <div>
                        <input
                            type="email"
                            placeholder="Email"
                            name="email"
                            value={email}
                            onChange={onChange}
                            className="w-full px-6 py-3 rounded-full bg-white/30 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#897949]/50 placeholder-gray-500 text-[#4A4A4A] transition-all"
                        />
                    </div>

                    <div>
                        <input
                            type="password"
                            placeholder="Password"
                            name="password"
                            value={password}
                            onChange={onChange}
                            className="w-full px-6 py-3 rounded-full bg-white/30 border border-white/20 focus:outline-none focus:ring-2 focus:ring-[#897949]/50 placeholder-gray-500 text-[#4A4A4A] transition-all"
                        />
                    </div>

                    <div className="pt-4 flex justify-center">
                        <button
                            type="submit"
                            disabled={localLoading}
                            className="px-10 py-3 rounded-full bg-gradient-to-b from-[#D4AF37] to-[#897949] text-white font-bold text-lg shadow-[0_4px_14px_0_rgba(137,121,73,0.39)] hover:shadow-[0_6px_20px_rgba(137,121,73,0.23)] hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {localLoading ? 'Processing...' : (isLogin ? 'Login' : 'Register')}
                        </button>
                    </div>
                </form>

                <div className="flex items-center gap-4 my-6">
                    <div className="h-px bg-[#A19981] flex-1"></div>
                    <span className="text-[#595342] font-bold">OR</span>
                    <div className="h-px bg-[#A19981] flex-1"></div>
                </div>

                <button
                    onClick={handleGoogleLogin}
                    disabled={localLoading}
                    className="w-full bg-white text-[#1A1A1A] py-3 rounded-full font-bold text-lg hover:bg-gray-50 transition-colors shadow-md border border-[#E5DCC5] flex items-center justify-center gap-3 disabled:opacity-50"
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
                    Sign in with Google
                </button>

            </div>
        </div>
    );
};

export default AuthPage;
