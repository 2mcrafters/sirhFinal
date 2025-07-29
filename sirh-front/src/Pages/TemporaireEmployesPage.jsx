import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUsersTemp, deleteUsers, fetchUsers } from '../Redux/Slices/userSlice';
import { affectUsersMass } from '../Redux/Slices/userSlice'; // Le thunk d'affectation en masse
import { fetchSocietes } from '../Redux/Slices/societeSlice'; // À adapter selon ton store
import { Icon } from '@iconify/react/dist/iconify.js';
import Swal from 'sweetalert2';
import api from '../config/axios';

const TemporaireEmployesPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { UserTemp: users, status: loading, error } = useSelector((state) => state.users);
  const { items: departments } = useSelector((state) => state.departments);
  const { items: societes } = useSelector((state) => state.societes);
  const { user: currentUser } = useSelector((state) => state.auth);
  const roles = useSelector((state) => state.auth.roles || []);
  const isEmployee = roles.includes('Employe');

  // Sélection utilisateurs
  const [selectedUsers, setSelectedUsers] = useState([]);

  // Filtres
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  // Affectation (mass)
  const [affectSocieteId, setAffectSocieteId] = useState('');
  const [affectDeptId, setAffectDeptId] = useState('');



  // Réinitialisation filtres
  const resetFilters = () => {
    setRole('');
    setDepartment('');
    setStatus('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Filtrage
  const filteredUsers = users.filter((user) => {
    const searchTermLower = searchTerm.toLowerCase();
    const matchesSearch =
      user.name?.toLowerCase().includes(searchTermLower) ||
      user.prenom?.toLowerCase().includes(searchTermLower) ||
      user.cin?.toLowerCase().includes(searchTermLower) ||
      user.email?.toLowerCase().includes(searchTermLower);

    const matchesRole = !role || (user.role && user.role.toLowerCase() === role.toLowerCase());
    const matchesDepartment = !department || user.departement_id === parseInt(department);
    const matchesStatus = !status || (user.statut && user.statut.toLowerCase() === status.toLowerCase());

    return matchesSearch && matchesRole && matchesDepartment && matchesStatus;
  });

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = e.target.value === 'all' ? filteredUsers.length : parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) {
          pageNumbers.push(i);
        }
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) {
          pageNumbers.push(i);
        }
      }
    }
    return pageNumbers;
  };

  const toggleUserSelection = (id) => {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((userId) => userId !== id) : [...prev, id]
    );
  };

  // --- Bloc Affectation en masse
  const handleAffectUsersMass = () => {
    if (!affectSocieteId || !affectDeptId) {
      Swal.fire('Erreur', 'Veuillez choisir un département et une société.', 'error');
      return;
    }

    dispatch(
      affectUsersMass({
        user_ids: selectedUsers,
        departement_id: affectDeptId,
        societe_id: affectSocieteId,
      })
    )
      .unwrap()
      .then(() => {
        Swal.fire('Succès', 'Affectation réalisée avec succès !', 'success');
        setSelectedUsers([]);
        setAffectSocieteId('');
        setAffectDeptId('');
        dispatch(fetchUsersTemp());
      })
      .catch((error) => {
        Swal.fire('Erreur', error?.message || 'Erreur lors de l’affectation.', 'error');
      });
  };

  // --- UI
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
                  <p className="mb-0">Une erreur est survenue lors du chargement des utilisateurs.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="basic-data-table">
      {/* Header */}
      <div className="card-header d-flex flex-column flex-md-row gap-2 justify-content-between align-items-start align-items-md-center">
        <h5 className="card-title mb-0">Employés Temporaire</h5>
        <div className="d-flex flex-wrap gap-3 py-2">
          {/* Ajout, Export, Import, Filtres : même logique */}
          <Link
            to="/users/add"
            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
            style={{ width: '40px', height: '40px', backgroundColor: '#E0F2FE', color: '#0284C7' }}
          >
            <Icon icon="mdi:plus" className="fs-5" />
          </Link>
          {/* ...autres boutons ici... */}
          {/* Filters Button (Mobile Only) */}
          <button
            className="d-md-none d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
            style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }}
            onClick={() => setFiltersOpen(!filtersOpen)}
          >
            <Icon icon="mdi:tune" className="fs-5" />
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Filtres */}
        <div className={`filters-container mb-4 ${filtersOpen ? 'd-block' : 'd-none'} d-md-block`}>
          <div className="row g-3 align-items-center">
            <div className="col-6 col-sm-4 col-md-3 col-lg-2">
              <select className="form-select" value={role} onChange={e => setRole(e.target.value)}>
                <option value="">Rôle</option>
                <option value="Employe">Employé</option>
                <option value="Chef_Dep">Chef département</option>
                <option value="RH">RH</option>
              </select>
            </div>
            <div className="col-6 col-sm-4 col-md-3 col-lg-2">
              <select className="form-select" value={department} onChange={e => setDepartment(e.target.value)}>
                <option value="">Département</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.id}>{dept.nom}</option>
                ))}
              </select>
            </div>
            <div className="col-6 col-sm-4 col-md-3 col-lg-2">
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Statut</option>
                <option value="Actif">Actif</option>
                <option value="Inactif">Inactif</option>
                <option value="Congé">Congé</option>
                <option value="Malade">Malade</option>
              </select>
            </div>
            <div className="col-6 col-sm-4 col-md-3 col-lg-3">
              <input
                type="text"
                className="form-control"
                placeholder="Rechercher par nom ou CIN..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            {(role || department || status || searchTerm) && (
              <div className="col-auto">
                <button
                  className="btn btn-link text-danger"
                  onClick={resetFilters}
                  title="Réinitialiser les filtres"
                  style={{ padding: '6px 10px' }}
                >
                  <Icon icon="mdi:close" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Bloc d'affectation */}
        {!isEmployee && selectedUsers.length > 0 && (
          <div className="card my-3 p-3 border border-success rounded">
            <div className="d-flex align-items-center justify-content-between">
              <h6 className="mb-0">Affecter {selectedUsers.length} utilisateur(s) sélectionné(s) :</h6>
              <button
                className="btn btn-link text-danger"
                onClick={() => setSelectedUsers([])}
              >
                <Icon icon="mdi:close" /> Annuler la sélection
              </button>
            </div>
            <div className="row g-2 mt-2">
              <div className="col-md-5">
                <select className="form-select" value={affectSocieteId} onChange={e => setAffectSocieteId(e.target.value)}>
                  <option value="">Choisir une société</option>
                  {societes.map(s => (
                    <option key={s.id} value={s.id}>{s.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-5">
                <select className="form-select" value={affectDeptId} onChange={e => setAffectDeptId(e.target.value)}>
                  <option value="">Choisir un département</option>
                  {departments.map(d => (
                    <option key={d.id} value={d.id}>{d.nom}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-2">
                <button
                  className="btn btn-success w-100"
                  onClick={handleAffectUsersMass}
                >
                  Affecter <Icon icon="mdi:account-convert" className="ms-1" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="table-responsive">
          <table className="table bordered-table mb-0" id="dataTable" data-page-length={10}>
            <thead>
              <tr>
                <th>
                  <div className="form-check style-check d-flex align-items-center">
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={() => {
                        if (selectedUsers.length === filteredUsers.length) {
                          setSelectedUsers([]);
                        } else {
                          setSelectedUsers(filteredUsers.map(u => u.id));
                        }
                      }}
                    />
                    <label className="form-check-label">S.L</label>
                  </div>
                </th>
                <th>Nom</th>
                <th>Prénom</th>
                <th>CIN</th>
                <th>Département</th>
                <th>Société</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user) => {
                const departmentObj = departments.find(d => d.id === user.departement_id);
                const societeObj = societes.find(s => s.id === user.societe_id);
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <input
                          type="checkbox"
                          className="form-check-input"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                        />
                        <label className="form-check-label">{user.id}</label>
                      </div>
                    </td>
                    <td>{user.name}</td>
                    <td>{user.prenom}</td>
                    <td>{user.cin}</td>
                    <td>{departmentObj ? departmentObj.nom : 'Non assigné'}</td>
                    <td>{societeObj ? societeObj.nom : 'Non assigné'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="d-flex justify-content-between align-items-center mt-4">
          <div className="d-flex align-items-center gap-2">
            <span className="text-muted">Afficher</span>
            <select
              className="form-select form-select-sm pagination-select"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              style={{ padding: "6px 12px", borderRadius: "8px", border: "1px solid #e0e0e0", backgroundColor: "#fafafa" }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="all">Tous</option>
            </select>
            <span className="text-muted">entrées</span>
          </div>

          <div className="d-flex gap-2">
            {/* Previous Button */}
            <button
              className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
              style={{ width: "40px", height: "40px", backgroundColor: "#F1F3F5", color: "#6C757D" }}
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <Icon icon="mdi:chevron-left" className="fs-5" />
            </button>
            {/* Page Numbers */}
            {getPageNumbers().map((number) => (
              <button
                key={number}
                className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${
                  currentPage === number ? "bg-primary-light text-primary-600" : "bg-light text-secondary"
                }`}
                style={{ width: "40px", height: "40px" }}
                onClick={() => paginate(number)}
              >
                {number}
              </button>
            ))}
            {/* Next Button */}
            <button
              className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
              style={{ width: "40px", height: "40px", backgroundColor: "#F1F3F5", color: "#6C757D" }}
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <Icon icon="mdi:chevron-right" className="fs-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TemporaireEmployesPage;
