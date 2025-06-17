import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>&copy; {new Date().getFullYear()} Muse Mart. All rights reserved.</p>
          <div className="flex space-x-6">
            <Link to="/about" className="hover:text-blue-400 transition-colors duration-200">About Us</Link>
            <Link to="/contact" className="hover:text-blue-400 transition-colors duration-200">Contact</Link>
            <Link to="/privacy" className="hover:text-blue-400 transition-colors duration-200">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;