import { ArrowLeft } from 'lucide-react';
import GrassBackground from '../ui/GrassBackground';
import StepProgress from './StepProgress';

export default function OnboardingShell({
  step,
  totalSteps,
  flow = 'player',
  backTo,
  onBack,
  pill,
  title,
  subtitle,
  children,
  footer,
  centered = false,
  wide = false,
}) {
  const handleBack = onBack || (backTo ? undefined : undefined);

  return (
    <div className={`min-h-screen relative flex flex-col ${flow === 'player' ? 'bg-slate-50' : 'dash-owner-bg'}`}>
      {flow !== 'player' && <GrassBackground />}
      <div className={`relative z-10 flex-1 flex flex-col w-full mx-auto px-5 sm:px-8 py-6 sm:py-10 ${wide ? 'max-w-2xl' : 'max-w-md'}`}>
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 transition self-start"
          >
            <ArrowLeft className="w-4 h-4" /> back
          </button>
        )}

        {step && totalSteps && (
          <StepProgress step={step} totalSteps={totalSteps} flow={flow} className="mb-6" />
        )}

        <div className={`animate-fade-up ${centered ? 'flex-1 flex flex-col justify-center' : ''}`}>
          {pill && <span className="tm-pill w-fit mb-4">{pill}</span>}
          {title && (
            <h1 className="text-3xl font-display font-extrabold text-slate-800 lowercase leading-tight">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="mt-2 text-slate-500 text-sm leading-relaxed">{subtitle}</p>
          )}
          <div className={title || subtitle ? 'mt-8' : ''}>{children}</div>
        </div>

        {footer && <div className="mt-auto pt-8 pb-4 safe-bottom">{footer}</div>}
      </div>
    </div>
  );
}
