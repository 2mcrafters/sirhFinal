import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useState, useEffect } from "react";

const PrivateRoute = ({ children, requirePlayerId = true }) => {
  const { isSuccess, token } = useSelector((state) => state.auth);
  const location = useLocation();
  const user = useSelector((state) => state.auth.user);
  const playerIdFromRedux = user?.onesignal_player_id;

  // Utiliser directement le playerIdFromDevice global
  const playerIdFromDevice = window.__oneSignalPlayerId || null;
  const [isDeviceReady, setIsDeviceReady] = useState(true);

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

  // 🚨 Vérifier Player IDs, seulement si requirePlayerId est true
  console.log("🔍 [CHECK] Redux ID:", playerIdFromRedux, "| Device ID:", playerIdFromDevice);
  if (
    requirePlayerId &&
    (
      !playerIdFromRedux ||
      !playerIdFromDevice ||
      playerIdFromRedux !== playerIdFromDevice
    )
  ) {
    console.warn("❌ Mismatch Player IDs - Redirection vers /Notif");
    if (location.pathname !== "/Notif") {
      return <Navigate to="/Notif" replace />;
    }
  }

  console.log("✅ Tous les checks OK - Accès autorisé");
  return children;
};

export default PrivateRoute;
