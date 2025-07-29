import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPresenceStats } from '../../Redux/Slices/presenceStatsSlice';
import PresenceStatsCard from './PresenceStatsCard';
import PresenceChart from './PresenceChart';
import PresenceBarChart from './PresenceBarChart';
import { Icon } from '@iconify/react';
import PresenceEvaluationChart from './PresenceEvaluationChart';
import PresenceCircleChart from './PresenceCircleChart'
import ContractTypeCircleChart from './ContractTypeCircleChart'
// Calcul heures même si sortie après minuit
function calcHours(heureEntree, heureSortie) {
  if (!heureEntree || !heureSortie) return 0;
  const [hE, mE] = heureEntree.split(':').map(Number);
  const [hS, mS] = heureSortie.split(':').map(Number);
  let minutesEntree = hE * 60 + mE;
  let minutesSortie = hS * 60 + mS;
  if (minutesSortie < minutesEntree) minutesSortie += 24 * 60;
  const diff = minutesSortie - minutesEntree;
  return diff > 0 ? +(diff / 60).toFixed(2) : 0;
}


const PresenceDashboard = ({ isDashboard = false }) => {
  const dispatch = useDispatch();

  // Filtres globaux
  const [periode, setPeriode] = useState('jour');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [dateDebut, setDateDebut] = useState(new Date().toISOString().split('T')[0]);
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);
  const [mois, setMois] = useState(new Date().toISOString().slice(0, 7));
  const [typeContrat, setTypeContrat] = useState('');

  // Pour détails
  const [showDetail, setShowDetail] = useState(false);
  const [detailType, setDetailType] = useState("");
  // Filtres dans le bloc détail
  const [filtreContrat, setFiltreContrat] = useState('');
  const [filtreDepartement, setFiltreDepartement] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Redux
  const { data: stats, loading } = useSelector((state) => state.presence);
  const pointages = useSelector((state) => state.pointages.items || []);
  const users = useSelector((state) => state.users.items || []);
  const departments = useSelector((state) => state.departments.items || []);
  const roles = useSelector((state) => state.auth.roles || []);
  const isRH = roles.includes('RH');
  const isEMP = roles.includes('Employe');

  // Charge les stats à chaque changement de période/filtres
  useEffect(() => {
    if (!['jour', 'semaine', 'mois'].includes(periode)) {
      setPeriode('jour');
      return;
    }
    let params = {};
    switch (periode) {
      case 'jour': params = { periode, date }; break;
      case 'semaine': params = { periode, dateDebut, dateFin }; break;
      case 'mois': params = { periode, mois }; break;
      default: params = { periode: 'jour', date };
    }
    if (typeContrat) params.typeContrat = typeContrat;
    dispatch(fetchPresenceStats(params));
    setShowDetail(false);
    setDetailType("");
  }, [periode, date, dateDebut, dateFin, mois, typeContrat, dispatch]);
  

  // --- Bloc détail : collecte et filtre ---
  // Récupère tous les pointages de la période
  let filteredPointages = [];
  if (periode === 'jour') {
    filteredPointages = pointages.filter(p => p.date === date);
  } else if (periode === 'semaine') {
    filteredPointages = pointages.filter(p => p.date >= dateDebut && p.date <= dateFin);
  } else if (periode === 'mois') {
    filteredPointages = pointages.filter(p => p.date && p.date.startsWith(mois));
  }

  // Bloc stats users pour semaine/mois
  let usersStats = {};
  if (periode === 'semaine' || periode === 'mois') {
    filteredPointages.forEach(p => {
      const user = users.find(u => u.id === p.user_id || u._id === p.user_id);
      if (!user) return;
      const key = user.id || user._id;
      if (!usersStats[key]) {
        usersStats[key] = {
          user,
          present: 0,
          absent: 0,
          retard: 0,
          heures: 0
        };
      }
      if ((p.statutJour || p.statut) === detailType) {
        if (p.statutJour === 'present') usersStats[key].present += 1;
        if (p.statutJour === 'absent') usersStats[key].absent += 1;
        if (p.statutJour === 'retard') usersStats[key].retard += 1;
        if (p.heureEntree && p.heureSortie && p.statutJour !== 'absent') {
          usersStats[key].heures += calcHours(p.heureEntree, p.heureSortie);
        }
      }
    });
  }

  // Table detail : filtrée selon le bloc détail
  let tableRows = [];
  if (showDetail) {
    if (periode === 'jour') {
      tableRows = filteredPointages
        .filter(p => (p.statutJour || p.statut) === detailType)
        .map(p => {
          const user = users.find(u => u.id === p.user_id || u._id === p.user_id);
          const dept = departments.find(d => d.id === user?.departement_id);
          return { ...p, user, dept };
        }).filter(row => {
          if (!row.user) return false;
          if (filtreContrat && row.user.typeContrat !== filtreContrat) return false;
          if (filtreDepartement && row.user.departement_id !== +filtreDepartement) return false;
          if (searchTerm && !(row.user.name + " " + row.user.prenom).toLowerCase().includes(searchTerm.toLowerCase())) return false;
          return true;
        });
    } else {
      tableRows = Object.values(usersStats)
        .map(stat => {
          const dept = departments.find(d => d.id === stat.user?.departement_id);
          return { ...stat, dept };
        }).filter(row => {
          if (!row.user) return false;
          if (filtreContrat && row.user.typeContrat !== filtreContrat) return false;
          if (filtreDepartement && row.user.departement_id !== +filtreDepartement) return false;
          if (searchTerm && !(row.user.name + " " + row.user.prenom).toLowerCase().includes(searchTerm.toLowerCase())) return false;
          return true;
        });
    }
  }

  // Options filtres dynamiques
  const contratOptions = [...new Set(tableRows.map(r => r.user?.typeContrat).filter(Boolean))];
  const departementOptions = departments;

  // Charts
  const chartData = stats ? [
    { name: 'Présents', value: stats.present || 0 },
    { name: 'Absents', value: stats.absent || 0 },
    { name: 'En Retard', value: stats.en_retard || 0 },
  ] : [];

  // -- Gère le bouton détail sur chaque card --
  const handleShowDetail = (type) => {
    setDetailType(type);
    setShowDetail(true);
    setFiltreContrat('');
    setFiltreDepartement('');
    setSearchTerm('');
  };

  return (
    <div className=" h-100 p-0 radius-12">
      <div className="card-header border-bottom bg-base py-16 px-24">
        <h6 className="text-lg fw-semibold mb-0">Taux de présence</h6>
      </div>
      <div className="card-body p-24">
        {/* Filtres principaux */}
        <div className="row mb-3 align-items-center justify-content-center g-3">
  <div className="col-12 col-md-auto">
    <select
      className="form-select form-select-sm border-primary"
      value={typeContrat}
      onChange={e => setTypeContrat(e.target.value)}
    >
      <option value="">Tous les contrats</option>
      <option value="Permanent">Permanent</option>
      <option value="Temporaire">Temporaire</option>
    </select>
  </div>
  <div className="col-12 col-md-auto">
    <select
      className="form-select form-select-sm border-primary"
      value={periode}
      onChange={e => setPeriode(e.target.value)}
    >
      <option value="jour">Par Jour</option>
      <option value="semaine">Entre 2 Jours</option>
      <option value="mois">Par Mois</option>
    </select>
  </div>
  {periode === 'jour' && (
    <div className="col-12 col-md-auto">
      <input
        type="date"
        className="form-select form-select-sm border-primary"
        value={date}
        onChange={e => setDate(e.target.value)}
      />
    </div>
  )}
  {periode === 'semaine' && (
    <>
      <div className="col-12 col-md-auto">
        <input
          type="date"
          className="form-select form-select-sm border-primary"
          value={dateDebut}
          onChange={e => setDateDebut(e.target.value)}
        />
      </div>
      <div className="col-12 col-md-auto">
        <input
          type="date"
          className="form-select form-select-sm border-primary"
          value={dateFin}
          onChange={e => setDateFin(e.target.value)}
        />
      </div>
    </>
  )}
  {periode === 'mois' && (
    <div className="col-12 col-md-auto">
      <input
        type="month"
        className="form-select form-select-sm border-primary"
        value={mois}
        onChange={e => setMois(e.target.value)}
      />
    </div>
  )}
</div>



        {/* Statistiques cards */}
        {loading ? (
          <p className="text-center text-gray-500">Chargement...</p>
        ) : stats ? (
          <>
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3">
  <div className="col">
    <PresenceStatsCard
      label="Total Présent"
      value={(stats.present || 0) + (stats.en_retard || 0)}
      icon="mdi:account-check"
      bgColor="bg-gradient-start-1"
      iconColor="#10B981"
      showDetailsBtn
      onDetailsClick={() => handleShowDetail("present")}
      selectorClass="car-1"
    />
  </div>
  <div className="col">
    <PresenceStatsCard
      label="Total Absent"
      value={stats.absent}
      icon="mdi:account-off"
      bgColor="bg-gradient-start-2"
      iconColor="#EF4444"
      showDetailsBtn
      onDetailsClick={() => handleShowDetail("absent")}
      selectorClass="car-2"

    />
  </div>
  <div className="col">
    <PresenceStatsCard
      label="Total En Retard"
      value={stats.en_retard}
      icon="mdi:clock-alert"
      bgColor="bg-gradient-start-5"
      iconColor="#F59E0B"
      showDetailsBtn
      onDetailsClick={() => handleShowDetail("retard")}
      selectorClass="car-3"
    />
  </div>
</div>


            {/* Bloc détail sous les cards */}
            {showDetail && (
              <div className="card my-4 shadow-sm border-0" style={{ borderRadius: 16 }}>
                <div className="card-header d-flex flex-wrap align-items-center gap-2 py-3 bg-primary-light" style={{ borderRadius: "16px 16px 0 0", background: "#EFF6FF" }}>
                  <div className="d-flex align-items-center gap-2">
                    <span className="d-inline-flex align-items-center justify-content-center rounded-circle p-2 bg-white" style={{
                      color: "#0284C7", width: 38, height: 38
                    }}>
                      <Icon icon="mdi:account-group" className="fs-4" />
                    </span>
                    <h5 className="mb-0 fw-bold" style={{ color: "#0284C7" }}>
                      Détail {detailType === "present" ? "Présents" : detailType === "absent" ? "Absents" : "Retardataires"}
                      <span className="ms-3 badge bg-primary text-white">{tableRows.length} employés</span>
                      {periode === 'jour' && <> du {date}</>}
                      {periode === 'semaine' && <> du {dateDebut} au {dateFin}</>}
                      {periode === 'mois' && <> ({mois})</>}
                    </h5>
                  </div>
                  <button className="ms-auto btn btn-link text-secondary p-0" onClick={() => setShowDetail(false)}>
                    <Icon icon="mdi:close" className="fs-4" />
                  </button>
                </div>
                {/* Filtres RH + recherche */}
                {isRH && (
                  <div className="d-flex flex-wrap justify-content-center gap-3 align-items-end px-4 py-3" style={{ background: "#F3F8FE", borderBottom: "1px solid #EEF2FB" }}>
                    <div className='text-center'>
                      <label className="text-primary fw-semibold mb-1" htmlFor="contratSelect">Type contrat</label>
                      <select id="contratSelect" className="form-select form-select-sm shadow-sm border-primary" style={{ minWidth: 140 }} value={filtreContrat} onChange={e => setFiltreContrat(e.target.value)}>
                        <option value="">Tous</option>
                        {contratOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                      </select>
                    </div>
                    <div className='text-center'>
                      <label className="text-primary fw-semibold mb-1" htmlFor="departementSelect">Département</label>
                      <select id="departementSelect" className="form-select form-select-sm shadow-sm border-primary" style={{ minWidth: 140 }} value={filtreDepartement} onChange={e => setFiltreDepartement(e.target.value)}>
                        <option value="">Tous</option>
                        {departementOptions.map(opt => <option key={opt.id} value={opt.id}>{opt.nom}</option>)}
                      </select>
                    </div>
                    <div className='text-center'>
                      <label className="text-primary fw-semibold mb-1" htmlFor="searchName">Recherche</label>
                      <input id="searchName" className="form-control form-control-sm shadow-sm" type="text" placeholder="Nom ou prénom" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ minWidth: 180 }} />
                    </div>
                  </div>
                )}
                {/* Table employés */}
                <div className="card-body py-3 px-2">
                  <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0" style={{ borderRadius: 12, overflow: 'hidden' }}>
                      <thead className="bg-light">
                        <tr>
                          <th>Nom</th>
                          <th>Prénom</th>
                          <th>Département</th>
                          <th>Type contrat</th>
                          {periode === 'jour' ? (
                            <>
                              <th>Entrée</th>
                              <th>Sortie</th>
                              <th>Heures supp.</th>
                            </>
                          ) : (
                            <>
                              <th>Jours Présents</th>
                              <th>Jours Absents</th>
                              <th>En Retard</th>
                              <th>Heures totales</th>
                            </>
                          )}
                        </tr>
                      </thead>
                      <tbody>
                        {tableRows.length === 0 ? (
                          <tr>
                            <td colSpan={periode === 'jour' ? 7 : 9} className="text-center text-muted py-4">Aucun résultat</td>
                          </tr>
                        ) : (
                          tableRows.map((row, i) => (
                            <tr key={i}>
                              <td>{row.user?.name || ''}</td>
                              <td>{row.user?.prenom || ''}</td>
                              <td>{row.dept ? row.dept.nom : <span className="text-muted">-</span>}</td>
                              <td>{row.user?.typeContrat || <span className="text-muted">-</span>}</td>
                              {periode === 'jour' ? (
                                <>
                                  <td>{row.heureEntree || '-'}</td>
                                  <td>{row.heureSortie || '-'}</td>
                                  <td>
  {(row.heureEntree && row.heureSortie && row.statutJour !== 'absent') ? (
    (() => {
      const heures = calcHours(row.heureEntree, row.heureSortie);
      const supp = heures > 9 ? (heures - 9).toFixed(2) : 0;
      return (
        <span className="badge bg-info text-dark">
          {supp > 0 ? supp : 0}
        </span>
      );
    })()
  ) : <span className="text-muted">-</span>}
</td>

                                </>
                              ) : (
                                <>
                                  <td>{row.present}</td>
                                  <td>{row.absent}</td>
                                  <td>{row.retard}</td>
                                  <td>
                                    <span className="badge bg-info text-dark">{row.heures.toFixed(2)}</span>
                                  </td>
                                </>
                              )}
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Graphiques */}
   
              <div className="mt-10 d-flex flex-wrap justify-content-between gap-3 row">
               
               
              <div className="row mt-4">
  <div   className={`${isEMP ? "col-md-12":"col-md-6"}`}>
    <PresenceCircleChart
      periode={periode}
      date={date}
      dateDebut={dateDebut}
      dateFin={dateFin}
      mois={mois}
    />
  </div>
  {!isEMP && (<div className="col-md-6">
    <ContractTypeCircleChart
      periode={periode}
      date={date}
      dateDebut={dateDebut}
      dateFin={dateFin}
      mois={mois}
    />
  </div>)}
  
</div>

                <PresenceEvaluationChart
                
  periode={periode}
  date={date}
  dateDebut={dateDebut}
  dateFin={dateFin}
  mois={mois}
/>
              </div>
           
          </>
        ) : (
          <p className="text-center text-gray-500">Aucune donnée disponible</p>
        )}
      </div>
    </div>
  );
};

export default PresenceDashboard;
