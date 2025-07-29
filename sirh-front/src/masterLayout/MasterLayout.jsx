/* eslint-disable react/prop-types */
import { useEffect, useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import { Link, NavLink, useLocation, Outlet, useNavigate } from "react-router-dom";
import ThemeToggleButton from "../helper/ThemeToggleButton";
import { useDispatch } from "react-redux";
import { logout } from "../Redux/Slices/authSlice";
import { useSelector } from "react-redux";
import BottomMenu from "./BottomMenu";

const MasterLayout = ({ children }) => {

  const roles = useSelector((state) => state.auth.roles || []);
const user = useSelector((state)=>state.auth.user)
const apiUrl = import.meta.env.VITE_API_URL;
const societe_id = useSelector((state) => state.auth.user?.societe_id);
const [imageUrl, setImageUrl] = useState("/assets/default.webp");

useEffect(() => {
  console.log("Current societe_id:", societe_id);
  
  const getImageUrl = () => {
    if (societe_id === 1) return "/assets/images/smee.webp";
    if (societe_id ===2) return "/assets/images/dct.webp";
    return "/assets/default.webp";
  };
  setImageUrl(getImageUrl());
}, [societe_id]);


  let [sidebarActive, seSidebarActive] = useState(false);
  let [mobileMenu, setMobileMenu] = useState(false);
  const location = useLocation(); // Hook to get the current route
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [imagePreview, setImagePreview] = useState(
    user?.picture
      ? `${apiUrl}storage/profile_picture/${user.picture}`
      : "assets/images/user-grid/user-grid-img13.png"
  );
  useEffect(() => {
    const handleDropdownClick = (event) => {
      event.preventDefault();
      const clickedLink = event.currentTarget;
      const clickedDropdown = clickedLink.closest(".dropdown");

      if (!clickedDropdown) return;

      const isActive = clickedDropdown.classList.contains("open");

      // Close all dropdowns
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        dropdown.classList.remove("open");
        const submenu = dropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = "0px"; // Collapse submenu
        }
      });

      // Toggle the clicked dropdown
      if (!isActive) {
        clickedDropdown.classList.add("open");
        const submenu = clickedDropdown.querySelector(".sidebar-submenu");
        if (submenu) {
          submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
        }
      }
    };

    // Attach click event listeners to all dropdown triggers
    const dropdownTriggers = document.querySelectorAll(
      ".sidebar-menu .dropdown > a, .sidebar-menu .dropdown > Link"
    );

    dropdownTriggers.forEach((trigger) => {
      trigger.addEventListener("click", handleDropdownClick);
    });

    const openActiveDropdown = () => {
      const allDropdowns = document.querySelectorAll(".sidebar-menu .dropdown");
      allDropdowns.forEach((dropdown) => {
        const submenuLinks = dropdown.querySelectorAll(".sidebar-submenu li a");
        submenuLinks.forEach((link) => {
          if (
            link.getAttribute("href") === location.pathname ||
            link.getAttribute("to") === location.pathname
          ) {
            dropdown.classList.add("open");
            const submenu = dropdown.querySelector(".sidebar-submenu");
            if (submenu) {
              submenu.style.maxHeight = `${submenu.scrollHeight}px`; // Expand submenu
            }
          }
        });
      });
    };

    // Open the submenu that contains the active route
    openActiveDropdown();

    // Cleanup event listeners on unmount
    return () => {
      dropdownTriggers.forEach((trigger) => {
        trigger.removeEventListener("click", handleDropdownClick);
      });
    };
  }, [location.pathname]);
useEffect(() => {
      seSidebarActive(!sidebarActive);

  
}, [location.pathname]);

  let sidebarControl = () => {
    seSidebarActive(!sidebarActive);
  };

  let mobileMenuControl = () => {
    setMobileMenu(!mobileMenu);
  };

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <section className={mobileMenu ? "overlay active" : "overlay"}>
      {/* sidebar */}
      <aside
      className={
        (sidebarActive ? "sidebar active " : mobileMenu ? "sidebar sidebar-open" : "sidebar") +
        " md:block hidden" // Ajoute cette classe
      }
      >
        <button
          onClick={mobileMenuControl}
          type='button'
          className='sidebar-close-btn'
        >
          <Icon icon='radix-icons:cross-2' />
        </button>
        <div>
          <Link to='/' className='sidebar-logo'>
            <img
              src={imageUrl}
              alt='site logo'
              className='light-logo'
            />
            <img
              src={imageUrl}
              alt='site logo'
              className='dark-logo'
            />
            <img
              src={imageUrl}
              alt='site logo'
              className='logo-icon'
            />
          </Link>
        </div>
        <div className='sidebar-menu-area'>
        <ul style={{paddingLeft:"0px"}} className="sidebar-menu" id="sidebar-menu">

  {/* Tableau de bord - Pour tous */}
  <li>
    <NavLink to="/" className={(navData) => navData.isActive ? "active-page" : ""}>
      <Icon icon="solar:home-smile-angle-outline" className="menu-icon" />
      <span>Tableau de bord</span>
                </NavLink>
              </li>

  {/* Gestion des employés - RH & Chef_Dep */}
  {(roles.includes("RH") || roles.includes("Chef_Dep") || roles.includes("Chef_Projet")) && (
    <li className="dropdown">
      <Link to="#">
        <Icon icon="mdi:account-group-outline" className="menu-icon" />
        <span> Employés</span>
      </Link>
      <ul className="sidebar-submenu">
      <li>
          <NavLink to="/users" className={(navData) => navData.isActive ? "active-page" : ""}>
            <Icon icon="mdi:format-list-bulleted" className="circle-icon w-auto" />
            Liste des employés
                    </NavLink>
                  </li>
                  
                  {roles.includes("RH") &&( <>
                    <li>
                    <NavLink to="/users/temp" className={(navData) => navData.isActive ? "active-page" : ""}>
                      <Icon icon="mdi:format-list-bulleted" className="circle-icon w-auto" />
                      Les employés Temporaire
                              </NavLink>
                            </li>
                    <li>
          <NavLink to="/users/add" className={(navData) => navData.isActive ? "active-page" : ""}>
            <Icon icon="mdi:account-plus-outline" className="circle-icon w-auto" />
            Ajouter les employés
          </NavLink>
        </li>
        </>)}
       
        
                </ul>
              </li>
  )}

  {/* Gestion des départements - RH uniquement */}
  {roles.includes("RH") && (
    <>
    <li className="dropdown">
      <Link to="#" >
        <Icon icon="fluent:building-people-24-regular" className="menu-icon" />
        <span>Départements</span>
      </Link>
      <ul className="sidebar-submenu"> <li>
          <NavLink to="/departments" className={(navData) => navData.isActive ? "active-page" : ""}>
            <Icon icon="mdi:format-list-bulleted-type" className="circle-icon w-auto" />
            Liste des départements
                    </NavLink>
                  </li>
        <li>
          <NavLink to="/departments/add" className={(navData) => navData.isActive ? "active-page" : ""}>
            <Icon icon="mdi:plus-box-outline" className="circle-icon w-auto" />
            Créer un département
                    </NavLink>
                  </li>
                 
                </ul>
              </li>

              

               <li className="dropdown d-none">
               <Link to="#" >
                 <Icon icon="fluent:building-people-24-regular" className="menu-icon" />
                 <span>Societes</span>
               </Link>
               <ul className="sidebar-submenu"> <li>
                   <NavLink to="/societes" className={(navData) => navData.isActive ? "active-page" : ""}>
                     <Icon icon="mdi:format-list-bulleted-type" className="circle-icon w-auto" />
                     Liste des Societess
                             </NavLink>
                           </li>
                 <li>
                   <NavLink to="/departments/add" className={(navData) => navData.isActive ? "active-page" : ""}>
                     <Icon icon="mdi:plus-box-outline" className="circle-icon w-auto" />
                     Créer un département
                             </NavLink>
                           </li>
                          
                         </ul>
                       </li></>
  )}
  
  <li className="dropdown">
      <Link to="#" >
        <Icon icon="mdi:format-list-bulleted-type" className="menu-icon" />
        <span>Documents</span>
      </Link>
      <ul className="sidebar-submenu">
        {roles.includes("RH") && (
         <li>
          <NavLink to="/type-docs" className={(navData) => navData.isActive ? "active-page" : ""}>
            <Icon icon="mdi:format-list-bulleted-type" className="circle-icon w-auto" />
            Types des documents
                    </NavLink>
                  </li>)}
        <li>
          <NavLink to="/documents" className={(navData) => navData.isActive ? "active-page" : ""}>
            <Icon icon="mdi:format-list-bulleted-type" className="circle-icon w-auto" />
            Liste des documents
                    </NavLink>
                  </li>
                 
                </ul>
              </li>
  {/* Demande d'absences - Tous */}
  <li className="dropdown">
    <Link to="#">
      <Icon icon="mdi:calendar-account-outline" className="menu-icon" />
      <span>Demandes</span>
              </Link>
    <ul className="sidebar-submenu">
      
        <li>
          <NavLink to="/absences" className={(navData) => navData.isActive ? "active-page" : ""}>
            <Icon icon="mdi:clipboard-list-outline" className="circle-icon w-auto" />
            Liste des demandes
                  </NavLink>
                </li>
{(roles.includes("RH") || roles.includes("Chef_Dep") || roles.includes("Chef_Projet")) && (
<li>
<NavLink to="/absences/calendar" className={(navData) => navData.isActive ? "active-page" : ""}>
  <Icon icon="mdi:calendar-outline" className="circle-icon w-auto" />
  Calendrier des demandes
        </NavLink>
      </li>
                
      )}
      <li>
        <NavLink to="absences/add" className={(navData) => navData.isActive ? "active-page" : ""}>
          <Icon icon="mdi:calendar-plus-outline" className="circle-icon w-auto" />
          Ajouter une demande
                  </NavLink>
                </li>
              </ul>
            </li>


  {/* Pointage */}
  <li>
    <NavLink to="/pointages" className={(navData) => navData.isActive ? "active-page" : ""}>
      <Icon icon="mdi:clock-outline" className="menu-icon" />
      <span>Pointages</span>
    </NavLink>
  </li>


  {/* Publications & Sondages regroupés + logique RH */}
  <li className="dropdown">
    <Link to="#">
      <Icon icon="mdi:newspaper-variant-multiple-outline" className="menu-icon" />
      <span>Communications</span>
    </Link>
    <ul className="sidebar-submenu">
      {roles.includes("RH") ? (
        <>
          <li>
            <NavLink to="/publications" className={(navData) => navData.isActive ? "active-page" : ""}>
              <Icon icon="mdi:newspaper" className="circle-icon w-auto" />
              Liste des publications
            </NavLink>
          </li>
          <li>
            <NavLink to="/publications/nouveau" className={(navData) => navData.isActive ? "active-page" : ""}>
              <Icon icon="mdi:plus-box-outline" className="circle-icon w-auto" />
              Nouvelle publication
            </NavLink>
          </li>
        </>
      ) : (
        <>
          <li>
            <NavLink to="/publications" className={(navData) => navData.isActive ? "active-page" : ""}>
              <Icon icon="mdi:newspaper" className="circle-icon w-auto" />
              Publications
            </NavLink>
          </li>
          <li>
            <NavLink to="/sondages" className={(navData) => navData.isActive ? "active-page" : ""}>
              <Icon icon="mdi:poll" className="circle-icon w-auto" />
              Sondages
            </NavLink>
          </li>
        </>
      )}
    </ul>
  </li>





  {/* Reporting */}
  <li className="dropdown">
    <Link to="#">
      <Icon icon="mdi:chart-box-outline" className="menu-icon" />
      <span>Reporting</span>
              </Link>
    <ul className="sidebar-submenu">
    
                <li>
        <NavLink to="/statistiques" className={(navData) => navData.isActive ? "active-page" : ""}>
          <Icon icon="mdi:chart-bar-stacked" className="circle-icon w-auto" />
          Statistiques
                  </NavLink>
                </li>
                {roles.includes("RH") && (<>
                <li>
                <li>
        <NavLink to="/pointagedetails" className={(navData) => navData.isActive ? "active-page" : ""}>
          <Icon icon="mdi:chart-bar-stacked" className="circle-icon w-auto" />
          Pointage Details
                  </NavLink>
                </li>
       
                </li>
                <li>
                <NavLink to="/Export" className={(navData) => navData.isActive ? "active-page" : ""}>
                  <Icon icon="mdi:chart-bar-stacked" className="circle-icon w-auto" />
                  Excel  Export
                          </NavLink>
                        </li></>
                )}
              </ul>
            </li>


           
</ul>
        </div>
      </aside>

      <main
        className={sidebarActive ? "dashboard-main active" : "dashboard-main"}
      >
        <div className='navbar-header'>
          <div className='row align-items-center justify-content-between'>
            <div className='col-auto'>
              <div className='d-flex flex-wrap align-items-center gap-4'>
                <button 
                  type='button'
                  className='sidebar-toggle'
                  onClick={sidebarControl}
                >
                  {sidebarActive ? (
                <Icon
                      icon='iconoir:arrow-right'
                      className='icon text-2xl non-active'
                    />
                  ) : (
                    <Icon
                      icon='heroicons:bars-3-solid'
                      className='icon text-2xl non-active '
                    />
                  )}
                </button>
                <button
                  onClick={mobileMenuControl}
                  type='button'
                  className='sidebar-mobile-toggle'
                >
                  <Icon icon='heroicons:bars-3-solid' className='icon' />
                </button>
                
              </div>
            </div>
            <div className='col-auto'>
              <div  className='  d-flex flex-wrap align-items-center gap-3'>
                {/* ThemeToggleButton */}
                <div className="d-none">
                <ThemeToggleButton/>
                </div>
              
                {/* Notification dropdown end */}
                <div className='dropdown'>
                  <button
                    className='d-flex justify-content-center align-items-center rounded-circle'
                    type='button'
                    data-bs-toggle='dropdown'
                  >
                    
                     <Link style={{textDecoration:"none",textAlign:"right"}} to="/view-profile">
                        <h6 className='text-lg text-primary fw-bold mb-1'>
                          {user.name +" "+ user.prenom}
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                        {user.role}
                        </span>
                      </Link>
                      <img
                      src={imagePreview}
                      alt='image_user'
                      className='w-40-px h-40-px object-fit-cover rounded-circle'
                    />
                  </button>
                  <div className='dropdown-menu to-top dropdown-menu-sm'>
                    <div className='py-12 px-16 radius-8 bg-primary-50 mb-16 d-flex align-items-center justify-content-between gap-2'>
                      <Link to="/view-profile">
                        <h6 className='text-lg text-primary-light fw-semibold mb-2'>
                          {user.name +" "+ user.prenom}
                        </h6>
                        <span className='text-secondary-light fw-medium text-sm'>
                        {user.role}
                        </span>
                      </Link>
                      <button type='button' className='hover-text-danger'>
                <Icon
                          icon='radix-icons:cross-1'
                          className='icon text-xl'
                        />
                      </button>
                    </div>
                    <ul className='to-top-list'>
                 
                <li>
                        <Link
                          className='dropdown-item text-black px-0 py-8 hover-bg-transparent hover-text-danger d-flex align-items-center gap-3'
                          to='#'
                          onClick={handleLogout}
                        >
                          <Icon icon='lucide:power' className='icon text-xl' />{" "}
                          Log Out
                        </Link>
            </li>
          </ul>
        </div>
                </div>
                {/* Profile dropdown end */}
              </div>
            </div>
          </div>
        </div>

        {/* dashboard-main-body */}
        <div className='dashboard-main-body'>
          <Outlet />
          
        </div>
        


      </main>
      <BottomMenu />

    </section>
  );
};

export default MasterLayout;