import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

// Palette personnalisée (modifie ou étends selon les types)
const COLORS = ["#2563EB", "#F59E0B", "#10B981", "#6366F1", "#EF4444", "#EAB308"];

function ContractTypeCircleChart({ periode, date, dateDebut, dateFin, mois }) {
  const pointages = useSelector((state) => state.pointages.items || []);
  const users = useSelector((state) => state.users.items || []);
  const departments = useSelector((state) => state.departments.items || []);
  const roles = useSelector((state) => state.auth.roles || []);
  const isRH = roles.includes('RH');
  const isCD = roles.includes('Chef_Dep');
  const [filtreDepartement, setFiltreDepartement] = useState("");

  // Filtrage de pointages par période
  let filteredPointages = [];
  if (periode === "jour") {
    filteredPointages = pointages.filter((p) => p.date === date);
  } else if (periode === "semaine") {
    filteredPointages = pointages.filter((p) => p.date >= dateDebut && p.date <= dateFin);
  } else if (periode === "mois") {
    filteredPointages = pointages.filter((p) => p.date && p.date.startsWith(mois));
  }

  // Trouver les userIds uniques ayant pointé dans la période
  const presentUserIds = [
    ...new Set(filteredPointages.map((p) => p.user_id)),
  ];

  // Filtrer les utilisateurs présents dans la période et (si filtre) du département
  const filteredUsers = users.filter((u) =>
    presentUserIds.includes(u.id || u._id) &&
    (!filtreDepartement || u.departement_id === +filtreDepartement)
  );

  // Groupement par type de contrat
  const pieData = useMemo(() => {
    const map = {};
    filteredUsers.forEach((u) => {
      const type = u.typeContrat || "Non spécifié";
      map[type] = (map[type] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [filteredUsers]);

  // Pourcentages pour affichage
  const total = pieData.reduce((sum, d) => sum + d.value, 0);

  return (
    <div className="bg-white rounded shadow-sm p-3 mt-4" style={{    placeItems: 'center'}} >
      {isRH && (

<div className="text-center">
<label className="fw-semibold mb-1 text-primary">Département</label>
<select
  className="form-select form-select-sm border-primary"
  style={{ minWidth: 140, maxWidth: 220 }}
  value={filtreDepartement}
  onChange={(e) => setFiltreDepartement(e.target.value)}
>
  <option value="">Tous</option>
  {departments.map((opt) => (
    <option key={opt.id} value={opt.id}>
      {opt.nom}
    </option>
  ))}
</select>
</div>
      )}

      
      <h6 className="fw-semibold text-center my-2">
        Répartition des types de contrat
      </h6>
      <div style={{ height: 270, width: "100%", position: "relative" }}>
        <ResponsiveContainer>
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              dataKey="value"
              nameKey="name"
              labelLine={false}
              paddingAngle={2}
              isAnimationActive
              label={({ name, value }) =>
                `${name} (${total ? ((value / total) * 100).toFixed(0) : 0}%)`
              }
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="d-flex justify-content-center gap-3 mt-2 flex-wrap">
        {pieData.map((item, idx) => (
          <span key={idx} className="fw-semibold" style={{ color: COLORS[idx % COLORS.length] }}>
            {item.name}: {item.value} 
            {" ("}
            {total ? ((item.value / total) * 100).toFixed(0) : 0}
            {"%)"}
          </span>
        ))}
      </div>
    </div>
  );
}

export default ContractTypeCircleChart;
