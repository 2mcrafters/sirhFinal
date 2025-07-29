import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Icon } from "@iconify/react";
import Swal from "sweetalert2";
import { uploadDocument, deleteDocument, fetchUserDocs } from "../Redux/Slices/userDocsSlice"; // Assure-toi d'avoir ces actions

// Helper pour obtenir la liste complète des types/documents pour un user
function getAllUserDocsForUser(userDocsPivotArray, typeDocs, user_id) {
  const mapByType = {};
  userDocsPivotArray.forEach(doc => {
    mapByType[doc.type_doc_id] = doc;
  });
  return typeDocs.map(typeDoc => {
    if (mapByType[typeDoc.id]) {
      return { ...mapByType[typeDoc.id], type_doc_nom: typeDoc.nom };
    } else {
      return {
        id: `empty-${typeDoc.id}`,
        user_id: user_id,
        type_doc_id: typeDoc.id,
        type_doc_nom: typeDoc.nom,
        is_provided: 0,
        file_path: null,
      };
    }
  });
}

const UserDocsPage = () => {
  const dispatch = useDispatch();
  const userDocs = useSelector((state) => state.userDocs.items); // [[pivot,pivot,...],...]
  const users = useSelector((state) => state.users.items);       // [{id, name, ...}]
  const typeDocs = useSelector((state) => state.typeDocs.items); // [{id, nom, ...}]
  const departments = useSelector((state) => state.departments?.items || []);
  const roles = useSelector((state) => state.auth.roles || []);

  // Accordéon ouvert
  const [openUser, setOpenUser] = useState(null);
  // Fichier sélectionné à uploader (clé: `${user_id}-${type_doc_id}`)
  const [selectedFiles, setSelectedFiles] = useState({});
  // Pour loader bouton upload
  const [uploading, setUploading] = useState({});
  // Filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [onlyCompleted, setOnlyCompleted] = useState(''); // 'complet', 'incomplet', ''

  // Filtrage users
  const getFilteredUsers = () => {
    return users.filter(user => {
      // Filtre search
      const term = searchTerm.toLowerCase();
      const matchSearch =
        (user.name || '').toLowerCase().includes(term) ||
        (user.prenom || '').toLowerCase().includes(term) ||
        (user.cin || '').toLowerCase().includes(term);

      // Filtre département
      const matchDept = !selectedDepartment || user.departement_id === Number(selectedDepartment);

      // Filtre complet/incomplet
      let matchComplete = true;
      if (onlyCompleted) {
        // Récupère la liste de tous les docs de ce user
        const userDocList = (userDocs.find(arr => arr[0]?.user_id === user.id)) || [];
        const allDocs = getAllUserDocsForUser(userDocList, typeDocs, user.id);
        const nbFournis = allDocs.filter(d => d.is_provided).length;
        if (onlyCompleted === "complet") matchComplete = nbFournis === typeDocs.length;
        if (onlyCompleted === "incomplet") matchComplete = nbFournis !== typeDocs.length;
      }
      return matchSearch && matchDept && matchComplete;
    });
  };

  // Actions
  const handleFileChange = (user_id, type_doc_id, file) => {
    setSelectedFiles((prev) => ({
      ...prev,
      [`${user_id}-${type_doc_id}`]: file
    }));
  };

  const handleUpload = async (user_id, type_doc_id) => {
    const key = `${user_id}-${type_doc_id}`;
    const file = selectedFiles[key];
    if (!file) return;
    setUploading(prev => ({ ...prev, [key]: true }));
    try {
      await dispatch(uploadDocument({ userId: user_id, typeDocId: type_doc_id, file })).unwrap();
      Swal.fire('Succès', 'Document envoyé !', 'success');
      setSelectedFiles(prev => {
        const ns = { ...prev };
        delete ns[key];
        return ns;
      });
      dispatch(fetchUserDocs()); // Pour recharger l'état global
    } catch (e) {
      Swal.fire('Erreur', "Impossible d'envoyer le fichier", 'error');
    }
    setUploading(prev => ({ ...prev, [key]: false }));
  };

  const handleDelete = async (user_id, type_doc_id) => {
    if (!window.confirm("Supprimer ce document ?")) return;
    await dispatch(deleteDocument({ userId: user_id, typeDocId: type_doc_id })).unwrap();
    dispatch(fetchUserDocs());
  };

  // La card du document
  const DocCard = ({ doc, user_id }) => {
    const key = `${user_id}-${doc.type_doc_id}`;
    const fileSelected = !!selectedFiles[key];
    const isUploading = !!uploading[key];

    return (
      <div
  className="p-3 rounded shadow-sm h-100 d-flex flex-column justify-content-between"
  style={{
    background: doc.is_provided
      ? "linear-gradient(120deg, rgb(144 235 162 / 49%) 0%, rgb(255 255 255) 100%)"
      : "linear-gradient(120deg, rgb(235 144 144 / 49%) 0%, rgb(255, 255, 255) 100%)",
    color: "#23272f", // texte foncé sur vert/rouge clair
    border: "1px solid #f0f0f0"
  }}
>
        <div>
          <div className="fw-semibold mb-1 d-flex align-items-center gap-2">
            <span>{doc.type_doc_nom || `Type doc id: ${doc.type_doc_id}`}</span>
            {doc.is_provided
              ? <Icon icon="mdi:check-circle" color="#34c38f" width={20} />
              : <Icon icon="mdi:alert-circle-outline" color="#f46a6a" width={20} />}
          </div>
          {/* <div className="mb-2 small text-break">
            {doc.file_path && (
              <span>
                <Icon icon="mdi:file" width={16} />{" "}
                {doc.file_path.split("/").pop()}
              </span>
            )}
          </div> */}
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap mt-2">
          {doc.is_provided && (
            <>
              <a
                href={`${import.meta.env.VITE_API_URL}storage/${doc.file_path}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Voir"
                className="btn btn-link btn-sm p-0 m-0"
                style={{ color: "#2878c5" }}
              >
                <Icon icon="mdi:eye" width={22} />
              </a>

              {/* {roles.includes("RH")&& ( */}
                <button
                  className="btn btn-link btn-sm p-0 m-0"
                  title="Supprimer"
                  onClick={() => handleDelete(user_id, doc.type_doc_id)}
                  disabled={isUploading}
                  style={{ color: "#f46a6a" }}
                >
                  <Icon icon="mdi:trash" width={22} />
                </button>
              {/* )} */}
             
            </>
          )}
          {/* Ajouter/modifier */}

          {/* {!doc.is_provided && !roles.includes('RH') && ( */}
            <label
              className="btn btn-link btn-sm p-0 m-0"
              title={doc.is_provided ? "Remplacer" : "Ajouter"}
              style={{ color: "#fbbf24" }}
            >
              <Icon icon="mdi:upload" width={22} />
              <input
                type="file"
                className="d-none"
                onChange={e => handleFileChange(user_id, doc.type_doc_id, e.target.files[0])}
              disabled={isUploading}
            />
          </label>
          {/* Bouton upload */}
          {fileSelected && (
            <button
              className="btn btn-link btn-sm p-0 m-0"
              onClick={() => handleUpload(user_id, doc.type_doc_id)}
              disabled={isUploading}
              title="Envoyer"
              style={{ color: "#2878c5" }}
            >
              <Icon icon={isUploading ? "mdi:loading" : "mdi:cloud-upload"} className={isUploading ? "fa-spin" : ""} width={22} />
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Documents des utilisateurs</h2>

      {/* Filtres */}
      <div className="row g-3 align-items-end mb-4">
        <div className="col-md-4">
          <input
            className="form-control"
            placeholder="Rechercher nom, prénom ou CIN..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={selectedDepartment}
            onChange={e => setSelectedDepartment(e.target.value)}
          >
            <option value="">Département</option>
            {departments.map(dep => (
              <option key={dep.id} value={dep.id}>{dep.nom}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select"
            value={onlyCompleted}
            onChange={e => setOnlyCompleted(e.target.value)}
          >
            <option value="">Tous</option>
            <option value="complet">Utilisateurs complets</option>
            <option value="incomplet">Utilisateurs incomplets</option>
          </select>
        </div>
      </div>

      <div className="accordion" id="userDocsAccordion">
        {getFilteredUsers().map((user) => {
          // Cherche la liste des docs de ce user dans userDocs (tableau de tableaux)
          const userDocList = (userDocs.find(arr => arr[0]?.user_id === user.id)) || [];
          const allDocsForUser = getAllUserDocsForUser(userDocList, typeDocs, user.id);
          const nbFournis = allDocsForUser.filter(d => d.is_provided).length;

          return (
            <div className="accordion-item mb-2" key={user.id}>
              <h2 className="accordion-header" id={`heading-${user.id}`}>
                <button
                  className={`accordion-button d-flex align-items-center justify-content-between ${openUser === user.id ? "" : "collapsed"}`}
                  type="button"
                  aria-expanded={openUser === user.id ? "true" : "false"}
                  aria-controls={`collapse-${user.id}`}
                  onClick={() => setOpenUser(openUser === user.id ? null : user.id)}
                  style={{
                    background: openUser === user.id
                      ? "#ffffff"
                      : "#ffffff"
                  }}
                >
                  <span className="fw-bold me-2">
                    {user.name} {user.prenom}
                  </span>
                  <span className="ms-2 text-muted small">CIN: {user.cin || "-"}</span>
                  <span className={`badge ${nbFournis === typeDocs.length ? "bg-success" : "bg-danger"} ms-2`}>
                    {nbFournis === typeDocs.length ? "Complet" : `Non complet (${nbFournis}/${typeDocs.length})`}                  </span>
                </button>
              </h2>
              <div
                id={`collapse-${user.id}`}
                className={`accordion-collapse collapse ${openUser === user.id ? "show" : ""}`}
                aria-labelledby={`heading-${user.id}`}
                data-bs-parent="#userDocsAccordion"
              >
                <div className="accordion-body bg-light">
                  <div className="row">
                    {allDocsForUser.map((doc) => (
                      <div className="col-12 col-md-6 col-lg-4 mb-3" key={doc.type_doc_id}>
                        <DocCard doc={doc} user_id={user.id} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default UserDocsPage;
