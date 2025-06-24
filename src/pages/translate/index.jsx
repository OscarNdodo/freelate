import { useState, useEffect } from 'react';
import {
    Copy,
    Volume2,
    Sparkles,
    CheckCircle,
    SendHorizontal,
    Loader2,
    User,
    Trash2,
    ArrowRightLeft,
    X
} from 'lucide-react';

const LANGUAGES = [
    { code: 'auto', name: 'Detectar idioma', flag: '🌍' },
    { code: 'en', name: 'Inglês', flag: '🇺🇸' },
    { code: 'pt', name: 'Português', flag: '🇵🇹' },
    { code: 'fr', name: 'Francês', flag: '🇫🇷' },
    { code: 'es', name: 'Espanhol', flag: '🇪🇸' },
    { code: 'zh', name: 'Chinês', flag: '🇨🇳' },
    { code: 'ru', name: 'Russo', flag: '🇷🇺' },
    { code: 'ar', name: 'Árabe', flag: '🇸🇦' },
    // ... outros idiomas
];

const MAX_CHARACTERS = 5000;
const HISTORY_KEY = 'translationHistory';

const Translate = () => {
    const [sourceText, setSourceText] = useState('');
    const [translatedText, setTranslatedText] = useState('');
    const [sourceLanguage, setSourceLanguage] = useState('auto');
    const [targetLanguage, setTargetLanguage] = useState('pt');
    const [isLoading, setIsLoading] = useState(false);
    const [copied, setCopied] = useState(false);
    const [charCount, setCharCount] = useState(0);
    const [history, setHistory] = useState([]);
    const textArea = document.querySelector('textarea');

    // Carrega o histórico do localStorage ao iniciar
    useEffect(() => {
        const savedHistory = localStorage.getItem(HISTORY_KEY);
        if (savedHistory) {
            setHistory(JSON.parse(savedHistory));
        }
    }, []);

    // Atualiza contagem de caracteres
    useEffect(() => {
        setCharCount(sourceText.length);
    }, [sourceText]);

    // Salva o histórico no localStorage quando muda
    useEffect(() => {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
    }, [history]);

    // Função para traduzir texto
    const handleTranslate = async () => {
        if (!sourceText.trim() || sourceText.length < 2) {
            setTranslatedText('');
            return;
        }

        setIsLoading(true);
        textArea.disabled = true;

        try {
            const response = await fetch(
                `https://lingva.ml/api/v1/${sourceLanguage}/${targetLanguage}/${encodeURIComponent(sourceText)}`
            ).then(res => res.json());

            const translation = response.translation || '';
            setTranslatedText(translation);

            // Adiciona ao histórico (limita a 50 itens)
            setHistory(prev => [
                {
                    id: Date.now(),
                    sourceText,
                    translation,
                    sourceLanguage,
                    targetLanguage,
                    timestamp: new Date().toISOString()
                },
                ...prev
            ].slice(0, 50));
        } catch (error) {
            console.error('Erro ao traduzir:', error);
            setTranslatedText('Erro ao traduzir. Tente novamente.');
        } finally {
            setIsLoading(false);
            textArea.disabled = false;
            setSourceText(''); // Limpa o texto de origem após traduzir
        }

    };

    // Remove um item do histórico
    const removeHistoryItem = (id) => {
        setHistory(prev => prev.filter(item => item.id !== id));
    };

    // Limpa todo o histórico
    const clearAllHistory = () => {
        setHistory([]);
        localStorage.removeItem(HISTORY_KEY);
    };

    // Trocar idiomas de origem e destino
    const swapLanguages = () => {
        if (sourceLanguage === 'auto') return;

        setSourceLanguage(targetLanguage);
        setTargetLanguage(sourceLanguage);
        setSourceText(translatedText);
        setTranslatedText(sourceText);
    };

    // Copiar texto traduzido
    const copyToClipboard = async (text = translatedText) => {
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        } catch (error) {
            console.error('Erro ao copiar:', error);
        }
    };

    // Reproduzir texto em voz alta
    const speakText = (text, lang) => {
        if (!text || !window.speechSynthesis) return;

        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang === 'pt' ? 'pt-BR' : lang;
        utterance.rate = 0.9;
        window.speechSynthesis.speak(utterance);
    };

    // Limpar campos de texto
    const clearText = () => {
        setSourceText('');
        setTranslatedText('');
    };

    // Manipulador de tecla Enter para traduzir
    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTranslate();
        }
    };



    return (
        <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
            {/* Cabeçalho */}
            <header className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <img src="/src/assets/logo.svg" alt="Traduza Logo" className="w-8 h-8" />
                        <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Traduza</h1>
                    </div>
                    {history.length > 0 && (
                        <button
                            onClick={clearAllHistory}
                            className="text-sm text-red-500 hover:text-red-700 dark:hover:text-red-400 flex items-center gap-1"
                        >
                            <Trash2 className="w-4 h-4" />
                            Limpar tudo
                        </button>
                    )}
                </div>
            </header>

            {/* Conteúdo principal */}
            <main className="flex-1 overflow-y-auto max-w-3xl w-full mx-auto px-4 py-6 space-y-4">
                {/* Histórico de traduções */}
                {history.map((item) => (
                    <div key={item.id} className="relative group">
                        <TranslationHistoryItem
                            sourceText={item.sourceText}
                            translatedText={item.translation}
                            sourceLanguage={item.sourceLanguage}
                            targetLanguage={item.targetLanguage}
                            onSpeak={speakText}
                            onCopy={copyToClipboard}
                            copied={copied}
                        />
                        <button
                            onClick={() => removeHistoryItem(item.id)}
                            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            aria-label="Remover tradução"
                        >
                            <X className="w-3 h-3" />
                        </button>
                    </div>
                ))}

                {/* Área de mensagens - só mostra se houver tradução atual */}
                {!translatedText && (
                    <>
                        {sourceText && (
                            <MessageBubble
                                text={sourceText}
                                isUser={true}
                                language={sourceLanguage}
                                onSpeak={speakText}
                                onClear={clearText}
                            />
                        )}
                        <MessageBubble
                            text={translatedText}
                            isUser={false}
                            isLoading={isLoading}
                            language={targetLanguage}
                            onSpeak={speakText}
                            onCopy={copyToClipboard}
                            copied={copied}
                        />
                    </>
                )}
            </main>

            {/* Área de entrada */}
            <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 py-4 px-4">
                <div className="max-w-3xl mx-auto">
                    <LanguageSelector
                        sourceLanguage={sourceLanguage}
                        targetLanguage={targetLanguage}
                        onSourceChange={setSourceLanguage}
                        onTargetChange={setTargetLanguage}
                        onSwap={swapLanguages}
                    />

                    <div className="relative mb-2">
                        <textarea
                            value={sourceText}
                            onChange={(e) => setSourceText(e.target.value)}
                            onKeyDown={handleKeyDown}
                            placeholder="Digite o texto para traduzir..."
                            className="w-full p-3 pr-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:text-white"
                            rows="3"
                            maxLength={MAX_CHARACTERS}
                        />
                        <div className="absolute bottom-3 right-3 flex items-center gap-2">
                            <span className={`text-xs ${charCount === MAX_CHARACTERS ? 'text-red-500' : 'text-gray-500'} dark:text-gray-400`}>
                                {charCount}/{MAX_CHARACTERS}
                            </span>
                            <button
                                onClick={handleTranslate}
                                disabled={!sourceText || isLoading}
                                className="p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                </div>
            </div>
        </div>
    );
};

// Componente para item do histórico de tradução
const TranslationHistoryItem = ({
    sourceText,
    translatedText,
    sourceLanguage,
    targetLanguage,
    onSpeak,
    onCopy,
    copied
}) => {
    const getLanguageName = (code) => {
        const lang = LANGUAGES.find(l => l.code === code);
        return lang ? `${lang.flag} ${lang.name}` : code;
    };

    return (
        <div className="flex items-start gap-3 bg-white dark:bg-gray-700 rounded-lg p-3 border border-gray-200 dark:border-gray-600">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-200 dark:bg-blue-900/70 flex items-center justify-center">
                <User className="w-4 h-4 text-blue-700 dark:text-blue-300" />
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mb-1">
                    <span>{getLanguageName(sourceLanguage)}</span>
                    <span>→</span>
                    <span>{getLanguageName(targetLanguage)}</span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{sourceText}</p>
                <div className="mt-1 flex items-center gap-2">
                    <ActionButton
                        icon={<Volume2 className="w-4 h-4" />}
                        onClick={() => onSpeak(sourceText, sourceLanguage)}
                        title="Ouvir"
                    />
                </div>

                <div className="mt-2 flex items-start gap-3 border-t pt-2">
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-purple-200 dark:bg-purple-900/70 flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-purple-700 dark:text-purple-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{translatedText}</p>
                        <div className="mt-1 flex items-center gap-2">
                            <ActionButton
                                icon={<Volume2 className="w-4 h-4" />}
                                onClick={() => onSpeak(translatedText, targetLanguage)}
                                title="Ouvir"
                            />
                            <ActionButton
                                icon={copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                onClick={() => onCopy(translatedText)}
                                title="Copiar"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Componente para bolha de mensagem
const MessageBubble = ({
    text,
    isUser,
    isLoading = false,
    language,
    onSpeak,
    onCopy,
    onClear,
    copied = false,
}) => (
    <div className={`rounded-lg shadow-sm border ${isUser ? 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700' : 'bg-gray-50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700'}`}>
        <div className="p-4">
            <div className="flex items-start gap-3">
                {!isLoading && (
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${isUser ? 'bg-blue-100 dark:bg-blue-900/50' : 'bg-purple-100 dark:bg-purple-900/50'}`}>
                        {isUser ? (
                            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                        ) : (
                            <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                    </div>
                )}
                <div className="flex-1 min-w-0">
                    {isLoading ? (
                        <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                            <div className="w-4 h-4 border-2 border-purple-500 dark:border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                            <span>Traduzindo...</span>
                        </div>
                    ) : (
                        <>
                            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">{text}</p>
                            <div className="mt-2 flex items-center gap-2">
                                <ActionButton
                                    icon={<Volume2 className="w-4 h-4" />}
                                    onClick={() => onSpeak(text, language)}
                                    title="Ouvir"
                                />
                                {!isUser && (
                                    <ActionButton
                                        icon={copied ? <CheckCircle className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                                        onClick={() => onCopy(text)}
                                        title="Copiar"
                                    />
                                )}
                                {isUser && onClear && (
                                    <ActionButton
                                        icon={<Trash2 className="w-4 h-4" />}
                                        onClick={onClear}
                                        title="Limpar"
                                    />
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    </div>
);

// Componente para seletor de idiomas
const LanguageSelector = ({
    sourceLanguage,
    targetLanguage,
    onSourceChange,
    onTargetChange,
    onSwap
}) => (
    <div className="flex items-center justify-center gap-2 mb-4 px-2">
        <LanguageDropdown
            value={sourceLanguage}
            onChange={onSourceChange}
            languages={LANGUAGES}
        />

        <button
            onClick={onSwap}
            disabled={sourceLanguage === 'auto'}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md disabled:opacity-50 transition-colors"
            aria-label="Trocar idiomas"
        >
            <ArrowRightLeft className="w-4 h-4" />
        </button>

        <LanguageDropdown
            value={targetLanguage}
            onChange={onTargetChange}
            languages={LANGUAGES.filter(lang => lang.code !== 'auto')}
        />
    </div>
);

// Componente para dropdown de idioma
const LanguageDropdown = ({ value, onChange, languages }) => (
    <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 p-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-colors"
    >
        {languages.map((lang) => (
            <option key={lang.code} value={lang.code}>
                {lang.flag} {lang.name}
            </option>
        ))}
    </select>
);

// Componente para botão de ação
const ActionButton = ({ icon, onClick, title }) => (
    <button
        onClick={onClick}
        className="p-1.5 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        title={title}
    >
        {icon}
    </button>
);

export default Translate;
