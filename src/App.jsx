﻿import React, { useState, useRef } from 'react';

// --- Reusable Components --------------------------------------------------

const Header = () => (
    <header className="flex items-center justify-between p-6 bg-gray-900/50 backdrop-blur-lg border-b border-gray-700/50 sticky top-0 z-50">
        <div className="flex items-center gap-4">
            <img src="/images/Arch Vector Logo White.svg" alt="Arch Font Hub Logo" className="h-10 w-10" />
            <h1 className="text-xl font-bold text-white tracking-wider">Arch Font Hub</h1>
        </div>
    </header>
);

const Card = ({ title, children }) => (
    <section className="bg-gray-800/50 rounded-2xl shadow-lg border border-gray-700/50">
        <h2 className="text-lg font-semibold text-white px-6 py-4 border-b border-gray-700/50">{title}</h2>
        <div className="p-6">
            {children}
        </div>
    </section>
);

const FontButton = ({ font, isSelected, onSelect }) => (
    <button
        onClick={() => onSelect(font)}
        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
            ${isSelected
                ? 'bg-blue-600 text-white shadow-lg transform scale-105'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 hover:text-white'
            }`}
        style={{ fontFamily: font.styles[Object.keys(font.styles)[0]] }}
    >
        {font.name}
    </button>
);

const StyleButton = ({ styleKey, isActive, onClick }) => (
    <button
        onClick={onClick}
        className={`px-3 py-1 text-xs rounded-md transition-colors ${isActive ? 'bg-blue-600 text-white' : 'bg-gray-600/50 text-gray-300 hover:bg-gray-500/50'}`}
    >
        {styleKey.charAt(0).toUpperCase() + styleKey.slice(1)}
    </button>
);

// --- Main App Component ---------------------------------------------------

const App = () => {
    const WORKER_URL = "https://customerfontselection-worker.tom-4a9.workers.dev";
    const DEFAULT_TEXT_PLACEHOLDER = 'Your text for engraving...';

    const fontLibrary = {
        'Sans-serif': [
            { name: 'Arial', styles: { regular: 'ArialMT', bold: 'Arial-BoldMT', italic: 'Arial-ItalicMT', boldItalic: 'Arial-BoldItalicMT' } },
            { name: 'Bebas Neue', styles: { regular: 'BebasNeue-Regular', bold: 'BebasNeue-Bold' } },
            { name: 'Graphik', styles: { thin: 'Graphik-Thin', regular: 'Graphik-Regular', medium: 'Graphik-Medium' } },
        ],
        'Serif': [
            { name: 'Garamond', styles: { regular: 'Garamond' } },
            { name: 'Times New Roman', styles: { regular: 'TimesNewRomanPSMT', bold: 'TimesNewRomanPS-BoldMT', italic: 'TimesNewRomanPS-ItalicMT' } },
        ],
        'Script': [
            { name: 'Great Vibes', styles: { regular: 'GreatVibes-Regular' } },
            { name: 'I Love Glitter', styles: { regular: 'ILoveGlitter' } },
        ],
    };

    const [selectedFonts, setSelectedFonts] = useState([]);
    const [customText, setCustomText] = useState('');
    const [fontSize, setFontSize] = useState(48);
    const textInputRef = useRef(null);

    // Simplified state management for modals
    const [modal, setModal] = useState(null);
    const [pendingSvgContent, setPendingSvgContent] = useState(null);

    // Form state
    const [customerName, setCustomerName] = useState('');
    const [customerCompany, setCustomerCompany] = useState('');
    const [orderNumber, setOrderNumber] = useState('');

    const handleFontSelect = (font) => {
        setSelectedFonts(prev =>
            prev.some(f => f.name === font.name)
                ? prev.filter(f => f.name !== font.name)
                : [...prev, { ...font, activeStyle: Object.keys(font.styles)[0] }]
        );
    };

    const handleStyleChange = (fontName, newStyle) => {
        setSelectedFonts(prev =>
            prev.map(font =>
                font.name === fontName ? { ...font, activeStyle: newStyle } : font
            )
        );
    };

    const handleSaveSvg = () => {
        if (selectedFonts.length === 0 || !customText.trim()) {
            setModal({ type: 'message', message: 'Please select a font and enter some text.' });
            return;
        }

        const lines = customText.split('\n').filter(line => line.trim() !== '');
        let svgTextElements = '';
        const lineHeight = fontSize * 1.5;
        let y = 40;

        selectedFonts.forEach((font) => {
            const activeFontFamily = font.styles[font.activeStyle];
            lines.forEach((line) => {
                const sanitizedLine = line.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                svgTextElements += `<text x="40" y="${y}" font-family="${activeFontFamily}" font-size="${fontSize}" fill="#111827">${sanitizedLine}</text>\n`;
                y += lineHeight;
            });
            y += lineHeight * 0.5;
        });

        const svgHeight = y;
        const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${svgHeight}" style="background-color: #FFF;">\n${svgTextElements}</svg>`;
        setPendingSvgContent(fullSvg);
        setModal({ type: 'customerInfo' });
    };

    const handleCustomerModalSubmit = async (e) => {
        e.preventDefault();
        // ... (rest of the submission logic is the same)
        setModal(null);
    };


    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
            <Header />
            <main className="max-w-7xl mx-auto p-6 space-y-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-8">
                        <Card title="1. Choose Your Fonts">
                            <div className="space-y-4">
                                {Object.entries(fontLibrary).map(([category, fonts]) => (
                                    <div key={category}>
                                        <h4 className="text-sm font-semibold text-gray-400 mb-2">{category}</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {fonts.map(font => (
                                                <FontButton
                                                    key={font.name}
                                                    font={font}
                                                    isSelected={selectedFonts.some(f => f.name === font.name)}
                                                    onSelect={handleFontSelect}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Card>
                        <Card title="2. Enter Your Text">
                            <textarea
                                ref={textInputRef}
                                className="w-full p-4 bg-gray-900/50 rounded-lg border border-gray-600/50 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[150px]"
                                value={customText}
                                onChange={(e) => setCustomText(e.target.value)}
                                placeholder={DEFAULT_TEXT_PLACEHOLDER}
                            />
                        </Card>
                    </div>

                    <div className="lg:col-span-2">
                        <Card title="3. Live Preview">
                            <div className="bg-gray-100 rounded-lg p-8 min-h-[400px] space-y-8 transition-all duration-300">
                                {selectedFonts.length > 0 && customText.trim() ? (
                                    selectedFonts.map((font) => (
                                        <div key={`preview-${font.name}`}>
                                            <div className="flex items-baseline gap-4 mb-3">
                                                <h3 className="text-xl font-semibold text-gray-800" style={{ fontFamily: font.styles[Object.keys(font.styles)[0]] }}>{font.name}</h3>
                                                <div className="flex gap-1.5">
                                                    {Object.keys(font.styles).map(styleKey => (
                                                        <StyleButton
                                                            key={styleKey}
                                                            styleKey={styleKey}
                                                            isActive={font.activeStyle === styleKey}
                                                            onClick={() => handleStyleChange(font.name, styleKey)}
                                                        />
                                                    ))}
                                                </div>
                                            </div>
                                            <p className="text-gray-900 break-words w-full" style={{ fontFamily: font.styles[font.activeStyle], fontSize: `${fontSize}px`, lineHeight: 1.4 }}>
                                                {customText}
                                            </p>
                                        </div>
                                    ))
                                ) : (
                                    <div className="flex items-center justify-center h-full"><p className="text-gray-500 italic">Your preview will appear here</p></div>
                                )}
                            </div>
                            <div className="mt-6">
                                <ActionButton onClick={handleSaveSvg}>
                                    Generate Proof & Save
                                </ActionButton>
                            </div>
                        </Card>
                    </div>
                </div>
            </main>

            {/* Modal Logic */}
            {modal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 w-full max-w-md border border-gray-700">
                        {modal.type === 'customerInfo' && (
                            <form onSubmit={handleCustomerModalSubmit} className="space-y-6">
                                <h3 className="text-xl font-bold text-white">Customer Information</h3>
                                <FormInput label="Order Number" id="orderNumber" value={orderNumber} onChange={e => setOrderNumber(e.target.value)} required />
                                <FormInput label="Customer Name" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} required />
                                <FormInput label="Customer Company" id="customerCompany" value={customerCompany} onChange={e => setCustomerCompany(e.target.value)} isOptional />
                                <div className="flex justify-end gap-4 pt-4">
                                    <button type="button" className="px-5 py-2 bg-gray-600/50 text-white rounded-lg hover:bg-gray-500/50" onClick={() => setModal(null)}>Cancel</button>
                                    <button type="submit" className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Submit & Save</button>
                                </div>
                            </form>
                        )}
                        {modal.type === 'message' && (
                            <div className="text-center space-y-6">
                                <p className="text-white text-lg">{modal.message}</p>
                                <button onClick={() => setModal(null)} className="px-10 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">OK</button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;