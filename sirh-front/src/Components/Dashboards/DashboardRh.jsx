import React from 'react'
import UsersListPage from "../../Pages/UsersListPage"
import AbsenceRequestsListPage from "../../Pages/AbsenceRequestsListPage"
import DepartmentsListPage from "../../Pages/DepartmentsListPage"
import PresenceDashboard from '../Statistique/PresenceDashboard'
function DashboardRh() {

  return (

    <div className='row'>
        <div className="col-12">
            <PresenceDashboard />
        </div>
       
      <div className="col-12">
      <AbsenceRequestsListPage statusFilter={['validé', 'en_attente']} className="mb-2" />

      </div>
    </div>
  )
}

export default DashboardRh
