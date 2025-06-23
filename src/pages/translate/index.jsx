import { useState, useEffect } from 'react';
import { Copy, Volume2, Sparkles, CheckCircle, SendHorizontal, Loader2, User, LucideVolume2, Trash2, LucideArrowRightLeft } from 'lucide-react';

const Translate = () => {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('auto');
    const [targetLanguage, setTargetLanguage] = useState('pt');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [history, setHistory] = useState({
        source: [],
        translated: []
    });

    const languages = [
        { code: 'auto', name: 'Detectar idioma', flag: '🌍' },
        { code: 'en', name: 'Inglês', flag: '🇺🇸' },
        { code: 'pt', name: 'Português', flag: '🇵🇹' },
        { code: 'fr', name: 'Francês', flag: '🇫🇷' },
        { code: 'es', name: 'Espanhol', flag: '🇪🇸' },
        { code: 'zh', name: 'Chinês', flag: '🇨🇳' },
        { code: 'ru', name: 'Russo', flag: '🇷🇺' },
        { code: 'ar', name: 'Árabe', flag: '🇸🇦' },
        { code: 'cs', name: 'Tcheco', flag: '🇨🇿' },
        { code: 'el', name: 'Grego', flag: '🇬🇷' },
        { code: 'de', name: 'Alemão', flag: '🇩🇪' },
        { code: 'fi', name: 'Finlandês', flag: '🇫🇮' },
        { code: 'he', name: 'Hebraico', flag: '🇮🇱' },
        { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
        { code: 'hu', name: 'Húngaro', flag: '🇭🇺' },
        { code: 'id', name: 'Indonésio', flag: '🇮🇩' },
        { code: 'it', name: 'Italiano', flag: '🇮🇹' },
        { code: 'ja', name: 'Japonês', flag: '🇯🇵' },
        { code: 'ko', name: 'Coreano', flag: '🇰🇷' },
        { code: 'nl', name: 'Holandês', flag: '🇳🇱' },
        { code: 'pl', name: 'Polonês', flag: '🇵🇱' },
        { code: 'ro', name: 'Romeno', flag: '🇷🇴' },
        { code: 'sk', name: 'Eslovaco', flag: '🇸🇰' },
        { code: 'sv', name: 'Sueco', flag: '🇸🇪' },
        { code: 'tr', name: 'Turco', flag: '🇹🇷' },
        { code: 'uk', name: 'Ucraniano', flag: '🇺🇦' },
        { code: 'vi', name: 'Vietnamita', flag: '🇻🇳' }
    ];

    useEffect(() => {
        setCharCount(sourceText.length);
    }, [sourceText]);

    const handleTranslate = async () => {
        if (!sourceText.trim() || sourceText.length < 2) {
            setTranslatedText('');
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`https://lingva.ml/api/v1/${sourceLanguage}/${targetLanguage}/${sourceText}`).then(res => res.json());
            console.log('Resposta da API:', response);
            setTranslatedText(response.translation || '');
            setHistory(prev => ({
                source: [...prev.source, sourceText],
                translated: [...prev.translated, response.translation || '']
            }));
        } catch (error) {
            console.error('Erro ao chamar a API:', error);
        } finally {
            setIsLoading(false);
            setSourceText('');
        }
    };

    const swapLanguages = () => {
        if (sourceLanguage === 'auto') return;

        setSourceLanguage(targetLanguage);
        setTargetLanguage(sourceLanguage);
        setSourceText(translatedText);
        setTranslatedText(sourceText);
    };

    const copyToClipboard = async () => {
        if (!translatedText) return;

        try {
            await navigator.clipboard.writeText(translatedText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar:', error);
        }
    };

    const speakText = (text, lang) => {
        if (!text || !window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'pt' ? 'pt-BR' : lang;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    const clearText = () => {
        setSourceText('');
        setTranslatedText('');
    };

    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Header simplificado */}
            <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center gap-1">
                    <img src="/public/vite.svg" alt="Freelate Logo" className="w-10 h-10" />
                    <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Freelate</h1>
                </div>
            </header>

            {/* Área principal de tradução */}
            <main className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto px-4 py-6">

                {
                    // Verifica se há histórico de tradução
                    history.source.length > 0 && (
                        <div className="space-y-4">
                            {history.source.map((src, idx) => (
                                <div key={idx} className="flex items-start gap-3 bg-white border mb-2 dark:bg-gray-700 rounded-lg p-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900/70 flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-700 dark:text-blue-300" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{src}</p>
                                        <div className="mt-1 flex items-center gap-2">
                                            <button
                                                onClick={() => speakText(src, sourceLanguage)}
                                                className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                title="Ouvir"
                                            >
                                                <LucideVolume2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                        <div className="mt-2 flex items-start gap-3 border-t pt-2">
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900/70 flex items-center justify-center">
                                                <Sparkles className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{history.translated[idx]}</p>
                                                <div className="mt-1 flex items-center gap-2">
                                                    <button
                                                        onClick={() => speakText(history.translated[idx], targetLanguage)}
                                                        className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                        title="Ouvir"
                                                    >
                                                        <Volume2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={async () => {
                                                            await navigator.clipboard.writeText(history.translated[idx]);
                                                            setCopied(true);
                                                            setTimeout(() => setCopied(false), 2000);
                                                        }}
                                                        className="p-1 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                                                        title="Copiar"
                                                    >
                                                        {copied ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )
                }

                {/* Área de conversação estilo ChatGPT */}
                <div className="space-y-4">
                    {/* Mensagem de origem */}
                    {sourceText && (
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                            <div className="p-4">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                                        <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{sourceText}</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <button
                                                onClick={() => speakText(sourceText, sourceLanguage)}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                title="Ouvir"
                                            >
                                                <LucideVolume2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={clearText}
                                                className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                title="Limpar"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Mensagem de tradução */}
                   
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="p-4">
                            <div className="flex items-start gap-3">
                                {sourceText && (
                                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center">
                                        <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                )}
                                <div className="flex-1 min-w-0">
                                    {isLoading ? (
                                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                                            <div className="w-4 h-4 border-2 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                                            <span>Traduzindo...</span>
                                        </div>
                                    ) : translatedText ? (

                                        sourceText && (
                                            <>
                                                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{translatedText}</p>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <button
                                                        onClick={() => speakText(translatedText, targetLanguage)}
                                                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                        title="Ouvir"
                                                    >
                                                        <Volume2 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={copyToClipboard}
                                                        className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
                                                        title="Copiar"
                                                    >
                                                        {copied ? (
                                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                                        ) : (
                                                            <Copy className="w-4 h-4" />
                                                        )}
                                                    </button>
                                                </div>
                                            </>
                                        )

                                    ) : (
                                        <p className="text-gray-400 dark:text-gray-500 italic">A tradução aparecerá aqui...</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Área de entrada de texto */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-4">
                <div className="max-w-3xl mx-auto">

                    <div className="relative">
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            placeholder="Digite o texto para traduzir..."
                            className="w-full p-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:text-white"
                            rows="3"
                            maxLength={5000}
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <span className="text-xs text-gray-500 dark:text-gray-400">{charCount}/5000</span>
                            <button
                                onClick={() => handleTranslate()}
                                disabled={!sourceText || isLoading}
                                className="p-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                aria-label="Traduzir"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <SendHorizontal className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-2 mb-6 px-2">
                        <select
                            value={sourceLanguage}
                            onChange={(e) => setSourceLanguage(e.target.value)}
                            className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                        >
                            {languages.map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>

                        <button
                            onClick={swapLanguages}
                            disabled={sourceLanguage === 'auto'}
                            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50"
                            aria-label="Trocar idiomas"
                        >
                            <LucideArrowRightLeft className="w-4 h-4" />
                        </button>

                        <select
                            value={targetLanguage}
                            onChange={(e) => setTargetLanguage(e.target.value)}
                            className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                        >
                            {languages.filter(lang => lang.code !== 'auto').map((lang) => (
                                <option key={lang.code} value={lang.code}>
                                    {lang.flag} {lang.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Traduções rápidas */}
                    <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-2">
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Translate;