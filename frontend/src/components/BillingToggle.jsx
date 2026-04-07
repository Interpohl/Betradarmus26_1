import React from 'react';

export const BillingToggle = ({ interval, onChange }) => {
  return (
    <div className="flex items-center justify-center gap-4 mb-8" data-testid="billing-toggle">
      <span className={`text-sm font-medium transition-colors ${
        interval === 'monthly' ? 'text-white' : 'text-[#A1A1AA]'
      }`}>
        Monatlich
      </span>
      
      <button
        onClick={() => onChange(interval === 'monthly' ? 'yearly' : 'monthly')}
        className="relative w-16 h-8 bg-[#121212] border border-white/10 rounded-full transition-colors hover:border-white/20"
        data-testid="billing-toggle-button"
      >
        <div className={`absolute top-1 w-6 h-6 rounded-full transition-all duration-300 ${
          interval === 'yearly' 
            ? 'left-9 bg-[#39FF14]' 
            : 'left-1 bg-white/30'
        }`} />
      </button>
      
      <div className="flex items-center gap-2">
        <span className={`text-sm font-medium transition-colors ${
          interval === 'yearly' ? 'text-white' : 'text-[#A1A1AA]'
        }`}>
          Jährlich
        </span>
        {interval === 'yearly' && (
          <span className="px-2 py-0.5 bg-[#39FF14]/20 text-[#39FF14] text-xs font-bold rounded-full">
            -28%
          </span>
        )}
      </div>
    </div>
  );
};

export default BillingToggle;
