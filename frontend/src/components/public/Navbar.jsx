import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="w-full h-16 flex justify-between items-center px-5">
      <div className="logo w-10">
        <Link to={"/"}>
          <img className="ml-10" src="/image.png" alt="Logo" />
        </Link>
      </div>
      <div className="nav-contains w-1/2 text-xl font-sans font-bold">
        <ul className="flex justify-between">
          <li>
            <Link to={"/"}>Home</Link>
          </li>
          <li>
            <Link to={user ? "/patient/dashboard" : "/login"}>Appointment</Link>
          </li>
          <li>
            <Link to={"/"}>About us</Link>
          </li>
        </ul>
      </div>
      {user ? (
        <div className="flex items-center gap-6">
          <button
            className="w-32 h-10 bg-[#76dbcf] rounded-2xl font-semibold hover:bg-[#5ac1b5] transition-colors"
            onClick={handleLogout}
          >
            LOGOUT
          </button>
          <div className="profile w-14">
            <Link to={"/patient/dashboard"}>
              <img src="/profile.png" alt="Profile" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex">
          <button
            className="w-32 h-10 bg-[#76dbcf] rounded-2xl font-semibold mr-3 hover:bg-[#5ac1b5] transition-colors"
            onClick={() => navigate('/register')}
          >
            REGISTER
          </button>
          <div className="relative">
            <button
              className="w-32 h-10 bg-[#76dbcf] rounded-2xl font-semibold hover:bg-[#5ac1b5] transition-colors"
              onClick={() => setIsOpen((prev) => !prev)}
            >
              LOGIN
            </button>
            {isOpen && (
              <div className="bg-[#76dbcf] absolute flex flex-col rounded-xl w-32 mt-3 font-semibold items-center z-50 shadow-lg">
                <Link to={"/login"} className="py-2 hover:text-white w-full text-center">
                  Patient
                </Link>
                <Link to={"/login"} className="py-2 hover:text-white w-full text-center">
                  Doctor
                </Link>
                <Link to={"/login"} className="py-2 hover:text-white w-full text-center">
                  Admin
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
