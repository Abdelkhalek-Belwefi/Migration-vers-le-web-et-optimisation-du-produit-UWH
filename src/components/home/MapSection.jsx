import React from 'react';
import './styles/ProcessSection.css'; // or your CSS file

const MapSection = () => {
  // City data: name, coordinates (percentages), and type (active/partner)
  const cities = [
    { name: 'Bonn', top: '28%', left: '45%', type: 'active' },
    { name: 'Sulzbach/Murr', top: '33%', left: '43%', type: 'active' },
    { name: 'Steinhausen', top: '35%', left: '47%', type: 'active' },
    { name: 'Budapest', top: '42%', left: '68%', type: 'active' },
    { name: 'Barcelona', top: '55%', left: '34%', type: 'active' },
    { name: 'Nabeul', top: '82%', left: '55%', type: 'partner' }, // partner example
  ];

  return (
    <section className="map-section">
      <div className="container">
        <div className="header-block">
          <h2>Notre réseau logistique</h2>
          <p className="lead-text">Sites L‑mobile à travers l'Europe</p>
        </div>
        <div className="map-container">
          <div className="map-wrapper">
            {/* Official L‑mobile map image */}
            <img
              src="https://l-mobile.com/wp-content/uploads/2021/06/weltkarte_neu_spanien-2021.jpg"
              alt="Carte L‑mobile"
              className="map-background"
            />
            {/* Hotspots */}
            {cities.map((city, index) => (
              <div
                key={index}
                className={`map-dot ${city.type === 'partner' ? 'partner' : ''}`}
                style={{ top: city.top, left: city.left }}
                data-tooltip={city.name}
              >
                <span className="dot-number">{index + 1}</span>
                <span className="dot-label">{city.name}</span>
              </div>
            ))}
            <div className="map-legend">
              <span className="dot blue"></span> Hub actif
              <span className="dot gray"></span> Partenaire
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MapSection;