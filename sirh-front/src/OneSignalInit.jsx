import { useEffect, useState } from "react";

const OneSignalInit = () => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [playerIdFromDevice, setPlayerIdFromDevice] = useState(null);

  useEffect(() => {
    // Initialisation OneSignal dès le chargement de l'application
    const initializeOneSignal = async () => {
      try {
        if (!window.OneSignal) {
          console.log("OneSignal n'est pas disponible");
          return;
        }
        
        // Empêche l'init multiple
        if (window.__oneSignalInitialized) {
          console.log("OneSignal déjà initialisé");
          setIsInitialized(true);
          await checkForPlayerId();
          return;
        }

        console.log("Initialisation de OneSignal...");
        await window.OneSignal.init({
          appId: "685f188c-1532-4ba4-b96a-919233c9eae2",
          safari_web_id: "web.onesignal.auto.5c6acdd7-2576-4d7e-9cb0-efba7bf8602e",
          notifyButton: { enable: false },
          autoPrompt: false,
          allowLocalhostAsSecureOrigin: true,
        });

        // Définir la variable globale APRÈS l'initialisation réussie
        console.log("🚀 Définition de window.__oneSignalInitialized = true");
        window.__oneSignalInitialized = true;
        setIsInitialized(true);
        console.log("OneSignal initialisé avec succès");

        // Vérifier si l'utilisateur est déjà abonné
        const isOptedIn = window.OneSignal.User.PushSubscription.optedIn;
        if (isOptedIn) {
          console.log("Utilisateur déjà abonné aux notifications");
          await checkForPlayerId();
        }

        // Écouter les changements d'abonnement
        window.OneSignal.User.PushSubscription.addEventListener(
          "change",
          async (event) => {
            console.log("Changement d'abonnement:", event);
            if (event.current.optedIn) {
              console.log("Utilisateur abonné");
              await checkForPlayerId();
            } else {
              console.log("Utilisateur désabonné");
              setPlayerIdFromDevice(null);
              window.__oneSignalPlayerId = null;
            }
          }
        );
      } catch (error) {
        console.error("Échec de l'initialisation OneSignal:", error);
      }
    };

    const checkForPlayerId = async () => {
      let attempts = 0;
      const maxAttempts = 30;

      while (attempts < maxAttempts) {
        try {
          if (
            window.OneSignal &&
            window.OneSignal.User &&
            window.OneSignal.User.PushSubscription
          ) {
            const id = window.OneSignal.User.PushSubscription.id;
            if (id) {
              console.log("✅ Player ID obtenu dès l'initialisation:", id);
              setPlayerIdFromDevice(id);
              // Stocker globalement pour y accéder facilement
              window.__oneSignalPlayerId = id;
              return id;
            }
          }
        } catch (error) {
          console.error("Erreur récupération Player ID:", error);
        }
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }
      console.warn("Impossible d'obtenir le Player ID après plusieurs tentatives");
      return null;
    };

    initializeOneSignal();

    return () => {
      // Nettoyage si nécessaire
    };
  }, []);

  // Return a React component (can be empty)
  return null;
};

export default OneSignalInit;