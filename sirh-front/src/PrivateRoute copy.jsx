import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

const PrivateRoute = ({ children, requirePlayerId }) => {
  const { isSuccess, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const playerIdFromRedux = user?.onesignal_player_id;

  const [playerIdFromDevice, setPlayerIdFromDevice] = useState(null);
  const [isDeviceReady, setIsDeviceReady] = useState(false);

  // 🔥 Déterminer si Redux est prêt
  const isReduxReady = isSuccess !== undefined && token !== undefined;

  // 🕐 Attendre Redux
  if (!isReduxReady) {
    console.log("⏳ Redux pas encore prêt, affichage Loading...");
    return <div style={{ padding: "20px" }}>Chargement de la session...</div>;
  }

  // 🚨 Redirection immédiate si pas connecté
  if (!isSuccess || !token) {
    console.warn("🚨 Utilisateur non connecté - Redirection vers /login");
    return <Navigate to="/login" state={{ from: location }} />;
  }

  // 🕐 Attendre Player ID Device
  useEffect(() => {
    const waitForPlayerId = async () => {
      let attempts = 0;
      const maxAttempts = 50;

      while (attempts < maxAttempts) {
        if (
          window.OneSignal &&
          window.OneSignal.User &&
          window.OneSignal.User.PushSubscription
        ) {
          const id = window.OneSignal.User.PushSubscription.id;
          if (id) {
            console.log("✅ [OneSignal] Player ID Device:", id);
            setPlayerIdFromDevice(id);
            break;
          }
        }
        console.log("⏳ [OneSignal] Attente Player ID Device...");
        await new Promise((resolve) => setTimeout(resolve, 200));
        attempts++;
      }

      setIsDeviceReady(true);
    };

    waitForPlayerId();
  }, []);

  if (!isDeviceReady) {
    // Ne pas afficher de popup ou de message, juste un loader minimal
    return null;
  }

  // 🚨 Vérifier Player IDs une fois tout prêt
  console.log("🔍 [CHECK] Redux ID:", playerIdFromRedux, "| Device ID:", playerIdFromDevice);
  if (
    requirePlayerId &&
    (
      !playerIdFromRedux ||                      // Redux absent
      !playerIdFromDevice ||                     // Device absent
      playerIdFromRedux !== playerIdFromDevice   // IDs différents
    )
  ) {
    console.warn("❌ Mismatch Player IDs - Redirection vers /Notif");
    if (location.pathname !== "/Notif") {
      return <Navigate to="/Notif" />;
    }
  }

  console.log("✅ Tous les checks OK - Accès autorisé");
  return children;
};

export default PrivateRoute;
