import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import PointageCardMobile from "./PointageCardMobile";
import PointageModalMobile from "./PointageModalMobile";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Icon } from "@iconify/react";

import {
  fetchPointages,
  createPointage,
  updatePointage,
  validerPointage,
  invaliderPointage,
} from "../../Redux/Slices/pointageSlice";

// Fonction de groupement
function groupPointages(pointages, users) {
  const groups = {};
  pointages.forEach((p) => {
    const key = [
      p.statutJour || "",
      p.heureEntree || "",
      p.heureSortie || "",
      p.valider // Ajout du statut de validation dans la clé
    ].join("|");

    if (!groups[key]) {
      groups[key] = {
        statutJour: p.statutJour,
        heureEntree: p.heureEntree,
        heureSortie: p.heureSortie,
        valider: p.valider, // Ajoute valider ici pour affichage
        pointages: [],
        userIds: [],
      };
    }
    groups[key].pointages.push(p);
    groups[key].userIds.push(p.user_id);
  });

  return Object.values(groups).map((g) => ({
    ...g,
    users: g.userIds.map((uid) => users.find((u) => u.id === uid)).filter(Boolean),
    ids: g.pointages.map((p) => p.id),
  }));
}

const PointagesMobile = () => {
  const dispatch = useDispatch();
  const { items: pointages } = useSelector((state) => state.pointages);
  const { items: users } = useSelector((state) => state.users);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0]);
  const [selectedGroups, setSelectedGroups] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("ajout");
  const [editingGroup, setEditingGroup] = useState(null);
  const employes = useSelector(state => 
    state.users.items.filter(u => u.statut !== "inactif")
  );
  const roles = useSelector((state) => state.auth.roles || []); // ou ton propre hook/prop
  const isRH = roles.includes("RH");

  
  // Assure que si pas RH, la date est toujours aujourd'hui (évite de changer manuellement)
  useEffect(() => {
    if (!isRH) {
      setSelectedDate(new Date().toISOString().split("T")[0]);
    }
  }, [isRH]);
  useEffect(() => {
    dispatch(fetchPointages());
  }, [dispatch, selectedDate]);
  const handleSavePointage = async (values, options = {}) => {
    try {
      if (modalMode === "ajout") {
        for (const user_id of values.employes) {
          // 1. Créer le pointage
          const res = await dispatch(
            createPointage({
              user_id,
              date: selectedDate,
              statutJour: values.statut,
              heureEntree: values.statut === "absent" ? null : values.heureEntree,
              heureSortie: values.statut === "absent" ? null : values.heureSortie,
              overtimeHours: values.overtimeHours,
            })
          ).unwrap();
  
          // 2. Si "Valider" a été cliqué, on valide juste après création
          if (options.valider && res?.id) {
            await dispatch(validerPointage(res.id));
          }
        }
      }else if (modalMode === "modifierTous") {
        // Modifier tous les pointages du groupe
        for (const id of editingGroup.ids) {
          await dispatch(
            updatePointage({
              id,
              statutJour: values.statut,
              heureEntree: values.statut === "absent" ? null : values.heureEntree,
              heureSortie: values.statut === "absent" ? null : values.heureSortie,
              overtimeHours: values.overtimeHours,
            })
          ).unwrap();
  
          // Si bouton "Valider"
          if (options.valider) {
            await dispatch(validerPointage(id));
          }
        }
      } else if (modalMode === "modifierPerso") {
        // Modifier seulement les employés sélectionnés dans le groupe
        const idsToUpdate = editingGroup.users
          .map((user, idx) => values.employes.includes(user.id) ? editingGroup.ids[idx] : null)
          .filter(Boolean);
  
        for (const id of idsToUpdate) {
          await dispatch(
            updatePointage({
              id,
              statutJour: values.statut,
              heureEntree: values.statut === "absent" ? null : values.heureEntree,
              heureSortie: values.statut === "absent" ? null : values.heureSortie,
              overtimeHours: values.overtimeHours,
            })
          ).unwrap();
  
          if (options.valider) {
            await dispatch(validerPointage(id));
          }
        }
      }
      setShowModal(false);
      dispatch(fetchPointages());
    } catch (e) {
      alert("Erreur lors de la sauvegarde.");
    }
  };

  //0. Retourne la liste des employés qui n'ont pas encore de pointage pour la date sélectionnée
const getEmployesNonPointes = () => {
  // Prendre tous les pointages du jour
  const pointagesDuJour = pointages.filter((p) => p.date === selectedDate);
  // Liste des user_id déjà pointés
  const dejaPointes = pointagesDuJour.map((p) => p.user_id);
  // Filtrer pour ne garder que les employés actifs qui ne sont pas déjà pointés
  return users.filter(u => 
    u.statut !== "inactif" && !dejaPointes.includes(u.id)
  );
};

  
  // 1. Filtre les pointages du jour
  const pointagesDuJour = pointages.filter((p) => p.date === selectedDate);

  // 2. Groupe les pointages
  const grouped = groupPointages(pointagesDuJour, users);

  // Sélection des groupes (par leur key d’index dans grouped)
  const toggleSelectGroup = (idx) => {
    setSelectedGroups((prev) =>
      prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]
    );
  };

  // Ouverture modale
  // const openModal = (mode, group = null) => {
  //   setModalMode(mode);
  //   setEditingGroup(group);
  //   setShowModal(true);
  // };
  const [employesAjout, setEmployesAjout] = useState([]);

  const openModal = (mode, group = null) => {
    setModalMode(mode);
    setEditingGroup(group);
  
    // Si mode "ajout", calcule la bonne liste d'employés restants
    if (mode === "ajout") {
      setEmployesAjout(getEmployesNonPointes());
    }
  
    setShowModal(true);
  };
  

  // Valider/invalider TOUS les pointages du groupe sélectionné
  const handleValider = async () => {
    for (const idx of selectedGroups) {
      for (const id of grouped[idx].ids) {
        await dispatch(validerPointage(id));
      }
    }
    setSelectedGroups([]);
    dispatch(fetchPointages());
  };
  const handleInvalider = async () => {
    for (const idx of selectedGroups) {
      for (const id of grouped[idx].ids) {
        await dispatch(invaliderPointage(id));
      }
    }
    setSelectedGroups([]);
    dispatch(fetchPointages());
  };

  return (
    <div style={{ padding: 12, maxWidth: 430, margin: "0 auto" }}>
      {/* Actions bar */}
      <div>
    {/* DatePicker full width */}
    <div className="mb-3 w-100">
      <label htmlFor="datepicker" className="d-block">Date du pointage</label>
      <DatePicker
        id="datepicker"
        className="form-control w-100 d-block"
        selected={isRH ? new Date(selectedDate) : new Date()}
        onChange={date => {
          if (isRH) setSelectedDate(date.toISOString().split("T")[0]);
        }}
        dateFormat="yyyy-MM-dd"
        placeholderText="Choisir une date"
        style={{ width: "100%" }}
        disabled={!isRH}
      />
    </div>

    {/* Boutons en ligne, gap automatique, padding arrondi Bootstrap */}
    <div className="d-flex gap-2 mb-2">
      <button
        className="btn btn-primary btn-sm rounded-pill d-flex align-items-center gap-2 flex-1"
        onClick={() => openModal("ajout")}
      >
        <Icon icon="mdi:plus" style={{ fontSize: 18 }} />
        Ajouter
      </button>

      <button
        className="btn btn-success btn-sm rounded-pill d-flex align-items-center gap-2 flex-1"
        onClick={handleValider}
        disabled={selectedGroups.length === 0}
      >
        <Icon icon="mdi:check-circle" style={{ fontSize: 18 }} />
        Valider
      </button>

      {isRH && (
        <button
          className="btn btn-danger btn-sm rounded-pill d-flex align-items-center gap-2 flex-1"
          onClick={handleInvalider}
          disabled={selectedGroups.length === 0}
        >
          <Icon icon="mdi:close-circle" style={{ fontSize: 18 }} />
          Invalider
        </button>
      )}
    </div>
  </div>

      {/* Affichage groupé en cartes */}
      <div className="flex flex-col gap-3">
        {grouped.map((group, idx) => (
          <PointageCardMobile
            key={idx}
            group={group}
            selected={selectedGroups.includes(idx)}
            onSelect={() => toggleSelectGroup(idx)}
            onVoir={() => openModal("voir", group)}
            onModifierTous={() => openModal("modifierTous", group)}
            onModifierPerso={() => openModal("modifierPerso", group)}
          />
        ))}
      </div>

      {/* Modale ajout/modif */}
      {showModal && (
  <PointageModalMobile
    mode={modalMode}
    onClose={() => setShowModal(false)}
    onSave={handleSavePointage}
    group={editingGroup}
    employes={modalMode === "ajout" ? employesAjout : employes}
  />
)}

    </div>
  );
};

export default PointagesMobile;
