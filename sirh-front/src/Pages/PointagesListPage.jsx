import React, { useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPointages, deletePointages, updatePointage, createPointage, validerPointage, invaliderPointage } from '../Redux/Slices/pointageSlice';
import { fetchUsers } from '../Redux/Slices/userSlice';
import { fetchAbsenceRequests } from '../Redux/Slices/absenceRequestSlice';
import { fetchSocietes } from '../Redux/Slices/societeSlice'; // Ajout de l'import pour fetchSocietes
import { fetchDepartments } from '../Redux/Slices/departementSlice';
import { Icon } from '@iconify/react/dist/iconify.js';
import Swal from 'sweetalert2';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import fr from "date-fns/locale/fr";
registerLocale("fr", fr);
const PointageRow = ({
  user,
  pointage,
  isTemp,
  idxTemp,
  isSelected,
  onSelect,
  onFieldChange,
  onSave,
  onRemoveTemp,
  onAddTemp,
  canValidate,
  onValidate,
  canInvalidate,
  onInvalidate,
  now,
  isToday,
  extractHourMinute,
  calcOvertime,
  Icon,
  disabledStatut = false,
  IsRH
  
}) => (
  <tr
    style={{
      backgroundColor: isTemp ? "#F4F7FF" : "#FFFFFF",
      borderRadius: "8px",
      marginBottom: "8px",
      transition: "background-color 0.3s ease",
    }}
    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = isTemp ? "#F4F7FF" : "#FFFFFF"}
  >
    {/* Checkbox sélection */}
    <td style={{ padding: "12px" }}>
      <input
        type="checkbox"
        className="form-check-input shadow-sm border border-primary"
        checked={isSelected}
        onChange={e => onSelect(e.target.checked)}
      />
    </td>
    {/* Nom employé */}
    <td style={{ padding: "12px", fontWeight: "500", color: "#374151" }}>
      {user.name} {user.prenom}
    </td>
    {/* Statut */}
    <td style={{ padding: "12px" }}>
      <select
        className="form-select"
        value={pointage.statutJour || ''}
        onChange={e => onFieldChange('statutJour', e.target.value)}
  disabled={disabledStatut || pointage.isAbsent || pointage.valider === 1}
        style={{
          backgroundColor: "#FFFFFF",
          border: "1px solid #E5E7EB",
          borderRadius: "8px",
          padding: "8px 12px",
          fontSize: "14px",
          width: "100%",
          minWidth: "100px",
        }}
      >
        <option value="">Sélectionner...</option>
        <option value="present">Présent</option>
        <option value="absent">Absent</option>
        <option value="retard">Retard</option>
      </select>
    </td>
    {/* Heure d'entrée */}
    <td style={{ padding: "12px" }}>
      <DatePicker
  disabled={disabledStatut || pointage.isAbsent || pointage.valider === 1}

        selected={
          extractHourMinute(pointage.heureEntree)
            ? new Date(`1970-01-01T${extractHourMinute(pointage.heureEntree)}:00`)
            : null
        }
        onChange={date => {
          if (date) {
            const hh = String(date.getHours()).padStart(2, '0');
            const mm = String(date.getMinutes()).padStart(2, '0');
            onFieldChange('heureEntree', `${hh}:${mm}:00`);
          } else {
            onFieldChange('heureEntree', '');
          }
        }}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={5}
        timeCaption="Heure"
        dateFormat="HH:mm"
        timeFormat="HH:mm"
        placeholderText="HH:mm"

        className="form-control"
        onKeyDown={e => e.preventDefault()}
        popperPlacement="bottom"

      />
    </td>
    {/* Heure de sortie */}
    <td style={{ padding: "12px", minWidth: 170 }}>
      <DatePicker
  disabled={disabledStatut || pointage.isAbsent || pointage.valider === 1}

        selected={
          extractHourMinute(pointage.heureSortie)
            ? new Date(`1970-01-01T${extractHourMinute(pointage.heureSortie)}:00`)
            : null
        }
        onChange={date => {
          if (!date) {
            onFieldChange('heureSortie', '');
            return;
          }
          let hh = date.getHours();
          let mm = date.getMinutes();
          const val = `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}:00`;
          onFieldChange('heureSortie', val);
        }}
        showTimeSelect
        showTimeSelectOnly
        timeIntervals={5}
        minTime={  !IsRH ?(new Date(0,0,0,0,0)) : undefined}
        maxTime={  !IsRH ?(isToday ? now : new Date(0,0,0,23,59)) : undefined}
        dateFormat="HH:mm"
        timeFormat="HH:mm"
        timeCaption="Heure"
        className="form-control"
        placeholderText="HH:mm"
        onKeyDown={e => e.preventDefault()}
        popperPlacement="bottom"
      />
    </td>
    {/* Heures supp */}
    <td style={{ padding: "12px" }}>
      <input
        type="number"
        className="form-control"
        value={
          pointage.heureEntree && pointage.heureSortie
            ? calcOvertime(pointage.heureEntree, pointage.heureSortie)
            : 0
        }
        disabled
      />
    </td>
    {/* Actions */}
    <td className={`d-flex align-items-center gap-2 flex-wrap`} style={{ padding: "12px" }}>
      <button
      className={` ${pointage.valider === 1 ? 'd-none' : ''}`}
        style={{
          backgroundColor: "#BFDBFE",
          color: "#1D4ED8",
          padding: "6px 12px",
          borderRadius: "8px",
          fontWeight: "500"
        }}
        onClick={onSave}
disabled={pointage.isAbsent || !pointage.statutJour || pointage.valider === 1}
        title="Enregistrer"
      >
        <Icon icon="mdi:content-save" />
      </button>
      
      {/* Boutons valider/invalider si applicables */}
      {Boolean(canValidate) && (
        <button
          style={{
            backgroundColor: "#D1FAE5",
            color: "#059669",
            padding: "6px 12px",
            borderRadius: "8px",
            fontWeight: "500"
          }}
          onClick={onValidate}
          title="Valider"
           disabled={
      // Statut présent/retard mais une heure manquante
      (["present", "retard"].includes(pointage.statutJour) &&
        (!pointage.heureEntree || !pointage.heureSortie))
      // Si le pointage est déjà validé ou pas de statut, tu peux aussi désactiver
      || pointage.valider === 1
      || !pointage.statutJour
    }
        >
          <Icon icon="ph:check-circle-duotone" />
        </button>
      )}
      {canInvalidate && (
        <button
          style={{
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            padding: "6px 12px",
            borderRadius: "8px",
            fontWeight: "500"
          }}
          onClick={onInvalidate}
          title="Invalider"
        >
          <Icon icon="ph:x-circle-duotone" />
        </button>
      )}
    </td>
  </tr>
);

const PointagesListPage = () => {
  const dispatch = useDispatch();
  const { items: pointages, status: loading, error } = useSelector((state) => state.pointages);
  const { items: users } = useSelector((state) => state.users);
  const { items: societes } = useSelector((state) => state.societes); // Récupération des sociétés
  const { items: absenceRequests } = useSelector((state) => state.absenceRequests);
  const { items: departments } = useSelector((state) => state.departments);
  const { user: currentUser } = useSelector((state) => state.auth); // Récupérer l'utilisateur actuel
  const canValidateAll = currentUser && ['RH', 'Chef_Dep', 'Chef_Projet'].includes(currentUser.role);
  const canInvalidateAllForRH = currentUser && currentUser.role === 'RH'; // Ajout pour le bouton Invalider Tout
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [selectedKeys, setSelectedKeys] = useState([]);

  const [filters, setFilters] = useState({
    date: '',
    user: '',
    status: '',
    societe: '',
    onlyPresentOrRetard: '',
  });

  const [editablePointages, setEditablePointages] = useState({});
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [usersForPointage, setUsersForPointage] = useState([]);
  const [usersWithAbsence, setUsersWithAbsence] = useState([]);
  const [multiHeureEntree, setMultiHeureEntree] = useState(null);
  const [multiHeureSortie, setMultiHeureSortie] = useState(null);
  const roles = useSelector((state) => state.auth.roles || []);
  const isRH = roles.includes('RH'); 
  const now = new Date();
  const isToday = selectedDate === now.toISOString().split('T')[0];
const today = new Date();

  useEffect(() => {
    dispatch(fetchPointages());
    dispatch(fetchUsers());
    dispatch(fetchAbsenceRequests());
    dispatch(fetchSocietes()); // Appel pour récupérer les sociétés
    dispatch(fetchDepartments());
  }, [dispatch]);

// Sélectionner/Désélectionner tout
const handleSelect = (key, checked) => {
  setSelectedKeys(prev =>
    checked ? [...prev, key] : prev.filter(k => k !== key)
  );
};

const handleSelectAll = checked => {
  if (checked) {
    // Ici tu prends SEULEMENT les clés actuellement affichées (après filtres/recherche/date)
    setSelectedKeys(filteredEditableKeys);
  } else {
    setSelectedKeys([]);
  }
};


// Sélectionner/Désélectionner un utilisateur
const handleSelectUser = (userId, checked) => {
  setSelectedUsers((prev) => 
    checked ? [...prev, userId] : prev.filter((id) => id !== userId)
  );
};

// Vérifie si tous les users visibles sont sélectionnés
const isAllSelected = Object.entries(editablePointages)
  .filter(([_, p]) => p.date === selectedDate)
  .every(([key]) => selectedKeys.includes(key));

  useEffect(() => {
  const searchValue = (searchTerm || '').toLowerCase();
  const filteredUsers = users.filter(user => {
  if (!user || typeof user !== 'object') return false;
  const statut = (user.statut || '').trim().toLowerCase();
  if (statut === 'inactif') return false;
  const absenceType = editablePointages[user.id]?.statutJour;
  if (['Congé', 'maladie', 'autre'].includes(absenceType)) return false;

  const matchRecherche =
    !searchTerm ||
    ((user.name || '').toLowerCase().includes(searchValue)) ||
    ((user.prenom || '').toLowerCase().includes(searchValue)) ||
    ((user.cin || '').toLowerCase().includes(searchValue));
  const matchDept = !selectedDepartment || user.departement_id === parseInt(selectedDepartment);

  // Nouveau filtre seulement présents/retard
  let matchStatutMulti = true;
  if (filters.onlyPresentOrRetard === 'present') {
    matchStatutMulti = editablePointages[user.id]?.statutJour === 'present';
  } else if (filters.onlyPresentOrRetard === 'retard') {
    matchStatutMulti = editablePointages[user.id]?.statutJour === 'retard';
  } else if (filters.onlyPresentOrRetard === 'present_retard') {
    matchStatutMulti = ['present', 'retard'].includes(editablePointages[user.id]?.statutJour);
  }

  // Filtre aussi par statut simple si coché
  if (!filters.status) {
    return matchRecherche && matchDept && matchStatutMulti;
  }
  const pointageUser = editablePointages[user.id];
  if (!pointageUser) return false;
  return (
    matchRecherche &&
    matchDept &&
    pointageUser.statutJour === filters.status &&
    matchStatutMulti
  );
});


  setUsersForPointage(filteredUsers);
}, [users, searchTerm, selectedDepartment, filters.status, editablePointages]);

  const handleInvaliderTout = async () => {
  const pointagesAInvalider = selectedKeys.map(key => editablePointages[key]).filter(p => p && p.id && p.valider === 1);

  if (pointagesAInvalider.length === 0) {
    Swal.fire('Information', 'Aucun pointage sélectionné à invalider.', 'info');
    return;
  }

  try {
    const result = await Swal.fire({
      title: 'Confirmation',
      text: `Voulez-vous invalider ${pointagesAInvalider.length} pointage(s) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, invalider',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    Swal.fire({
      title: 'Invalidation en cours...',
      text: `Invalidation de ${pointagesAInvalider.length} pointage(s).`,
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    const promises = pointagesAInvalider.map(p => dispatch(invaliderPointage(p.id)).unwrap());
    await Promise.all(promises);

    Swal.fire('Succès!', `${pointagesAInvalider.length} pointage(s) invalidé(s) avec succès.`, 'success');
    dispatch(fetchPointages());
    setSelectedKeys([])
  } catch (error) {
    console.error("Erreur lors de l'invalidation groupée:", error);
    Swal.fire('Erreur!', 'L\'invalidation des pointages a échoué.', 'error');
  }
};



  // Helper function to get the leave type and status
  const getLeaveInfo = useCallback((userId) => {
    const selectedDateObj = new Date(selectedDate);
    
    const userAbsence = absenceRequests.find(request => {
      const startDate = new Date(request.dateDebut);
      const endDate = new Date(request.dateFin);
      return request.user_id === userId && 
             request.statut === 'approuvé' &&
             selectedDateObj >= startDate && 
             selectedDateObj <= endDate;
    });

    if (userAbsence) {
      return {
        type: userAbsence.type,
        motif: userAbsence.motif || 'N/A',
        endDate: userAbsence.dateFin
      };
    }
    return null;
  }, [absenceRequests, selectedDate]);

  useEffect(() => {
  const newEditablePointages = {};

  // 1. Ajoute tous les pointages existants pour la date sélectionnée
  pointages.forEach(pointage => {
    if (pointage.date && !isNaN(new Date(pointage.date))) {
  if (new Date(pointage.date).toISOString().split('T')[0] === selectedDate) {
    newEditablePointages[pointage.id] = { ...pointage, isTemp: false };
  }
}

  });

  // 2. Pour chaque user actif, si aucun pointage trouvé pour la date, ajoute une ligne "vierge"
  users.forEach(user => {
    // Inactifs OUT
    if ((user.statut || '').trim().toLowerCase() === 'inactif') return;

    // Si déjà un ou plusieurs pointages ce jour-là -> on saute cette étape pour ce user
    const hasPointage = pointages.some(
      (p) => p.user_id === user.id && new Date(p.date).toISOString().split('T')[0] === selectedDate
    );
    if (!hasPointage) {
      newEditablePointages[`new-${user.id}`] = {
        id: null,
        user_id: user.id,
        date: selectedDate,
        heureEntree: '',
        heureSortie: '',
        statutJour: '',
        overtimeHours: 0,
        valider: 0,
        isTemp: true,
      };
    }
  });

  // 3. Ajoute une ligne d'absence validée si besoin
  const currentUsersWithAbsence = [];
  users.forEach(user => {
    const userAbsenceInfo = getLeaveInfo(user.id);
    if (
      userAbsenceInfo &&
      ['Congé', 'maladie', 'Autre absence'].includes(userAbsenceInfo.type)
    ) {
      // S'il existe déjà un pointage pour ce user/date qui correspond à une absence, inutile d'ajouter
      const hasAbsencePointage = Object.values(newEditablePointages).some(
        (p) => p.user_id === user.id && p.date === selectedDate && p.statutJour === userAbsenceInfo.type
      );
      if (!hasAbsencePointage) {
        const absenceKey = `absence-${user.id}-${selectedDate}`;
        newEditablePointages[absenceKey] = {
          id: null,
          user_id: user.id,
          date: selectedDate,
          heureEntree: null,
          heureSortie: null,
          statutJour: userAbsenceInfo.type,
          overtimeHours: 0,
          valider: 0,
          isAbsent: true,
          absenceEndDate: userAbsenceInfo.endDate
        };
      }
      currentUsersWithAbsence.push({
        ...user,
        absenceType: userAbsenceInfo.type,
        absenceMotif: userAbsenceInfo.motif,
        absenceEndDate: userAbsenceInfo.endDate
      });
    }
  });

  setEditablePointages(newEditablePointages);
  setUsersWithAbsence(currentUsersWithAbsence);
}, [users, pointages, selectedDate, absenceRequests, filters, societes, getLeaveInfo]);

  // Filter pointages based on filters
  const filteredPointages = pointages.filter(pointage => {
    const pointageDate = new Date(pointage.date);
    const filterDate = filters.date ? new Date(filters.date) : null;
    
    return (
      (!filters.date || pointageDate.toDateString() === filterDate.toDateString()) &&
      (!filters.user || pointage.user_id === parseInt(filters.user)) &&
      (!filters.status || pointage.statutJour === filters.status) &&
      (!filters.societe || pointage.societe_id === parseInt(filters.societe)) // Ajout du filtre société
    );
  });

  // Pagination calculations
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPointages.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPointages.length / itemsPerPage);



  const commonHeureSortie =
  selectedKeys.length > 0
    ? editablePointages[selectedKeys[0]]?.heureSortie
    : '';
const isAllSameHeureSortie = selectedKeys.every(
  (userId) => editablePointages[userId]?.heureSortie === commonHeureSortie
);
// À placer avant le JSX
const commonHeureEntree =
  selectedKeys.length > 0
    ? editablePointages[selectedKeys[0]]?.heureEntree
    : '';
const isAllSameHeureEntree = selectedKeys.every(
  (userId) => editablePointages[userId]?.heureEntree === commonHeureEntree
);

const extractHourMinute = (timeString) => {
  // timeString attendu au format "HH:mm:SS"
  if (!timeString) return "";
  const [hh, mm] = timeString.split(":");
  if (hh && mm) return `${hh}:${mm}`;
  return "";
};

// Utile pour trouver une valeur commune

// Pour initialiser l’affichage (quand on change la sélection)
useEffect(() => {
  // Prend la valeur commune si tous ont la même, sinon vide
  const getCommonValue = (key) => {
    if (selectedKeys.length === 0) return "";
    const firstValue = editablePointages[selectedKeys[0]]?.[key] || "";
    const allSame = selectedKeys.every(
      userId => editablePointages[userId]?.[key] === firstValue
    );
    return allSame ? firstValue : "";
  };

  const heureEntree = getCommonValue("heureEntree");
  const heureSortie = getCommonValue("heureSortie");
  setMultiHeureEntree(
    extractHourMinute(heureEntree)
      ? new Date(`1970-01-01T${extractHourMinute(heureEntree)}:00`)
      : null
  );
  setMultiHeureSortie(
    extractHourMinute(heureSortie)
      ? new Date(`1970-01-01T${extractHourMinute(heureSortie)}:00`)
      : null
  );
}, [selectedKeys, editablePointages]); 




  const timeToMinutes = (time) => {
    if (!time) return null;
    const [hours, minutes] = time.split(':');
    return parseInt(hours, 10) * 60 + parseInt(minutes, 10);
  };
  function calcOvertime(heureEntree, heureSortie) {
    if (!heureEntree || !heureSortie) return 0;
    // Format attendu : "HH:mm:00"
    const [hEnt, mEnt] = heureEntree.split(':').map(Number);
    const [hSort, mSort] = heureSortie.split(':').map(Number);
    const minutesEntree = hEnt * 60 + mEnt;
    const minutesSortie = hSort * 60 + mSort;
    const diff = minutesSortie - minutesEntree;
    if (diff <= 0) return 0;
    // 9 heures = 540 min
    return diff > 540 ? Math.round((diff - 540) / 60 * 100) / 100 : 0;
  }
  
function calcOvertime(heureEntree, heureSortie) {
  if (!heureEntree || !heureSortie) return 0;
  const [hEnt, mEnt] = heureEntree.split(':').map(Number);
  const [hSort, mSort] = heureSortie.split(':').map(Number);

  let minutesEntree = hEnt * 60 + mEnt;
  let minutesSortie = hSort * 60 + mSort;

  // Si la sortie est inférieure à l'entrée, on considère que c'est le lendemain
  if (minutesSortie <= minutesEntree) {
    minutesSortie += 24 * 60;
  }

  const diff = minutesSortie - minutesEntree;
  if (diff <= 0) return 0;
  // 9 heures = 540 min
  return diff > 540 ? Math.round((diff - 540) / 60 * 100) / 100 : 0;
}



  
const handleFieldChange = (key, field, value) => {
  setEditablePointages(prev => {
    const prevPointage = prev[key] || {};
    let newPointage = { ...prevPointage, [field]: value };

    // Recalcul des heures supp
    if (field === "statutJour" || field === "heureEntree" || field === "heureSortie") {
      if (newPointage.statutJour !== "absent" && newPointage.heureEntree && newPointage.heureSortie) {
        newPointage.overtimeHours = calcOvertime(newPointage.heureEntree, newPointage.heureSortie);
      } else {
        newPointage.overtimeHours = 0;
      }
    }

    return { ...prev, [key]: newPointage };
  });
};
  

const handleSavePointage = async (key) => {
  const pointage = editablePointages[key];

  // Vérifie statut
  if (!pointage.statutJour) {
    Swal.fire({
      icon: 'error',
      title: "Statut non sélectionné",
      text: "Veuillez sélectionner un statut (présent/absent/retard) avant de sauvegarder.",
    });
    return; // Stop la fonction
  }

  try {
    const pointageData = {
      user_id: pointage.user_id,
      date: selectedDate,
      heureEntree: pointage.statutJour === 'absent' ? null : pointage.heureEntree,
      heureSortie: pointage.statutJour === 'absent' ? null : pointage.heureSortie,
      statutJour: pointage.statutJour,
      overtimeHours: pointage.statutJour === 'absent' ? 0 : (pointage.overtimeHours || 0)
    };

    if (pointage.id) {
      // Modification d’un pointage existant
      await dispatch(updatePointage({ id: pointage.id, ...pointageData })).unwrap();
    } else {
      // Création d’un nouveau pointage
      await dispatch(createPointage(pointageData)).unwrap();
    }

    // Retire la ligne temporaire si c’était une création
    if (!pointage.id && key.startsWith("temp-")) {
      setEditablePointages(prev => {
        const copy = { ...prev };
        delete copy[key];
        return copy;
      });
    }

    await dispatch(fetchPointages()).unwrap();

    Swal.fire(
      'Succès!',
      'Le pointage a été enregistré avec succès.',
      'success'
    );
  } catch (error) {
    console.error('Error saving pointage:', error);
    Swal.fire(
      'Erreur!',
      'Une erreur est survenue lors de l\'enregistrement du pointage.',
      'error'
    );
  }
};
const handleRemoveTempPointage = (key) => {
  setEditablePointages(prev => {
    const copy = { ...prev };
    delete copy[key];
    return copy;
  });
};


const handleAddMultiplePointages = () => {
  const now = Date.now();
  setEditablePointages(prev => {
    const updated = { ...prev };
    selectedKeys.forEach(key => {
      const userId = editablePointages[key]?.user_id;
      if (!userId) return;
      const tempKey = `temp-${userId}-${now}-${Math.random()}`;
      updated[tempKey] = {
        user_id: userId,
        date: selectedDate,
        heureEntree: '',
        heureSortie: '',
        statutJour: '',
        overtimeHours: 0,
        isTemp: true
      };
    });
    setSelectedKeys([]);
    return updated;
  });
};

// VALIDER uniquement les pointages sélectionnés
const handleValiderTout = async () => {
  const pointagesAValider = selectedKeys
    .map(key => ({ key, pointage: editablePointages[key] }))
    .filter(({ pointage }) => pointage && Number(pointage.valider) !== 1);

  if (pointagesAValider.length === 0) {
    Swal.fire('Information', 'Aucun pointage sélectionné à valider.', 'info');
    return;
  }

  let nbValidés = 0;
  let erreurs = [];

  for (const { key, pointage } of pointagesAValider) {
    if (!pointage.statutJour ||
      (["present", "retard"].includes(pointage.statutJour) &&
        (!pointage.heureEntree || !pointage.heureSortie))) {
      erreurs.push(key);
      continue;
    }

    try {
      let finalId = pointage.id;
      if (!finalId) {
        const created = await dispatch(createPointage(pointage)).unwrap();
        finalId = created.id;
        setEditablePointages(prev => ({
          ...prev,
          [key]: { ...prev[key], id: finalId }
        }));
      } else {
        await dispatch(updatePointage({ ...pointage, id: finalId })).unwrap();
      }
      await dispatch(validerPointage(finalId)).unwrap();
      setEditablePointages(prev => ({
        ...prev,
        [key]: { ...prev[key], valider: 1 }
      }));
      nbValidés++;
    } catch (error) {
      erreurs.push(key);
    }
  }

  await dispatch(fetchPointages());
  setSelectedKeys([]); // 👈 Vider la sélection APRÈS le traitement

  if (nbValidés > 0) {
    Swal.fire('Succès', `${nbValidés} pointage(s) validé(s).`, 'success');
  }
  if (erreurs.length > 0) {
    Swal.fire('Erreur', `${erreurs.length} pointage(s) non valides ou incomplets.`, 'warning');
  }
};




const handleSaveAll = async () => {
  const updates = selectedKeys
    .map(key => editablePointages[key])
    .filter(pointage => pointage && pointage.statutJour);

  if (updates.length === 0) {
    Swal.fire({ icon: 'info', title: 'Aucune sélection', text: 'Sélectionnez des pointages à sauvegarder.' });
    return;
  }

  try {
    await Promise.all(updates.map(async pointage => {
      if (pointage.id) {
        await dispatch(updatePointage({ ...pointage, id: pointage.id })).unwrap();
        setSelectedKeys([])
      } else {
        await dispatch(createPointage(pointage)).unwrap();
        setSelectedKeys([]); 
      }
    }));
    await dispatch(fetchPointages());
    Swal.fire({ icon: 'success', title: 'Sauvegardé', timer: 1200, showConfirmButton: false });
  } catch (err) {
    Swal.fire({ icon: 'error', title: 'Erreur', text: 'Erreur lors de la sauvegarde.' });
  }
};

// Ajoute ce bloc juste avant ton return ou avant la map du tbody
const filteredEditableKeys = Object.entries(editablePointages)
  .filter(([_, p]) => {
    // 1. Pas les absences spéciales
    if (p.statutJour && ['Congé', 'maladie', 'autre'].includes(p.statutJour)) return false;
    // 2. Filtre par date
    if (p.date !== selectedDate) return false;

    // 3. Filtre par département
    if (selectedDepartment && users.length) {
      const user = users.find(u => String(u.id) === String(p.user_id));
      if (!user || String(user.departement_id) !== String(selectedDepartment)) return false;
    }

    // 4. Filtre recherche (nom, prénom, CIN)
    if (searchTerm) {
      const user = users.find(u => String(u.id) === String(p.user_id));
      const term = searchTerm.toLowerCase();
      if (
        !user ||
        (
          !(user.name || '').toLowerCase().includes(term) &&
          !(user.prenom || '').toLowerCase().includes(term) &&
          !(user.cin || '').toLowerCase().includes(term)
        )
      ) return false;
    }

    // 5. Filtre statut simple ou "présent/retard"
    if (filters.onlyPresentOrRetard) {
      if (filters.onlyPresentOrRetard === 'present' && p.statutJour !== 'present') return false;
      if (filters.onlyPresentOrRetard === 'retard' && p.statutJour !== 'retard') return false;
      if (filters.onlyPresentOrRetard === 'present_retard' && !['present', 'retard'].includes(p.statutJour)) return false;
    }

    return true;
  })
  .map(([key]) => key);

// Ajoute une ligne temporaire pour ce user

const handleValiderPointage = async (pointageId, key) => {
  const pointage = editablePointages[key];
  if (!pointage) return;

  if (!pointage.statutJour) {
    Swal.fire("Erreur!", "Veuillez sélectionner un statut.", "error");
    return;
  }

  if (
    ["present", "retard"].includes(pointage.statutJour) &&
    (!pointage.heureEntree || !pointage.heureSortie)
  ) {
    Swal.fire("Erreur!", "Veuillez remplir l’heure d’entrée et de sortie.", "error");
    return;
  }

  try {
    let finalId = pointageId;

    const pointageData = {
      user_id: pointage.user_id,
      date: pointage.date,
      heureEntree: pointage.heureEntree,
      heureSortie: pointage.heureSortie,
      statutJour: pointage.statutJour,
      overtimeHours: pointage.overtimeHours || 0,
    };

    if (!pointageId) {
      // ➕ Création
      const created = await dispatch(createPointage(pointageData)).unwrap();
      finalId = created.id;
      setEditablePointages(prev => ({
        ...prev,
        [key]: { ...prev[key], id: finalId },
      }));
    } else {
      // ✅ Mise à jour AVANT validation
      await dispatch(updatePointage({ ...pointageData, id: pointageId })).unwrap();
    }

    // ✅ Validation
    await dispatch(validerPointage(finalId)).unwrap();
    setSelectedKeys([])
    // ✅ État local
    setEditablePointages(prev => ({
      ...prev,
      [key]: { ...prev[key], valider: 1 }
    }));

    await dispatch(fetchPointages());

    Swal.fire("Succès!", "Pointage mis à jour et validé.", "success");
  } catch (err) {
    console.error("Erreur lors de la validation :", err);
    Swal.fire("Erreur!", err.message || "Échec lors de la validation.", "error");
  }
};




  const handleInvaliderPointage = async (pointageId) => {
    if (!pointageId) {
      Swal.fire('Erreur!', 'ID de pointage manquant pour l\'invalidation.', 'error');
      return;
    }
    try {
      await dispatch(invaliderPointage(pointageId)).unwrap();
      dispatch(fetchPointages());
      Swal.fire('Invalidé!', 'Le pointage a été invalidé.', 'success');
    } catch (err) {
      Swal.fire('Erreur!', err.message || 'L\'invalidation du pointage a échoué.', 'error');
    }
  };

 

  if (loading === 'loading') {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-12">
            <div className="alert alert-danger" role="alert">
              <div className="d-flex align-items-center">
                <Icon icon="mdi:alert-circle" className="me-2" />
                <div>
                  <h5 className="alert-heading">Erreur de chargement</h5>
                  <p className="mb-0">Une erreur est survenue lors du chargement des pointages.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="">
      <div className="card-header d-flex flex-wrap justify-content-between align-items-center gap-2">
  <h5 className="card-title mb-0 flex-grow-1">Pointages</h5>

  <div className="d-flex flex-wrap gap-2 align-items-center" style={{ flex: "1 1 100%", justifyContent: "space-between" }}>
    <div className="row gy-2 align-items-center mb-2">
  {/* Date */}
  <div className="col-12 col-md-auto ">
    <label className='form-label d-block'> Date</label>

    <DatePicker
      selected={selectedDate ? new Date(selectedDate) : today}
      onChange={date =>
        isRH
          ? setSelectedDate(date ? date.toISOString().split("T")[0] : "")
          : null
      }
      dateFormat="dd/MM/yyyy"
      locale="fr"
      className="form-control w-auto"
      maxDate={!isRH ? today : null}
      minDate={!isRH ? today : null}
      placeholderText="jj/mm/aaaa"
      disabled={!isRH}
    />
  </div>

  {/* Recherche */}
  <div className="col-12 col-md">
    <label className='form-label'> Recherche</label>

    <div className="position-relative w-100">
      <Icon 
        icon="mdi:magnify"
        className="position-absolute start-0 top-50 translate-middle-y ms-2 text-secondary"
        style={{ fontSize: "18px" }}
      />
      <input
        type="text"
        className="form-control ps-5 py-2"
        placeholder="Rechercher par Nom, Prénom ou CIN..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
    </div>
  </div>

  {/* Statut */}
  <div className="col-12 col-md-auto">
    <label className='form-label'> Statut</label>
    <select
      className="form-select"
      value={filters.onlyPresentOrRetard}
      onChange={e => setFilters(prev => ({ ...prev, onlyPresentOrRetard: e.target.value }))}
      style={{
        borderRadius: "8px",
        padding: "8px 12px",
        backgroundColor: "#F1F3F5",
        color: "#374151",
        border: "1px solid #E2E8F0",
        minWidth: 150
      }}
    >
      <option value="">Tous</option>
      <option value="present">Présents seulement</option>
      <option value="retard">Retards seulement</option>
      <option value="present_retard">Présents et Retards</option>
    </select>
  </div>

  {/* Département */}
  {isRH && (

    <div className="col-12 col-md-auto">
    <label className='form-label'> Département</label>

    <select
      className="form-select"
      value={selectedDepartment}
      onChange={(e) => setSelectedDepartment(e.target.value)}
      style={{
        borderRadius: "8px",
        padding: "8px 12px",
        backgroundColor: "#F1F3F5",
        color: "#374151",
        border: "1px solid #E2E8F0",
      }}
    >
      <option value="">Tous</option>
      {departments.map((dept) => (
        <option key={dept.id} value={dept.id}>
          {dept.nom}
        </option>
      ))}
    </select>
  </div>
  )}
  

  {/* BOUTONS: affichés sur UNE SEULE LIGNE */}
        <label className='form-label'> Actions</label>

  <div className="col-12 col-md-auto d-flex align-items-center gap-2 mt-2 mt-md-0">

        <button 
        className="d-flex align-items-center gap-2"
        style={{
          backgroundColor: "#BFDBFE",
          color: "#1D4ED8",
          borderRadius: "8px",
          padding: "8px",
          fontWeight: 500,
          transition: "all 0.3s ease",
        }} 
        onClick={handleSaveAll}
      >
        <Icon icon="mdi:content-save-all" className="fs-5" />
        <span className=" d-md-inline">Sauvegarder</span>
      </button>

      {canValidateAll && (
 <button 
 className="d-flex align-items-center gap-2"
 style={{
   backgroundColor: "#D1FAE5",
   color: "#059669",
   borderRadius: "8px",
   padding: "8px",
   fontWeight: 500,
   transition: "all 0.3s ease",
 }}
 onClick={handleValiderTout}
 disabled={
   selectedKeys.length === 0 ||
   !selectedKeys.some(key => {
     const p = editablePointages[key];
     if (!p || p.valider === 1 || !p.statutJour) return false;

     if (["present", "retard"].includes(p.statutJour)) {
       return p.heureEntree && p.heureSortie;
     }

     return true; // pour 'absent'
   })
 }
>
 <Icon icon="mdi:check-all" className="fs-5" />
 <span className="d-md-inline">Valider</span>
</button>

)}


      {canInvalidateAllForRH && (
        <button 
          className="d-flex align-items-center gap-2"
          style={{
            backgroundColor: "#FEE2E2",
            color: "#DC2626",
            borderRadius: "8px",
            padding: "8px",
            fontWeight: 500,
            transition: "all 0.3s ease",
          }}
          onClick={handleInvaliderTout}
        >
          <Icon icon="mdi:close-octagon-outline" className="fs-5" />
          <span className=" d-md-inline">Invalider</span>
        </button>
      )}
      <button 
       className="d-flex align-items-center gap-2"
          style={{
            backgroundColor: "rgb(249 223 255)",
            color: "rgb(181 38 220)",
            borderRadius: "8px",
            padding: "8px",
            fontWeight: 500,
            transition: "all 0.3s ease",
          }}
  onClick={handleAddMultiplePointages} 
  disabled={selectedKeys.length === 0}
>
    <Icon icon="mdi:plus"  className="fs-5" />
  Nouveau pointage
</button>



  </div>
</div>


    {/* Bouton Sauvegarder */}
   
  </div>
</div>
{selectedKeys.length > 0 && (

<div className="row align-items-center mb-2 mt-2 gy-2 gx-3">
  <div className="col-12 col-md-3 mb-2 mb-md-0">
    <h6 className=" mb-0">Pointage Multiple</h6>
  </div>
  <div className="col-12 col-md-9">
    <div className="row gy-2 gx-2 align-items-center">
      {/* Statut */}
      <div className="col-12 col-sm-4">
        <label className="form-label mb-1 fw-medium">Statut</label>
           <select
  className="form-select"
  onChange={(e) => {
    const value = e.target.value;
    setEditablePointages((prev) => {
      const updated = { ...prev };
      selectedKeys.forEach((key) => {
        // On ignore les pointages validés !
        if (prev[key]?.valider === 1) return;
        let pointage = { ...updated[key], statutJour: value };
        pointage.overtimeHours =
          (value === "absent")
            ? 0
            : calcOvertime(pointage.heureEntree, pointage.heureSortie);
        updated[key] = pointage;
      });
      return updated;
    });
  }}
  defaultValue=""
>
  <option value="">Appliquer statut à la sélection</option>
  <option value="present">Présent</option>
  <option value="absent">Absent</option>
  <option value="retard">Retard</option>
</select>



      </div>

     {/* Heure d'entrée */}
{/* Heure d'entrée */}
<div className="col-12 col-sm-4">
  <label className="form-label mb-1 fw-medium d-block">Heure d'Entrée</label>
  <DatePicker
  selected={multiHeureEntree}
  onChange={date => {
    setMultiHeureEntree(date);
    if (!date) return;
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const value = `${hh}:${mm}:00`;
    setEditablePointages((prev) => {
      let updated = { ...prev };
      selectedKeys.forEach((userId) => {
        if (prev[userId]?.valider === 1) return; // On ignore les validés
        let pointage = { ...updated[userId], heureEntree: value };
        pointage.overtimeHours = 
          (pointage.statutJour === "absent")
            ? 0
            : calcOvertime(pointage.heureEntree, pointage.heureSortie);
        updated[userId] = pointage;
      });
      return updated;
    });
  }}
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={5}
  timeCaption="Heure"
  dateFormat="HH:mm"
  timeFormat="HH:mm"
  placeholderText="HH:mm"
  className="form-control"
  onKeyDown={e => e.preventDefault()}
/>


</div>

{/* Heure de sortie */}
<div className="col-12 col-sm-4">
  <label className="form-label mb-1 fw-medium d-block">Heure de Sortie</label>
 <DatePicker
  selected={multiHeureSortie}
  onChange={date => {
    setMultiHeureSortie(date);
    if (!date) return;
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    const value = `${hh}:${mm}:00`;
    setEditablePointages((prev) => {
      let updated = { ...prev };
      selectedKeys.forEach((userId) => {
        if (prev[userId]?.valider === 1) return;
        let pointage = { ...updated[userId], heureSortie: value };
        pointage.overtimeHours =
          (pointage.statutJour === "absent")
            ? 0
            : calcOvertime(pointage.heureEntree, pointage.heureSortie);
        updated[userId] = pointage;
      });
      return updated;
    });
  }}
  showTimeSelect
  showTimeSelectOnly
  timeIntervals={5}
  timeCaption="Heure"
  dateFormat="HH:mm"
  timeFormat="HH:mm"
  placeholderText="HH:mm"
  className="form-control"
  onKeyDown={e => e.preventDefault()}
  minTime={  !isRH ?(new Date(0,0,0,0,0)) : undefined}
  maxTime={  !isRH ?(isToday ? now : new Date(0,0,0,23,59)) : undefined}
/>





</div>


    </div>
  </div>
</div>
)}



      <div className="card-body">
      <div className="table-container" style={{ overflowX: "auto" }}>
  <table 
    className="table table-hover"
    style={{
      width: "100%",
      borderCollapse: "separate",
      borderSpacing: "0 8px",
      backgroundColor: "#F9FAFB",
    }}
  >
    <thead>
      <tr style={{ backgroundColor: "#E5E7EB", color: "#374151", fontWeight: "600", textAlign: "left" }}>
      <th className='d-flex' style={{ padding: "12px" }}>
  <input
    type="checkbox"className="form-check-input shadow-sm me-1 border border-primary"
    checked={isAllSelected}
    onChange={(e) => handleSelectAll(e.target.checked)}
  />
  <label>S.L</label>
</th>

        <th style={{ padding: "12px" }}>Employé</th>
        <th style={{ padding: "12px" }}>Statut</th>
        <th style={{ padding: "12px" }}>Entrée</th>
        <th style={{ padding: "12px" }}>Sortie</th>
        <th style={{ padding: "12px" }}>Supplémentaires</th>
        <th style={{ padding: "12px" }}>Actions</th>
      </tr>
    </thead>
   <tbody>
  {filteredEditableKeys.map(key => {
    const pointage = editablePointages[key];
    const user = users.find(u => String(u.id) === String(pointage.user_id));
    if (!user) {
      return (
        <tr key={key} style={{ color: 'red' }}>
          <td colSpan={7}>Utilisateur non trouvé pour le pointage (user_id : {pointage.user_id})</td>
        </tr>
      );
    }
    return (
      <PointageRow
        key={key}
        user={user}
        pointage={pointage}
        isTemp={pointage.isTemp}
        idxTemp={key}
        isSelected={selectedKeys.includes(key)}
        onSelect={checked => {
          if (checked) setSelectedKeys(prev => [...prev, key]);
          else setSelectedKeys(prev => prev.filter(k => k !== key));
        }}
        onFieldChange={(field, value) => handleFieldChange(key, field, value)}
        onSave={() => handleSavePointage(key)}
        onRemoveTemp={() => handleRemoveTempPointage(key)}
        canValidate={
          Number(pointage.valider) !== 1 && (
            pointage.statutJour === "absent" ||
            (
              ["present", "retard"].includes(pointage.statutJour) &&
              pointage.heureEntree &&
              pointage.heureSortie
            )
          )
        }
        
        
        onValidate={() => handleValiderPointage(pointage.id, key)}
        canInvalidate={!!(pointage.id && pointage.valider && currentUser?.role === 'RH')}
        onInvalidate={() => handleInvaliderPointage(pointage.id)}
        now={now}
        isToday={isToday}
        extractHourMinute={extractHourMinute}
        calcOvertime={calcOvertime}
        Icon={Icon}
        IsRH={isRH}
      />
    );
  })}
</tbody>






  </table>
</div>


        {/* Table for users with validated absence */}
        {usersWithAbsence.length > 0 && (
  <div className="mt-4">
    <h5 className="mb-3" style={{ fontWeight: 600, color: "#1A202C" }}>
      Employés avec absence validée le {new Date(selectedDate).toLocaleDateString()}
    </h5>
    <div className="table-responsive" style={{ borderRadius: "12px", overflow: "hidden", boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.1)" }}>
      <table 
        className="table table-hover"
        style={{
          width: "100%",
          backgroundColor: "#F9FAFB",
          borderCollapse: "separate",
          borderSpacing: "0 8px"
        }}
      >
        <thead style={{ backgroundColor: "#E5E7EB", color: "#374151", fontWeight: "600" }}>
          <tr>
            <th style={{ padding: "12px", textAlign: "left" }}>Employé</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Type d'absence</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Motif</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Département</th>
            <th style={{ padding: "12px", textAlign: "left" }}>Société</th>
          </tr>
        </thead>
        <tbody>
          {usersWithAbsence.map(absentUser => {
            const department = departments.find(d => d.id === absentUser.departement_id);
            const societe = societes.find(s => s.id === absentUser.societe_id);
            return (
              <tr 
                key={absentUser.id}
                style={{
                  backgroundColor: "#FFFFFF",
                  boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)",
                  borderRadius: "8px",
                  marginBottom: "8px",
                  transition: "background-color 0.3s ease"
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "#F3F4F6"}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "#FFFFFF"}
              >
                <td style={{ padding: "12px", fontWeight: "500", color: "#1A202C" }}>
                  {absentUser.name} {absentUser.prenom}
                </td>
                <td style={{ padding: "12px" }}>
                  <span 
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      fontWeight: "500",
                      color: absentUser.absenceType === 'Congé' ? "#15803D" : 
                             absentUser.absenceType === 'maladie' ? "#B45309" : 
                             absentUser.absenceType === 'Autre absence' ? "#0EA5E9" : "#6B7280",
                      backgroundColor: absentUser.absenceType === 'Congé' ? "#DCFCE7" : 
                                      absentUser.absenceType === 'maladie' ? "#FEF3C7" : 
                                      absentUser.absenceType === 'Autre absence' ? "#E0F2FE" : "#F3F4F6"
                    }}
                  >
                    {absentUser.absenceType}
                  </span>
                </td>
                <td style={{ padding: "12px", color: "#374151", fontSize: "14px" }}>
                  {absentUser.absenceMotif || 'N/A'}
                </td>
                <td style={{ padding: "12px", color: "#374151", fontSize: "14px" }}>
                  {department ? department.nom : 'N/A'}
                </td>
                <td style={{ padding: "12px", color: "#374151", fontSize: "14px" }}>
                  {societe ? societe.nom : 'N/A'}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </div>
)}

      </div>
    </div>
  );
};



export default PointagesListPage;