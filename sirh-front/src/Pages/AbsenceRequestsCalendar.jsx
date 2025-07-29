

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAbsenceRequests } from '../Redux/Slices/absenceRequestSlice';
import { fetchUsers } from '../Redux/Slices/userSlice';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import Swal from 'sweetalert2';

import "../assets/css/fullcalendar.css";

const AbsenceRequestsListPage = () => {
  const dispatch = useDispatch();
  const { items: absenceRequests, status, error } = useSelector((state) => state.absenceRequests);
  const { items: users } = useSelector((state) => state.users);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    dispatch(fetchAbsenceRequests());
    dispatch(fetchUsers());
  }, [dispatch]);

  useEffect(() => {
    const approvedRequests = absenceRequests.filter((request) => request.statut === 'approuvé');

    const formattedEvents = approvedRequests.map((request) => {
      const user = users.find(u => u.id === request.user_id);
      return {
        id: request.id,
        title: user ? `${user.name} ${user.prenom}` : 'Utilisateur inconnu',
        start: request.dateDebut,
        end: request.dateFin,
        backgroundColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
        borderColor: `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`,
        textColor: '#FFFFFF',
        extendedProps: {
          motif: request.motif,
          type: request.type,
        }
      };
    });

    setEvents(formattedEvents);
  }, [absenceRequests, users]);

  const handleEventClick = (info) => {
    const { title, start, end, extendedProps } = info.event;
    Swal.fire({
      title: title,
      html: `
        <div style="text-align: left;">
          <strong>Motif:</strong> ${extendedProps.motif || 'Non spécifié'}<br/>
          <strong>Type:</strong> ${extendedProps.type}<br/>
          <strong>Du:</strong> ${new Date(start).toLocaleDateString()}<br/>
          <strong>Au:</strong> ${new Date(end).toLocaleDateString()}
        </div>
      `,
      icon: 'info',
      confirmButtonColor: '#34c38f'
    });
  };

  return (
    <div className="container-fluid py-4">
      <h3 className="text-center mb-4" style={{ color: '#4A5568' }}>Demandes d'absence approuvées</h3>
      <div className="calendar-container shadow p-3 mb-5 bg-white rounded" style={{ borderRadius: '12px', overflow: 'hidden' }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          events={events}
          eventClick={handleEventClick}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,dayGridWeek,dayGridDay'
          }}
          height="auto"
        />
      </div>
    </div>
  );
};

export default AbsenceRequestsListPage;
