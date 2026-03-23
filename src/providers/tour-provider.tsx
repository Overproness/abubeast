"use client";

import { useAuth } from "@/providers/auth-provider";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Loader2,
  Sparkles,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

export interface TourStep {
  /** CSS selector for the target element */
  target: string;
  title: string;
  content: string;
  page: string;
  placement?: "top" | "bottom" | "left" | "right";
  /** Navigate here when this step becomes active */
  navigateTo?: string;
  /** DOM event to dispatch when this step becomes active */
  domAction?: string;
  /** Tour auto-advances when this window event fires (user completed the action) */
  autoAdvanceOn?: string;
  /** When true, hides the Next button — user must perform the real action */
  waitForAction?: boolean;
  /** Label for the primary button */
  actionLabel?: string;
}

const ALL_TOUR_STEPS: TourStep[] = [
  // ── Dashboard overview ──────────────────────────────────────────────────
  {
    target: "[data-tour='bot-status']",
    title: "Bot Control Center",
    content:
      "This is your bot's command center. Pause or resume automated trading here and monitor daily trades, volume, P&L, and win rate.",
    page: "/dashboard",
    placement: "bottom",
  },
  {
    target: "[data-tour='session-keys-card']",
    title: "Session Keys Overview",
    content:
      "At a glance: how many active session keys you have and their combined SOL balance. Click 'Manage' any time to jump to the Session Keys page.",
    page: "/dashboard",
    placement: "left",
  },
  {
    target: "[data-tour='portfolio-chart']",
    title: "Portfolio Performance",
    content:
      "Your portfolio value over time. Switch between 1D / 1W / 1M to spot trends.",
    page: "/dashboard",
    placement: "top",
  },
  {
    target: "[data-tour='live-activity']",
    title: "Live Activity Feed",
    content:
      "Real-time feed of every trade and swap your bot executes. Check here to see what's happening.",
    page: "/dashboard",
    placement: "left",
  },
  // ── Step 5: open the form ────────────────────────────────────────────────
  {
    target: "[data-tour='new-session-key']",
    title: "Step 1 — Open the Key Generator",
    content:
      "Let's create your first session key. Click 'Open Form' and we'll open the generator for you.",
    page: "/dashboard/session-keys",
    placement: "bottom",
    navigateTo: "/dashboard/session-keys",
    actionLabel: "Open Form",
    domAction: "open-session-key-form",
  },
  // ── Step 6: fill & submit the form ─────────────────────────────────────
  {
    target: "[data-tour='session-key-form']",
    title: "Step 2 — Generate the Key",
    content:
      'Give it a name, pick permissions, and set an expiry. Then click the "Generate Key" button inside the form. The tour will automatically continue once it\'s created.',
    page: "/dashboard/session-keys",
    placement: "bottom",
    waitForAction: true,
    autoAdvanceOn: "tour:key-generated",
  },
  // ── Step 7: authorize ───────────────────────────────────────────────────
  {
    target: "[data-tour='key-authorize']",
    title: "Step 3 — Authorize the Key",
    content:
      'Your key is Pending. Click the "Authorize" button and sign the message in your wallet. This activates the key so the bot can trade on your behalf.',
    page: "/dashboard/session-keys",
    placement: "right",
    waitForAction: true,
    autoAdvanceOn: "tour:key-authorized",
  },
  // ── Step 8: fund ────────────────────────────────────────────────────────
  {
    target: "[data-tour='key-fund']",
    title: "Step 4 — Fund the Key",
    content:
      'Active keys need SOL to pay for transaction fees. Click "Fund", enter an amount (0.01 SOL is plenty to start), and confirm in your wallet.',
    page: "/dashboard/session-keys",
    placement: "right",
    waitForAction: true,
    autoAdvanceOn: "tour:key-funded",
  },
  // ── Step 9: fund panel open ─────────────────────────────────────────────
  {
    target: "[data-tour='key-fund-panel']",
    title: "Step 4 — Send SOL",
    content:
      'Enter an amount and click "Send SOL". The tour will move on once the transaction is sent.',
    page: "/dashboard/session-keys",
    placement: "top",
    waitForAction: true,
    autoAdvanceOn: "tour:key-funded",
  },
  // ── Step 10: revoke ─────────────────────────────────────────────────────
  {
    target: "[data-tour='key-revoke']",
    title: "Step 5 — Revoke a Key",
    content:
      'When you no longer need a key, click "Revoke". The bot will drain any remaining SOL back to your wallet and destroy the key. Try it now!',
    page: "/dashboard/session-keys",
    placement: "right",
    waitForAction: true,
    autoAdvanceOn: "tour:key-revoked",
  },
  // ── Step 11: completion ─────────────────────────────────────────────────
  {
    target: "[data-tour='new-session-key']",
    title: "You're All Set! 🎉",
    content:
      "You've created, authorized, funded, and revoked a session key — that's the full lifecycle! Use the 'Hide Revoked' toggle to keep your list clean. Happy trading!",
    page: "/dashboard/session-keys",
    placement: "bottom",
    actionLabel: "Finish Tour",
  },
];

interface TourContextType {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: TourStep | null;
  startTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
}

const TourContext = createContext<TourContextType>({
  isActive: false,
  currentStep: 0,
  totalSteps: 0,
  currentStepData: null,
  startTour: () => {},
  nextStep: () => {},
  prevStep: () => {},
  skipTour: () => {},
});

export function useTour() {
  return useContext(TourContext);
}

export function TourProvider({ children }: { children: ReactNode }) {
  const { user, completeOnboarding } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasPrompted, setHasPrompted] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const steps = ALL_TOUR_STEPS;

  // Show welcome modal for new users
  useEffect(() => {
    if (
      user &&
      !user.onboardingComplete &&
      !hasPrompted &&
      !isActive &&
      pathname?.startsWith("/dashboard")
    ) {
      const timer = setTimeout(() => setShowWelcome(true), 800);
      return () => clearTimeout(timer);
    }
  }, [user, hasPrompted, isActive, pathname]);

  const advanceTo = useCallback(
    (next: number) => {
      if (next >= steps.length) {
        setIsActive(false);
        setCurrentStep(0);
        completeOnboarding();
        return;
      }
      const nextData = steps[next];
      if (nextData.domAction) {
        window.dispatchEvent(
          new CustomEvent("tour-step-action", {
            detail: { action: nextData.domAction },
          }),
        );
      }
      if (nextData.navigateTo && pathname !== nextData.navigateTo) {
        setCurrentStep(next);
        router.push(nextData.navigateTo);
      } else {
        setCurrentStep(next);
      }
    },
    [steps, completeOnboarding, pathname, router],
  );

  // Listen for auto-advance events emitted by the page after real actions
  useEffect(() => {
    if (!isActive) return;
    const stepData = steps[currentStep];
    if (!stepData?.autoAdvanceOn) return;

    const eventName = stepData.autoAdvanceOn as string;
    const handler = () => advanceTo(currentStep + 1);
    window.addEventListener(eventName, handler);
    return () => window.removeEventListener(eventName, handler);
  }, [isActive, currentStep, steps, advanceTo]);

  const startTour = useCallback(() => {
    setShowWelcome(false);
    setHasPrompted(true);
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const skipTour = useCallback(() => {
    setShowWelcome(false);
    setHasPrompted(true);
    setIsActive(false);
    setCurrentStep(0);
    completeOnboarding();
  }, [completeOnboarding]);

  const nextStep = useCallback(() => {
    advanceTo(currentStep + 1);
  }, [currentStep, advanceTo]);

  const prevStep = useCallback(() => {
    const prev = currentStep - 1;
    if (prev < 0) return;
    const prevData = steps[prev];
    if (prevData.page && pathname !== prevData.page) {
      setCurrentStep(prev);
      router.push(prevData.page);
    } else {
      setCurrentStep(prev);
    }
  }, [currentStep, steps, pathname, router]);

  const currentStepData = isActive ? (steps[currentStep] ?? null) : null;

  return (
    <TourContext
      value={{
        isActive,
        currentStep,
        totalSteps: steps.length,
        currentStepData,
        startTour,
        nextStep,
        prevStep,
        skipTour,
      }}
    >
      {children}

      {/* Welcome Modal */}
      <AnimatePresence>
        {showWelcome && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glassmorphism rounded-2xl p-8 max-w-md mx-4 border border-primary/20 shadow-2xl shadow-primary/10"
            >
              <div className="flex items-center justify-center mb-6">
                <div className="size-16 rounded-full bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <Sparkles className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h2 className="text-2xl font-black text-white text-center tracking-tight mb-2">
                Welcome to AbuBeast!
              </h2>
              <p className="text-slate-400 text-sm text-center leading-relaxed mb-6">
                Let&apos;s get you set up. We&apos;ll walk you through the
                dashboard, then guide you through creating, authorizing, funding
                and revoking your first session key — step by step.
              </p>
              <div className="flex flex-col gap-3">
                <button
                  onClick={startTour}
                  className="w-full py-3 rounded-xl bg-primary text-background-dark font-black text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-all glow-cyan"
                >
                  <Sparkles className="w-4 h-4" /> Start Guided Tour
                </button>
                <button
                  onClick={skipTour}
                  className="w-full py-3 rounded-xl bg-white/5 text-slate-400 font-bold text-sm hover:text-white hover:bg-white/10 transition-all border border-white/10"
                >
                  Skip, I know my way around
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tour Tooltip */}
      {isActive && currentStepData && (
        <TourTooltip
          step={currentStepData}
          stepIndex={currentStep}
          totalSteps={steps.length}
          onNext={nextStep}
          onPrev={prevStep}
          onSkip={skipTour}
        />
      )}
    </TourContext>
  );
}

function TourTooltip({
  step,
  stepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
}: {
  step: TourStep;
  stepIndex: number;
  totalSteps: number;
  onNext: () => void;
  onPrev: () => void;
  onSkip: () => void;
}) {
  const [tooltipPos, setTooltipPos] = useState<{
    top: number;
    left: number;
    arrowDir: string;
  } | null>(null);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const timer = setTimeout(() => {
      setTooltipPos(null);
      setTargetRect(null);
      const el = document.querySelector(step.target);
      if (!el) return;

      el.scrollIntoView({ behavior: "smooth", block: "center" });

      requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);

        const placement = step.placement ?? "bottom";
        const tooltipW = 360;
        const tooltipH = 220;
        const gap = 16;
        let top = 0;
        let left = 0;

        switch (placement) {
          case "bottom":
            top = rect.bottom + gap;
            left = rect.left + rect.width / 2 - tooltipW / 2;
            break;
          case "top":
            top = rect.top - tooltipH - gap;
            left = rect.left + rect.width / 2 - tooltipW / 2;
            break;
          case "left":
            top = rect.top + rect.height / 2 - tooltipH / 2;
            left = rect.left - tooltipW - gap;
            break;
          case "right":
            top = rect.top + rect.height / 2 - tooltipH / 2;
            left = rect.right + gap;
            break;
        }

        left = Math.max(16, Math.min(left, window.innerWidth - tooltipW - 16));
        top = Math.max(72, Math.min(top, window.innerHeight - tooltipH - 16));

        setTooltipPos({ top, left, arrowDir: placement });
      });
    }, 400);

    return () => clearTimeout(timer);
  }, [step, pathname]);

  const tooltipBody = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 pr-3">
          <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">
            Step {stepIndex + 1} of {totalSteps}
          </p>
          <h3 className="text-base font-bold text-white leading-snug">
            {step.title}
          </h3>
        </div>
        <button
          onClick={onSkip}
          className="p-1 rounded-lg text-slate-500 hover:text-white transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <p className="text-sm text-slate-400 leading-relaxed mb-4">
        {step.content}
      </p>

      {/* Waiting indicator */}
      {step.waitForAction && (
        <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20">
          <Loader2 className="w-3.5 h-3.5 text-primary animate-spin shrink-0" />
          <span className="text-xs font-bold text-primary">
            Waiting for you to complete this action…
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          disabled={stepIndex === 0}
          className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-400 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-1 transition-colors"
        >
          <ArrowLeft className="w-3 h-3" /> Back
        </button>
        <div className="flex gap-1">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all ${
                i === stepIndex
                  ? "bg-primary w-4"
                  : i < stepIndex
                    ? "bg-primary/40 w-1.5"
                    : "bg-slate-600 w-1.5"
              }`}
            />
          ))}
        </div>
        {!step.waitForAction && (
          <button
            onClick={onNext}
            className="px-4 py-1.5 rounded-lg bg-primary text-background-dark text-xs font-black flex items-center gap-1 hover:opacity-90 transition-all"
          >
            {stepIndex === totalSteps - 1 ? (
              <>
                <CheckCircle2 className="w-3 h-3" />{" "}
                {step.actionLabel ?? "Finish"}
              </>
            ) : (
              <>
                {step.actionLabel ?? "Next"}{" "}
                <ChevronRight className="w-3 h-3" />
              </>
            )}
          </button>
        )}
        {step.waitForAction && (
          <span className="text-[10px] text-slate-500 italic">
            auto-advances
          </span>
        )}
      </div>
    </>
  );

  // Target not found yet — floating bottom bar
  if (!tooltipPos || !targetRect) {
    return (
      <div className="fixed inset-0 z-[9998] pointer-events-none">
        <div
          className="absolute inset-0 bg-black/40"
          style={{ pointerEvents: "auto" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[9999] glassmorphism rounded-2xl p-5 border border-primary/20 shadow-2xl"
          style={{ width: 360, pointerEvents: "auto" }}
        >
          {tooltipBody}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[9998]" style={{ pointerEvents: "none" }}>
      {/* 4-panel overlay with hole */}
      <div
        className="absolute bg-black/50"
        style={{
          pointerEvents: "auto",
          top: 0,
          left: 0,
          right: 0,
          height: Math.max(0, targetRect.top - 6),
        }}
      />
      <div
        className="absolute bg-black/50"
        style={{
          pointerEvents: "auto",
          top: targetRect.bottom + 6,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      />
      <div
        className="absolute bg-black/50"
        style={{
          pointerEvents: "auto",
          top: targetRect.top - 6,
          left: 0,
          width: Math.max(0, targetRect.left - 6),
          height: targetRect.height + 12,
        }}
      />
      <div
        className="absolute bg-black/50"
        style={{
          pointerEvents: "auto",
          top: targetRect.top - 6,
          left: targetRect.right + 6,
          right: 0,
          height: targetRect.height + 12,
        }}
      />

      {/* Highlight ring */}
      <div
        className="absolute border-2 border-primary rounded-xl"
        style={{
          pointerEvents: "none",
          top: targetRect.top - 6,
          left: targetRect.left - 6,
          width: targetRect.width + 12,
          height: targetRect.height + 12,
          boxShadow: "0 0 24px rgba(0, 242, 255, 0.35)",
        }}
      />

      {/* Tooltip */}
      <motion.div
        ref={tooltipRef}
        key={stepIndex}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="absolute z-[9999] glassmorphism rounded-2xl p-5 border border-primary/20 shadow-2xl"
        style={{
          pointerEvents: "auto",
          top: tooltipPos.top,
          left: tooltipPos.left,
          width: 360,
        }}
      >
        {tooltipBody}
      </motion.div>
    </div>
  );
}
