
import React, { useState } from 'react';
import { format } from 'date-fns';
import { toast } from 'react-toastify';
import api from '../config/axios';
import './PointagesPageExport.css';
import Swal from 'sweetalert2';

const PointagesPageExport = () => {
  const [exportType, setExportType] = useState('tous');
  const [dateDebut, setDateDebut] = useState(new Date());
  const [dateFin, setDateFin] = useState(new Date());
  const [mois, setMois] = useState(format(new Date(), 'yyyy-MM'));

  const handleExport = async () => {
    let swalLoading;
    try {
      // Affiche un SweetAlert "en attente"
      swalLoading = Swal.fire({
        title: 'Export en cours...',
        text: 'Merci de patienter pendant la génération du fichier.',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
        allowEscapeKey: false,
      });
  
      let params = {};
  
      if (exportType === 'tous') {
        params.exportAll = true;
      } else if (exportType === 'jour') {
        params.specificDate = format(dateDebut, 'yyyy-MM-dd');
      } else if (exportType === 'periode') {
        params.startDate = format(dateDebut, 'yyyy-MM-dd');
        params.endDate = format(dateFin, 'yyyy-MM-dd');
      } else if (exportType === 'mois') {
        params.month = mois;
      }
  
      const response = await api.get('/export-pointages', {
        params,
        responseType: 'blob'
      });
  
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `pointages_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
  
      // Ferme le loading et affiche le succès
      Swal.close();
      Swal.fire({
        icon: 'success',
        title: 'Export réalisé avec succès',
        showConfirmButton: false,
        timer: 1500
      });
    } catch (error) {
      Swal.close();
      Swal.fire({
        icon: 'error',
        title: 'Erreur lors de l\'export',
        text: 'Une erreur est survenue lors de l\'export des pointages.'
      });
      console.error('Erreur lors de l\'export:', error);
    }
  };

  return (
    <div className="export-container">
      <h1>Export des Pointages</h1>
      
      <div className="export-grid">
        <div className="export-item">
          <div className="form-control">
            <label htmlFor="exportType">Type d'export</label>
            <select
              id="exportType"
              value={exportType}
              onChange={(e) => setExportType(e.target.value)}
              className="select-input"
            >
              <option value="tous">Tous les pointages</option>
              <option value="jour">Jour spécifique</option>
              <option value="periode">Période</option>
              <option value="mois">Mois</option>
            </select>
          </div>
        </div>

        {exportType === 'jour' && (
          <div className="export-item">
            <div className="form-control">
              <label htmlFor="date">Date</label>
              <input
                type="date"
                id="date"
                value={format(dateDebut, 'yyyy-MM-dd')}
                onChange={(e) => setDateDebut(new Date(e.target.value))}
                className="date-input"
              />
            </div>
          </div>
        )}

        {exportType === 'periode' && (
          <>
            <div className="export-item">
              <div className="form-control">
                <label htmlFor="dateDebut">Date de début</label>
                <input
                  type="date"
                  id="dateDebut"
                  value={format(dateDebut, 'yyyy-MM-dd')}
                  onChange={(e) => setDateDebut(new Date(e.target.value))}
                  className="date-input"
                />
              </div>
            </div>
            <div className="export-item">
              <div className="form-control">
                <label htmlFor="dateFin">Date de fin</label>
                <input
                  type="date"
                  id="dateFin"
                  value={format(dateFin, 'yyyy-MM-dd')}
                  onChange={(e) => setDateFin(new Date(e.target.value))}
                  className="date-input"
                />
              </div>
            </div>
          </>
        )}

        {exportType === 'mois' && (
          <div className="export-item">
            <div className="form-control">
              <label htmlFor="mois">Mois</label>
              <input
                type="month"
                id="mois"
                value={mois}
                onChange={(e) => setMois(e.target.value)}
                className="date-input"
              />
            </div>
          </div>
        )}

        <div className="export-item full-width">
          <button className="export-button" onClick={handleExport}>
            Exporter
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointagesPageExport;