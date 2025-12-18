import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic, MicOff, Upload, FileText, Sparkles,
    ArrowRight, CheckCircle2, AlertCircle, Loader2,
    ChevronLeft, Copy, Printer
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/axiosConfig';

const ChronologyGenerator = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('narrative'); // 'narrative' or 'upload'
    const [narrativeText, setNarrativeText] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const recognitionRef = useRef(null);

    // -- SEARCH & DATA STATES --
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const searchTimeoutRef = useRef(null);

    // Patient Search Handler
    const handleSearch = async (term) => {
        setSearchTerm(term);
        if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

        if (term.length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        searchTimeoutRef.current = setTimeout(async () => {
            try {
                const response = await api.get(`/patients/search?q=${term}`);
                setSearchResults(response.data);
                setShowResults(true);
            } catch (err) {
                console.error("Search failed", err);
            }
        }, 500);
    };

    const selectPatient = (patient) => {
        setSelectedPatient(patient);
        setSearchTerm(`${patient.name} (${patient.no_rm})`);
        setShowResults(false);
        // Auto-fill narrative context if empty
        if (!narrativeText) {
            setNarrativeText(`Pasien atas nama ${patient.name} dengan nomor RM ${patient.no_rm} mengalami kejadian...`);
        }
    };

    // Initialize Speech Recognition
    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'id-ID';

            recognition.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setNarrativeText(prev => prev + ' ' + finalTranscript);
                }
            };

            recognition.onerror = (event) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleGenerate = async () => {
        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const formData = new FormData();
            if (activeTab === 'upload' && selectedFile) {
                formData.append('file', selectedFile);
            } else if (activeTab === 'narrative' && narrativeText) {
                formData.append('text', narrativeText);
            } else {
                setError("Please provide some text or upload a file first.");
                setIsLoading(false);
                return;
            }

            // Using shared api client which handles baseURL and Auth token
            const response = await api.post('/chronology/generate', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                // MERGE Logic: Override AI data with Trusted Database Data
                let finalData = response.data.data;

                // Helper to parse date
                if (finalData.waktuKejadian) {
                    // Try to normalize if needed, but AI usually follows instruction
                }

                if (selectedPatient) {
                    finalData = {
                        ...finalData,
                        namaPasien: selectedPatient.name,
                        noBPJS: selectedPatient.bpjs_no || finalData.noBPJS,
                        alamatPasien: selectedPatient.address || finalData.alamatPasien
                    };
                }
                setResult(finalData);
            }
        } catch (err) {
            console.error("Generation failed", err);
            setError(err.response?.data?.error || "Failed to generate chronology. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (!result) return;
        const text = JSON.stringify(result, null, 2);
        navigator.clipboard.writeText(text);
    };

    const handlePrint = () => {
        window.print();
    };

    const handleResultChange = (field, value) => {
        setResult(prev => ({
            ...prev,
            [field]: value
        }));
    };

    return (
        <div className="min-h-screen bg-theme-bg p-6 lg:p-10 font-sans text-theme-text transition-colors duration-300 print:p-0 print:bg-white">
            {/* Header - Hidden on Print */}
            <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                    >
                        <ChevronLeft size={24} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
                            AI Chronology Assistant
                        </h1>
                        <p className="text-theme-text-secondary opacity-80">
                            Generate detailed medical chronologies from voice, text, or reports.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 print:block">
                {/* Input Section - Hidden on Print */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-theme-card dark:bg-gray-800/50 backdrop-blur-xl rounded-3xl p-6 border border-white/10 shadow-2xl relative overflow-hidden print:hidden"
                >
                    {/* Decorative Gradients */}
                    <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

                    {/* Patient Search Bar (Integration Feature) */}
                    <div className="relative z-20 mb-6 group">
                        <label className="text-sm text-gray-400 mb-1 block pl-1 uppercase font-bold text-[10px]">1. Link Patient Data (Optional)</label>
                        <div className="relative">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                                <Sparkles size={16} />
                            </div>
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => handleSearch(e.target.value)}
                                onFocus={() => searchTerm.length >= 2 && setShowResults(true)}
                                placeholder="Search by Name, RM, or BPJS..."
                                className="w-full bg-black/10 dark:bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder:text-gray-500"
                            />
                            {/* Search Results Dropdown */}
                            <AnimatePresence>
                                {showResults && searchResults.length > 0 && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: 10 }}
                                        className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-50 max-h-[300px] overflow-y-auto"
                                    >
                                        {searchResults.map((p) => (
                                            <div
                                                key={p.id}
                                                onClick={() => selectPatient(p)}
                                                className="p-3 hover:bg-blue-50 dark:hover:bg-gray-700 cursor-pointer border-b border-gray-100 dark:border-gray-700 last:border-none flex justify-between items-center group"
                                            >
                                                <div>
                                                    <p className="font-bold text-gray-800 dark:text-gray-200 group-hover:text-blue-600">{p.name}</p>
                                                    <p className="text-xs text-gray-500">RM: {p.no_rm} | NIK: {p.nik}</p>
                                                    {p.bpjs_no && <p className="text-xs text-green-600 font-medium">BPJS: {p.bpjs_no}</p>}
                                                </div>
                                                <div className="text-gray-400">
                                                    <ArrowRight size={16} />
                                                </div>
                                            </div>
                                        ))}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex bg-black/10 dark:bg-white/5 p-1 rounded-2xl mb-6 relative z-10">
                        <button
                            onClick={() => setActiveTab('narrative')}
                            className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'narrative'
                                ? 'bg-white dark:bg-gray-700 shadow-lg text-blue-600 dark:text-blue-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <FileText size={18} />
                            Narrative & Voice
                        </button>
                        <button
                            onClick={() => setActiveTab('upload')}
                            className={`flex-1 py-3 px-6 rounded-xl text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${activeTab === 'upload'
                                ? 'bg-white dark:bg-gray-700 shadow-lg text-purple-600 dark:text-purple-400'
                                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                                }`}
                        >
                            <Upload size={18} />
                            Upload File
                        </button>
                    </div>

                    <div className="relative z-10 min-h-[400px]">
                        <AnimatePresence mode='wait'>
                            {activeTab === 'narrative' ? (
                                <motion.div
                                    key="narrative"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className="h-full flex flex-col"
                                >
                                    <textarea
                                        value={narrativeText}
                                        onChange={(e) => setNarrativeText(e.target.value)}
                                        placeholder="Start typing the chronology here, or use the microphone to dictate..."
                                        className="w-full flex-1 bg-white/50 dark:bg-black/20 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-base focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none transition-all placeholder:text-gray-400"
                                        style={{ minHeight: '300px' }}
                                    />
                                    <div className="mt-4 flex justify-between items-center">
                                        <button
                                            onClick={toggleListening}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all ${isListening
                                                ? 'bg-red-500/10 text-red-500 border border-red-500/20 animate-pulse'
                                                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                                                }`}
                                        >
                                            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
                                            {isListening ? 'Listening...' : 'Start Dictation'}
                                        </button>
                                        <p className="text-xs text-gray-400">
                                            {narrativeText.length} characters
                                        </p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="upload"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="h-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl bg-gray-50/50 dark:bg-black/20 hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer relative"
                                    onClick={() => document.getElementById('fileInput').click()}
                                >
                                    {/* Privacy Warning */}
                                    <div className="absolute top-4 left-4 right-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700/50 rounded-xl p-3 flex items-start gap-3 z-20">
                                        <AlertCircle size={20} className="text-yellow-600 dark:text-yellow-500 shrink-0 mt-0.5" />
                                        <div className="text-xs text-yellow-800 dark:text-yellow-300">
                                            <p className="font-bold mb-1">Privacy Notice</p>
                                            <p>Uploaded images are processed by AI. Please ensure you manually censor sensitive Personal Identifiable Information (PII) like NIK or Phone Numbers before uploading, as AI privacy filters may not catch text in images.</p>
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        id="fileInput"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                    {previewUrl ? (
                                        <div className="relative w-full h-full p-4 mt-16">
                                            <img
                                                src={previewUrl}
                                                alt="Preview"
                                                className="w-full h-full object-contain rounded-xl"
                                            />
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity rounded-xl">
                                                <p className="text-white font-medium">Click to change</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-center p-8 mt-8">
                                            <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                <Upload size={32} />
                                            </div>
                                            <h3 className="text-lg font-bold mb-2">Upload Document</h3>
                                            <p className="text-sm text-gray-500 max-w-xs mx-auto">
                                                Drag & drop or click to upload an image of the chronology form or handwritten notes.
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="mt-6">
                        <button
                            onClick={handleGenerate}
                            disabled={isLoading || (!narrativeText && !selectedFile)}
                            className="w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-lg shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-3"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={24} className="animate-spin" />
                                    Processing with Groq AI...
                                </>
                            ) : (
                                <>
                                    <Sparkles size={24} />
                                    Generate Chronology
                                </>
                            )}
                        </button>
                        {error && (
                            <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 flex items-center gap-3">
                                <AlertCircle size={20} />
                                <p className="text-sm">{error}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Result Section - Editable Paper */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="flex flex-col items-center"
                >
                    {/* Action Toolbar */}
                    <div className="w-full flex justify-between items-center mb-6 print:hidden">
                        <div className="flex items-center gap-2">
                            <div className="px-3 py-1 rounded-full bg-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wider">
                                Pixel Perfect Preview
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={copyToClipboard} className="p-2 bg-white hover:bg-gray-50 rounded-lg shadow text-gray-600 transition-colors" title="Copy JSON">
                                <Copy size={20} />
                            </button>
                            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition-colors shadow-lg" title="Print Form">
                                <Printer size={20} />
                                Print
                            </button>
                        </div>
                    </div>

                    {/* BPJS GUARD ALERT */}
                    {result?.warning && (
                        <div className="w-full bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded shadow-md print:hidden">
                            <div className="flex items-center gap-2">
                                <AlertCircle size={24} />
                                <div>
                                    <p className="font-bold">BPJS Eligibility Warning</p>
                                    <p>{result.warning}</p>
                                    <p className="text-xs mt-1 italic">Silakan verifikasi ulang apakah kasus ini dijamin BPJS.</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* A4 Paper Container - FORMULIR KRONOLOGIS STANDARD */}
                    <div
                        className="bg-white text-black shadow-2xl overflow-hidden print:shadow-none print:w-full print:h-auto print:overflow-visible print:m-0"
                        style={{
                            width: '210mm',
                            minHeight: '297mm',
                            padding: '20mm',
                            boxSizing: 'border-box',
                            fontFamily: '"Times New Roman", Times, serif',
                            lineHeight: '1.5',
                        }}
                    >
                        {result ? (
                            <div className="h-full flex flex-col justify-between relative">
                                <div>
                                    {/* KOP SURAT */}
                                    <div className="border-b-4 border-double border-black pb-4 mb-8 flex items-center gap-6">
                                        <div className="w-20 h-20 bg-gray-100 flex items-center justify-center border text-xs text-center font-bold print:grayscale shrink-0">
                                            LOGO RS
                                        </div>
                                        <div className="flex-1 text-center">
                                            <h1 className="text-2xl font-bold tracking-widest uppercase mb-1">Rumah Sakit Siaga Medika</h1>
                                            <p className="text-sm">Jl. Raya Purwokerto - Banyumas Km. 7, Banyumas, Jawa Tengah</p>
                                            <p className="text-sm">Telp: (0281) 1234567 | Email: info@siagamedika.co.id</p>
                                        </div>
                                    </div>

                                    {/* TITLE */}
                                    <div className="text-center mb-8">
                                        <h2 className="text-xl font-bold underline uppercase tracking-wide">Surat Kronologis Kejadian</h2>
                                        <p className="text-sm mt-1">No: ..... / SKK / ..... / {new Date().getFullYear()}</p>
                                    </div>

                                    {/* BODY */}
                                    <div className="text-justify text-base">
                                        <p className="mb-4">Yang bertanda tangan di bawah ini:</p>

                                        {/* Saksi / Pelapor Table */}
                                        <table className="w-full mb-6 ml-4">
                                            <tbody>
                                                <tr>
                                                    <td className="w-48 py-1">Nama</td>
                                                    <td className="w-4">:</td>
                                                    <td><input className="font-bold border-b border-black border-dashed w-full outline-none bg-transparent" value={result.namaSaksi || ""} onChange={(e) => handleResultChange('namaSaksi', e.target.value)} /></td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">Alamat</td>
                                                    <td>:</td>
                                                    <td><input className="border-b border-black border-dashed w-full outline-none bg-transparent" value={result.alamatSaksi || ""} onChange={(e) => handleResultChange('alamatSaksi', e.target.value)} /></td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">Hubungan dengan Pasien</td>
                                                    <td>:</td>
                                                    <td><input className="border-b border-black border-dashed w-full outline-none bg-transparent" value={result.hubunganSaksi || ""} onChange={(e) => handleResultChange('hubunganSaksi', e.target.value)} /></td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <p className="mb-4">Dengan ini menyatakan kronologis kejadian yang menimpa pasien:</p>

                                        {/* Pasien Table */}
                                        <table className="w-full mb-6 ml-4">
                                            <tbody>
                                                <tr>
                                                    <td className="w-48 py-1">Nama Pasien</td>
                                                    <td className="w-4">:</td>
                                                    <td><input className="font-bold border-b border-black border-dashed w-full outline-none bg-transparent" value={result.namaPasien || ""} onChange={(e) => handleResultChange('namaPasien', e.target.value)} /></td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">No. BPJS / RM</td>
                                                    <td>:</td>
                                                    <td><input className="font-bold border-b border-black border-dashed w-full outline-none bg-transparent" value={result.noBPJS || ""} onChange={(e) => handleResultChange('noBPJS', e.target.value)} /></td>
                                                </tr>
                                                <tr>
                                                    <td className="py-1">Alamat</td>
                                                    <td>:</td>
                                                    <td><input className="border-b border-black border-dashed w-full outline-none bg-transparent" value={result.alamatPasien || ""} onChange={(e) => handleResultChange('alamatPasien', e.target.value)} /></td>
                                                </tr>
                                            </tbody>
                                        </table>

                                        <p className="mb-2 font-bold">Adalah sebagai berikut:</p>
                                        <div className="ml-4 mb-6">
                                            <p className="leading-loose mb-4">
                                                Pada <input className="text-center border-b border-black w-48 outline-none bg-transparent font-bold" value={result.waktuKejadian || ""} onChange={(e) => handleResultChange('waktuKejadian', e.target.value)} />,
                                                bertempat di <input className="border-b border-black w-64 outline-none bg-transparent font-bold" value={result.tempatKejadian || ""} onChange={(e) => handleResultChange('tempatKejadian', e.target.value)} />.
                                            </p>

                                            <div className="relative">
                                                <label className="block text-sm text-gray-400 print:hidden mb-1">Rincian Kronologis (Edit di sini):</label>
                                                <textarea
                                                    className="w-full h-[400px] border border-gray-300 p-4 text-justify leading-relaxed resize-none focus:ring-2 focus:ring-blue-100 outline-none bg-transparent rounded print:border-none print:p-0 print:h-auto print:overflow-visible"
                                                    value={result.penyebab || ""}
                                                    onChange={(e) => handleResultChange('penyebab', e.target.value)}
                                                    placeholder="Deskripsi kejadian..."
                                                />
                                            </div>
                                        </div>

                                        <p className="mt-8">
                                            Demikian surat pernyataan ini saya buat dengan sebenar-benarnya dan penuh tanggung jawab untuk dapat dipergunakan sebagaimana mestinya.
                                        </p>
                                    </div>
                                </div>

                                {/* SIGNATURES */}
                                <div className="mt-12 mb-8 flex justify-between items-end px-4">
                                    <div className="text-center w-56">
                                        <p className="mb-20">Saksi / Mengetahui</p>
                                        <input className="block w-full text-center font-bold border-b border-black outline-none bg-transparent" value="( .................................... )" readOnly />
                                    </div>
                                    <div className="text-center w-64">
                                        <p className="mb-1">Banyumas, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                        <p className="mb-4">Yang Membuat Pernyataan,</p>

                                        {/* Meterai Box */}
                                        <div className="relative mx-auto w-24 h-14 border border-gray-400 flex items-center justify-center text-[10px] text-gray-400 mb-2 print:border-dashed">
                                            METERAI 10.000
                                        </div>

                                        <input
                                            className="block w-full text-center font-bold border-b border-black outline-none bg-transparent"
                                            value={result.namaSaksi || ""}
                                            onChange={(e) => handleResultChange('namaSaksi', e.target.value)}
                                            placeholder="(Nama Jelas)"
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-gray-300 relative">
                                <FileText size={48} className="mb-4 opacity-50" />
                                <p className="text-lg font-serif italic text-center">
                                    Format Dokumen Standar<br />
                                    RS Siaga Medika
                                </p>
                                <p className="text-sm mt-4 text-gray-400">Siap Cetak A4</p>

                                {/* Watermark Preview */}
                                <div className="absolute inset-0 border-8 border-gray-100 m-8 pointer-events-none" />
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default ChronologyGenerator;
