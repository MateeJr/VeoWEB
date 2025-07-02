'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LuX, LuChevronLeft, LuChevronRight } from 'react-icons/lu';

interface PricingTier {
  name: string;
  price: string;
  features: string[];
  highlight?: boolean;
  originalPrice?: string;
  discountPercent?: number;
}

const tiers: PricingTier[] = [
  {
    name: 'Basic',
    price: 'Rp. 50.000/mo',
    originalPrice: 'Rp. 70.000/mo',
    discountPercent: 29,
    features: [
      '32K token memory',
      'Web search',
      'Image generation',
      'File upload / analysis',
      '500 messages per day',
    ],
  },
  {
    name: 'Intermediate',
    price: 'Rp. 100.000/mo',
    originalPrice: 'Rp. 150.000/mo',
    discountPercent: 33,
    features: [
      'All Basic features',
      '128K token memory',
      'Agent search (smartest)',
      'Advanced image generation',
      'Voice mode',
      'Smart AI model',
    ],
    highlight: true,
  },
  {
    name: 'Advanced',
    price: 'Rp. 200.000/mo',
    originalPrice: 'Rp. 320.000/mo',
    discountPercent: 38,
    features: [
      'All Intermediate features',
      'High priority support',
      'In-depth research',
      '200K token memory',
      'Smartest AI model',
      'Video call mode',
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
  // Billing period state: 'monthly' or 'six-month' (6-month plan gives 1 month free)
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'six-month'>('monthly');

  // Helper to format numbers into Indonesian Rupiah string, e.g., 50000 -> "Rp. 50.000"
  const formatRupiah = (value: number) => `Rp. ${value.toLocaleString('id-ID')}`;

  // Extract pure number from the tier price string (assumes format like "Rp. 50.000/mo")
  const getMonthlyNumeric = (priceStr: string) => {
    const onlyDigits = priceStr.replace(/[^0-9]/g, '');
    return parseInt(onlyDigits, 10) || 0;
  };

  useEffect(() => {
    // Preserve original overflow style to restore later
    const previousOverflow = document.body.style.overflow;

    if (isOpen) {
      // Prevent background scrolling while the pricing panel is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore whatever the page previously had (default is hidden from globals.css)
      document.body.style.overflow = previousOverflow || 'hidden';
    }

    // Clean-up when component unmounts or isOpen changes
    return () => {
      document.body.style.overflow = previousOverflow || 'hidden';
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
                maxWidth: '1200px',
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

        {/* Billing period selector */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          padding: '18px',
          borderBottom: '1px solid var(--border)'
        }}>
          <button
            onClick={() => setBillingPeriod('monthly')}
            style={{
              background: billingPeriod === 'monthly' ? 'var(--primary)' : 'var(--secondary)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              minWidth: '110px'
            }}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('six-month')}
            style={{
              background: billingPeriod === 'six-month' ? 'var(--primary)' : 'var(--secondary)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              padding: '8px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 600,
              minWidth: '110px'
            }}
          >
            6&nbsp;Months
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
            <motion.div
              key={tier.name}
              style={{
                background: 'var(--card-background)',
                padding: '25px',
                borderRadius: '12px',
                border: tier.highlight ? '2px solid #ff3b3b' : '1px solid var(--border)',
                width: isSmallScreen ? '100%' : '340px',
                maxWidth: isSmallScreen ? '400px' : '360px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                boxShadow: tier.highlight ? '0 0 15px rgba(255,0,0,0.4)' : 'var(--shadow-md)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                minHeight: isSmallScreen? 0 : '450px', // Ensure cards on desktop have a minimum height for alignment
                color: 'var(--foreground)'
              }}
              animate={tier.highlight ? { boxShadow: ['0 0 15px rgba(255,0,0,0.4)', '0 0 35px #ff3b3b', '0 0 15px rgba(255,0,0,0.4)'] } : undefined}
              transition={tier.highlight ? { duration: 2, repeat: Infinity, repeatType: 'mirror', ease: 'easeInOut' } : undefined}
              onMouseEnter={(e) => {
                if (!isSmallScreen) {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  if (!tier.highlight) {
                    e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
                  }
                }
              }}
              onMouseLeave={(e) => {
                if (!isSmallScreen) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  if (!tier.highlight) {
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }
                }
              }}
            >
              <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, paddingRight: isSmallScreen ? '10px': '0px' }}>
                <h3 style={{ 
                    fontSize: '22px', 
                    color: 'var(--foreground)', 
                    marginBottom: '10px',
                    textAlign: 'center'
                }}>{tier.name}</h3>
                {billingPeriod === 'monthly' ? (
                  tier.originalPrice ? (
                    <div style={{
                        marginBottom: '20px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px'
                    }}>
                      <span style={{
                          fontSize: '18px',
                          color: 'var(--foreground-secondary)',
                          textDecoration: 'line-through'
                      }}>{tier.originalPrice}</span>
                      <span style={{
                          fontSize: '28px',
                          fontWeight: 'bold',
                          color: 'var(--foreground)',
                          whiteSpace: 'nowrap'
                      }}>{tier.price}</span>
                      {tier.discountPercent !== undefined && (
                        <span style={{
                            fontSize: '14px',
                            background: tier.highlight ? '#ff3b3b' : 'var(--primary)',
                            color: '#fff',
                            padding: '2px 8px',
                            borderRadius: '4px',
                            fontWeight: 600
                        }}>
                          {tier.discountPercent}% OFF
                        </span>
                      )}
                    </div>
                  ) : (
                    <p style={{
                        fontSize: '28px',
                        fontWeight: 'bold',
                        color: 'var(--foreground)',
                        marginBottom: '20px',
                        textAlign: 'center',
                        whiteSpace: 'nowrap'
                    }}>{tier.price}</p>
                  )
                ) : (
                  (() => {
                    const monthlyValue = getMonthlyNumeric(tier.price);
                    const originalTotal = monthlyValue * 6; // Pay for 6 months
                    const discountedTotal = monthlyValue * 5; // 1 month free
                    return (
                      <div style={{
                        marginBottom: '20px',
                        textAlign: 'center',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <span style={{
                          fontSize: '18px',
                          color: 'var(--foreground-secondary)',
                          textDecoration: 'line-through'
                        }}>{formatRupiah(originalTotal)}</span>
                        <span style={{
                          fontSize: '28px',
                          fontWeight: 'bold',
                          color: 'var(--foreground)',
                          whiteSpace: 'nowrap'
                        }}>{formatRupiah(discountedTotal)} / 6 mo</span>
                        <span style={{
                          fontSize: '14px',
                          background: 'var(--primary)',
                          color: 'var(--primary-foreground, #fff)',
                          padding: '2px 8px',
                          borderRadius: '4px',
                          fontWeight: 600
                        }}>
                          1 Month FREE
                        </span>
                      </div>
                    );
                  })()
                )}
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, marginBottom: '25px', color: 'var(--foreground)' }}>
                  {tier.features.map((feature, i) => (
                    <li key={i} style={{ display: 'flex', alignItems: 'center', marginBottom: '10px', fontSize: '15px' }}>
                      <span style={{ color: 'var(--foreground)', marginRight: '10px', fontSize: '18px' }}>✓</span>
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
            </motion.div>
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