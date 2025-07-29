import MasterLayout from './masterLayout/MasterLayout'
import { Route, Routes, useNavigate } from 'react-router-dom'
import Login from './Pages/Login2'
import Dashboard from './Pages/Dashboard'
import ViewProfileLayer from './Pages/ViewProfileLayer'
import { AuthProvider } from './context/AuthContext'
import PresenceDashboard from './Components/Statistique/PresenceDashboard'
import UserPointagesPeriode from './Components/Statistique/UserPointagesPeriode'
import BulkAddDepartmentPage from './Pages/BulkAddDepartmentPage'
import DepartmentsListPage from './Pages/DepartmentsListPage'
import EditDepartmentPage from './Pages/EditDepartmentPage'
import UsersListPage from './Pages/UsersListPage'
import UserFormPage from './Pages/UserFormPage'
import AbsenceRequestsListPage from './Pages/AbsenceRequestsListPage'
import AddAbsenceRequestPage from './Pages/AddAbsenceRequestPage'
import EditAbsenceRequestPage from './Pages/EditAbsenceRequestPage'
import PointagesListPage from './Pages/PointagesListPage'
import AddPointagePage from './Pages/AddPointagePage'
import EditPointagePage from './Pages/EditPointagePage'
import PrivateRoute from './PrivateRoute'
import NotFound from './Pages/NotFound'
import SocietesListPage from './Pages/SocietesListPage'; // Ajout de l'import pour la page des sociétés
import TemporaireEmployesPage from './Pages/TemporaireEmployesPage'; // Ajout de l'import pour la page des sociétés
import AbsenceRequestsCalendar from './Pages/AbsenceRequestsCalendar';
import PointagesPage from './Pages/PointagesPageExport';
import "./degrade.css"
import TypeDocsListPage from './Pages/TypeDocsListPage';
import UserDocsPage from './Pages/UserDocsPage';
import PointagePage from './Pages/PointagePage'
import PublicationList from './Pages/Publication/PublicationList';
import PublicationDetail from './Pages/Publication/PublicationDetail';
import PublicationCreate from './Pages/Publication/PublicationCreate';
import PublicationListCards from './Pages/Publication/PublicationListCards';
import SondageListCards from './Pages/Publication/SondageListCards';
import OneSignal from 'react-onesignal'; // Make sure you have this package installed
import ModalNotif from './ModalNotif'
//fetch slices

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from './Redux/Slices/userSlice';
import { fetchUsersTemp } from './Redux/Slices/userSlice';
import { fetchDepartments } from './Redux/Slices/departementSlice';
import { fetchAbsenceRequests } from './Redux/Slices/absenceRequestSlice';
import { fetchPointages } from './Redux/Slices/pointageSlice';
import { fetchPresenceStats } from './Redux/Slices/presenceStatsSlice';
import { fetchSocietes } from './Redux/Slices/societeSlice';
import {fetchUserDocs} from './Redux/Slices/userDocsSlice';
import {fetchTypeDocs} from './Redux/Slices/typeDocSlice';
import { fetchPublications } from './Redux/Slices/publicationSlice'
import { fetchVotes } from './Redux/slices/voteSlice'
import OneSignalSetup from './OneSignalSetup'


const updateFavicon = (url) => {
  const favicon = document.getElementById("dynamic-favicon");
  if (favicon) {
    favicon.href = url;
  }
};
const App = () => {
  const dispatch = useDispatch();
  const auth = useSelector((state) => state.auth);
  const user = useSelector((state) => state.auth.user);
  const isAuthenticated = useSelector((state) => state.auth.isAuthenticated);
  const playerId = OneSignalSetup();


  // Charger les données après auth
  useEffect(() => {
    if (auth.isAuthenticated) {
      dispatch(fetchUserData());
      dispatch(fetchNotifications());
    }
  }, [auth.isAuthenticated, dispatch]);


  useEffect(() => {
    if (auth.isSuccess && auth.token) {
      dispatch(fetchUsers());
      dispatch(fetchUsersTemp());
      dispatch(fetchDepartments());
      dispatch(fetchAbsenceRequests());
      dispatch(fetchPointages());
      dispatch(fetchSocietes());
      dispatch(fetchTypeDocs())
      dispatch(fetchUserDocs())
      dispatch(fetchPublications());
      dispatch(fetchVotes());
      
  
      const currentMonth = new Date().toISOString().slice(0, 7);
      dispatch(fetchPresenceStats({ periode: 'mois', mois: currentMonth }));
    }
  }, [auth.isSuccess, auth.token, dispatch]);
  
  const societe_id = useSelector((state) => state.auth.user?.societe_id);

  useEffect(() => {
    const getFaviconUrl = () => {
      if (societe_id === 1) return "/assets/smee.webp";
      if (societe_id === 2) return "/assets/dct.webp";
      return "/assets/default.webp";
    };

    const faviconUrl = getFaviconUrl();
    updateFavicon(faviconUrl);

  }, [societe_id]);


  return (
    <AuthProvider>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />
      <Route path="/Notif" element={<ModalNotif />} />

        {/* Protected routes with MasterLayout */}
        <Route element={  <PrivateRoute requirePlayerId={false}>
                            <MasterLayout />
                          </PrivateRoute>}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/view-profile" element={<ViewProfileLayer />} />
          <Route path='/dashboard' element={<Dashboard/>} />
          <Route path='/statistiques' element={<PresenceDashboard/>} />
          <Route path='/pointagedetails'element={<UserPointagesPeriode userId={user?.id} />} />

          <Route path="users" element={<UsersListPage />} />
        <Route path="users/add" element={<UserFormPage />} />
        <Route path="users/:id/edit" element={<UserFormPage />} />
        <Route path="users/temp" element={<TemporaireEmployesPage />} />
       
        <Route path="societes" element={<SocietesListPage />} />
    
          {/* Department routes */}
          <Route path="/departments" element={<DepartmentsListPage />} />
          <Route path="/departments/add" element={<BulkAddDepartmentPage />} />
          <Route path="/departments/:id/edit" element={<EditDepartmentPage />} />
          
     
          {/* Absence request routes */}
          <Route path="/absences" element={<AbsenceRequestsListPage />} />
          <Route path="/absences/calendar" element={<AbsenceRequestsCalendar/>} />
          <Route path="/absences/add" element={<AddAbsenceRequestPage />} />
          <Route path="/absences/:id/edit" element={<EditAbsenceRequestPage />} />
          
          {/* Pointage routes */}
          <Route path="/pointages" element={<PointagePage />} />
          {/* <Route path="/pointages" element={<PointagesListPage />} /> */}
          <Route path="/pointages/add" element={<AddPointagePage />} />
          <Route path="/pointages/:id/edit" element={<EditPointagePage />} />
          <Route path="/export" element={<PointagesPage />} />
          <Route path="/type-docs" element={<TypeDocsListPage />} />
          <Route path="/documents" element={<UserDocsPage />} />

      {/* Route Notif accessible sans PrivateRoute */}



          <Route path="/publications" element={user && user.role && user.role.toLowerCase().includes('rh') ? <PublicationList /> : <PublicationListCards />} />
          <Route path="/sondages" element={<SondageListCards />} />
          <Route path="/publications/:id" element={<PublicationDetail />} />
          <Route path="/publications/nouveau" element={<PublicationCreate />} />
*          {/* Page introuvable */}
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </AuthProvider>
  )
}

export default App