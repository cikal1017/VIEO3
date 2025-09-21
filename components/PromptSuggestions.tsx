import React from 'react';
import { ShirtIcon, PantsIcon, ShoesIcon, FaceSmileIcon, ScissorsIcon, PhotoIcon } from './Icons';

interface PromptSuggestionsProps {
  onSelect: (suggestion: string) => void;
}

const suggestions = [
  {
    label: 'Change Shirt',
    icon: <ShirtIcon className="w-5 h-5 mb-1" />,
    template: 'Place [describe your unique design or logo] on the shirt. Make it look realistic and high-quality, suitable for an e-commerce mockup.'
  },
  {
    label: 'Change Pants',
    icon: <PantsIcon className="w-5 h-5 mb-1" />,
    template: 'Change the pants to [describe new pants, e.g., blue jeans], in the style of the reference image.'
  },
  {
    label: 'Change Shoes',
    icon: <ShoesIcon className="w-5 h-5 mb-1" />,
    template: 'Change the shoes to [describe new shoes, e.g., white sneakers], in the style of the reference image.'
  },
  {
    label: 'Change Expression',
    icon: <FaceSmileIcon className="w-5 h-5 mb-1" />,
    template: 'Change the facial expression to [describe expression, e.g., a wide, happy smile], in the style of the reference image.'
  },
  {
    label: 'Change Hair',
    icon: <ScissorsIcon className="w-5 h-5 mb-1" />,
    template: 'Change the hair to [describe hair style, e.g., long and blonde], in the style of the reference image.'
  },
  {
    label: 'Change Background',
    icon: <PhotoIcon className="w-5 h-5 mb-1" />,
    template: 'Change the background to a [describe background, e.g., clean, professional studio with soft lighting] to highlight the product.'
  }
];

export const PromptSuggestions: React.FC<PromptSuggestionsProps> = ({ onSelect }) => {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-300 mb-2">
        Prompt Ideas
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.label}
            onClick={() => onSelect(suggestion.template)}
            className="flex flex-col items-center justify-center text-center p-2 bg-gray-700/50 border border-gray-600 rounded-lg text-gray-300 hover:bg-gray-700 hover:border-purple-500 hover:text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500"
            title={suggestion.label}
          >
            {suggestion.icon}
            <span className="text-xs font-semibold">{suggestion.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};