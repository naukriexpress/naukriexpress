"use client";

import { useEffect, useState } from "react";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

export default function PwaInstallButton() {
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  useEffect(() => {
    const standalone = window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & { standalone?: boolean }).standalone === true;
    setIsInstalled(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPrompt(null);
      setShowHelp(false);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  async function handleInstall() {
    if (installPrompt) {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") setInstallPrompt(null);
      return;
    }
    setShowHelp((visible) => !visible);
  }

  if (isInstalled) {
    return (
      <div className="flex items-center gap-3 rounded-xl bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700" role="status">
        <span aria-hidden="true">✓</span>
        <span>NaukriExpress is installed</span>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-3">
      <button
        type="button"
        onClick={handleInstall}
        className="flex w-full items-center gap-3 rounded-lg px-1 py-1 text-left text-sm font-bold text-brand-800 transition-colors hover:text-brand-900"
        aria-expanded={showHelp}
      >
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-700 text-white" aria-hidden="true">
          {installPrompt ? "↓" : "+"}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block">Install NaukriExpress</span>
          <span className="mt-0.5 block text-xs font-normal text-brand-700">
            Add the app icon to your home screen
          </span>
        </span>
        <span aria-hidden="true">{installPrompt ? "↓" : "›"}</span>
      </button>
      {showHelp && (
        <div className="mt-3 border-t border-brand-200 pt-3 text-xs leading-5 text-ink-800">
          <p className="font-bold">Chrome on Android</p>
          <ol className="mt-1 list-decimal space-y-1 pl-5">
            <li>Tap the three-dot menu (⋮) in Chrome.</li>
            <li>Choose “Install app” or “Add to Home screen”.</li>
            <li>Tap Install or Add to confirm.</li>
          </ol>
          <p className="mt-2 text-gray-600">
            If the install option is not available yet, open this website directly in Chrome and try again.
          </p>
        </div>
      )}
    </div>
  );
}
