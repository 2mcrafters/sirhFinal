import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  setSelectedUserId,
  clearSelectedUserId,
  setSelectedPeriode,
  setSelectedDates,
  getPointagesOfSelectedUserAndPeriod,
} from '../../Redux/Slices/pointageSlice';
import { Icon } from '@iconify/react';

// Utilitaire pour générer la liste des années (7 dernières)
const yearsList = (yearsBack = 7) => {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: yearsBack }, (_, i) => `${currentYear - i}`);
};

// Calcul des stats
const getStats = (pointages) => ({
  present: pointages.filter(p => p.statutJour === 'present').length,
  absent: pointages.filter(p => p.statutJour === 'absent').length,
  retard: pointages.filter(p => p.statutJour === 'retard').length,
});

// Carte statistique moderne
const StatCard = ({ icon, label, value, color }) => (
  <div
    className="flex-1 min-w-[120px] bg-white rounded-2xl shadow-sm p-3 d-flex flex-column align-items-center"
    style={{ borderTop: `4px solid ${color}` }}
  >
    <div className="d-flex align-items-center gap-2 mb-1">
      <Icon icon={icon} width={20} height={20} style={{ color }} />
      <span className="fw-semibold" style={{ color }}>{label}</span>
    </div>
    <div className="fs-3 fw-bold" style={{ color }}>{value}</div>
  </div>
);

const UserPointagesPeriode = ({ userId, onClose }) => {
  const dispatch = useDispatch();
  const pointages = useSelector(getPointagesOfSelectedUserAndPeriod);
  const selectedPeriode = useSelector(state => state.pointages.selectedPeriode);
  const selectedDates = useSelector(state => state.pointages.selectedDates);

  // Sélectionne l'utilisateur à l'ouverture
  useEffect(() => {
    if (userId) dispatch(setSelectedUserId(userId));
    return () => dispatch(clearSelectedUserId());
  }, [userId, dispatch]);

  // Gestion du changement de période
  const handlePeriodeChange = e => {
    dispatch(setSelectedPeriode(e.target.value));
    dispatch(setSelectedDates({ date: null, dateDebut: null, dateFin: null, mois: null, annee: null }));
  };

  // Stats
  const stats = getStats(pointages);

  return (
    <div className="modern-pointage-popup" >
      {/* Header */}
      <div className="d-flex align-items-center justify-content-between mb-2">
      
        {onClose && (
          <button
            className="btn btn-sm btn-light border"
            onClick={onClose}
            style={{ borderRadius: 16 }}
          >
            <Icon icon="mdi:close" width={20} />
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="d-flex flex-wrap align-items-end gap-3 my-3">
        <div>
          <label className="form-label mb-1 fw-semibold">Période</label>
          <select
            className="form-select shadow-sm"
            value={selectedPeriode}
            onChange={handlePeriodeChange}
            style={{ minWidth: 110 }}
          >
            <option value="jour">Jour</option>
            <option value="semaine">Semaine</option>
            <option value="mois">Mois</option>
            <option value="annee">Année</option>
          </select>
        </div>
        {selectedPeriode === 'jour' && (
          <div>
            <label className="form-label mb-1 fw-semibold">Date</label>
            <input
              type="date"
              className="form-control shadow-sm"
              value={selectedDates.date || ''}
              onChange={e => dispatch(setSelectedDates({ date: e.target.value }))}
              style={{ minWidth: 110 }}
            />
          </div>
        )}
        {selectedPeriode === 'semaine' && (
          <>
            <div>
              <label className="form-label mb-1 fw-semibold">Début</label>
              <input
                type="date"
                className="form-control shadow-sm"
                value={selectedDates.dateDebut || ''}
                onChange={e => dispatch(setSelectedDates({ dateDebut: e.target.value }))}
                style={{ minWidth: 110 }}
              />
            </div>
            <div>
              <label className="form-label mb-1 fw-semibold">Fin</label>
              <input
                type="date"
                className="form-control shadow-sm"
                value={selectedDates.dateFin || ''}
                onChange={e => dispatch(setSelectedDates({ dateFin: e.target.value }))}
                style={{ minWidth: 110 }}
              />
            </div>
          </>
        )}
        {selectedPeriode === 'mois' && (
          <div>
            <label className="form-label mb-1 fw-semibold">Mois</label>
            <input
              type="month"
              className="form-control shadow-sm"
              value={selectedDates.mois || ''}
              onChange={e => dispatch(setSelectedDates({ mois: e.target.value }))}
              style={{ minWidth: 110 }}
            />
          </div>
        )}
        {selectedPeriode === 'annee' && (
          <div>
            <label className="form-label mb-1 fw-semibold">Année</label>
            <select
              className="form-select shadow-sm"
              value={selectedDates.annee || ''}
              onChange={e => dispatch(setSelectedDates({ annee: e.target.value }))}
              style={{ minWidth: 110 }}
            >
              <option value="">Année</option>
              {yearsList(7).map(year => (
                <option value={year} key={year}>{year}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div className="d-flex gap-3 my-3 flex-wrap">
        <StatCard icon="mdi:account-check" label="Présents" value={stats.present} color="#10B981" />
        <StatCard icon="mdi:clock-alert" label="En retard" value={stats.retard} color="#F59E0B" />
        <StatCard icon="mdi:account-off" label="Absents" value={stats.absent} color="#EF4444" />
        <StatCard icon="mdi:account-multiple-check" label="Présent+Retard" value={stats.present + stats.retard} color="#2563EB" />
      </div>

      {/* Tableau */}
      <div className="table-responsive mt-3">
        <table className="table table-sm align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th>Date</th>
              <th>Entrée</th>
              <th>Sortie</th>
              <th>Statut</th>
            </tr>
          </thead>
          <tbody>
            {pointages.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center text-secondary py-4">
                  <Icon icon="mdi:emoticon-sad-outline" width={22} /> Aucun pointage.
                </td>
              </tr>
            ) : (
              pointages.map((p) => (
                <tr key={p.id}>
                  <td>{p.date}</td>
                  <td>{p.heureEntree}</td>
                  <td>{p.heureSortie}</td>
                  <td>
                    {p.statutJour === 'present' && (
                      <span className="badge bg-success bg-opacity-25 text-success fw-semibold">Présent</span>
                    )}
                    {p.statutJour === 'absent' && (
                      <span className="badge bg-danger bg-opacity-25 text-danger fw-semibold">Absent</span>
                    )}
                    {p.statutJour === 'retard' && (
                      <span className="badge bg-warning bg-opacity-25 text-warning fw-semibold">En retard</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserPointagesPeriode;
