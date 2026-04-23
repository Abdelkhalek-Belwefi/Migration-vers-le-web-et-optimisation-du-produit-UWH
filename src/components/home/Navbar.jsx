import { Link, useLocation } from "react-router-dom";
import "../../styles/navbar.css";

const Navbar = () => {
  const location = useLocation();

  return (
    <header className="navbar-outer-wrapper">
      <div className="navbar-capsule">
        {/* GAUCHE : LOGO ET NOM */}
        <div className="nav-brand-left">
          <img src="images/logo.png" alt="Warehouse Logo" className="logo-img-v3" />
          <h1 className="brand-name-v3">
            Ware<span className="orange-span">House</span>
          </h1>
        </div>

        {/* DROITE : NAVIGATION */}
        <nav className="nav-links-right">
          <Link to="/" className={location.pathname === "/" ? "link-active" : ""}>
            Home
          </Link>
          <Link to="/login" className="login-link-v3">Login</Link>
          <Link to="/signup" className="signup-btn-capsule">Signup</Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;