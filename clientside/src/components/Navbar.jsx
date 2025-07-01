import React, { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Navbar = () => {
  const navigate = useNavigate();

  const { token, setToken, userData } = useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
  };

  return (
    <div className="flex items-center justify-between text-sm py-4 mb-5 border-b border-b-gray-400">
      <img
        onClick={() => navigate("/")}
        className="w-44 cursor-pointer"
        src={assets.logo}
        alt="logo-img"
      />
      <ul className="hidden md:flex items-center gap-8 font-medium text-gray-700">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            `group relative transition-all duration-300 ${
              isActive ? 'text-primary' : 'hover:text-primary'
            }`
          }
        >
          <li className="py-2 px-1 cursor-pointer tracking-wide text-sm font-semibold uppercase">
            HOME
          </li>
          <hr className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 ease-out" />
        </NavLink>
        
        <NavLink 
          to="/doctors" 
          className={({ isActive }) => 
            `group relative transition-all duration-300 ${
              isActive ? 'text-primary' : 'hover:text-primary'
            }`
          }
        >
          <li className="py-2 px-1 cursor-pointer tracking-wide text-sm font-semibold uppercase">
            ALL DOCTORS
          </li>
          <hr className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 ease-out" />
        </NavLink>
        
        <NavLink 
          to="/about" 
          className={({ isActive }) => 
            `group relative transition-all duration-300 ${
              isActive ? 'text-primary' : 'hover:text-primary'
            }`
          }
        >
          <li className="py-2 px-1 cursor-pointer tracking-wide text-sm font-semibold uppercase">
            ABOUT
          </li>
          <hr className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 ease-out" />
        </NavLink>
        
        <NavLink 
          to="/contact" 
          className={({ isActive }) => 
            `group relative transition-all duration-300 ${
              isActive ? 'text-primary' : 'hover:text-primary'
            }`
          }
        >
          <li className="py-2 px-1 cursor-pointer tracking-wide text-sm font-semibold uppercase">
            CONTACT
          </li>
          <hr className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 ease-out" />
        </NavLink>
        
        <NavLink 
          to="/caremate" 
          className={({ isActive }) => 
            `group relative transition-all duration-300 ${
              isActive ? 'text-primary' : 'hover:text-primary'
            }`
          }
        >
          <li className="py-2 px-1 cursor-pointer tracking-wide text-sm font-semibold uppercase">
            CAREMATE
          </li>
          <hr className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 border-none outline-none h-0.5 bg-primary w-0 group-hover:w-full transition-all duration-300 ease-out" />
        </NavLink>
      </ul>
      <div className="flex items-center gap-4">
        {token && userData ? (
          <div className="flex items-center gap-2 cursor-pointer group relative">
            <img className="w-8 rounded-full" src={userData.image} alt="" />
            <img className="w-2.5" src={assets.dropdown_icon} alt="" />
            <div className="absolute top-0 right-0 pt-14 text-base font-medium text-gray-600 z-20 hidden group-hover:block">
              <div className="min-w-48 bg-stone-100 rounded flex flex-col gap-4 p-4">
                <p
                  onClick={() => navigate("/my-profile")}
                  className="hover:text-black cursor-pointer"
                >
                  My Profile
                </p>
                <p
                  onClick={() => navigate("/my-appointments")}
                  className="hover:text-black cursor-pointer"
                >
                  My Appointments
                </p>
                <p onClick={logout} className="hover:text-black cursor-pointer">
                  Logout
                </p>
              </div>
            </div>
          </div>
        ) : (
          <button
            onClick={() => navigate("/login")}
            className="bg-primary text-white px-8 py-3 rounded-full font-light hidden md:block"
          >
            Create account
          </button>
        )}
        <img
          onClick={() => setShowMenu(true)}
          className="w-6 md:hidden"
          src={assets.menu_icon}
          alt=""
        />
        {/* ---------- Mobile Menu ---------- */}
        <div
          className={`${
            showMenu ? "fixed w-full" : "h-0 w-0"
          } md:hidden right-0 top-0 bottom-0 z-20 overflow-hidden bg-white transition-all`}
        >
          <div className="flex items-center justify-between px-5 py-6">
            <img className="w-36" src={assets.logo} alt="" />
            <img
              className="w-7"
              onClick={() => setShowMenu(false)}
              src={assets.cross_icon}
              alt=""
            />
          </div>
          <ul className="flex flex-col items-center gap-2 mt-5 px-5 text-lg font-medium">
            <NavLink onClick={() => setShowMenu(false)} to="/">
              <p className="px-4 py-2 rounded inline-block">HOME</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/doctors">
              <p className="px-4 py-2 rounded inline-block">ALL DOCTORS</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/about">
              <p className="px-4 py-2 rounded inline-block">ABOUT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/contact">
              <p className="px-4 py-2 rounded inline-block">CONTACT</p>
            </NavLink>
            <NavLink onClick={() => setShowMenu(false)} to="/Caremate">
              <p className="px-4 py-2 rounded inline-block">CAREMATE</p>
            </NavLink>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Navbar;