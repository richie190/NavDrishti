import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Snowflake, X, ChevronDown, Sparkles, HelpCircle } from 'lucide-react';

interface FAQItem {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    id: 1,
    question: "What is NAVDRISHTI?",
    answer: "NAVDRISHTI is an AI-powered polar intelligence platform designed to optimize vessel passage through dynamic Antarctic sea ice and iceberg fields using SAR satellite telemetry and drift forecasting."
  },
  {
    id: 2,
    question: "How does automated POLARIS RIO scoring work?",
    answer: "The POLARIS Risk Index Outcome (RIO) cross-references a ship's structural Ice Class (e.g., Arc7, 1A) against real-time ice thickness and concentration. Positive scores (+RIO) indicate safe passage; negative scores (-RIO) flag danger corridors."
  },
  {
    id: 3,
    question: "How are iceberg drift paths predicted?",
    answer: "NAVDRISHTI ingests Sentinel-1 SAR satellite imagery combined with ocean surface currents and atmospheric wind telemetry to forecast iceberg drift trajectories across +6h, +12h, and +24h horizons."
  },
  {
    id: 4,
    question: "Why is AI routing superior to traditional ice charts?",
    answer: "Traditional ice charts update every 24–72 hours and rely on visual bridge lookouts. NAVDRISHTI provides dynamic predictive evasion, preventing ice lock-ins and reducing fuel consumption by up to 36%."
  },
  {
    id: 5,
    question: "Which Antarctic research stations are supported?",
    answer: "The Command Center simulates passage corridors to major outposts including Maitri Station (Queen Maud Land), Bharati Station (Larsemann Hills), and King George Island via the Drake Passage."
  }
];

export default function PolarChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = (id: number) => {
    setExpandedFaq(expandedFaq === id ? null : id);
  };

  return (
    <div className="polar-chatbot-wrapper" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999 }}>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="polar-chat-window"
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            style={{
              width: '360px',
              maxHeight: '520px',
              backgroundColor: 'rgba(2, 18, 38, 0.95)',
              backdropFilter: 'blur(12px)',
              border: '1px solid rgba(0, 229, 255, 0.3)',
              borderRadius: '16px',
              boxShadow: '0 12px 32px rgba(0, 0, 0, 0.6), 0 0 20px rgba(0, 229, 255, 0.15)',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
              fontFamily: 'sans-serif'
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '16px',
                background: 'linear-gradient(135deg, rgba(0, 71, 171, 0.4), rgba(0, 229, 255, 0.15))',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  backgroundColor: 'rgba(0, 229, 255, 0.15)',
                  padding: '8px',
                  borderRadius: '10px',
                  border: '1px solid rgba(0, 229, 255, 0.4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Snowflake size={20} color="#00e5ff" />
                </div>
                <div>
                  <h4 style={{ margin: 0, color: '#ffffff', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    POLAR AI ASSISTANT <Sparkles size={12} color="#00e5ff" />
                  </h4>
                  <span style={{ fontSize: '11px', color: '#8ca8b4' }}>Frequently Asked Questions</span>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                aria-label="Close chatbot"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#8ca8b4',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* FAQ Accordion List */}
            <div
              style={{
                padding: '12px',
                overflowY: 'auto',
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ padding: '4px 8px', fontSize: '11px', color: '#68829e', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <HelpCircle size={12} /> Select a question below:
              </div>

              {faqs.map((faq) => {
                const isExpanded = expandedFaq === faq.id;
                return (
                  <div
                    key={faq.id}
                    style={{
                      borderRadius: '8px',
                      border: isExpanded ? '1px solid rgba(0, 229, 255, 0.4)' : '1px solid rgba(255, 255, 255, 0.08)',
                      backgroundColor: isExpanded ? 'rgba(0, 96, 213, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                      transition: 'all 0.2s ease',
                      overflow: 'hidden'
                    }}
                  >
                    <button
                      onClick={() => toggleFaq(faq.id)}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '10px 12px',
                        background: 'none',
                        border: 'none',
                        color: isExpanded ? '#00e5ff' : '#e2e8f0',
                        fontSize: '12.5px',
                        fontWeight: 500,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '8px'
                      }}
                    >
                      <span>{faq.question}</span>
                      <motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={14} color={isExpanded ? '#00e5ff' : '#8ca8b4'} />
                      </motion.div>
                    </button>

                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          style={{
                            padding: '0 12px 12px 12px',
                            fontSize: '12px',
                            lineHeight: '1.45',
                            color: '#a0b3c6',
                            borderTop: '1px dashed rgba(255, 255, 255, 0.08)',
                            paddingTop: '8px'
                          }}
                        >
                          {faq.answer}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div style={{
              padding: '10px 16px',
              backgroundColor: 'rgba(0, 10, 24, 0.8)',
              borderTop: '1px solid rgba(255, 255, 255, 0.08)',
              fontSize: '10px',
              color: '#527a70',
              textAlign: 'center',
              letterSpacing: '0.05em'
            }}>
              NAVDRISHTI INTELLIGENCE ENGINE • ONLINE
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Floating Action Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        aria-label="Open Polar AI Chatbot"
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#002663',
          border: '2px solid #00e5ff',
          color: '#00e5ff',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 16px rgba(0, 229, 255, 0.4)',
          position: 'relative',
          marginLeft: 'auto'
        }}
      >
        {isOpen ? (
          <X size={24} />
        ) : (
          <>
            <Snowflake size={26} />
            <span
              style={{
                position: 'absolute',
                top: '2px',
                right: '2px',
                width: '12px',
                height: '12px',
                backgroundColor: '#10B981',
                borderRadius: '50%',
                border: '2px solid #002663'
              }}
            />
          </>
        )}
      </motion.button>
    </div>
  );
}