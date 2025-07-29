import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import SondageVote from './SondageVote';
import { Icon } from '@iconify/react';
import './SondageCards.css';

const borderClasses = [
  "border-green",
  "border-blue",
  "border-orange",
  "border-pink",
  "border-purple",
  "border-yellow"
];


export default function SondageList() {
  const dispatch = useDispatch();
  const { items: publications, loading } = useSelector(state => state.publications);
  const { votes } = useSelector(state => state.vote);
  const user = useSelector(state => state.auth.user);
  const [blockedIds, setBlockedIds] = React.useState([]);

  const sondages = publications.filter(pub => pub.type === 'sondage');

  // Si l'utilisateur a déjà voté à ce sondage (backend ou local)
  const hasVotedFor = (pub) => {
    const question = pub.questions?.[0];
    if (!question || !user) return false;
    return (
      votes.some(v => v.answer && v.answer.question_id === question.id && v.user_id === user.id)
      || blockedIds.includes(pub.id)
    );
  };

  const handleVoted = (pubId) => {
    setBlockedIds(ids => [...ids, pubId]);
  };

  if (loading === 'loading') {
    return <div className="text-center py-10 text-gray-500">Chargement…</div>;
  }

  return (
    <div className="container py-6">
      <h2 className="text-2xl font-extrabold mb-7 flex items-center gap-2">
        <Icon icon="mdi:poll" className="text-green-600" /> Sondages
      </h2>
      <div className="sondage-grid">
        {sondages.length === 0 && (
          <div className="col-span-full text-gray-400 text-center font-semibold">Aucun sondage disponible.</div>
        )}
        {sondages.map((pub, idx) => {
          const blocked = hasVotedFor(pub);
          return (
            <div key={pub.id} className={`sondage-card ${borderClasses[idx % borderClasses.length]}${blocked ? ' sondage-card-blocked' : ''}`}>
              <div className="sondage-header">
                <Icon icon="mdi:poll" className="text-xl" />
                <span>{pub.titre}</span>
              </div>
              <div className="sondage-body">
                <div className="sondage-question">{pub.texte}</div>
                {blocked ? (
                  <div className="flex flex-col items-center justify-center py-6">
                    <span className="text-gray-700 font-bold mb-2">Vous avez déjà voté</span>
                    <div className="sondage-chips">
                      {(() => {
                        const question = pub.questions?.[0];
                        let answerId = null;
                        if (question && user) {
                          let vote = votes.find(v => v.answer && v.answer.question_id === question.id && v.user_id === user.id);
                          if (!vote) {
                            vote = (pub.votes || []).find(v => v.user_id === user.id || (v.user && v.user.id === user.id));
                          }
                          if (vote) {
                            answerId = vote.answer_id || (vote.answer && vote.answer.id);
                          }
                        }
                        return question && question.answers.map((ans, idx) => {
                          const isSelected = ans.id === answerId;
                          let extraColor = "";
                          // Toujours donner une couleur random si pas oui/non
                          const lower = (ans.answer || '').trim().toLowerCase();
                          if (lower === 'oui' || lower === 'yes') extraColor = 'sondage-chip-green';
                          else if (lower === 'non' || lower === 'no') extraColor = 'sondage-chip-red';
                          else extraColor = borderClasses[idx % borderClasses.length].replace('border-', 'sondage-chip-');
                          return (
                            <span
                              key={ans.id}
                              className={`sondage-chip ${isSelected ? 'selected' : ''} ${extraColor}`}
                              style={isSelected ? {
                                background: 'linear-gradient(90deg,#22c55e 60%,#4ade80 100%)',
                                color: '#fff',
                                fontWeight: 'bold',
                                boxShadow: '0 0 12px #22c55e',
                                border: '2px solid #22c55e',
                                animation: 'pulse 1.2s infinite',
                              } : {}}
                            >
                              {ans.answer} {isSelected && <Icon icon="mdi:check-circle" className="ml-2 text-white" style={{fontSize:22}} />}
                            </span>
                          );
                        });
                      })()}
                    </div>
                    <style>{`
                      @keyframes pulse {
                        0% { box-shadow: 0 0 0 0 #22c55e99; }
                        70% { box-shadow: 0 0 0 10px #22c55e00; }
                        100% { box-shadow: 0 0 0 0 #22c55e99; }
                      }
                    `}</style>
                  </div>
                ) : (
                  <SondageVote
                    publication={pub}
                    canVote={pub.statut === 'publie' && !blocked}
                    onVoted={() => handleVoted(pub.id)}
                  />
                )}
                <div className="sondage-meta">
                  <span>Créé le {new Date(pub.created_at).toLocaleDateString()}</span>
                  {pub.statut !== 'publie' && (
                    <span className="text-orange-600 font-semibold">Non ouvert</span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
