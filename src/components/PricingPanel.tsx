'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface PricingTier {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
}

const tiers: PricingTier[] = [
  {
    name: 'Basic',
    price: 'Rp. 99.000',
    features: [
      '32K context window',
      'Search web',
      'Image generation',
      'File uploads / analyzing',
      '500 messages per day',
    ],
  },
  {
    name: 'Intermediate',
    price: 'Rp. 200.000',
    features: [
      'Everything in Basic',
      '128k context window',
      'Agentic search (smartest)',
      'Advanced Image Generation',
      'Voice Mode',
      'Smart AI Model',
    ],
    highlight: true,
  },
  {
    name: 'Advanced',
    price: 'Rp. 500.000',
    features: [
      'Everything in Intermediate',
      'High priority support',
      'Deep Research',
      '500k context window',
      'Smartest AI Model',
      'Video Call mode',
      'Agent',
    ],
  },
];

interface PricingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  isSmallScreen: boolean;
  // headerHeight is no longer needed for panel positioning
}

const PricingPanel: React.FC<PricingPanelProps> = ({ isOpen, onClose, isSmallScreen }) => {
  const [currentPage, setCurrentPage] = useState(0);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleNextPage = () => {
    setCurrentPage((prev) => (prev + 1) % tiers.length);
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => (prev - 1 + tiers.length) % tiers.length);
  };
  
  const getDisplayedTiers = () => {
    if (isSmallScreen) {
      return [tiers[currentPage]];
    }
    return tiers;
  }

  // Animation variants like Menu.tsx
  const panelVariants = {
    hidden: isSmallScreen 
      ? { opacity: 0, y: '100%' } 
      : { opacity: 0, y: -30, scale: 0.95 },
    visible: isSmallScreen 
      ? { opacity: 1, y: '0%' } 
      : { opacity: 1, y: 0, scale: 1 },
    exit: isSmallScreen 
      ? { opacity: 0, y: '100%' } 
      : { opacity: 0, y: -30, scale: 0.95 },
  };

  return (
    <motion.div // Backdrop
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(0, 0, 0, 0.6)',
        zIndex: 1001, // Ensure this is below menu if they can overlap, or same level if not
        display: 'flex',
        justifyContent: 'center',
        alignItems: isSmallScreen ? 'flex-end' : 'center', // Key change for centering
        backdropFilter: 'blur(5px)',
      }}
      onClick={onClose}
    >
      <motion.div // Panel
        key="pricing-panel"
        variants={panelVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ duration: 0.3, ease: "easeInOut" }}
        style={{
          position: 'relative', // Changed from fixed
          background: 'var(--background)',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          ...(isSmallScreen
            ? {
                width: '100vw',
                height: '85vh',
                borderRadius: '20px 20px 0 0',
              }
            : {
                width: 'auto',
                height: 'auto',
                maxWidth: '1000px', 
                maxHeight: '800px', 
                borderRadius: '16px',
              }
          )
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid var(--border)',
          // Add a small top padding for mobile if close button is too close to edge
          paddingTop: isSmallScreen ? '25px' : '20px',
        }}>
          <h2 style={{ margin: 0, fontSize: '24px', color: 'var(--foreground)' }}>Pricing</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--foreground-secondary)',
              // Ensure button is accessible on mobile, Menu.tsx positions it absolutely
              // For simplicity here, ensure title bar padding is enough
            }}
            aria-label="Close pricing panel"
          >
            <LuX size={24} />
          </button>
        </div>

        <div style={{ 
          flexGrow: 1, 
          padding: isSmallScreen ? '20px 15px' :'20px 30px', // Adjusted mobile padding slightly
          overflowY: 'auto',
          display: 'flex',
          flexDirection: isSmallScreen ? 'column' : 'row',
          gap: '20px',
          justifyContent: 'center',
          alignItems: isSmallScreen ? 'center' : 'stretch', // Stretch for desktop to make cards same height if desired, or 'flex-start'
        }}>
          {getDisplayedTiers().map((tier, index) => (
            <div
              key={tier.name}
              style={{
                background: tier.highlight ? 'var(--secondary)' : 'var(--card-background)',
                padding: '25px',
                borderRadius: '12px',
                border: tier.highlight ? '2px solid var(--primary)' : '1px solid var(--border)',
                width: isSmallScreen ? '100%' : '300px',
                maxWidth: isSmallScreen ? '400px' : '320px', // Max width for single card on mobile
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: tier.highlight ? '0 0 15px var(--primary-soft)' : 'var(--shadow-md)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                minHeight: isSmallScreen? 0 : '450px', // Ensure cards on desktop have a minimum height for alignment
              }}
              onMouseEnter={(e) => {
                if (!isSmallScreen) {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = tier.highlight ? '0 0 20px var(--primary-soft-strong)' : 'var(--shadow-lg)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isSmallScreen) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = tier.highlight ? '0 0 15px var(--primary-soft)' : 'var(--shadow-md)';
                }
              }}
            >
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: isSmallScreen ? '10px': '0px' }}>
                <h3 style={{ 
                    fontSize: '22px', 
                    color: tier.highlight ? 'var(--primary-foreground)' : 'var(--foreground)', 
                    marginBottom: '10px',
                    textAlign: 'center'
                }}>{tier.name}</h3>
                <p style={{ 
                    fontSize: '28px', 
                    fontWeight: 'bold', 
                    color: tier.highlight ? 'var(--primary-foreground)' : 'var(--primary)', 
                    marginBottom: '20px',
                    textAlign: 'center'
                }}>{tier.price}</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '25px', color: tier.highlight ? 'var(--primary-foreground-secondary)' : 'var(--foreground-secondary)' }}>
                  {tier.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '15px' }}>
                      <span style={{ color: 'var(--accent)', marginRight: '10px', fontSize: '18px' }}>✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                style={{
                  background: 'var(--button-disabled-background)',
                  color: 'var(--button-disabled-foreground)',
                  border: 'none',
                  padding: '12px 20px',
                  borderRadius: '8px',
                  fontSize: '16px',
                  fontWeight: '600',
                  cursor: 'not-allowed',
                  width: '100%',
                  marginTop: 'auto', 
                  opacity: 0.7,
                }}
                disabled
              >
                Coming Soon
              </button>
            </div>
          ))}
        </div>
        
        {isSmallScreen && tiers.length > 1 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 20px', borderTop: '1px solid var(--border)' }}>
            <button 
              onClick={handlePrevPage}
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              <LuChevronLeft size={20} /> Prev
            </button>
            <div style={{display: 'flex', alignItems: 'center', color: 'var(--foreground-secondary)', fontSize: '14px'}}>
                Page {currentPage + 1} of {tiers.length}
            </div>
            <button 
              onClick={handleNextPage}
              style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--foreground)', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}
            >
              Next <LuChevronRight size={20} />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

export default PricingPanel; 