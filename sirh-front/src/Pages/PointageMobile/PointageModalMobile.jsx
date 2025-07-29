import React, { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import CheckboxStatutGroup from "./CheckboxStatutGroup";
import './CheckboxStatutGroup.css';
import { Icon } from "@iconify/react";
import { useSelector } from "react-redux";
import Swal from 'sweetalert2';

// Helpers pour transformer string 'HH:mm' <-> objet Date
const stringToDate = (hhmm) => {
  if (!hhmm) return null;
  const [h, m] = hhmm.split(":").map(Number);
  const date = new Date();
  date.setHours(h || 0);
  date.setMinutes(m || 0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  return date;
};
const dateToString = (date) => {
  if (!date) return "";
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

// Calcul des heures supp
function calcOvertime(heureEntree, heureSortie) {
  if (!heureEntree || !heureSortie) return 0;
  const [hEnt, mEnt] = heureEntree.split(":").map(Number);
  const [hSort, mSort] = heureSortie.split(":").map(Number);
  let minutesEntree = hEnt * 60 + mEnt;
  let minutesSortie = hSort * 60 + mSort;
  if (minutesSortie <= minutesEntree) minutesSortie += 24 * 60;
  const diff = minutesSortie - minutesEntree;
  if (diff <= 0) return 0;
  return diff > 540 ? Math.round((diff - 540) / 60 * 100) / 100 : 0;
}

const PointageModalMobile = ({
  mode = "ajout",      // 'ajout', 'modifierTous', 'modifierPerso', 'voir'
  onClose,
  onSave,
  group = null,        // Pour les modes modif/voir
  employes = [],       // Toujours la liste complète pour le mode 'ajout'
}) => {
  // Etats locaux
  const [statut, setStatut] = useState("");
  const [heureEntree, setHeureEntree] = useState("");
  const [heureSortie, setHeureSortie] = useState("");
  const [employesSelectionnes, setEmployesSelectionnes] = useState([]);
  const [datePointage, setDatePointage] = useState(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);

  const roles = useSelector((state) => state.auth.roles || []);
  const isRH = roles.includes('RH');

  // Comparaison de dates (même jour ?)
  const isSameDay = (dateA, dateB) =>
    dateA.getDate() === dateB.getDate() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getFullYear() === dateB.getFullYear();

  // Doit-on limiter l'heure de sortie ? (non-RH et aujourd'hui seulement)
  const shouldLimitTime =
    !isRH && isSameDay(datePointage, new Date());

  // Min: minuit, Max: maintenant (pour non-RH aujourd'hui)
  const minHeure = new Date();
  minHeure.setHours(0, 0, 0, 0);
  const maxHeure = new Date();
  maxHeure.setSeconds(0, 0);

  // Pré-remplissage si group (pour modifier/voir)
  useEffect(() => {
    if (group) {
      setStatut(group.statutJour || "");
      setHeureEntree(group.heureEntree || "");
      setHeureSortie(group.heureSortie || "");
      setEmployesSelectionnes(group.users?.map((u) => u.id) || []);
      setDatePointage(group.date ? new Date(group.date) : new Date());
    } else {
      setStatut("");
      setHeureEntree("");
      setHeureSortie("");
      setEmployesSelectionnes([]);
      setDatePointage(new Date());
    }
  }, [group, mode]);

  // Gestion du clic sur checkbox employé
  const toggleEmploye = (id) => {
    setEmployesSelectionnes((prev) =>
      prev.includes(id)
        ? prev.filter((eid) => eid !== id)
        : [...prev, id]
    );
  };

  // Sélectionner/désélectionner tous les employés affichés
  const handleSelectAll = (list, allSelected) => {
    if (allSelected) {
      setEmployesSelectionnes([]);
    } else {
      setEmployesSelectionnes(list.map(emp => emp.id));
    }
  };

  // Pour activer le bouton Sauvegarder
  const canSave =
    !!statut &&
    ((mode === "ajout" && employesSelectionnes.length > 0) || mode !== "ajout");

  // Pour activer le bouton Valider
  const canValider =
    !!statut &&
    (statut === "absent" || (heureEntree && heureSortie)) &&
    ((mode === "ajout" && employesSelectionnes.length > 0) || mode !== "ajout");

  // Validation du pointage
  const handleSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
  
    // Affiche le loader SweetAlert
    Swal.fire({
      title: 'Veuillez patienter...',
      text: 'Enregistrement en cours',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });
  
    try {
      await onSave({
        statut,
        heureEntree: statut === "absent" ? null : heureEntree,
        heureSortie: statut === "absent" ? null : heureSortie,
        date: datePointage,
        employes: employesSelectionnes,
        overtimeHours: statut === "absent"
          ? 0
          : calcOvertime(heureEntree, heureSortie),
      });
      Swal.close(); // Ferme le loader
    } catch (e) {
      Swal.fire('Erreur', "Une erreur s'est produite", 'error');
    } finally {
      setIsSubmitting(false);
    }
  };
  

  // Nouvelle version avec select/deselect all
  const renderEmployes = () => {
    const list =
      mode === "ajout"
        ? employes
        : (group?.users || []);

    if (!list.length) return null;

    const titre =
      mode === "ajout" ? "Employés concernés :" :
      mode === "modifierTous" ? "Employés concernés :" :
      mode === "modifierPerso" ? "Sélectionner les employés à modifier :" :
      "Employés concernés :";

    const selectable = mode !== "voir";
    const allSelected = list.length > 0 && list.every(emp => employesSelectionnes.includes(emp.id));
    const nbSelected = employesSelectionnes.length;

    return (
      <div className="mb-3">
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <label className="mb-2 fw-bold">{titre}</label>
          <span style={{
            background: "#e5e7eb",
            color: "#111",
            fontWeight: 600,
            borderRadius: 16,
            padding: "1px 12px",
            fontSize: 14,
            marginLeft: 5,
          }}>
            {nbSelected}/{list.length}
          </span>
        </div>

        {selectable && (
          <div style={{ marginBottom: 8 }}>
            <label style={{ cursor: "pointer", fontWeight: 500 }}>
              <input
                type="checkbox"
                checked={allSelected}
                onChange={() => handleSelectAll(list, allSelected)}
                style={{ marginRight: 8 }}
              />
              {allSelected ? "Tout désélectionner" : "Tout sélectionner"}
            </label>
          </div>
        )}
        <div className="badges-employes-row">
          {list.map(emp => {
            const selected = employesSelectionnes.includes(emp.id);
            return (
              <label
                key={emp.id}
                className={`badge-employe${selected ? " selected" : ""}`}
                style={{
                  pointerEvents: selectable ? "auto" : "none"
                }}
              >
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => selectable && toggleEmploye(emp.id)}
                  disabled={!selectable}
                  style={{ display: "none" }}
                />
                <span>
                  {emp.name} {emp.prenom}
                  {selected && (
                    <Icon icon="mdi:check-circle" className="check-icon-emp" />
                  )}
                </span>
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="position-modal">
      <div className="modal-flotte mx-auto my-3">
        <div
          className="bg-white rounded-4 p-4 shadow-lg border"
          style={{
            minWidth: 320,
            maxWidth: 420,
            width: "90%",
            boxShadow: "0 8px 32px rgba(80,60,150,0.14)",
            border: "1.5px solid #eaeaff",
            transform: "translateY(0)",
            transition: "box-shadow 0.3s, transform 0.3s",
            height: "max-content"
          }}
        >
          <h4 className="mb-3">
            {mode === "ajout"
              ? "Ajouter un pointage"
              : mode === "modifierTous"
              ? "Modifier tous"
              : mode === "modifierPerso"
              ? "Modifier personnalisé"
              : "Voir le pointage"}
          </h4>
          <CheckboxStatutGroup statut={statut} setStatut={setStatut} disabled={mode === "voir"} />

          {/* Date du pointage */}
          <div className="time-field-group mb-3">
            <label htmlFor="datePointage">Date du pointage</label>
            <DatePicker
              id="datePointage"
              selected={datePointage}
              onChange={setDatePointage}
              dateFormat="yyyy-MM-dd"
              className="form-control"
              disabled={mode === "voir"}
            />
          </div>

          {/* Inputs heure entrée/sortie */}
          {statut !== "absent" && (
            <div className="pair-time-fields mb-3">
              <div className="time-field-group">
                <label htmlFor="heureEntree">Heure d'entrée</label>
                <DatePicker
                  id="heureEntree"
                  selected={stringToDate(heureEntree)}
                  onChange={(date) => setHeureEntree(dateToString(date))}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={5}
                  timeCaption="Entrée"
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                  className="form-control"
                  placeholderText="Heure d'entrée"
                  disabled={mode === "voir"}
                />
              </div>
              <div className="time-field-group">
                <label htmlFor="heureSortie">Heure de sortie</label>
                <DatePicker
                  id="heureSortie"
                  selected={stringToDate(heureSortie)}
                  onChange={(date) => setHeureSortie(dateToString(date))}
                  showTimeSelect
                  showTimeSelectOnly
                  timeIntervals={5}
                  timeCaption="Sortie"
                  dateFormat="HH:mm"
                  timeFormat="HH:mm"
                  className="form-control"
                  placeholderText="Heure de sortie"
                  disabled={mode === "voir"}
                  minTime={shouldLimitTime ? minHeure : undefined}
                  maxTime={shouldLimitTime ? maxHeure : undefined}
                />
              </div>
            </div>
          )}

          {/* Liste employés */}
          {renderEmployes()}

          {/* Boutons */}
          <div className="d-flex gap-2 mt-4">
            <button className="btn btn-danger rounded-pill flex-grow-1 w-100" onClick={onClose}>
              Annuler
            </button>
            {mode !== "voir" && (
              <>
                <button
                  className="btn btn-primary rounded-pill flex-grow-1 w-100"
                  onClick={handleSave}
                  disabled={!canSave || isSubmitting}
                >
                  {isSubmitting ? "Enregistrement..." : "Sauvegarder"}
                </button>
                {["ajout", "modifierTous", "modifierPerso"].includes(mode) && canValider && (
                 <button
                 className="btn btn-success rounded-pill flex-grow-1 w-100"
                 onClick={async () => {
                   if (isSubmitting) return;
                   setIsSubmitting(true);
               
                   Swal.fire({
                     title: 'Veuillez patienter...',
                     text: 'Validation en cours',
                     allowOutsideClick: false,
                     didOpen: () => {
                       Swal.showLoading();
                     }
                   });
               
                   try {
                     await onSave(
                       {
                         statut,
                         heureEntree: statut === "absent" ? null : heureEntree,
                         heureSortie: statut === "absent" ? null : heureSortie,
                         date: datePointage,
                         employes: employesSelectionnes,
                         overtimeHours:
                           statut === "absent"
                             ? 0
                             : calcOvertime(heureEntree, heureSortie),
                       },
                       { valider: true }
                     );
                     Swal.close();
                   } catch (e) {
                     Swal.fire('Erreur', "Une erreur s'est produite", 'error');
                   } finally {
                     setIsSubmitting(false);
                   }
                 }}
                 disabled={!canValider || isSubmitting}
               >
                 {isSubmitting ? "Validation..." : "Valider"}
               </button>
               
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PointageModalMobile;
