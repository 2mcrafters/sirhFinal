import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

// Dégradé pour "Présents"
const COLORS = [
  "url(#presentGradient)", // Présent + En retard
  "#FF7700"                // Absent
];

function PresenceCircleChart({ periode, date, dateDebut, dateFin, mois }) {
  const pointages = useSelector((state) => state.pointages.items || []);
  const users = useSelector((state) => state.users.items || []);
  const departments = useSelector((state) => state.departments.items || []);
  const roles = useSelector((state) => state.auth.roles || []);
  const isRH = roles.includes('RH');
  const isEMP = roles.includes('Employe');
  // Filtres
  const [filtreDepartement, setFiltreDepartement] = useState("");
  const [filtreContrat, setFiltreContrat] = useState("");

  const getUser = (userId) =>
    users.find((u) => u.id === userId || u._id === userId);

  // Filtrage période
  let filteredPointages = [];
  if (periode === "jour") {
    filteredPointages = pointages.filter((p) => p.date === date);
  } else if (periode === "semaine") {
    filteredPointages = pointages.filter(
      (p) => p.date >= dateDebut && p.date <= dateFin
    );
  } else if (periode === "mois") {
    filteredPointages = pointages.filter(
      (p) => p.date && p.date.startsWith(mois)
    );
  }

  // Filtres supplémentaires
  filteredPointages = filteredPointages.filter((p) => {
    const user = getUser(p.user_id);
    if (!user) return false;
    if (filtreDepartement && user.departement_id !== +filtreDepartement)
      return false;
    if (filtreContrat && user.typeContrat !== filtreContrat) return false;
    return true;
  });

  // Fusion Présents + En retard, Absent seul
  const pieData = useMemo(() => {
    let present = 0, absent = 0, retard = 0;
    filteredPointages.forEach((p) => {
      if (p.statutJour === "present") present++;
      if (p.statutJour === "retard") retard++;
      if (p.statutJour === "absent") absent++;
    });
    return [
      { name: "Présents", value: present + retard },
      { name: "Absents", value: absent }
    ];
  }, [filteredPointages]);

  const total = pieData.reduce((sum, d) => sum + d.value, 0);
  const getPercent = v => total ? ((v / total) * 100).toFixed(1) : "0.0";

  // Options dynamiques
  const contratOptions = [
    ...new Set(
      users
        .filter((u) =>
          !filtreDepartement ? true : u.departement_id === +filtreDepartement
        )
        .map((u) => u.typeContrat)
        .filter(Boolean)
    ),
  ];
  const departementOptions = departments;

  // Légende personnalisée pour afficher le pourcentage à droite du texte
  const renderCustomLegend = () => (
    <div style={{ display: "flex", justifyContent: "center", gap: 30, marginTop: 12 }}>
      {pieData.map((entry, idx) => (
        <div key={entry.name} style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 110 }}>
          <div
            style={{
              width: 16,
              height: 16,
              background: COLORS[idx],
              borderRadius: 4,
              display: "inline-block",
              marginRight: 5,
            }}
          />
          <span style={{ fontWeight: 600, fontSize: 15 }}>
            {entry.name}
          </span>
          <span style={{ color: "#888", fontWeight: 500, marginLeft: 6 }}>
            {entry.value}
          </span>
          <span style={{ color: idx === 0 ? "#10B981" : "#FF7700", fontWeight: 700, marginLeft: 6 }}>
            {getPercent(entry.value)}%
          </span>
        </div>
      ))}
    </div>
  );

  return (
    <div className="bg-white rounded shadow-sm p-3 mt-4">
      {isRH && (<div className="d-flex gap-3 align-items-end justify-content-center  mb-3 flex-wrap" >
        <div  className="text-center">
          <label className="fw-semibold mb-1 text-primary">Département</label>
          <select
            className="form-select form-select-sm border-primary"
            style={{ minWidth: 140 }}
            value={filtreDepartement}
            onChange={(e) => setFiltreDepartement(e.target.value)}
          >
            <option value="">Tous</option>
            {departementOptions.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.nom}
              </option>
            ))}
          </select>
        </div></div>)}
        {!isEMP &&(
        <div className="text-center">
          <label className="fw-semibold mb-1 text-primary">Type contrat</label>
          <select
            className="form-select form-select-sm border-primary"
            style={{ minWidth: 140 }}
            value={filtreContrat}
            onChange={(e) => setFiltreContrat(e.target.value)}
          >
            <option value="">Tous</option>
            {contratOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      )}
      
      <h6 className="fw-semibold text-center mb-2">Présence globale</h6>
      <div style={{ height: 270, width: "100%", position: "relative" }}>
        <ResponsiveContainer>
          <PieChart>
            <defs>
              <linearGradient id="presentGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="5%" stopColor="#10B981" />
                <stop offset="90%" stopColor="#2563EB" />
              </linearGradient>
            </defs>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={105}
              dataKey="value"
              nameKey="name"
              paddingAngle={3}
              labelLine={false}
              isAnimationActive
            >
              {pieData.map((entry, i) => (
                <Cell key={i} fill={COLORS[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        {/* PAS de pourcentage au centre */}
      </div>
      {/* Légende custom avec pourcentage à l'extérieur */}
      {renderCustomLegend()}
    </div>
  );
}

export default PresenceCircleChart;
