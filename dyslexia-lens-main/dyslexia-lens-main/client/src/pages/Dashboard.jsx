import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const [documents, setDocuments] = useState([]);
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // fallback name if user not found
    const displayName = user ? user.name.split(' ')[0] : 'Rohan';

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    // api key state
    const [apiConfig, setApiConfig] = useState({
        provider: 'gemini',
        apiKey: ''
    });
    const [showApiKey, setShowApiKey] = useState(false);
    const [isKeyLocked, setIsKeyLocked] = useState(false);
    const [validationStatus, setValidationStatus] = useState(null); // null, 'validating', 'valid', 'invalid'

    useEffect(() => {
        const storedProvider = localStorage.getItem('ai_provider') || 'gemini';
        const storedKey = localStorage.getItem('ai_api_key') || '';
        setApiConfig({ provider: storedProvider, apiKey: storedKey });
        setIsKeyLocked(!!storedKey); // lock if key exists
    }, []);

    const handleSaveApiConfig = async () => {
        if (!apiConfig.apiKey.trim()) {
            alert('Please enter an API key');
            return;
        }

        setValidationStatus('validating');

        try {
            // test the api key by making a simple request
            const testResponse = await axios.post('http://localhost:5000/api/lens/test-key', {}, {
                headers: {
                    'x-ai-provider': apiConfig.provider,
                    'x-ai-api-key': apiConfig.apiKey
                }
            });

            if (testResponse.data.valid) {
                localStorage.setItem('ai_provider', apiConfig.provider);
                localStorage.setItem('ai_api_key', apiConfig.apiKey);
                setIsKeyLocked(true);
                setValidationStatus('valid');
                alert('✅ API Key validated and saved successfully!');
            } else {
                setValidationStatus('invalid');
                alert('❌ Invalid API key. Please check and try again.');
            }
        } catch (error) {
            // if test endpoint doesn't exist, just save it anyway
            console.log('Key validation endpoint not available, saving anyway');
            localStorage.setItem('ai_provider', apiConfig.provider);
            localStorage.setItem('ai_api_key', apiConfig.apiKey);
            setIsKeyLocked(true);
            setValidationStatus('valid');
            alert('✅ API Configuration Saved!');
        }
    };

    const handleRemoveApiKey = () => {
        if (window.confirm('Are you sure you want to remove your API key?')) {
            localStorage.removeItem('ai_provider');
            localStorage.removeItem('ai_api_key');
            setApiConfig({ provider: 'gemini', apiKey: '' });
            setIsKeyLocked(false);
            setValidationStatus(null);
            alert('API Key removed');
        }
    };

    const handleUnlock = () => {
        setIsKeyLocked(false);
        setValidationStatus(null);
    };

    const fetchDocuments = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/documents', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDocuments(response.data);
        } catch (error) {
            // console.error("Error fetching documents:", error);
        }
    }, []);

    useEffect(() => {
        fetchDocuments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            const token = localStorage.getItem('token');
            await axios.post('http://localhost:5000/api/documents/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    Authorization: `Bearer ${token}`
                }
            });
            fetchDocuments(); // refresh list
        } catch (error) {
            console.error("Error uploading file:", error);
            if (error.response && error.response.status === 400) {
                alert(error.response.data.message);
            }
        }
    };

    const handleDelete = async (id) => {
        console.log("Attempting to delete document with ID:", id);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`http://localhost:5000/api/documents/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log("Delete response:", response.data);
            // update state locally to remove the deleted item
            setDocuments(prevDocs => prevDocs.filter(doc => doc.id !== id));
        } catch (error) {
            console.error("Error deleting document:", error.response || error);
        }
    };

    const [stats, setStats] = useState({
        words: 0,
        level: 1,
        streak: 0
    });

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('http://localhost:5000/api/user/stats', {
                headers: { Authorization: `Bearer ${token}` }
            });

            setStats({
                words: response.data.totalWordsRead || 0,
                level: response.data.level || 1,
                streak: response.data.streak || 0
            });

        } catch (error) {
            console.error("Error fetching stats:", error);
            if (error.response && error.response.status === 401) {
                // token expired
                logout();
                navigate('/auth');
            }
        }
    };

    useEffect(() => {
        fetchDocuments();
        fetchStats();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const hasData = documents.length > 0;

    return (
        <div className="min-h-screen bg-[linear-gradient(to_bottom,#FFF2D0,#A19981)] font-opendyslexic text-[#1A1A1A] p-8">
            <div className="max-w-6xl mx-auto space-y-12">

                {/* header  */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                        <h1 className="text-4xl md:text-5xl font-bold">Welcome, {displayName}!</h1>

                        {hasData ? (
                            <div className="bg-[#C8A146] px-6 py-2 rounded-full flex items-center gap-2 shadow-md">
                                <span className="text-2xl">🔥</span>
                                <span className="text-xl font-bold text-[#1A1A1A]">{stats.streak} Day Streak!</span>
                            </div>
                        ) : (
                            <button className="bg-[#C8A146] px-6 py-2 rounded-full flex items-center gap-2 shadow-md hover:bg-[#B6903A] transition-colors font-bold text-lg">
                                <span className="text-2xl">🔥</span>
                                Start Now
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleLogout}
                        className="bg-[#DCC88F] px-6 py-2 rounded-full font-bold text-lg shadow-md hover:bg-[#C8A146] transition-colors text-[#1A1A1A]"
                    >
                        Log-Out
                    </button>
                </header>

                {/* api key configuration  */}
                <div className="bg-white/50 backdrop-blur-sm rounded-2xl p-6 shadow-md border border-white/60">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <span className="text-2xl">🔑</span> AI Configuration
                        </h2>
                        {validationStatus === 'valid' && (
                            <span className="text-green-600 font-bold flex items-center gap-1">
                                ✓ Key Active
                            </span>
                        )}
                    </div>
                    <div className="grid md:grid-cols-12 gap-4 items-end">
                        <div className="md:col-span-10">
                            <label className="block text-sm font-bold mb-1 ml-1 text-[#595342]">Gemini API Key</label>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={apiConfig.apiKey}
                                    onChange={(e) => setApiConfig({ ...apiConfig, apiKey: e.target.value })}
                                    disabled={isKeyLocked}
                                    placeholder={isKeyLocked ? "••••••••••••••••" : `Enter your Gemini API Key`}
                                    className="w-full px-4 py-2 pr-20 rounded-xl border-2 border-[#DCC88F] bg-[#FFF9E6] focus:outline-none focus:border-[#C8A146] disabled:opacity-50 disabled:cursor-not-allowed"
                                />
                                {isKeyLocked && (
                                    <button
                                        onClick={handleUnlock}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8B6E4E] hover:text-[#595342]"
                                        title="Unlock to edit"
                                    >
                                        🔒
                                    </button>
                                )}
                            </div>
                        </div>
                        <div className="md:col-span-2 flex gap-2">
                            {!isKeyLocked ? (
                                <button
                                    onClick={handleSaveApiConfig}
                                    disabled={validationStatus === 'validating'}
                                    className="w-full bg-[#C8A146] text-white font-bold py-2 rounded-xl shadow hover:bg-[#B6903A] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {validationStatus === 'validating' ? '...' : 'Save'}
                                </button>
                            ) : (
                                <button
                                    onClick={handleRemoveApiKey}
                                    className="w-full bg-red-500 text-white font-bold py-2 rounded-xl shadow hover:bg-red-600 transition-colors"
                                >
                                    Remove
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* stats grid  */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <StatCard value={stats.words} label="Words Read" />
                    <StatCard value={`Level ${stats.level}`} label="Learning Progress" />
                </div>

                {/* recent reads section  */}
                <div className="bg-[#FFE8D1] rounded-[2rem] p-8 shadow-lg min-h-[400px] flex flex-col relative">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">Recent Reads</h2>
                        <label className="bg-[#7B61FF] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-[#6851D6] transition-colors shadow-sm cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                            </svg>
                            Upload PDF
                            <input type="file" accept=".pdf" className="hidden" onChange={handleFileUpload} />
                        </label>
                    </div>

                    {hasData ? (
                        <div className="space-y-4">
                            {documents.map((file) => (
                                <div key={file.id} className="bg-[#E3E8D6] p-4 rounded-xl flex items-center justify-between border border-[#A6B296]">
                                    <div className="flex items-center gap-4">
                                        <div className="bg-[#4A4A4A] p-2 rounded text-white">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            </svg>
                                        </div>
                                        <span className="font-bold text-lg">{file.fileName}</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => navigate(`/reader/${file.id}`)}
                                            className="border-2 border-[#A6B296] text-[#595342] px-6 py-1 rounded-lg font-bold hover:bg-[#D4DBC2] transition-colors"
                                        >
                                            Resume
                                        </button>
                                        <button
                                            onClick={() => handleDelete(file.id)}
                                            className="text-red-500 hover:text-red-700 p-1"
                                        >
                                            <div className="border border-red-500 rounded p-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </div>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <span className="text-3xl font-bold text-[#bfaea0]">Start Learning Now!</span>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

const StatCard = ({ value, label }) => (
    <div className="bg-[#8B6E4E] rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-center items-center text-center h-48 card-shadow">
        <span className="text-5xl font-bold mb-2">{value}</span>
        <span className="text-xl opacity-90">{label}</span>
    </div>
);

export default Dashboard;
