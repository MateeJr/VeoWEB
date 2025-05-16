"use client";

import { FileUp, ImagePlus, MessageSquarePlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddMenuProps {
  isOpen: boolean;
  position: { x: number, y: number };
  onNewChat?: () => void;
}

export default function AddMenu({ isOpen, position, onNewChat = () => {} }: AddMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <div className="w-full h-full relative">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute pointer-events-auto bg-black/60 backdrop-blur-sm rounded-xl w-48 overflow-hidden shadow-lg border border-white/10"
              style={{ 
                left: `${position.x}px`, 
                top: `${position.y - 160}px`,
                transform: 'translateX(-50%)'
              }}
            >
              <div className="py-2">
                <button 
                  onClick={() => onNewChat()} 
                  className="w-full px-4 py-3 flex items-center gap-3 hover:bg-black/40 text-white text-left transition-colors focus:outline-none cursor-pointer"
                >
                  <MessageSquarePlus size={18} className="text-green-400" />
                  <span className="text-sm cal-sans-regular">New Chat</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-black/40 text-white text-left transition-colors focus:outline-none cursor-pointer">
                  <FileUp size={18} className="text-blue-400" />
                  <span className="text-sm cal-sans-regular">Upload files</span>
                </button>
                <button className="w-full px-4 py-3 flex items-center gap-3 hover:bg-black/40 text-white text-left transition-colors focus:outline-none cursor-pointer">
                  <ImagePlus size={18} className="text-purple-400" />
                  <span className="text-sm cal-sans-regular">Upload images</span>
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
} 