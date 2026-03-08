import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import taginLogo from '../assets/tagin-logo-white.svg';

const Navbar = () => {
  return (
    <nav className="absolute z-50 max-w-full top-0 left-0 right-0 z-50 bg-black">
      <div className="max-w-full mx-14 bg-black flex items-center justify-between h-16 py-10 px-12i">
        {/* Left Side: Logo + Nav Links */}
        <div className="flex items-center gap-12">
          {/* Logo */}
          <div className="flex items-center gap-2">
            <img
              src={taginLogo}
              alt="TagIn Logo"
              className="h-7 w-auto"
            />
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link to="/about" className="text-white hover:text-gray-300 transition-colors font-light">
              About
            </Link>
            <Link to="/plans" className="text-white hover:text-gray-300 transition-colors font-light">
              Plans
            </Link>
            <Link to="/blog" className="text-white hover:text-gray-300 transition-colors font-light">
              Blog
            </Link>
            <Link to="/contact" className="text-white hover:text-gray-300 transition-colors font-light">
              Contact
            </Link>
          </div>
        </div>

        {/* Buttons on the right */}
        <div className="flex items-center gap-4">
          <Link to="/login" className="group">
            <Button withArrow className="bg-white hover:bg-gray-50 text-black px-6 py-5 rounded-3xl shadow-xl transition-all">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
