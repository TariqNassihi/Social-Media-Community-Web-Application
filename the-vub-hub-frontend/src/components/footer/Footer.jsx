import { ArrowUpCircleFill } from "react-bootstrap-icons"; 
import "./Footer.css"; 
import { Link } from "react-router-dom"; 


// Footer functional component
const Footer = () => {
  // Function to smoothly scroll to the top of the page
  const scrollToTop = () => {
    window.scrollTo({
      top: 0, // Scroll to the top of the page
      behavior: "smooth" // Smooth scrolling effect
    });
  };

  return (
    <div>
      {/* Footer container */}
      <div className="footer-container">
        <div>
          {/* Logo linking to the home page */}
          <Link className="logo-f" to='/'>
            <h2>The VUB Hub</h2> {/* Website title */}
          </Link>
        </div>
        {/* text */}
        <p> &copy;2024 Tariq | Sellamzi | King </p>
        <div>
          {/* Scroll-to-top icon */}
          <Link onClick={scrollToTop}>
            <ArrowUpCircleFill size={30} color="black" /> {/* Black arrow-up icon with size 30 */}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Footer; 
