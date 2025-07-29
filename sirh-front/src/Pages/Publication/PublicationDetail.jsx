import React from 'react';
import { useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Icon } from '@iconify/react';
import './SondageCards.css';

const STATUT_COLORS = {
  publie:  { bg: "#bbf7d0", color: "#166534", icon: "mdi:check-circle" },
  brouillon: { bg: "#f3f4f6", color: "#6b7280", icon: "mdi:file-document-outline" },
  ferme:  { bg: "#fee2e2", color: "#dc2626", icon: "mdi:lock" }
};
const TYPE_COLORS = {
  actualite: { bg: "#bae6fd", color: "#075985", icon: "mdi:newspaper" },
  news:      { bg: "#bae6fd", color: "#075985", icon: "mdi:newspaper" },
  sondage:   { bg: "#fde68a", color: "#a16207", icon: "mdi:poll" }
};

export default function PublicationDetail() {
  const { id } = useParams();
  // On cherche la publication dans le Redux store !
  const publication = useSelector(
    state => state.publications.items.find(pub => String(pub.id) === String(id))
  );
  const user = useSelector(state => state.auth.user);
  const isRH = user && user.role && user.role.toLowerCase().includes('rh');
  const votes = useSelector(state => state.vote.votes);

  if (!publication) {
    return <div className="text-center py-10 text-red-600 font-semibold">Publication non trouvée.</div>;
  }

  const typeBadge = TYPE_COLORS[publication.type] || TYPE_COLORS.actualite;
  const statutBadge = STATUT_COLORS[publication.statut] || STATUT_COLORS.brouillon;

  return (
    <div className="publication-card">
      {/* Header badges */}
      <div className="publication-badges">
        <span
          className="publication-badge"
          style={{ background: typeBadge.bg, color: typeBadge.color }}
        >
          <Icon icon={typeBadge.icon} className="mr-1" /> {publication.type === "sondage" ? "Sondage" : "Actualité"}
        </span>
        <span
          className="publication-badge"
          style={{ background: statutBadge.bg, color: statutBadge.color }}
        >
          <Icon icon={statutBadge.icon} className="mr-1" /> {publication.statut === "publie"
            ? "Publié" : publication.statut === "ferme"
            ? "Fermé" : "Brouillon"}
        </span>
      </div>

      {/* Titre */}
      <div className="publication-title">{publication.titre}</div>

      {/* Texte + Question (si sondage) */}
      <div className="publication-texte">
        {publication.texte}
        {publication.type === 'sondage' && publication.questions && publication.questions[0] && (
          <div className="publication-question mt-3 text-lg font-semibold text-green-700">
            <Icon icon="mdi:help-circle-outline" className="mr-1 text-green-500" />
            {publication.questions[0].question}
          </div>
        )}
      </div>

      {/* Statistiques Sondage */}
      {publication.type === 'sondage' && publication.questions && publication.questions[0] && (
        <div className="my-6">
          <div className="stats-title">Statistiques du sondage</div>
          {/* Compte des votes par réponse */}
          <div className="stats-list">
            {publication.questions[0].answers.map(ans => {
              // On compte les votes du state global pour cette question
              const count = votes.filter(v => (v.answer && v.answer.question_id === publication.questions[0].id && v.answer_id === ans.id)).length;
              return (
                <div key={ans.id} className="stats-chip">
                  <span>{ans.answer}</span>
                  <span className="stats-chip-count">{count}</span>
                </div>
              );
            })}
          </div>
          {/* Liste des votants */}
          <div>
            <h5 className="font-semibold mb-2" style={{ color: '#2563eb' }}>Détail des votes</h5>
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Réponse</th>
                  <th>Téléphone</th>
                </tr>
              </thead>
              <tbody>
                {votes.filter(v => v.answer && v.answer.question_id === publication.questions[0].id).map((vote, idx) => {
                  const user = vote.user || vote.utilisateur || {};
                  const answer = (publication.questions[0].answers || []).find(a => a.id === (vote.answer_id || (vote.answer && vote.answer.id)));
                  return (
                    <tr key={idx}>
                      <td>{user.name || user.nom || user.prenom || user.email || vote.user_id}</td>
                      <td>{answer ? answer.answer : vote.answer_id}</td>
                      <td>{user.tel || user.telephone || '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {/* Pas de vote, pas de SondageVote ! */}
    </div>
  );
}
