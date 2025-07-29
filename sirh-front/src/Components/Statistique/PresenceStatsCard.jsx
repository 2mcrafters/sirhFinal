import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
const STATUS_COLORS = {
  present: {
    bg: "bg-success bg-opacity-10",
    icon: "#28a745",
    text: "text-success",
    border: "border-success border-opacity-25",
  },
  absent: {
    bg: "bg-danger bg-opacity-10",
    icon: "#dc3545",
    text: "text-danger",
    border: "border-danger border-opacity-25",
  },
  retard: {
    bg: "bg-warning bg-opacity-10",
    icon: "#ffc107",
    text: "text-warning",
    border: "border-warning border-opacity-25",
  },
  default: {
    bg: "bg-secondary bg-opacity-10",
    icon: "#6c757d",
    text: "text-secondary",
    border: "border-secondary border-opacity-25",
  }
};

function getType(label) {
  if (label.toLowerCase().includes('présent')) return 'present';
  if (label.toLowerCase().includes('absent')) return 'absent';
  if (label.toLowerCase().includes('retard')) return 'retard';
  return 'default';
}

const PresenceStatsCard = ({ label, value, icon, percentage, showDetailsBtn, onDetailsClick,selectorClass }) => {
  const type = getType(label);
  const color = STATUS_COLORS[type] || STATUS_COLORS.default;
  const roles = useSelector((state) => state.auth.roles || []);
  const isRH = roles.includes('RH');
  return (
    <div className={`card border mx-1 h-100 ${selectorClass} `}>
      

        <div className="row p-3 ">
          <div className="col-2 align-items-center" style={{justifyItems:" anchor-center",
    placeContent: 'center'}}>
          <div className={`iconbg rounded-circle p-3  `}>
            <Icon icon={icon} className="fs-1 iconCar" style={{ color: color.icon }} />
          </div>
          </div>
          <div className="col-7 " style={{justifyItems:" anchor-center",
    placeContent: 'center'}}>
          <h5 className="card-title text-muted">{label}</h5>
        <div className="">
          <span className={`display-4 fw-bold ${color.text}`}>{value}</span>
          {percentage && (
            <span className={`fs-3 ms-2 ${color.text}`}>{percentage}%</span>
          )}
        </div>
          </div>
        <div className="col-3" style={{justifyItems:" anchor-center",
    placeContent: 'center'}}>
        {isRH && showDetailsBtn && value > 0 && (
          <button
            className={`btn btn-sm btn- mt-auto mx-auto ${color.text}  border-0`}
            onClick={onDetailsClick}
          >
            <Icon icon="mdi:arrow-right" />  Détails
          </button>
        )}
        </div>
        
       
      </div>
    </div>
  );
};

export const PresenceStatsContainer = ({ children }) => {
  return (
    <div className="container px-4">
      <div className="row g-4">
        {React.Children.map(children, (child, index) => (
          <div key={index} className="col-md-4">
            {child}
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresenceStatsCard;