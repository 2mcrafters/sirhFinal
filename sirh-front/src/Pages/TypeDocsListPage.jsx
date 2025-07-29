import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTypeDocs, deleteTypeDocs, createTypeDoc, updateTypeDoc } from '../Redux/Slices/typeDocSlice';
import { Icon } from '@iconify/react/dist/iconify.js';
import Swal from 'sweetalert2';
import TypeDocFormModal from '../Components/TypeDocFormModal';

const TypeDocsListPage = () => {
  const dispatch = useDispatch();
  const { items: typeDocs, status: loading, error } = useSelector((state) => state.typeDocs);
  const [selectedTypeDocs, setSelectedTypeDocs] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTypeDoc, setCurrentTypeDoc] = useState(null);

 

  const resetFilters = () => {
    setSearchTerm('');
    setCurrentPage(1);
  };

  const filteredTypeDocs = typeDocs.filter((typeDoc) => {
    const searchTermLower = searchTerm.toLowerCase();
    return typeDoc.nom.toLowerCase().includes(searchTermLower);
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredTypeDocs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredTypeDocs.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleItemsPerPageChange = (e) => {
    const newItemsPerPage = e.target.value === 'all' ? filteredTypeDocs.length : parseInt(e.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) pageNumbers.push(i);
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 5; i++) pageNumbers.push(i);
      } else if (currentPage >= totalPages - 2) {
        for (let i = totalPages - 4; i <= totalPages; i++) pageNumbers.push(i);
      } else {
        for (let i = currentPage - 2; i <= currentPage + 2; i++) pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const handleOpenModal = (typeDoc = null) => {
    setCurrentTypeDoc(typeDoc);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentTypeDoc(null);
  };

  const handleSubmitModal = async (formData) => {
    try {
      if (currentTypeDoc) {
        await dispatch(updateTypeDoc({ ...formData, id: currentTypeDoc.id })).unwrap();
        Swal.fire('Succès!', 'Type de document mis à jour avec succès.', 'success');
      } else {
        await dispatch(createTypeDoc(formData)).unwrap();
        Swal.fire('Succès!', 'Type de document créé avec succès.', 'success');
      }
      dispatch(fetchTypeDocs());
      handleCloseModal();
    } catch (err) {
      Swal.fire('Erreur!', `Une erreur est survenue: ${err.message || 'Veuillez réessayer.'}`, 'error');
    }
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
        await dispatch(deleteTypeDocs([id])).unwrap();
        Swal.fire('Supprimé!', 'Le type de document a été supprimé avec succès.', 'success');
        dispatch(fetchTypeDocs());
      } catch (error) {
        Swal.fire('Erreur!', 'Une erreur est survenue lors de la suppression.', 'error');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedTypeDocs.length === 0) {
      Swal.fire('Attention!', 'Veuillez sélectionner au moins un type de document à supprimer.', 'warning');
      return;
    }
    const result = await Swal.fire({
      title: 'Êtes-vous sûr?',
      text: `Vous êtes sur le point de supprimer ${selectedTypeDocs.length} type(s) de document. Cette action ne peut pas être annulée!`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Oui, supprimer!',
      cancelButtonText: 'Annuler'
    });

    if (result.isConfirmed) {
      try {
        await dispatch(deleteTypeDocs(selectedTypeDocs)).unwrap();
        setSelectedTypeDocs([]);
        Swal.fire('Supprimé!', 'Les types de document ont été supprimés avec succès.', 'success');
        dispatch(fetchTypeDocs());
      } catch (error) {
        Swal.fire('Erreur!', 'Une erreur est survenue lors de la suppression.', 'error');
      }
    }
  };

  const toggleTypeDocSelection = (id) => {
    setSelectedTypeDocs(prev => prev.includes(id) ? prev.filter(typeDocId => typeDocId !== id) : [...prev, id]);
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
        <div className="alert alert-danger" role="alert">
          Erreur de chargement des types de document: {typeof error === 'string' ? error : JSON.stringify(error)}
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="basic-data-table">
        {/* Header */}
        <div className="card-header d-flex flex-column flex-md-row gap-2 justify-content-between align-items-start align-items-md-center">
          <h5 className="card-title mb-0">Liste des Types de Document</h5>

          <div className="d-flex flex-wrap gap-3 py-2">
            {/* Ajouter Button */}
            <button className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover" style={{ width: '40px', height: '40px', backgroundColor: '#E0F2FE', color: '#0284C7' }} onClick={() => handleOpenModal()}>
              <Icon icon="mdi:plus" className="fs-5" />
            </button>

            {/* Supprimer Button */}
            {selectedTypeDocs.length > 0 && (
              <button className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover" style={{ width: '40px', height: '40px', backgroundColor: '#FFE4E6', color: '#D33' }} onClick={handleBulkDelete}>
                <Icon icon="mdi:trash" className="fs-5" />
              </button>
            )}
          </div>
        </div>

        <div className="card-body">
          {/* Table */}
          <div className="table-responsive">
            <table className="table bordered-table mb-0">
              <thead>
                <tr>
                  <th scope="col">
                    <div className="form-check style-check d-flex align-items-center">
                      <input className="form-check-input" type="checkbox" onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedTypeDocs(currentItems.map(s => s.id));
                        } else {
                          setSelectedTypeDocs([]);
                        }
                      }} checked={selectedTypeDocs.length === currentItems.length && currentItems.length > 0} />
                      <label className="form-check-label">T.D</label>
                    </div>
                  </th>
                  <th scope="col">Nom</th>
                  <th scope="col">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? currentItems.map((typeDoc) => (
                  <tr key={typeDoc.id}>
                    <td>
                      <div className="form-check style-check d-flex align-items-center">
                        <input className="form-check-input" type="checkbox" checked={selectedTypeDocs.includes(typeDoc.id)} onChange={() => toggleTypeDocSelection(typeDoc.id)} />
                        <label className="form-check-label">{typeDoc.id}</label>
                      </div>
                    </td>
                    <td>{typeDoc.nom}</td>
                    <td className="text-end">
                      <div className="d-flex justify-content-end gap-2">
                        <button className="w-32-px h-32-px me-8 bg-primary-light text-primary-600 rounded-circle d-inline-flex align-items-center justify-content-center" onClick={() => handleOpenModal(typeDoc)} title="Modifier">
                          <Icon icon="lucide:edit" />
                        </button>
                        <button className="w-32-px h-32-px me-8 bg-danger-focus text-danger-main rounded-circle d-inline-flex align-items-center justify-content-center" onClick={() => handleDelete(typeDoc.id)} title="Supprimer">
                          <Icon icon="mingcute:delete-2-line" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="3" className="text-center">Aucun type de document trouvé.</td>
                  </tr>
                )}
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
              {/* Previous Button */}
              <button className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover" style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }} onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
                <Icon icon="mdi:chevron-left" className="fs-5" />
              </button>

              {/* Page Numbers */}
              {getPageNumbers().map((number) => (
                <button key={number} className={`d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover ${currentPage === number ? "bg-primary-light text-primary-600" : "bg-light text-secondary"}`} style={{ width: '40px', height: '40px' }} onClick={() => paginate(number)}>
                  {number}
                </button>
              ))}

              {/* Next Button */}
              <button className="d-flex align-items-center justify-content-center rounded-circle shadow-sm p-2 btn-hover" style={{ width: '40px', height: '40px', backgroundColor: '#F1F3F5', color: '#6C757D' }} onClick={() => paginate(currentPage + 1)} disabled={currentPage === totalPages}>
                <Icon icon="mdi:chevron-right" className="fs-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <TypeDocFormModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSubmit={handleSubmitModal}
          initialData={currentTypeDoc}
        />
      )}
    </div>
  );
};

export default TypeDocsListPage;