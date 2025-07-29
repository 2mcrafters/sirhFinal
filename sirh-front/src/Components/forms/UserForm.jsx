import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createUser, updateUser } from '../../Redux/Slices/userSlice';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { fetchDepartments } from '../../Redux/Slices/departementSlice';
import { fetchSocietes } from '../../Redux/Slices/societeSlice'; // Ajouter l'importation pour fetchSocietes
import { fetchUsers } from '../../Redux/Slices/userSlice'; // Ajouter l'importation pour fetchSocietes
import Swal from 'sweetalert2';

const UserForm = ({ initialValues = {}, isEdit = false, onSuccess }) => {
  const dispatch = useDispatch();
  const { status } = useSelector(state => state.users);
  const { items: departments } = useSelector(state => state.departments);
  const { items: societes } = useSelector(state => state.societes); // Récupérer les sociétés depuis le store

  React.useEffect(() => {
    dispatch(fetchDepartments());
    dispatch(fetchSocietes()); // Dispatch pour récupérer les sociétés
  }, [dispatch]);

  const validationSchema = Yup.object({
    cin: Yup.string().nullable('Le CIN est requis').max(20, 'Le CIN ne doit pas dépasser 20 caractères'),
    sex: Yup.string().nullable('Le sexe est requis').oneOf(['H', 'F'], 'Valeur de sexe invalide'),
date_sortie: Yup.date().nullable(),
cnss: Yup.string().nullable().max(30, 'Le numéro CNSS ne doit pas dépasser 30 caractères'),
solde_conge: Yup.number()
  .nullable()
  .min(0, 'Le solde ne peut pas être négatif')
  .max(365, 'Le solde ne peut pas dépasser 365 jours'),
dateEmbauche: Yup.date().nullable('La date d\'embauche est requise'),
    rib: Yup.string().nullable('Le RIB est requis').max(32, 'Le RIB ne doit pas dépasser 32 caractères'),
    situationFamiliale: Yup.string()
      .nullable('La situation familiale est requise')
      .oneOf(['Célibataire', 'Marié', 'Divorcé'], 'Situation familiale invalide'),
    nbEnfants: Yup.number()
      .nullable('Le nombre d\'enfants est requis')
      .min(0, 'Le nombre d\'enfants ne peut pas être négatif'),
    adresse: Yup.string()
      .nullable('L\'adresse est requise')
      .max(255, 'L\'adresse ne doit pas dépasser 255 caractères'),
    name: Yup.string()
      .nullable('Le nom est requis')
      .max(50, 'Le nom ne doit pas dépasser 50 caractères'),
    prenom: Yup.string()
      .nullable('Le prénom est requis')
      .max(50, 'Le prénom ne doit pas dépasser 50 caractères'),
    tel: Yup.string()
      .nullable('Le numéro de téléphone est requis')
      .max(20, 'Le numéro de téléphone ne doit pas dépasser 20 caractères'),
      information_supplementaire: Yup.string().nullable(),
      information_supplementaire2: Yup.string().nullable(),
    email: Yup.string()
      .nullable('L\'email est requis')
      .email('Email invalide'),
    password: isEdit ? Yup.string() : Yup.string()
      .nullable('Le mot de passe est requis')
      .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
    role: Yup.string()
      .oneOf(['Employe', 'Chef_Dep', 'RH', ''], 'Rôle invalide')
      .test('role-validation', 'Rôle invalide', function(value) {
        if (isEdit) {
          // In edit mode, allow empty value to keep existing role
          return true;
        }
        // In create mode, require a valid role
        return ['Employe', 'Chef_Dep', 'RH'].includes(value);
      }),
    typeContrat: Yup.string()
      .nullable('Le type de contrat est requis')
      .oneOf(['Permanent', 'Temporaire'], 'Type de contrat invalide'),
date_naissance: Yup.date().nullable('La date de naissance est requise'),
    statut: isEdit ? Yup.string()
      .nullable('Le statut est requis')
      .oneOf(['Actif', 'Inactif', 'Congé', 'Malade'], 'Statut invalide') : Yup.string(),
    departement_id: Yup.string().nullable('Le département est requis'),
    societe_id: Yup.string().when('typeContrat', {
      is: 'Permanent',
      then: schema => schema.nullable('La société est requise pour un contrat permanent'),
      otherwise: schema => schema.nullable(),
    }),
    picture: Yup.mixed()
      .nullable()
      .test('fileSize', 'Le fichier est trop volumineux (max 2MB)', value => {
        if (!value || typeof value === 'string') return true;
        return value.size <= 2048 * 1024;
      })
      .test('fileType', 'Format de fichier non supporté', value => {
        if (!value || typeof value === 'string') return true;
        return ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'].includes(value.type);
      }),
  });



  const handleSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      

      const formattedData = {
        cin: values.cin,
        rib: values.rib,
        sex: values.sex,
        dateEmbauche: values.dateEmbauche,
        fonction:values.fonction,
        date_naissance: values.date_naissance ,
        situationFamiliale: values.situationFamiliale,
        nbEnfants: values.nbEnfants,
        adresse: values.adresse,
        name: values.name,
        prenom: values.prenom,
        information_supplementaire: values.information_supplementaire || null,
  information_supplementaire2: values.information_supplementaire2 || null,
        tel: values.tel,
        email: values.email,
        ...(values.password ? { password: values.password } : {}),
        role: isEdit ? (values.role || initialValues.role) : values.role,
        typeContrat: values.typeContrat,
        statut: isEdit ? values.statut : 'Actif',
        departement_id: values.departement_id ? parseInt(values.departement_id, 10) : null,
        societe_id: values.societe_id ? parseInt(values.societe_id, 10) : null,
        date_sortie: values.date_sortie || null,
        cnss: values.cnss || null,
        solde_conge: values.solde_conge !== '' ? values.solde_conge : null,
      };
  console.log('Valeur de date_naissance:', formattedData);
      if (isEdit) {
        if (values.picture && values.picture instanceof File) {
          formattedData.picture = values.picture;
        } else if (values.picture === null) {
          formattedData.picture = null;
        }
      } else {
        if (values.picture) {
          formattedData.picture = values.picture;
        }
      }
  
      let response;
      
      if (isEdit) {
        response = await dispatch(updateUser({ id: initialValues.id, ...formattedData })).unwrap();
      } else {
        response = await dispatch(createUser(formattedData)).unwrap();
      }
  
      Swal.fire({
        icon: 'success',
        title: isEdit ? 'Utilisateur modifié avec succès' : 'Utilisateur ajouté avec succès',
        timer: 2000,
        showConfirmButton: false,
      });
  
      resetForm();
      if (onSuccess){
        dispatch(fetchUsers());
         onSuccess()

      };
  
    } catch (error) {
      console.error('Error submitting form:', error);
  
      let errorMessage = 'Une erreur est survenue lors de l\'opération.';
  
      if (error?.payload?.message) {
        errorMessage = error.payload.message;
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
  
      Swal.fire({
        icon: 'error',
        title: 'Erreur de soumission',
        text: errorMessage,
        confirmButtonText: 'OK',
        confirmButtonColor: '#d33',
      });
  
    } finally {
      setSubmitting(false);
    }
  };
  


  // Add a function to normalize the role value
  const normalizeRole = (role) => {
    if (!role) return '';
    return role.toUpperCase();
  };

  return (
    <Formik
      initialValues={{
        cin: '',
        sex: '',
        dateEmbauche: '',      
        fonction:'',   
        date_naissance: '',
        rib: '',
        situationFamiliale: 'Célibataire',
        nbEnfants: 0,
        adresse: '',
        name: '',
        prenom: '',
        tel: '',
        email: '',
        information_supplementaire: '',
        information_supplementaire2: '',
        password: undefined,
        role: isEdit ? normalizeRole(initialValues.role) : 'Employe',
        typeContrat: 'Permanent',
        statut: 'Actif',
        departement_id: '',
        picture: null,
        date_sortie: '',
        cnss: '',
        solde_conge: '',
        ...initialValues
      }}
      validationSchema={validationSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting, setFieldValue }) => (
        <Form className="space-y-4">
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="name" className="form-label">Nom</label>
                <Field
                  type="text"
                  name="name"
                  id="name"
                  className="form-control"
                />
                <ErrorMessage name="name" component="div" className="text-danger" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="prenom" className="form-label">Prénom</label>
                <Field
                  type="text"
                  name="prenom"
                  id="prenom"
                  className="form-control"
                />
                <ErrorMessage name="prenom" component="div" className="text-danger" />
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="cin" className="form-label">CIN</label>
                <Field
                  type="text"
                  name="cin"
                  id="cin"
                  className="form-control"
                />
                <ErrorMessage name="cin" component="div" className="text-danger" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="rib" className="form-label">RIB</label>
                <Field
                  type="text"
                  name="rib"
                  id="rib"
                  className="form-control"
                />
                <ErrorMessage name="rib" component="div" className="text-danger" />
              </div>
            </div>
          </div>
<div className="row">
  <div className="col-md-6">
    <div className="mb-3">
      <label htmlFor="sex" className="form-label">Sexe</label>
      <Field as="select" name="sex" id="sex" className="form-select">
        <option value="">Sélectionner le sexe</option>
        <option value="H">Homme</option>
        <option value="F">Femme</option>
      </Field>
      <ErrorMessage name="sex" component="div" className="text-danger" />
    </div>
  </div>
  <div className="col-md-6">
    <div className="mb-3">
      <label htmlFor="dateEmbauche" className="form-label">Date d'embauche</label>
      <Field
        type="date"
        name="dateEmbauche"
        id="dateEmbauche"
        className="form-control"
      />
      <ErrorMessage name="dateEmbauche" component="div" className="text-danger" />
    </div>
  </div>
</div>
<div className="row">
  
  <div className="col-md-12">
    <div className="mb-3">
      <label htmlFor="date_sortie" className="form-label">Date de Sortie</label>
      <Field type="date" name="date_sortie" id="date_sortie" className="form-control" />
      <ErrorMessage name="date_sortie" component="div" className="text-danger" />
    </div>
  </div>
</div>
<div className="row">
  <div className="col-md-6">
    <div className="mb-3">
      <label htmlFor="cnss" className="form-label">Numéro CNSS</label>
      <Field type="text" name="cnss" id="cnss" className="form-control" />
      <ErrorMessage name="cnss" component="div" className="text-danger" />
    </div>
  </div>
  <div className="col-md-6">
    <div className="mb-3">
      <label htmlFor="solde_conge" className="form-label">Solde Congé (jours)</label>
      <Field type="number" name="solde_conge" id="solde_conge" className="form-control" />
      <ErrorMessage name="solde_conge" component="div" className="text-danger" />
    </div>
  </div>
</div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="situationFamiliale" className="form-label">Situation Familiale</label>
                <Field
                  as="select"
                  name="situationFamiliale"
                  id="situationFamiliale"
                  className="form-select"
                >
                  <option value="Célibataire">Célibataire</option>
                  <option value="Marié">Marié</option>
                  <option value="Divorcé">Divorcé</option>
                </Field>
                <ErrorMessage name="situationFamiliale" component="div" className="text-danger" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="nbEnfants" className="form-label">Nombre d'enfants</label>
                <Field
                  type="number"
                  name="nbEnfants"
                  id="nbEnfants"
                  className="form-control"
                />
                <ErrorMessage name="nbEnfants" component="div" className="text-danger" />
              </div>
            </div>
          </div>

<div className="row">
<div className="mb-3">
  <label htmlFor="information_supplementaire" className="form-label">Information supplémentaire</label>
  <Field
    as="textarea"
    name="information_supplementaire"
    id="information_supplementaire"
    className="form-control"
    rows={3}
  />
  <ErrorMessage name="information_supplementaire" component="div" className="text-danger" />
</div>
<div className="mb-3">
  <label htmlFor="information_supplementaire2" className="form-label">Information supplémentaire 2</label>
  <Field
    as="textarea"
    name="information_supplementaire2"
    id="information_supplementaire2"
    className="form-control"
    rows={3}
  />
  <ErrorMessage name="information_supplementaire2" component="div" className="text-danger" />
</div>

</div>
          

        <div className="row">
          <div className="col-md-6">
            <div className="mb-3">
            <label htmlFor="adresse" className="form-label">Adresse</label>
            <Field
              type="text"
              name="adresse"
              id="adresse"
              className="form-control"
            />
            <ErrorMessage name="adresse" component="div" className="text-danger" />
          </div>
          </div>
          <div className="col-md-6">
            <div className="mb-3">
            <label htmlFor="fonction" className="form-label">Fonction</label>
            <Field
              type="text"
              name="fonction"
              id="fonction"
              className="form-control"
            />
            <ErrorMessage name="fonction" component="div" className="text-danger" />
          </div>
          </div>
        </div>
          

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="tel" className="form-label">Téléphone</label>
                <Field
                  type="text"
                  name="tel"
                  id="tel"
                  className="form-control"
                />
                <ErrorMessage name="tel" component="div" className="text-danger" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="email" className="form-label">Email</label>
                <Field
                  type="email"
                  name="email"
                  id="email"
                  className="form-control"
                  disabled={isEdit} // Disable email editing
                />
                <ErrorMessage name="email" component="div" className="text-danger" />
              </div>
            </div>
          </div>

          {!isEdit && (
            <div className="mb-3">
              <label htmlFor="password">Mot de passe</label>
              <Field type="password" name="password" className="form-control" />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>
          )}
          {isEdit && (
            <div className="mb-3">
              <label htmlFor="password">Nouveau mot de passe (laisser vide si inchangé)</label>
              <Field type="password" name="password" className="form-control" />
              <ErrorMessage name="password" component="div" className="text-danger" />
            </div>
          )}

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="role" className="form-label">Rôle</label>
                <Field
                  as="select"
                  name="role"
                  id="role"
                  className="form-select"
                >
                  <option value="">Sélectionner un rôle</option>
                  <option value="Employe">Employé</option>
                  <option value="Chef_Dep">Chef de Département</option>
                  <option value="RH">RH</option>
                </Field>
                <ErrorMessage name="role" component="div" className="text-danger" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="typeContrat" className="form-label">Type de Contrat</label>
                <Field
                  as="select"
                  name="typeContrat"
                  id="typeContrat"
                  className="form-select"
                >
                  <option value="Permanent">Permanent</option>
                  <option value="Temporaire">Temporaire</option>
                </Field>
                <ErrorMessage name="typeContrat" component="div" className="text-danger" />
              </div>
            </div>
          </div>

          <div className="row">
            <div className="col-md-6">
            <div className="mb-3">
  <label htmlFor="date_naissance" className="form-label">Date de Naissance</label>
  <Field
    type="date"
    name="date_naissance"
    id="date_naissance"
    className="form-control"
  />
  <ErrorMessage name="date_naissance" component="div" className="text-danger" />
</div></div>

            {isEdit && (
              <div className="col-md-6">
                <div className="mb-3">
                  <label htmlFor="statut" className="form-label">Statut</label>
                  <Field
                    as="select"
                    name="statut"
                    id="statut"
                    className="form-select"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                    <option value="Congé">Congé</option>
                    <option value="Malade">Malade</option>
                  </Field>
                  <ErrorMessage name="statut" component="div" className="text-danger" />
                </div>
              </div>
            )}
          </div>

          <div className="row">
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="departement_id" className="form-label">Département</label>
                <Field
                  as="select"
                  name="departement_id"
                  id="departement_id"
                  className="form-select"
                >
                  <option value="">Sélectionner un département</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.nom}</option>
                  ))}
                </Field>
                <ErrorMessage name="departement_id" component="div" className="text-danger" />
              </div>
            </div>
            <div className="col-md-6">
              <div className="mb-3">
                <label htmlFor="societe_id" className="form-label">Société</label>
                <Field
                  as="select"
                  name="societe_id"
                  id="societe_id"
                  className="form-select"
                >
                  <option value="">Sélectionner une société</option>
                  {societes.map(soc => (
                    <option key={soc.id} value={soc.id}>{soc.nom}</option>
                  ))}
                </Field>
                <ErrorMessage name="societe_id" component="div" className="text-danger" />
              </div>
            </div>
          </div>

          <div className="mb-3">
            <label htmlFor="picture" className="form-label">Photo de Profil</label>
            <input
              type="file"
              name="picture"
              id="picture"
              className="form-control"
              onChange={(event) => {
                setFieldValue("picture", event.currentTarget.files[0]);
              }}
            />
            <ErrorMessage name="picture" component="div" className="text-danger" />
          </div>

          <div className="text-end">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting || status === 'loading'}
            >
              {isSubmitting || status === 'loading' ? (
                <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
              ) : null}
              {isEdit ? 'Modifier' : 'Ajouter'}
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default UserForm;