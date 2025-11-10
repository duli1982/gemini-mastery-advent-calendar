
import React, { useEffect, useState } from 'react';
import { marked } from 'marked';
import type { CalendarDay } from '../types';
import { exportAllPromptsAsPDF } from '../utils/pdfExport';

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  dayData: CalendarDay;
  content: string;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-300"></div>
  </div>
);


export const SurpriseModal: React.FC<SurpriseModalProps> = ({ isOpen, onClose, dayData, content, isLoading }) => {
  const [parsedContent, setParsedContent] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    if (!isLoading && content) {
      // Use DOMPurify in a real app if content can be user-generated
      const html = marked.parse(content);
      setParsedContent(html as string);
    }
  }, [content, isLoading]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(dayData.prompt);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleShare = (platform: 'x' | 'linkedin' | 'facebook') => {
    const url = window.location.href;
    const text = `Check out Day ${dayData.day}: ${dayData.name} ${dayData.emoji} of the Gemini Mastery Advent Calendar!\n\n${dayData.whatItDoes}`;
    let shareUrl = '';

    switch (platform) {
      case 'x':
        shareUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        window.open(shareUrl, '_blank', 'width=600,height=400');
        break;
      case 'linkedin':
      case 'facebook':
        // LinkedIn and Facebook don't support pre-filling text via URL
        // Copy message to clipboard and notify user
        navigator.clipboard.writeText(text).then(() => {
          const platformName = platform === 'linkedin' ? 'LinkedIn' : 'Facebook';
          shareUrl = platform === 'linkedin'
            ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
            : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          window.open(shareUrl, '_blank', 'width=600,height=400');
          alert(`✓ Message copied to clipboard!\n\nPaste it into your ${platformName} post (Ctrl+V or Cmd+V)`);
        }).catch(err => {
          console.error('Failed to copy:', err);
          // Fallback: just open the share dialog
          shareUrl = platform === 'linkedin'
            ? `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
            : `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
          window.open(shareUrl, '_blank', 'width=600,height=400');
        });
        break;
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4 transition-opacity duration-300 ease-in-out"
      onClick={onClose}
    >
      <div
        className="bg-[#14532d] rounded-2xl shadow-2xl p-6 md:p-8 max-w-2xl w-full transform transition-all duration-300 ease-in-out scale-95 animate-scale-in border-4 border-yellow-500 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative corner snowflakes */}
        <div className="absolute top-2 right-2 text-yellow-500 opacity-20 text-4xl">❄</div>
        <div className="absolute bottom-2 left-2 text-yellow-500 opacity-20 text-4xl">❄</div>

        <div className="flex justify-between items-center mb-4 border-b-2 border-yellow-500 pb-2">
          <div className="flex items-center gap-3">
            <span className="text-4xl">{dayData.emoji}</span>
            <div>
              <h3 className="font-christmas text-3xl text-yellow-300 drop-shadow-md">{dayData.name}</h3>
              <p className="text-sm text-gray-300">Day {dayData.day}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-yellow-200 hover:text-white transition-colors text-4xl z-10"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="text-gray-200">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div>
                <h4 className="text-yellow-300 font-bold text-lg mb-2">🎁 What it does:</h4>
                <p className="text-gray-200">{dayData.whatItDoes}</p>
              </div>

              <div>
                <h4 className="text-yellow-300 font-bold text-lg mb-2">⏰ When to use:</h4>
                <p className="text-gray-200">{dayData.whenToUse}</p>
              </div>

              <div>
                <h4 className="text-yellow-300 font-bold text-lg mb-2">📝 The Prompt:</h4>
                <div className="bg-gray-900 rounded-lg p-4 border border-yellow-500/30">
                  <pre className="whitespace-pre-wrap text-gray-200 font-mono text-sm">{dayData.prompt}</pre>
                </div>
              </div>

              <div>
                <h4 className="text-yellow-300 font-bold text-lg mb-2">💡 Pro Tips:</h4>
                <ul className="list-disc list-inside space-y-1 text-gray-200">
                  {dayData.proTips.map((tip, index) => (
                    <li key={index}>{tip}</li>
                  ))}
                </ul>
              </div>

              {dayData.day === 24 && (
                <div className="mt-6 pt-4 border-t-2 border-yellow-500/30">
                  <button
                    onClick={exportAllPromptsAsPDF}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-green-600 hover:from-red-700 hover:to-green-700 text-white font-bold px-6 py-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
                    aria-label="Export all 24 prompts as PDF"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-lg">🎄 Export All 24 Days as PDF</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {!isLoading && content && (
          <div className="mt-6 pt-4 border-t-2 border-yellow-500/30">
            <div className="flex flex-wrap gap-3 items-center justify-between">
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-semibold px-4 py-2 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                {copySuccess ? '✓ Copied!' : 'Copy'}
              </button>

              <div className="flex gap-2 items-center">
                <span className="text-yellow-200 text-sm">Share:</span>
                <button onClick={() => handleShare('x')} className="bg-[#000000] hover:bg-[#333333] text-white p-2 rounded-lg transition-all" title="Share on X">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                  </svg>
                </button>
                <button onClick={() => handleShare('linkedin')} className="bg-[#0077B5] hover:bg-[#006399] text-white p-2 rounded-lg transition-all" title="Share on LinkedIn">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                  </svg>
                </button>
                <button onClick={() => handleShare('facebook')} className="bg-[#1877F2] hover:bg-[#166fe5] text-white p-2 rounded-lg transition-all" title="Share on Facebook">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes scaleIn {
          from { transform: scale(0.9); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        .animate-scale-in { animation: scaleIn 0.3s ease-out forwards; }
        
        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in { animation: fadeIn 0.5s ease-in-out forwards; }
      `}</style>
    </div>
  );
};