import { useEffect, useState } from "react";

function InstallPWAButton() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showButton, setShowButton] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      // Empêche Chrome d’afficher automatiquement la bannière
      e.preventDefault();
      setDeferredPrompt(e);
      setShowButton(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      // Optionnel : masquer le bouton si accepté ou refusé
      setShowButton(false);
      setDeferredPrompt(null);
    }
  };

  if (!showButton) return null;

  return (
    <button onClick={handleInstallClick} className="btn btn-danger mt-2" >
      Installer l’application Maintenant
    </button>
  );
}

export default InstallPWAButton;
