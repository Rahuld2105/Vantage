import React from 'react';

const STEPS = ['Plan', 'Charity', 'Account'];

export default function StepIndicator({ currentStep }) {
  return (
    <div className="flex items-center gap-2 sm:gap-3 mb-8 sm:mb-10 overflow-x-auto pb-1">
      {STEPS.map((step, index) => (
        <React.Fragment key={index}>
          <div className={`flex items-center gap-2 shrink-0 ${currentStep === index + 1 ? 'text-white' : currentStep > index + 1 ? 'text-cyan-400' : 'text-white/20'}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black border transition-all ${
              currentStep === index + 1
                ? 'bg-white text-black border-white'
                : currentStep > index + 1
                  ? 'bg-cyan-500 text-black border-cyan-500'
                  : 'border-white/20'
            }`}>
              {currentStep > index + 1 ? '✓' : index + 1}
            </div>
            <span className="text-[11px] sm:text-xs font-bold whitespace-nowrap">{step}</span>
          </div>
          {index < STEPS.length - 1 && (
            <div className={`flex-1 min-w-6 sm:min-w-0 h-px transition-all ${currentStep > index + 1 ? 'bg-cyan-500' : 'bg-white/10'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
