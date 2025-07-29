import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";

// Menu data avec roles sur chaque option
const menuData = [
  {
    icon: "solar:home-smile-angle-outline",
    to: "/",
    label: "Dashboard",
    roles: ["RH", "Chef_Dep", "Chef_Projet", "Employe"], // tous
    direct: true
  },
  {
    icon: "mdi:account-group-outline",
    label: "Employés",
    options: [
      { icon: "mdi:format-list-bulleted", to: "/users", label: "Liste", roles: ["RH", "Chef_Dep", "Chef_Projet"] },
      { icon: "mdi:format-list-bulleted", to: "/users/temp", label: "Temporaire", roles: ["RH"] },
      { icon: "mdi:account-plus-outline", to: "/users/add", label: "Ajouter", roles: ["RH"] },
    ]
  },
  {
    icon: "mdi:clock-outline",
    to: "/pointages",
    label: "Pointages",
    roles: ["RH", "Chef_Dep", "Chef_Projet","Employe"],
    direct: true
  },
  {
    icon: "mdi:calendar-account-outline",
    label: "Demandes",
    options: [
      { icon: "mdi:clipboard-list-outline", to: "/absences", label: "Liste Demandes", roles: ["RH", "Chef_Dep", "Chef_Projet", "Employe"] },
      { icon: "mdi:calendar-outline", to: "/absences/calendar", label: "Calendrier Des Demandes", roles: ["RH", "Chef_Dep", "Chef_Projet"] },
      { icon: "mdi:calendar-plus-outline", to: "/absences/add", label: "Ajouter Une Demande", roles: ["RH", "Chef_Dep", "Chef_Projet", "Employe"] },
    ]
  },
  {
    icon: "mdi:format-list-bulleted-type",
    label: "Documents",
    options: [
      { icon: "mdi:format-list-bulleted-type", to: "/type-docs", label: "Type de document", roles: ["RH"] },
      { icon: "mdi:format-list-bulleted-type", to: "/documents", label: "Liste Documents", roles: ["RH", "Chef_Dep", "Chef_Projet", "Employe"] }
    ]
  },
  {
    icon: "mdi:chart-box-outline",
    label: "statistiques",
    options: [
      { icon: "mdi:chart-box-outline", to: "/statistiques", label: "Statistiques", roles: ["RH", "Chef_Dep", "Chef_Projet", "Employe"] },
      { icon: "mdi:chart-box-outline", to: "/pointagedetails", label: "Pointage Details", roles: ["RH", "Chef_Dep", "Chef_Projet", "Employe"] },
      { icon: "mdi:file-excel",
        to: "/export",
        label: "Export Excel",
        roles: ["RH"], },
        
    ]
  },
  {
    icon: "mdi:newspaper-variant-multiple-outline",
    label: "Communications",
    options: [
      // Pour RH : liste + nouvelle publication
      {
        icon: "mdi:newspaper",
        to: "/publications",
        label: "Liste des publications",
        roles: ["RH"]
      },
      {
        icon: "mdi:plus-box-outline",
        to: "/publications/nouveau",
        label: "Nouvelle publication",
        roles: ["RH"]
      },
      // Pour non-RH : publications + sondages
      {
        icon: "mdi:newspaper",
        to: "/publications",
        label: "Publications",
        roles: ["Chef_Dep", "Chef_Projet", "Employe"]
      },
      {
        icon: "mdi:poll",
        to: "/sondages",
        label: "Sondages",
        roles: ["Chef_Dep", "Chef_Projet", "Employe"]
      }
    ]
  },
];

const BottomMenu = () => {
  const [openIdx, setOpenIdx] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const roles = useSelector((state) => state.auth.roles || []);

  useEffect(() => {
    setOpenIdx(null);
  }, [location.pathname]);

  // 1. Filtrer le menuData selon les rôles de l'utilisateur
  const filteredMenuData = menuData
    .map(item => {
      // Si pas d'options, on check le role du parent
      if (!item.options) {
        if (!item.roles || item.roles.some(role => roles.includes(role))) return item;
        return null;
      }
      // Sinon on filtre chaque option selon les rôles
      const filteredOptions = item.options.filter(opt =>
        !opt.roles || opt.roles.some(role => roles.includes(role))
      );
      if (filteredOptions.length > 0) {
        return { ...item, options: filteredOptions };
      }
      return null;
    })
    .filter(Boolean);

  const handleIconClick = (idx, item) => {
    if (item.direct && item.to) {
      navigate(item.to);
      setOpenIdx(null);
    } else {
      setOpenIdx(openIdx === idx ? null : idx);
    }
  };

  const handleOptionClick = (to) => {
    navigate(to);
    setOpenIdx(null);
  };

  const isActive = (path) => location.pathname === path;

  // hauteur du menu bas
  const FOOTER_HEIGHT = 60;

  return (
    <>
      <nav
        className="navbar rounded-top-5  fixed-bottom bg-white border-top shadow-sm d-flex justify-content-between align-items-center px-2 py-2 d-md-none"
        style={{
          zIndex: 1050,
          height: FOOTER_HEIGHT,
          transition: "all 0.3s ease"
        }}
      >
        {filteredMenuData.map((item, idx) => (
          <div key={idx} className="d-inline-block">
            <button
              type="button"
              className={`btn btn-circle btn-light p-2 me-1 border-0 shadow-none ${isActive(item.to) || openIdx === idx ? "bg-primary-subtle" : ""}`}
              style={{
                transition: "all 0.2s",
                outline: "none",
                transform: isActive(item.to) || openIdx === idx ? "scale(1.1)" : "scale(1)"
              }}
              onClick={() => handleIconClick(idx, item)}
            >
              <Icon
                icon={item.icon}
                className={`fs-3 ${isActive(item.to) || openIdx === idx ? "text-primary" : "text-secondary"}`}
              />
            </button>
          </div>
        ))}
      </nav>

      {openIdx !== null && filteredMenuData[openIdx]?.options && (
        <>
          {/* Overlay, mais on laisse passer les clics sur le popover */}
          <div
            className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-25"
            style={{ zIndex: 1040, backdropFilter: "blur(3px)" }}
            onClick={() => setOpenIdx(null)}
          />

          {/* Popover menu (juste au-dessus du menu bas) */}
          <div
            className="position-fixed start-50 translate-middle-x d-md-none"
            style={{
              bottom: FOOTER_HEIGHT + 14, // 14px de marge au-dessus du menu
              zIndex: 1051,
              minWidth: 220,
              maxWidth: 340,
              animation: "fadeSlideDown 0.2s cubic-bezier(0.16, 1, 0.3, 1)"
            }}
            onClick={e => e.stopPropagation()} // Empêche la fermeture si on clique dans le popover
          >
            <div className="bg-white rounded-3 border shadow p-2">
              {filteredMenuData[openIdx].options.map((opt, oIdx) => (
                <button
                  key={oIdx}
                  onClick={() => handleOptionClick(opt.to)}
                  className={`btn d-flex align-items-center w-100 mb-1 gap-2 py-2 px-3 text-start ${isActive(opt.to) ? "bg-primary-subtle text-primary" : "text-secondary"} rounded-2`}
                  style={{
                    fontWeight: 500,
                    transition: "all 0.2s"
                  }}
                >
                  <Icon
                    icon={opt.icon}
                    className={`fs-5 me-2 ${isActive(opt.to) ? "text-primary" : ""}`}
                  />
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default BottomMenu;
