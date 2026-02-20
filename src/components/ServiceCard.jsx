import "../styles/serviceCard.css";

const ServiceCard = ({ title, image }) => {
  return (
    <div className="service-card" style={{ backgroundImage: `url(${image})` }}>
      <div className="overlay">
        <h2>{title}</h2>
        <button>More</button>
      </div>
    </div>
  );
};

export default ServiceCard;
