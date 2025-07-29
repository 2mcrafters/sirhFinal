import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchPublications,
  updatePublication,
  deletePublication,
  deletePublications,
} from '../../Redux/Slices/publicationSlice';
import { useNavigate } from 'react-router-dom';
import { Icon } from '@iconify/react';
import Swal from 'sweetalert2';

const PublicationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  // publications: { items, loading, error }
  const { items: publications, loading, error } = useSelector(state => state.publications);
  // user: { role, ... }
  const user = useSelector(state => state.auth.user); // <-- adaptez selon votre store
  const isRH = user && user.role && user.role.toLowerCase().includes('rh');

  const [selectedPublications, setSelectedPublications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

 
  const filteredPublications = publications.filter(pub => {
    const searchMatch = (pub.titre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                        (pub.texte || '').toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = !typeFilter || pub.type === typeFilter;
    const statusMatch = !statusFilter || pub.statut === statusFilter;
    return searchMatch && typeMatch && statusMatch;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredPublications.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPublications.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const resetFilters = () => {
    setSearchTerm('');
    setTypeFilter('');
    setStatusFilter('');
  };

  const togglePublicationSelection = (id) => {
    setSelectedPublications(prev =>
      prev.includes(id)
        ? prev.filter(pubId => pubId !== id)
        : [...prev, id]
    );
  };

  // Suppression multiple
  const handleBulkDelete = async () => {
    if (selectedPublications.length === 0) {
      Swal.fire('Attention!', 'Sélectionnez au moins une publication.', 'warning');
      return;
    }
    const result = await Swal.fire({
      title: 'Êtes-vous sûr ?',
      text: `Supprimer ${selectedPublications.length} publication(s) ?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });
    if (result.isConfirmed) {
      try {
        await dispatch(deletePublications(selectedPublications)).unwrap();
        setSelectedPublications([]);
        Swal.fire('Supprimé!', 'Les publications ont été supprimées.', 'success');
      } catch (error) {
        Swal.fire('Erreur!', 'Échec de la suppression.', 'error');
      }
    }
  };

  // Utilitaire pour retrouver le nom à partir de l'ID
  const getNameById = (list, id) => {
    const item = list.find(e => e.id === id);
    return item ? (item.nom || item.name || item.raison_sociale) : id;
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
                  <p className="mb-0">Une erreur est survenue lors du chargement des publications.</p>
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
      <div className="card-header d-flex flex-column flex-md-row gap-2 justify-content-between align-items-start align-items-md-center mb-4">
        <h5 className="card-title mb-0">Actualités & Sondages</h5>
        {isRH &&
        <div className="d-flex flex-wrap gap-3 py-2">
          <button
            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
            style={{ width: '40px', height: '40px', backgroundColor: '#E0F2FE', color: '#0284C7' }}
            onClick={() => navigate('/publications/nouveau')}
          >
            <Icon icon="mdi:plus" className="fs-5" />
          </button>
          <button
            className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${selectedPublications.length === 0 ? 'disabled opacity-50' : ''}`}
            style={{ width: '40px', height: '40px', backgroundColor: '#FFE4E6', color: '#D33' }}
            onClick={handleBulkDelete}
            disabled={selectedPublications.length === 0}
          >
            <Icon icon="mdi:trash" className="fs-5" />
          </button>
          <button
            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
            style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }}
            onClick={resetFilters}
          >
            <Icon icon="mdi:tune" className="fs-5" />
          </button>
        </div>
        }
      </div>

      {/* Filters */}
      <div className="row g-3 align-items-center mb-4">
        <div className="col-12 col-md-4">
          <input
            type="text"
            placeholder="Rechercher..."
            className="form-control shadow-sm"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-4">
          <select
            className="form-select shadow-sm"
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
          >
            <option value="">Tous types</option>
            <option value="actualite">Actualité</option>
            <option value="sondage">Sondage</option>
          </select>
        </div>
        <div className="col-6 col-md-4">
          <select
            className="form-select shadow-sm"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Tous statuts</option>
            <option value="publie">Publié</option>
            <option value="brouillon">Brouillon</option>
            <option value="ferme">Fermé</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-responsive">
        <table className="table bordered-table mb-0" id="dataTable" data-page-length={10}>
          <thead>
            <tr>
              {isRH && (
              <th scope="col">
                <div className="form-check style-check d-flex align-items-center">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    onChange={() => {
                      if (selectedPublications.length === currentItems.length) {
                        setSelectedPublications([]);
                      } else {
                        setSelectedPublications(currentItems.map(pub => pub.id));
                      }
                    }}
                    checked={selectedPublications.length === currentItems.length && currentItems.length > 0}
                  />
                  <label className="form-check-label">S.L</label>
                </div>
              </th>
              )}
              <th scope="col">Type</th>
              <th scope="col">Titre</th>
              <th scope="col">Texte</th>
              {isRH && <th scope="col">Statut</th>}
              {/* {isRH && <th scope="col">Cibles</th>} */}
              <th scope="col">Créée le</th>
              {isRH && <th scope="col">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {currentItems.map(pub => (
              <tr key={pub.id}
                className="hover:bg-blue-50 transition"
                style={{ cursor: 'pointer' }}
                onClick={e => {
                  if (
                    e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'SELECT' ||
                    e.target.closest('button')
                  ) return;
                  navigate(`/publications/${pub.id}`);
                }}
              >
                {isRH && (
                <td>
                  <div className="form-check style-check d-flex align-items-center">
                    <input className="form-check-input" type="checkbox" checked={selectedPublications.includes(pub.id)} onChange={() => togglePublicationSelection(pub.id)} onClick={e => e.stopPropagation()} />
                    <label className="form-check-label">{pub.id}</label>
                  </div>
                </td>
                )}
                <td>
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${pub.type === 'sondage' ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {pub.type === 'sondage' ? 'Sondage' : 'Actualité'}
                  </span>
                </td>
                <td>{pub.titre}</td>
                <td className="truncate max-w-sm">{pub.texte}</td>
                {isRH && (
                  <td onClick={e => e.stopPropagation()}>
                    <select
                      value={pub.statut}
                      className={
                        `form-select form-select-sm shadow-sm
                        ${pub.statut === 'publie' ? 'bg-green-100 text-green-800 border-success' :
                          pub.statut === 'brouillon' ? 'bg-gray-100 text-gray-700 border-secondary' :
                          'bg-red-100 text-red-700 border-danger'}`
                      }
                      style={{ borderRadius: 8, minWidth: 110, fontWeight: 600 }}
                      onChange={e => dispatch(updatePublication({ id: pub.id, statut: e.target.value }))}
                    >
                      <option value="publie">Publié</option>
                      <option value="brouillon">Brouillon</option>
                      <option value="ferme">Fermé</option>
                    </select>
                  </td>
                )}
                {/* {isRH && (
                  <td>
                    {Array.isArray(pub.targets) && pub.targets.length > 0 ? (
                      <ul style={{margin:0, padding:0, listStyle:'none'}}>
                        {pub.targets.map((t, idx) => (
                          <li key={idx}>
                            {t.user_id && <span>👤User {t.user_id} </span>}
                            {t.departement_id && <span>Dept {t.departement_id} </span>}
                            {t.societe_id && <span>Soc {t.societe_id} </span>}
                            {t.role && <span>Role {t.role} </span>}
                            {t.typeContrat && <span>Contrat {t.typeContrat} </span>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <span className="text-muted">-</span>
                    )}
                  </td>
                )} */}
                <td>{new Date(pub.created_at).toLocaleDateString()}</td>
                {isRH && (
                <td className="text-end">
                  <div className="d-flex justify-content-end gap-2">
                    <button
                      className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={e => { e.stopPropagation(); navigate(`/publications/${pub.id}`); }}
                      title="Voir le détail"
                    >
                      <Icon icon="lucide:eye" />
                    </button>
                    <button
                      className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={e => {
                        e.stopPropagation();
                        Swal.fire({
                          title: 'Supprimer cette publication ?',
                          icon: 'warning',
                          showCancelButton: true,
                          confirmButtonText: 'Oui, supprimer',
                          cancelButtonText: 'Annuler'
                        }).then(async (result) => {
                          if (result.isConfirmed) {
                            await dispatch(deletePublication(pub.id));
                            Swal.fire('Supprimé !', 'La publication a été supprimée.', 'success');
                          }
                        });
                      }}
                      title="Supprimer"
                    >
                      <Icon icon="mingcute:delete-2-line" />
                    </button>
                  </div>
                </td>
                )}
              </tr>
            ))}
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
            onChange={e => setItemsPerPage(parseInt(e.target.value))}
            style={{ borderRadius: "8px", padding: "6px 12px" }}
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
          </select>
          <span className="text-muted">entrées</span>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <button
            className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
            style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }}
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <Icon icon="mdi:chevron-left" className="fs-5" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${currentPage === i + 1 ? "bg-primary-light text-primary-600" : "bg-light text-secondary"}`}
              style={{ width: '40px', height: '40px' }}
              onClick={() => paginate(i + 1)}
            >
              {i + 1}
            </button>
          ))}
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
  );
};

export default PublicationList;
