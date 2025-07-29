import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchUsers, deleteUsers } from '../Redux/Slices/userSlice';
import { fetchDepartments } from '../Redux/Slices/departementSlice';
import { Icon } from '@iconify/react/dist/iconify.js';
import Swal from 'sweetalert2';
import api from '../config/axios';
import UserPointagesPeriode from '../Components/Statistique/UserPointagesPeriode';

const UsersListPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: users, status: loading, error } = useSelector((state) => state.users);
  const { items: departments } = useSelector((state) => state.departments);
  const { user: currentUser } = useSelector((state) => state.auth); // Ajout de l'utilisateur connecté
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [role, setRole] = useState('');
  const [department, setDepartment] = useState('');
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const roles = useSelector((state) => state.auth.roles || []);
  const isRH = roles.includes('RH'); 
  const [typeEmploye, setTypeEmploye] = useState('');
  const [userPointagesOpenId, setUserPointagesOpenId] = useState(null);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setUserPointagesOpenId(null);
    };
    if (userPointagesOpenId) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [userPointagesOpenId]);
  
  // Ajouter la fonction de réinitialisation des filtres
  const resetFilters = () => {
    setRole('');
    setDepartment('');
    setStatus('');
    setSearchTerm('');
    setCurrentPage(1);
    setTypeEmploye('');

  };

  // Ajout de la fonction de filtrage
  const filteredUsers = users.filter((user) => {
  const searchTermLower = searchTerm.toLowerCase();
  const matchesSearch = 
    (user.name || '').toLowerCase().includes(searchTermLower) ||
    (user.prenom || '').toLowerCase().includes(searchTermLower) ||
    (user.cin || '').toLowerCase().includes(searchTermLower) ||
    (user.email || '').toLowerCase().includes(searchTermLower);

  const matchesRole = !role || user.role.toLowerCase() === role.toLowerCase();
  const matchesDepartment = !department || user.departement_id === parseInt(department);
  const matchesStatus = !status || user.statut.toLowerCase() === status.toLowerCase();
  const matchesTypeEmploye = !typeEmploye || (user.typeContrat || '').toLowerCase() === typeEmploye.toLowerCase(); // AJOUT

  return matchesSearch && matchesRole && matchesDepartment && matchesStatus && matchesTypeEmploye;
});


  // Mise à jour des calculs de pagination pour utiliser les utilisateurs filtrés
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

  const handleEdit = (id) => {
    // Empêcher la modification si c'est l'utilisateur connecté
    if (currentUser && currentUser.id === id) {
      Swal.fire({
        title: 'Action non autorisée',
        text: 'Vous ne pouvez pas modifier votre profil depuis cette page. Veuillez utiliser la page de profil.',
        icon: 'warning',
        confirmButtonText: 'OK'
      });
      return;
    }
    navigate(`/users/${id}/edit`);
  };

  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: "Cette action ne peut pas être annulée!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteUsers([id])).unwrap();
        Swal.fire(
          'Supprimé!',
          'L\'utilisateur a été supprimé avec succès.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Erreur!',
          'Une erreur est survenue lors de la suppression.',
          'error'
        );
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedUsers.length === 0) {
      Swal.fire(
        'Attention!',
        'Veuillez sélectionner au moins un utilisateur à supprimer.',
        'warning'
      );
      return;
    }

    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Vous êtes sur le point de supprimer ${selectedUsers.length} utilisateur(s). Cette action ne peut pas être annulée!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteUsers(selectedUsers)).unwrap();
        setSelectedUsers([]);
        Swal.fire(
          'Supprimé!',
          'Les utilisateurs ont été supprimés avec succès.',
          'success'
        );
      } catch (error) {
        Swal.fire(
          'Erreur!',
          'Une erreur est survenue lors de la suppression.',
          'error'
        );
      }
    }
  };

  const toggleUserSelection = (id) => {
    setSelectedUsers(prev => 
      prev.includes(id) 
        ? prev.filter(userId => userId !== id)
        : [...prev, id]
    );
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

  if (error && users.length === 0) {
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
  

  const handleImport = async (e) => {
    const file = e.target.files[0]; 
  
    if (!file) {
      Swal.fire('Erreur', 'Veuillez sélectionner un fichier', 'error');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await api.post('/import-employes', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Cas normal : succès HTTP 200
      if (response.status === 200) {
        Swal.fire('Succès', 'Fichier importé avec succès', 'success');
        await dispatch(fetchUsers());
      }
    } catch (error) {
      const status = error?.response?.status;
  
      // ✅ Si le backend retourne 204 No Content ou 302 Redirect, on considère que l'import est OK
      if (status === 204 || status === 302 || !error.response) {
        Swal.fire('Import réussi', 'Employés importés (avec redirection ou sans réponse explicite).', 'success');
        await dispatch(fetchUsers());
      } else {
        console.error('Erreur lors de l’importation des employés:', error);
        Swal.fire('Erreur', error?.response?.data?.message || 'Une erreur est survenue lors de l’importation.', 'error');
      }
    }
  };
  
  return (
    <div className="basic-data-table">
      {/* Header */}
      <div className="card-header d-flex flex-column flex-md-row gap-2 justify-content-between align-items-start align-items-md-center">
        <h5 className="card-title mb-0">Employés</h5>

        <div className="d-flex flex-wrap gap-3 py-2">
{isRH&& (<>
          {/* Ajouter Button */}
          <Link 
            to="/users/add" 
            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
            style={{ width: '40px', height: '40px', backgroundColor: '#E0F2FE', color: '#0284C7' }}
          >
            <Icon icon="mdi:plus" className="fs-5" />
          </Link>

          {/* Supprimer Button */}
          <button 
            className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${selectedUsers.length === 0 ? 'disabled opacity-50' : ''}`}
            style={{ width: '40px', height: '40px', backgroundColor: '#FFE4E6', color: '#D33' }}
            onClick={handleBulkDelete}
            disabled={selectedUsers.length === 0}
          >
            <Icon icon="mdi:trash" className="fs-5" />
          </button>

          {/* Export Button */}
         

          {/* Import Button */}
          
            <>
              <button
                className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
                style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }}
                onClick={() => document.getElementById('fileInput').click()}
              >
                <Icon icon="mdi:upload" className="fs-5" />
              </button>

              <input
                type="file"
                id="fileInput"
                className="d-none"
                accept=".xlsx, .xls, .csv"
                onChange={handleImport}
              />
            </>
            </>
          )}

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
        {/* Filters */}
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
           <div className="col-6 col-sm-4 col-md-3 col-lg-2">
  <select className="form-select" value={typeEmploye} onChange={e => setTypeEmploye(e.target.value)}>
    <option value="">Type employé</option>
    <option value="Permanent">Permanent</option>
    <option value="Temporaire">Temporaire</option>
    {/* Ajoute d'autres types si besoin */}
  </select>
</div>


            <div className="col-6 col-sm-4 col-md-3 col-lg-3">
              <div className="position-relative">
                <Icon 
                  icon="mdi:magnify" 
                  className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary"
                  style={{ fontSize: "18px" }}
                />
                <input
                  type="text"
                  className="form-control search-input ps-5 py-2 shadow-sm"
                  placeholder="Rechercher par nom ou CIN..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
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

        {/* Table */}
        <div className="table-responsive">
          <table className="table bordered-table mb-0" id="dataTable" data-page-length={10}>
            <thead>
              <tr>
                <th scope="col">
                  <div className="form-check style-check d-flex align-items-center">
                    <input 
                      className="form-check-input" 
                      type="checkbox" 
                      onChange={() => {
                        if (selectedUsers.length === currentItems.length) {
                          setSelectedUsers([]);
                        } else {
                          const visibleIds = currentItems.map(user => user.id);
                          setSelectedUsers(visibleIds);
                        }
                      }}
                      checked={selectedUsers.length === currentItems.length && currentItems.length > 0}
                    />
                    <label className="form-check-label">S.L</label>
                  </div>
                </th>
                <th scope="col">Nom</th>
                <th scope="col">Prénom</th>
                <th scope="col">Email</th>
                <th scope="col">Rôle</th>
                <th scope="col">Fonction</th>
                <th scope="col">Département</th>
                <th scope="col">Statut</th>
                {isRH && <th scope="col" className='dt-orderable-asc dt-orderable-desc'>Actions</th>}
                
              </tr>
            </thead>
            <tbody>
              {currentItems.map((user) => {
                const department = departments.find(d => d.id === user.departement_id);
                const isCurrentUser = currentUser && currentUser.id === user.id;
                return (
                  <tr key={user.id}>
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <input className="form-check-input" type="checkbox" checked={selectedUsers.includes(user.id)} onChange={() => toggleUserSelection(user.id)} />
                        <label className="form-check-label">{user.id}</label>
                      </div>
                    </td>
                    <td     onClick={() => setUserPointagesOpenId(user.id)}
                    style={{
                      padding: "12px",
                      fontWeight: "500",
                      color: "#2563EB",
                      cursor: "pointer",
                      textDecoration: "underline"
                    }}
                    title="Voir le détail des pointages"
                    >{user.name}</td>
                    <td>{user.prenom}</td>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.fonction}</td>
                    <td>{department ? department.nom : 'Non assigné'}</td>
                    <td>{user.statut}</td>
                    {isRH && (<td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          className={`w-32-px h-32-px me-8 ${isCurrentUser ? 'bg-secondary-light text-secondary-600' : 'bg-primary-light text-primary-600'} rounded-circle d-inline-flex align-items-center justify-content-center`}
                          onClick={() => handleEdit(user.id)}
                          title={isCurrentUser ? "Utilisez la page de profil pour modifier vos informations" : "Modifier"}
                          disabled={isCurrentUser}
                        >
                          <Icon icon="lucide:edit" />
                        </button>
                        <button
                          className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                          onClick={() => handleDelete(user.id)}
                          title="Supprimer"
                        >
                          <Icon icon="mingcute:delete-2-line" />
                        </button>
                      </div>
                    </td>)}
                    
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
              className="form-select form-select-sm w-auto shadow-sm border-0 bg-light text-dark"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
              style={{ borderRadius: "8px", padding: "6px 12px" }}
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="all">Tous</option>
            </select>
            <span className="text-muted">entrées</span>
          </div>

          <div className="d-flex gap-2 align-items-center">
  {/* Previous Button */}
  <button
    className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
    style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }}
    onClick={() => paginate(currentPage - 1)}
    disabled={currentPage === 1}
  >
    <Icon icon="mdi:chevron-left" className="fs-5" />
  </button>

  {/* Numéros de page : affichés uniquement sur desktop */}
  <div className="d-none d-sm-flex gap-2">
    {getPageNumbers().map((number) => (
      <button
        key={number}
        className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${
          currentPage === number ? "bg-primary-light text-primary-600" : "bg-light text-secondary"
        }`}
        style={{ width: '40px', height: '40px' }}
        onClick={() => paginate(number)}
      >
        {number}
      </button>
    ))}
  </div>

  {/* Mobile : select de pages */}
  <div className="d-flex d-sm-none align-items-center gap-1">
    <select
      value={currentPage}
      onChange={e => paginate(Number(e.target.value))}
      className="form-select form-select-sm"
      style={{ width: 70 }}
    >
      {getPageNumbers().map((number) => (
        <option value={number} key={number}>{number}</option>
      ))}
    </select>
    <span style={{ fontSize: 13 }}>/ {totalPages}</span>
  </div>

  {/* Next Button */}
  <button
    className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
    style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }}
    onClick={() => paginate(currentPage + 1)}
    disabled={currentPage === totalPages}
  >
    <Icon icon="mdi:chevron-right" className="fs-5" />
  </button>
</div>

        </div>
      </div>
      {/* Modal d'affichage des pointages */}
<div
  className={`modal fade ${userPointagesOpenId ? 'show d-block' : ''}`}
  tabIndex="-1"
  style={{ background: userPointagesOpenId ? 'rgba(0,0,0,0.3)' : 'transparent' }}
  aria-modal={userPointagesOpenId ? 'true' : undefined}
  role="dialog"
>
  <div className="modal-dialog modal-lg">
    <div className="modal-content">
      <div className="modal-header">
        <h5 className="modal-title">
          {userPointagesOpenId && (() => {
            const user = users.find(u => u.id === userPointagesOpenId);
            return user ? `Pointages de ${user.name} ${user.prenom}` : '';
          })()}
        </h5>
        <button
          type="button"
          className="btn-close"
          onClick={() => setUserPointagesOpenId(null)}
        ></button>
      </div>
      <div className="modal-body">
        {userPointagesOpenId && (
          <UserPointagesPeriode userId={userPointagesOpenId} />
        )}
      </div>
    </div>
  </div>
</div>

    </div>
  );
};

export default UsersListPage;