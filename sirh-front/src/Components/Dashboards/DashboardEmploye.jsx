import React from 'react'
import PointagePage from "../../Pages/PointagePage"
import AbsenceRequestsListPage from "../../Pages/AbsenceRequestsListPage"
import DepartmentsListPage from "../../Pages/DepartmentsListPage"
import PresenceDashboard from '../Statistique/PresenceDashboard'
function DashboardEmploye() {

  return (

    <div className='row'>
        <div className="col-12">
            <PresenceDashboard isDashboard={true}/>
        </div>
        <div className="col-12 col-md-12 gap-2">
      <PointagePage/>
      </div>
      
    </div>
  )
}

export default DashboardEmploye
