import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Document, Page, pdfjs } from 'react-pdf';
import FocusRuler from '../components/FocusRuler';
import DyslexicText from '../components/DyslexicText';

// configure pdf worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const Reader = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();

    // pdf state
    const [numPages, setNumPages] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const [pdfUrl, setPdfUrl] = useState(null);
    const canvasRef = useRef(null);
    const pageRef = useRef(null);

    // analysis state
    const [analysis, setAnalysis] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [error, setError] = useState(null);

    // tools state
    // tools state
    const [showSimplify, setShowSimplify] = useState(true); // renamed from showsyllables
    const [showVisuals, setShowVisuals] = useState(true);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isFocusMode, setIsFocusMode] = useState(false);
    const speechRef = useRef(null);

    useEffect(() => {
        const fetchDocument = async () => {
            try {
                const token = localStorage.getItem('token');

                // 1. Fetch Metadata (for lastPage, fileName, etc.)
                const metaResponse = await axios.get(`http://localhost:5000/api/documents/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // set initial page from saved progress
                if (metaResponse.data.lastPage) {
                    setPageNumber(metaResponse.data.lastPage);
                }

                // 2. Fetch Content (PDF Blob)
                const contentResponse = await axios.get(`http://localhost:5000/api/documents/${id}/content`, {
                    headers: { Authorization: `Bearer ${token}` },
                    responseType: 'blob'
                });
                const url = window.URL.createObjectURL(new Blob([contentResponse.data], { type: 'application/pdf' }));
                setPdfUrl(url);

            } catch (err) {
                console.error("Error loading PDF:", err);
                setError("Failed to load document.");
            }
        };
        if (user) fetchDocument();
    }, [id, user]);

    // save progress (debounced)
    useEffect(() => {
        const saveProgress = setTimeout(async () => {
            if (pageNumber > 0) {
                try {
                    const token = localStorage.getItem('token');
                    await axios.put(`http://localhost:5000/api/documents/${id}/progress`,
                        { pageNumber },
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    // console.log("Progress saved:", pageNumber);
                } catch (error) {
                    console.error("Failed to save progress:", error);
                }
            }
        }, 1000); // save after 1 second of no page turns

        return () => clearTimeout(saveProgress);
    }, [pageNumber, id]);

    const onDocumentLoadSuccess = ({ numPages }) => {
        setNumPages(numPages);
    };

    // capture and analyze page
    const captureAndAnalyze = async () => {
        if (!pageRef.current) return;

        setAnalyzing(true);
        setAnalysis(null);
        setError(null);

        try {
            // wait a brief moment for render to complete
            setTimeout(async () => {
                const canvas = pageRef.current.querySelector('canvas');
                if (!canvas) {
                    setAnalyzing(false);
                    return;
                }

                canvas.toBlob(async (blob) => {
                    if (!blob) return;

                    const formData = new FormData();
                    formData.append('file', blob, 'page.png');

                    try {
                        const token = localStorage.getItem('token');
                        const provider = localStorage.getItem('ai_provider') || 'gemini';
                        const apiKey = localStorage.getItem('ai_api_key') || '';

                        // use node backend proxy which handles python + gamification (words/xp)
                        const response = await axios.post('http://localhost:5000/api/lens/analyze-image', formData, {
                            headers: {
                                'Content-Type': 'multipart/form-data',
                                Authorization: `Bearer ${token}`,
                                'x-ai-provider': provider,
                                'x-ai-api-key': apiKey
                            }
                        });

                        setAnalysis(response.data);
                        console.log("Analysis & Gamification Result:", response.data);

                    } catch (aiErr) {
                        console.error("AI Error:", aiErr);
                        setError("Failed to analyze page.");
                    } finally {
                        setAnalyzing(false);
                    }
                }, 'image/png');
            }, 500); // 500ms delay for canvas render

        } catch (err) {
            console.error("Capture error:", err);
            setAnalyzing(false);
        }
    };

    // trigger analysis when page changes
    useEffect(() => {
        if (pdfUrl && pageNumber) {
            // auto-analyze on page load? user requirement: "immediately capture... send... show loading"
            // we need to wait for react-pdf to render.
            // onRenderSuccess callback on Page component is best.
        }
    }, [pageNumber, pdfUrl]);

    const handlePageRenderSuccess = () => {
        captureAndAnalyze();
    };

    const changePage = (offset) => {
        setPageNumber(prev => Math.min(Math.max(1, prev + offset), numPages || 1));
    };

    // text-to-speech logic
    const handleSpeak = () => {
        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        if (!analysis) return;

        const textToRead = showSimplify ? analysis.simplified_text : analysis.chunked_text;
        // clean text for speech (remove dots and emojis)
        const cleanSpeech = textToRead.replace(/[·•]/g, '').replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u, '');

        const utterance = new SpeechSynthesisUtterance(cleanSpeech);
        utterance.onend = () => setIsSpeaking(false);
        window.speechSynthesis.speak(utterance);
        setIsSpeaking(true);
    };

    // stop speech on unmount
    useEffect(() => {
        return () => window.speechSynthesis.cancel();
    }, []);

    // render logic

    return (
        <div className="h-screen flex flex-col bg-[#FDF6E3]">
            {/* toolbar  */}
            <div className="h-16 bg-[#FFF2D0] flex items-center justify-between px-8 shadow-md z-20">
                <div className="flex items-center gap-4">
                    <button onClick={() => navigate('/dashboard')} className="text-[#8B6E4E] font-bold hover:underline">
                        Exit
                    </button>
                    <div className="flex items-center gap-2">
                        <button disabled={pageNumber <= 1} onClick={() => changePage(-1)} className="px-3 py-1 bg-white rounded shadow disabled:opacity-50">‹</button>
                        <span className="font-bold text-[#8B6E4E]">Page {pageNumber} of {numPages || '--'}</span>
                        <button disabled={pageNumber >= numPages} onClick={() => changePage(1)} className="px-3 py-1 bg-white rounded shadow disabled:opacity-50">›</button>
                    </div>
                </div>

                <div className="flex gap-4">
                    <button
                        onClick={() => setIsFocusMode(!isFocusMode)}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${isFocusMode ? 'bg-[#C8A146] text-white' : 'bg-white text-[#8B6E4E]'}`}
                    >
                        Focus {isFocusMode ? 'ON' : 'OFF'}
                    </button>

                    <button
                        onClick={handleSpeak}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${isSpeaking ? 'bg-red-500 text-white' : 'bg-white text-[#8B6E4E]'}`}
                    >
                        {isSpeaking ? 'Stop' : 'Listen 🔊'}
                    </button>

                    <button
                        onClick={() => setShowSimplify(!showSimplify)}
                        className={`px-4 py-2 rounded-lg font-bold transition-colors ${showSimplify ? 'bg-[#C8A146] text-white' : 'bg-white text-[#8B6E4E]'}`}
                    >
                        Simplify {showSimplify ? 'ON' : 'OFF'}
                    </button>
                </div>
            </div>

            {/* content grid  */}
            <div className="grid grid-cols-12 h-[calc(100vh-64px)] overflow-hidden">

                {/* left: pdf page (smaller - 4 cols)  */}
                <div className="col-span-4 bg-gray-200 flex items-start justify-center overflow-auto p-4 border-r border-[#DCC88F]">
                    {pdfUrl && (
                        <div ref={pageRef} className="shadow-lg mt-4">
                            <Document
                                file={pdfUrl}
                                onLoadSuccess={onDocumentLoadSuccess}
                                loading={<div className="text-gray-500">Loading document...</div>}
                            >
                                <Page
                                    pageNumber={pageNumber}
                                    width={350}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    onRenderSuccess={handlePageRenderSuccess}
                                />
                            </Document>
                        </div>
                    )}
                </div>

                {/* right: analysis (larger - 8 cols) with scoped focus ruler  */}
                <div className="col-span-8 bg-[#FDF6E3] relative h-full overflow-hidden">
                    <FocusRuler isActive={isFocusMode} />
                    <div className="h-full overflow-y-auto p-12">
                        <h2 className="text-4xl font-bold mb-8 text-[#8B6E4E] font-opendyslexic">
                            Dyslexia Lens
                        </h2>

                        {analyzing ? (
                            <div className="animate-pulse space-y-4">
                                <div className="h-4 bg-[#E5DCC5] rounded w-3/4"></div>
                                <div className="h-4 bg-[#E5DCC5] rounded w-full"></div>
                                <div className="h-4 bg-[#E5DCC5] rounded w-5/6"></div>
                                <div className="text-[#8B6E4E] font-bold mt-4">Analyzing page...</div>
                            </div>
                        ) : error ? (
                            <div className="text-red-500">{error}</div>
                        ) : (
                            <div className="prose max-w-none text-2xl leading-[3rem] tracking-[0.2em] font-opendyslexic text-[#1A1A1A]">
                                {analysis ? (
                                    <DyslexicText
                                        text={showSimplify ? analysis.simplified_text : analysis.chunked_text}
                                        analysis={analysis}
                                    />
                                ) : (
                                    <p className="text-gray-500 italic">Page loaded. Analysis starting...</p>
                                )}

                                {analysis?.visuals?.length > 0 && showVisuals && (
                                    <div className="mt-8 border-t border-[#DCC88F] pt-4">
                                        <h3 className="font-bold text-[#8B6E4E] mb-2">Visual Anchors</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {analysis.visuals.map((v, i) => (
                                                <div key={i} className="bg-white px-3 py-1 rounded-full shadow text-sm border border-[#E5DCC5]">
                                                    {v.emoji} {v.word}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Reader;
