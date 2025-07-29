import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAbsenceRequests, deleteAbsenceRequests } from '../Redux/Slices/absenceRequestSlice';
import { fetchUsers } from '../Redux/Slices/userSlice';
import { Icon } from '@iconify/react/dist/iconify.js';
import Swal from 'sweetalert2';

const AbsenceRequestsListPage = (props) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: absenceRequests, status: loading, error } = useSelector((state) => state.absenceRequests);
  const { items: users } = useSelector((state) => state.users);
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [type, setType] = useState('');
  const [status, setStatus] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const roles = useSelector((state) => state.auth.roles || []);
  const handleDownloadAttestation = (url) => {
    if (url) {
      window.open(url, '_blank');
    } else {
      Swal.fire('Info', 'Aucune attestation disponible pour cette demande.', 'info');
    }
  };
  const handleDownloadJustification = (justificationUrl) => {
    if (justificationUrl) {
      window.open(justificationUrl, '_blank');
    } else {
      Swal.fire('Info', 'Aucune justification disponible pour cette demande.', 'info');
    }
  };
  // Ajouter la fonction de réinitialisation des filtres
  const resetFilters = () => {
    setType('');
    setStatus('');
    setSearchTerm('');
    setCurrentPage(1);
  };

  // Ajouter la logique de filtrage
  const filteredRequests = absenceRequests.filter((request) => {
    const user = users.find(u => u.id === request.user_id);
    const userName = user ? `${user.name} ${user.prenom}`.toLowerCase() : '';
    const searchLower = searchTerm.toLowerCase();
  
    const matchesSearch = userName.includes(searchLower) || 
                         request.type.toLowerCase().includes(searchLower) ||
                         request.motif?.toLowerCase().includes(searchLower);
  
    const matchesType = !type || request.type.toLowerCase() === type.toLowerCase();
    const matchesStatus = !status || request.statut.toLowerCase() === status.toLowerCase();
    const matchesStatusProp = !props.statusFilter || props.statusFilter.length === 0 || props.statusFilter.includes(request.statut.toLowerCase());
  
    return matchesSearch && matchesType && matchesStatus && matchesStatusProp;
  });
  

  // Mise à jour des calculs de pagination pour utiliser les demandes filtrées
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredRequests.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = e.target.value === 'all' ? filteredRequests.length : parseInt(e.target.value);
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
    navigate(`/absences/${id}/edit`);
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
        await dispatch(deleteAbsenceRequests([id])).unwrap();
        Swal.fire(
          'Supprimé!',
          'La demande d\'absence a été supprimée avec succès.',
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
  function handleImportRequests(event) {
    // Logique pour gérer l'importation des demandes d'absence
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = e.target.result;
      // Traiter les données du fichier ici
      console.log('Données du fichier importé:', data);
    };
    reader.readAsText(file);
  }
  const handleBulkDelete = async () => {
    if (selectedRequests.length === 0) {
      Swal.fire(
        'Attention!',
        'Veuillez sélectionner au moins une demande à supprimer.',
        'warning'
      );
      return;
    }

    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Vous êtes sur le point de supprimer ${selectedRequests.length} demande(s). Cette action ne peut pas être annulée!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteAbsenceRequests(selectedRequests)).unwrap();
        setSelectedRequests([]);
        Swal.fire(
          'Supprimé!',
          'Les demandes ont été supprimées avec succès.',
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

  const toggleRequestSelection = (id) => {
    setSelectedRequests(prev => 
      prev.includes(id) 
        ? prev.filter(reqId => reqId !== id)
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
                  <p className="mb-0">Une erreur est survenue lors du chargement des demandes.</p>
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
        <h5 className="card-title mb-0">Les Demandes </h5>

        <div className="d-flex flex-wrap gap-3 py-2">
          <Link to="/absences/add" className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover" style={{ width: '40px', height: '40px', backgroundColor: '#E0F2FE', color: '#0284C7' }}>
            <Icon icon="mdi:plus" className="fs-5" />
          </Link>

          <button className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${selectedRequests.length === 0 ? 'disabled opacity-50' : ''}`} style={{ width: '40px', height: '40px', backgroundColor: '#FFE4E6', color: '#D33' }} onClick={handleBulkDelete} disabled={selectedRequests.length === 0}>
            <Icon icon="mdi:trash" className="fs-5" />
          </button>

          <button className="d-md-none d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover" style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }} onClick={() => setFiltersOpen(!filtersOpen)}>
            <Icon icon="mdi:tune" className="fs-5" />
          </button>
        </div>
      </div>

      <div className="card-body">
        {/* Filters */}
        <div className={`filters-container mb-4 ${filtersOpen ? 'd-block' : 'd-none'} d-md-block`}>
          <div className="row g-3 align-items-center">
            <div className="col-6 col-sm-4 col-md-3 col-lg-2">
              <select className="form-select" value={type} onChange={e => setType(e.target.value)}>
                <option value="">Type</option>
                <option value="Congé">Congé</option>
                <option value="maladie">Maladie</option>
                <option value="AttestationTravail">Attestation de Travail</option>
                <option value="autre">Autre</option>
              </select>
            </div>

            <div className="col-6 col-sm-4 col-md-3 col-lg-2">
              <select className="form-select" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="">Statut</option>
                <option value="en_attente">En attente</option>
                <option value="validé">Validé</option>
                <option value="rejeté">Rejeté</option>
                <option value="approuvé">Approuvé</option>
              </select>
            </div>

            <div className="col-6 col-sm-4 col-md-3 col-lg-3">
              <div className="position-relative">
                <Icon icon="mdi:magnify" className="position-absolute start-0 top-50 translate-middle-y ms-3 text-secondary" style={{ fontSize: "18px" }} />
                <input type="text" className="form-control search-input ps-5 py-2 shadow-sm" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
              </div>
            </div>

            {(type || status || searchTerm) && (
              <div className="col-auto">
                <button className="btn btn-link text-danger" onClick={resetFilters} title="Réinitialiser les filtres" style={{ padding: '6px 10px' }}>
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
                    <input className="form-check-input" type="checkbox" onChange={() => {
                      if (selectedRequests.length === currentItems.length) {
                        setSelectedRequests([]);
                      } else {
                        const visibleIds = currentItems.map(request => request.id);
                        setSelectedRequests(visibleIds);
                      }
                    }} checked={selectedRequests.length === currentItems.length && currentItems.length > 0} />
                    <label className="form-check-label">S.L</label>
                  </div>
                </th>
                <th scope="col">Employé</th>
                <th scope="col">Type</th>
                <th scope="col">Date de début</th>
                <th scope="col">Date de fin</th>
                <th scope="col">Statut</th>
                <th scope="col" className='dt-orderable-asc dt-orderable-desc'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((request) => {
                const user = users.find(u => u.id === request.user_id);
                return (
                  <tr key={request.id}>
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <input className="form-check-input" type="checkbox" checked={selectedRequests.includes(request.id)} onChange={() => toggleRequestSelection(request.id)} />
                        <label className="form-check-label">{request.id}</label>
                      </div>
                    </td>
                    <td>{user ? `${user.name} ${user.prenom}` : 'Utilisateur inconnu'}</td>
                    <td>{request.type}</td>
                    {request.type === "AttestationTravail" && (
                      <>
                        <td className='text-center'> ---</td>
                        <td className='text-center'> ---</td>
                      </>
                    )}
                    {request.type !== "AttestationTravail" && (
                      <>
                        <td>{new Date(request.dateDebut).toLocaleDateString()}</td>
                        <td>{new Date(request.dateFin).toLocaleDateString()}</td>
                      </>
                    )}
                    <td>

  <div 
    className="d-flex align-items-center justify-content-center shadow-sm p-2"
    style={{
      width: '100px',
      height: '32px',
      borderRadius: '16px',
      fontWeight: 500,
      fontSize: '0.875rem',
      textTransform: 'capitalize',
      backgroundColor: 
        request.statut === 'approuvé' ? '#e6f7e8' :
        request.statut === 'rejeté' ? '#ffe7e9' :
        request.statut === 'validé' ? '#e8f4ff' :
        request.statut === 'en_attente' ? '#fff4d4' :
        '#fffae6',
      color: 
        request.statut === 'approuvé' ? '#34c38f' :
        request.statut === 'rejeté' ? '#f46a6a' :
        request.statut === 'validé' ? '#409eff' :
        request.statut === 'en_attente' ? '#ffad46' :
        '#ffc107',
      transition: 'background-color 0.3s ease, transform 0.3s ease',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'scale(1.05)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'scale(1)';
    }}
  >
    {request.statut}
  </div>
</td>





                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        {request.justification && (
                          <button
                            className="btn btn-link text-primary"
                            onClick={() => handleDownloadJustification(`${import.meta.env.VITE_API_URL}storage/${request.justification}`)}
                            title="Télécharger la justification"
                          >
                            <Icon icon="mdi:eye" className="fs-5" />
                          </button>
                        )}
                        {(request.statut === 'approuvé' && request.type === 'AttestationTravail') && (
                          <button className="btn btn-link text-primary" onClick={() => handleDownloadAttestation(`${import.meta.env.VITE_API_URL}api/attestation-travail/pdf/${request.id}`)} title="Télécharger l'attestation">
                            <Icon icon="mdi:download" className="fs-5" />
                          </button>
                        )}
                        {(request.statut === 'approuvé' && request.type === 'Congé') && (
                          <button className="btn btn-link text-primary" onClick={() => handleDownloadAttestation(`${import.meta.env.VITE_API_URL}api/conge/pdf/${request.id}`)} title="Télécharger l'attestation">
                            <Icon icon="mdi:download" className="fs-5" />
                          </button>
                        )}
                        <button className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center" onClick={() => handleEdit(request.id)} title="Modifier">
                          <Icon icon="lucide:edit" />
                        </button>
                        <button className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center" onClick={() => handleDelete(request.id)} title="Supprimer">
                          <Icon icon="mingcute:delete-2-line" />
                        </button>
                      </div>
                    </td>
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
            <select className="form-select form-select-sm w-auto shadow-sm border-0 bg-light text-dark" value={itemsPerPage} onChange={handleItemsPerPageChange} style={{ borderRadius: "8px", padding: "6px 12px" }}>
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="all">Tous</option>
            </select>
            <span className="text-muted">entrées</span>
          </div>

          <div className="d-flex gap-2">
            <button className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover" style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }} onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
              <Icon icon="mdi:chevron-left" className="fs-5" />
            </button>

            {getPageNumbers().map((number) => (
              <button key={number} className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${currentPage === number ? "bg-primary-light text-primary-600" : "bg-light text-secondary"}`} style={{ width: '40px', height: '40px' }} onClick={() => paginate(number)}>
                {number}
              </button>
            ))}

            <button className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover" style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }} onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
              <Icon icon="mdi:chevron-right" className="fs-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbsenceRequestsListPage;