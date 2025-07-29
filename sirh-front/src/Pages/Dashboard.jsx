import React from 'react';
import { useSelector } from 'react-redux';

import DashboardRh from '../Components/Dashboards/DashboardRh';
import DashbaordChefDep from '../Components/Dashboards/DashbaordChefDep';
import DashboardEmploye from '../Components/Dashboards/DashboardEmploye';
import UpdatePWAButton from '../UpdatePWAButton';
const Dashboard = () => {
  const roles = useSelector((state) => state.auth.roles || []);

  return (
    <div>
            {/* <UpdatePWAButton /> */}

      
  {(() => {
  if (roles.includes("RH")) return <DashboardRh />;
  if (roles.includes("Chef_Dep")) return <DashbaordChefDep />;
  if (roles.includes("Employe")) return <DashboardEmploye />;
})()}

  </div>
  )
};

export default Dashboard;
