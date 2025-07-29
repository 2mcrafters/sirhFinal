import { useEffect, useState } from "react";
import { useSelector } from "react-redux";

const OneSignalSetup = () => {
  const [playerId, setPlayerId] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const playerIdFromDB = user?.onesignal_player_id;

  useEffect(() => {
    // Ne rien faire si pas connecté
    if (!user) {
      setIsInitialized(false);
      setPlayerId(null);
      return;
    }
    // Si le playerId existe déjà (en base / Redux), inutile d'initialiser OneSignal
    if (playerIdFromDB) {
      setPlayerId(playerIdFromDB);
      setIsInitialized(true);
      console.log("Player ID already present in DB/Redux:", playerIdFromDB);
      return;
    }

    const initializeOneSignal = async () => {
      try {
        // Vérifier si OneSignal est déjà chargé
        if (!window.OneSignal) {
          const script = document.createElement('script');
          script.src = 'https://cdn.onesignal.com/sdks/OneSignalSDK.js';
          script.async = true;
          document.body.appendChild(script);

          script.onload = () => {
            initializeOneSignal();
          };
          return;
        }

        // Initialiser OneSignal avec la nouvelle API
        await window.OneSignal.init({
          appId: "685f188c-1532-4ba4-b96a-919233c9eae2",
          safari_web_id: "web.onesignal.auto.5c6acdd7-2576-4d7e-9cb0-efba7bf8602e",
          notifyButton: { enable: true },
          allowLocalhostAsSecureOrigin: true,
        });

        setIsInitialized(true);
        console.log('OneSignal initialized successfully');

        // Écouter les changements d'abonnement avec la nouvelle API
        window.OneSignal.User.PushSubscription.addEventListener('change', async (event) => {
          console.log('Subscription changed:', event);

          if (event.current.optedIn) {
            console.log('User is subscribed');
            await waitForPlayerId();
          } else {
            console.log('User is not subscribed');
            setPlayerId(null);
          }
        });

        // Vérifier si déjà abonné
        const isOptedIn = window.OneSignal.User.PushSubscription.optedIn;
        if (isOptedIn) {
          console.log('User is already subscribed');
          await waitForPlayerId();
        }

      } catch (error) {
        console.error('OneSignal initialization failed:', error);
      }
    };

    // Fonction pour attendre le Player ID
    const waitForPlayerId = async () => {
      let attempts = 0;
      const maxAttempts = 30; // 3 secondes max

      while (attempts < maxAttempts) {
        try {
          const id = window.OneSignal.User.PushSubscription.id;
          if (id) {
            console.log('Player ID obtenu:', id);
            setPlayerId(id);
            alert("Votre Player ID OneSignal : " + id);
            return id;
          }
        } catch (error) {
          console.log('Erreur lors de la récupération du Player ID:', error);
        }
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }
      console.error('Impossible d\'obtenir le Player ID après', maxAttempts, 'tentatives');
      alert("Abonnement réussi mais Player ID indisponible. Essayez de recharger la page.");
    };

    initializeOneSignal();

    // Cleanup
    return () => {
      console.log('OneSignal cleanup');
    };
  }, [user, playerIdFromDB]); // <-- Important ! Si le user ou playerIdFromDB change

  // Les autres fonctions restent identiques...

  const getPlayerIdManually = async () => {
    if (!isInitialized) {
      alert("OneSignal n'est pas encore initialisé");
      return;
    }
    try {
      const isOptedIn = window.OneSignal.User.PushSubscription.optedIn;
      if (isOptedIn) {
        const id = window.OneSignal.User.PushSubscription.id;
        if (id) {
          setPlayerId(id);
          alert("Votre Player ID OneSignal : " + id);
          console.log('Player ID récupéré manuellement:', id);
        } else {
          alert("Player ID non disponible. Assurez-vous d'être abonné aux notifications.");
        }
      } else {
        alert("Vous devez d'abord vous abonner aux notifications push.");
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du Player ID:', error);
      alert("Erreur lors de la récupération du Player ID: " + error.message);
    }
  };

  const subscribeManually = async () => {
    if (!isInitialized) {
      alert("OneSignal n'est pas encore initialisé");
      return;
    }
    try {
      await window.OneSignal.User.PushSubscription.optIn();
      console.log('Subscription demandée');
    } catch (error) {
      console.error('Erreur lors de l\'abonnement:', error);
      alert("Erreur lors de l'abonnement: " + error.message);
    }
  };

  return {
    playerId: playerIdFromDB || playerId, // toujours prioriser playerIdFromDB
    isInitialized,
    getPlayerIdManually,
    subscribeManually
  };
};

export default OneSignalSetup;
