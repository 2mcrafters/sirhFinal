
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../Slices/authSlice';
import presenceStatsReducer from '../Slices/presenceStatsSlice';
import userReducer from '../Slices/userSlice';
import departmentReducer from '../Slices/departementSlice';
import absenceRequestReducer from '../Slices/absenceRequestSlice';
import pointageReducer from '../Slices/pointageSlice';
import societeReducer from '../Slices/societeSlice'; // Assurez-vous que ce chemin est correct et que le fichier existe
import typeDocReducer from '../Slices/typeDocSlice';
import userDocsReducer from '../Slices/userDocsSlice';
import publicationsReducer from '../Slices/publicationSlice'
import voteReducer from '../Slices/voteSlice'
export const store = configureStore({
  reducer: {
    auth: authReducer,
    presence: presenceStatsReducer, 
    users: userReducer,
    departments: departmentReducer,
    absenceRequests: absenceRequestReducer,
    pointages: pointageReducer,
    societes: societeReducer,
    typeDocs: typeDocReducer,
    userDocs: userDocsReducer,
    publications: publicationsReducer,
    vote: voteReducer,
  }
});
