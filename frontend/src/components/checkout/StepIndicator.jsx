import { Check } from 'lucide-react';

export default function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-center gap-0 mb-8">
      {steps.map((step, i) => {
        const done   = i < currentStep;
        const active = i === currentStep;
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 flex items-center justify-center text-sm font-medium transition-colors
                ${done ? 'bg-brand-success text-white' : active ? 'bg-brand-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                {done ? <Check size={14}/> : i + 1}
              </div>
              <p className={`text-xs mt-1 hidden sm:block ${active ? 'text-brand-primary font-medium' : 'text-gray-400'}`}>{step}</p>
            </div>
            {i < steps.length - 1 && <div className={`h-px w-12 sm:w-24 transition-colors ${done ? 'bg-brand-success' : 'bg-gray-200'}`} />}
          </div>
        );
      })}
    </div>
  );
}
