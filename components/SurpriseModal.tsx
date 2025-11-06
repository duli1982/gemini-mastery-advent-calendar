
import React, { useEffect, useState } from 'react';
import { marked } from 'marked';

interface SurpriseModalProps {
  isOpen: boolean;
  onClose: () => void;
  day: number;
  content: string;
  isLoading: boolean;
}

const LoadingSpinner: React.FC = () => (
  <div className="flex justify-center items-center h-48">
    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-yellow-300"></div>
  </div>
);


export const SurpriseModal: React.FC<SurpriseModalProps> = ({ isOpen, onClose, day, content, isLoading }) => {
  const [parsedContent, setParsedContent] = useState('');

  useEffect(() => {
    if (!isLoading && content) {
      // Use DOMPurify in a real app if content can be user-generated
      const html = marked.parse(content);
      setParsedContent(html as string);
    }
  }, [content, isLoading]);

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
          <h3 className="font-christmas text-4xl text-yellow-300 drop-shadow-md">December {day}</h3>
          <button
            onClick={onClose}
            className="text-yellow-200 hover:text-white transition-colors text-4xl z-10"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="text-gray-200 prose prose-invert max-w-none prose-h3:text-yellow-300 prose-strong:text-yellow-200 prose-a:text-green-300 hover:prose-a:text-green-200 prose-code:bg-gray-900 prose-code:rounded-md prose-code:p-1">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <div className="whitespace-pre-wrap animate-fade-in" dangerouslySetInnerHTML={{ __html: parsedContent }} />
          )}
        </div>
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