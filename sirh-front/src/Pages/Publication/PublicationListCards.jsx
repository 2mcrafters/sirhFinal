import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPublications } from '../../Redux/Slices/publicationSlice';
import { Icon } from '@iconify/react';
import './SondageCards.css'; // RÉUTILISATION DU CSS !

const borderClasses = [
  "border-blue",
  "border-orange",
  "border-purple",
  "border-pink",
  "border-green",
  "border-yellow"
];

export default function PublicationListCards() {
  const dispatch = useDispatch();
  const { items: publications, loading } = useSelector(state => state.publications);

  useEffect(() => {
    dispatch(fetchPublications());
  }, [dispatch]);

  // Filtrer uniquement les actualités (type news ou actualite)
  const actualites = publications.filter(pub => pub.type === 'news' || pub.type === 'actualite');

  if (loading === 'loading') {
    return <div className="text-center py-10 text-gray-500">Chargement…</div>;
  }

  return (
    <div className="container py-6">
      <h2 className="text-2xl font-bold mb-7 flex items-center gap-2">
        <Icon icon="mdi:newspaper" className="text-blue-600" /> Actualités
      </h2>
      <div className="sondage-grid">
        {actualites.length === 0 && (
          <div className="col-span-full text-gray-400 text-center font-semibold">Aucune actualité disponible.</div>
        )}
        {actualites.map((pub, idx) => (
          <div key={pub.id} className={`sondage-card ${borderClasses[idx % borderClasses.length]}`}>
            <div className="sondage-header">
              <Icon icon="mdi:newspaper" className="text-xl" />
              <span>{pub.titre}</span>
            </div>
            <div className="sondage-body">
              <div className="sondage-question">{pub.texte}</div>
              <div className="sondage-meta">
                <span>Créé le {new Date(pub.created_at).toLocaleDateString()}</span>
                {pub.statut !== 'publie' && (
                  <span className="text-orange-600 font-semibold">Non publié</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
