import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { fetchDepartments, deleteDepartments } from '../Redux/Slices/departementSlice';
import { Icon } from '@iconify/react/dist/iconify.js';
import Swal from 'sweetalert2';
import api from '../config/axios';

const DepartmentsListPage = () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items: departments, status: loading, error } = useSelector((state) => state.departments);
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const roles = useSelector((state) => state.auth.roles || []);
  const isEmployee = roles.includes('Employe');  // Vérifie si le rôle est "EMPLOYE"
  // useEffect(() => {
  //   dispatch(fetchDepartments());
  // }, [dispatch]);

  // Ajouter la fonction de réinitialisation des filtres
  const resetFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handleImportDepartments = async (e) => {
    const file = e.target.files[0];
  
    if (!file) {
      Swal.fire('Erreur!', 'Aucun fichier sélectionné.', 'error');
      return;
    }
  
    const formData = new FormData();
    formData.append('file', file);
  
    try {
      const response = await api.post(apiUrl + 'api/departements/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
  
      // Si succès standard (200 OK)
      if (response.status === 200) {
        Swal.fire('Succès!', 'Les départements ont été importés avec succès.', 'success');
        dispatch(fetchDepartments());
      }
    } catch (error) {
      const status = error?.response?.status;
  
      // ✅ Cas ignorés (redirection, no content, CORS sans réponse explicite)
      if (status === 204 || status === 302 || !error.response) {
        Swal.fire('Import réussi', 'Les départements ont été importés (avec redirection ou réponse vide).', 'success');
        dispatch(fetchDepartments());
      } else {
        console.error('Erreur lors de l’importation des départements:', error);
        Swal.fire('Erreur!', error?.response?.data?.message || 'Une erreur est survenue.', 'error');
      }
    }
  };
  
  // Ajouter la logique de filtrage
  const filteredDepartments = departments.filter((department) => {
    const matchesSearch = !searchTerm || 
      department.nom.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  // Mise à jour des calculs de pagination pour utiliser les départements filtrés
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDepartments.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredDepartments.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = e.target.value === 'all' ? filteredDepartments.length : parseInt(e.target.value);
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
    navigate(`/departments/${id}/edit`);
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
        await dispatch(deleteDepartments([id])).unwrap();
        Swal.fire(
          'Supprimé!',
          'Le département a été supprimé avec succès.',
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
    if (selectedDepartments.length === 0) {
      Swal.fire(
        'Attention!',
        'Veuillez sélectionner au moins un département à supprimer.',
        'warning'
      );
      return;
    }

    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Vous êtes sur le point de supprimer ${selectedDepartments.length} département(s). Cette action ne peut pas être annulée!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteDepartments(selectedDepartments)).unwrap();
        setSelectedDepartments([]);
        Swal.fire(
          'Supprimé!',
          'Les départements ont été supprimés avec succès.',
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

  const toggleDepartmentSelection = (id) => {
    setSelectedDepartments(prev => 
      prev.includes(id) 
        ? prev.filter(deptId => deptId !== id)
        : [...prev, id]
    );
  };

  // Ajouter la fonction pour gérer la sélection de tous les départements
  const toggleSelectAllDepartments = () => {
  if (selectedDepartments.length === departments.length) {
    setSelectedDepartments([]);
  } else {
    setSelectedDepartments(departments.map(department => department.id));
  }
  

  const toggleSelectAllDepartments = () => {
  if (selectedDepartments.length === currentItems.length) {
    setSelectedDepartments([]);
  } else {
    const visibleIds = currentItems.map(department => department.id);
    setSelectedDepartments(visibleIds);
  }
};

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
                  <p className="mb-0">Une erreur est survenue lors du chargement des départements.</p>
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
        <h5 className="card-title mb-0">Départements</h5>

        <div className="d-flex flex-wrap gap-3 py-2">
  
  {/* Ajouter Button */}
  <Link 
    to="/departments/add" 
    className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
    style={{ width: '40px', height: '40px', backgroundColor: '#E0F2FE', color: '#0284C7' }}
  >
    <Icon icon="mdi:plus" className="fs-5" />
  </Link>

  {/* Supprimer Button */}
  <button 
    className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${selectedDepartments.length === 0 ? 'disabled opacity-50' : ''}`}
    style={{ width: '40px', height: '40px', backgroundColor: '#FFE4E6', color: '#D33' }}
    onClick={handleBulkDelete}
    disabled={selectedDepartments.length === 0}
  >
    <Icon icon="mdi:trash" className="fs-5" />
  </button>

  {/* Export Button */}
  <button 
    className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
    style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }}
    onClick={() => window.open(`${import.meta.env.VITE_API_URL}api/export-departements`, '_blank')}
  >
    <Icon icon="mdi:download" className="fs-5" />
  </button>

  {/* Import Button */}
  {!isEmployee && (
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
        onChange={handleImportDepartments}
      />
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
      placeholder="Rechercher un département..."
      value={searchTerm}
      onChange={e => setSearchTerm(e.target.value)}
    />
  </div>
</div>


            {searchTerm && (
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
  onChange={toggleSelectAllDepartments}
  checked={selectedDepartments.length === currentItems.length && currentItems.length > 0}
/>
                    <label className="form-check-label">S.L</label>
                  </div>
                </th>
                <th scope="col">Nom</th>
                <th scope="col" className='dt-orderable-asc dt-orderable-desc'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((department) => (
                <tr key={department.id}>
                  <td>
                    <div className="form-check style-check d-flex align-items-center">
                      <input className="form-check-input" type="checkbox" checked={selectedDepartments.includes(department.id)} onChange={() => toggleDepartmentSelection(department.id)} />
                      <label className="form-check-label">{department.id}</label>
                    </div>
                  </td>
                  <td>{department.nom}</td>
                  <td className="text-end">
                    <div className="d-flex justify-content-end gap-2">
                      <button
                        className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center"
                        onClick={() => handleEdit(department.id)}
                        title="Modifier"
                    >
                      <Icon icon="lucide:edit" />
                    </button>
                    <button
                      className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center"
                      onClick={() => handleDelete(department.id)}
                      title="Supprimer"
                    >
                      <Icon icon="mingcute:delete-2-line" />
                    </button>
                    </div>
                  </td>
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

  <div className="d-flex gap-2">
    {/* Previous Button */}
    <button
      className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover"
      style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }}
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
        style={{ width: '40px', height: '40px' }}
        onClick={() => paginate(number)}
      >
        {number}
      </button>
    ))}

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
      </div>
    );
};

export default DepartmentsListPage;