"use client";

import { useState, useRef, useEffect } from 'react';
import { Lightbulb, Search, Database, Plus, X } from 'lucide-react';

interface TextBoxButtonsProps {
  onToggleAddMenu: (isOpen: boolean, position: { x: number, y: number }) => void;
  isAddMenuOpen: boolean;
  onSearchToggle?: (isEnabled: boolean) => void;
}

export default function TextBoxButtons({ onToggleAddMenu, isAddMenuOpen, onSearchToggle }: TextBoxButtonsProps) {
  const [activeButtons, setActiveButtons] = useState<{
    thinking: boolean;
    search: boolean;
    deepResearch: boolean;
  }>({
    thinking: false,
    search: false,
    deepResearch: false
  });
  
  const [isCompact, setIsCompact] = useState(false);
  
  // Check if we need to switch to compact mode
  useEffect(() => {
    const checkWidth = () => {
      const containerWidth = document.querySelector('.button-container')?.clientWidth || 0;
      const totalButtonsWidth = 12 + 140 + 150 + 190; // approx width of all buttons with text
      setIsCompact(containerWidth < totalButtonsWidth);
    };
    
    checkWidth();
    window.addEventListener('resize', checkWidth);
    
    return () => {
      window.removeEventListener('resize', checkWidth);
    };
  }, []);

  // Call the onSearchToggle callback whenever search state changes
  useEffect(() => {
    if (onSearchToggle) {
      onSearchToggle(activeButtons.search);
    }
  }, [activeButtons.search, onSearchToggle]);
  
  const addButtonRef = useRef<HTMLButtonElement>(null);
  
  const handleAddButtonClick = () => {
    if (addButtonRef.current) {
      const rect = addButtonRef.current.getBoundingClientRect();
      onToggleAddMenu(!isAddMenuOpen, { 
        x: rect.left, 
        y: rect.top 
      });
    }
  };

  const handleToggle = (button: 'thinking' | 'search' | 'deepResearch') => {
    setActiveButtons(prev => {
      // Creating a new state object
      const newState = { ...prev };
      
      if (button === 'deepResearch') {
        // If toggling Deep Research ON, turn off the other buttons
        if (!prev.deepResearch) {
          return {
            thinking: false,
            search: false,
            deepResearch: true
          };
        } else {
          // Just turn off Deep Research
          return {
            ...prev,
            deepResearch: false
          };
        }
      } else {
        // If toggling Thinking or Search and Deep Research is ON,
        // turn off Deep Research
        if (prev.deepResearch) {
          newState.deepResearch = false;
        }
        
        // Toggle the clicked button
        newState[button] = !prev[button];
        return newState;
      }
    });
  };
  
  return (
    <div className="w-full px-4 flex justify-start gap-4 pt-1 button-container">
      <button
        ref={addButtonRef}
        onClick={handleAddButtonClick}
        className={`w-12 h-12 rounded-xl bg-black/30 text-gray-300 hover:bg-black/40 transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none ${isAddMenuOpen ? 'bg-black/50 text-white' : ''}`}
        aria-label="Add"
      >
        {isAddMenuOpen ? <X size={20} /> : <Plus size={20} />}
      </button>
    
      <button
        onClick={() => handleToggle('search')}
        className={`${isCompact ? 'w-12 h-12 justify-center' : 'px-5 py-3'} rounded-xl cal-sans-regular transition-all duration-200 cursor-pointer flex items-center gap-3 focus:outline-none ${
          activeButtons.search 
            ? 'bg-black/50 text-blue-400 border border-blue-500/40 shadow-[0_0_15px_rgba(59,130,246,0.3)]' 
            : 'bg-black/30 text-gray-300 hover:bg-black/40'
        }`}
        aria-label="Search"
      >
        <Search size={18} className={activeButtons.search ? 'text-blue-400' : 'text-gray-500'} />
        {!isCompact && <span className="text-base">Search</span>}
      </button>
      
      <button
        onClick={() => handleToggle('thinking')}
        className={`${isCompact ? 'w-12 h-12 justify-center' : 'px-5 py-3'} rounded-xl cal-sans-regular transition-all duration-200 cursor-pointer flex items-center gap-3 focus:outline-none ${
          activeButtons.thinking 
            ? 'bg-black/50 text-purple-400 border border-purple-500/40 shadow-[0_0_15px_rgba(168,85,247,0.3)]' 
            : 'bg-black/30 text-gray-300 hover:bg-black/40'
        }`}
        aria-label="Thinking"
      >
        <Lightbulb size={18} className={activeButtons.thinking ? 'text-purple-400' : 'text-gray-500'} />
        {!isCompact && <span className="text-base">Thinking</span>}
      </button>
      
      <button
        onClick={() => handleToggle('deepResearch')}
        className={`${isCompact ? 'w-12 h-12 justify-center' : 'px-5 py-3'} rounded-xl cal-sans-regular transition-all duration-200 cursor-pointer flex items-center gap-3 focus:outline-none ${
          activeButtons.deepResearch 
            ? 'bg-black/50 text-emerald-400 border border-emerald-500/40 shadow-[0_0_15px_rgba(52,211,153,0.3)]' 
            : 'bg-black/30 text-gray-300 hover:bg-black/40'
        }`}
        aria-label="Deep Research"
      >
        <Database size={18} className={activeButtons.deepResearch ? 'text-emerald-400' : 'text-gray-500'} />
        {!isCompact && <span className="text-base">Deep Research</span>}
      </button>
    </div>
  );
} 