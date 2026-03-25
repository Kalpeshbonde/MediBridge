import { useContext, useState } from "react";
import { assets } from "../assets/assets";
import { NavLink, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

// ─── Navbar ────────────────────────────────────────────────────────────────────
const Navbar = ({ onOpenCareMate }) => {
  const navigate = useNavigate();
  const { token, setToken, userData } = useContext(AppContext);

  const [showMenu, setShowMenu] = useState(false);

  const logout = () => {
    setToken(false);
    localStorage.removeItem("token");
  };

  const navLinks = [
    { to: "/", label: "Home" },
    { to: "/doctors", label: "Find Doctors" },
    { label: "Care Assistant", onClick: () => onOpenCareMate?.() },
  ];

  const isLoggedIn = !!token && !!userData;

  return (
    <>
      <div className="sticky top-0 z-50 bg-gradient-to-b from-sky-50/95 via-white/95 to-white/95 backdrop-blur-md border-b border-sky-100 shadow-[0_8px_24px_rgba(13,110,253,0.08)]">
        <nav className="flex items-center justify-between flex-nowrap text-sm pt-3 pb-3 px-2 sm:px-4 lg:px-6">
        {/* Left: Logo */}
        <div className="flex items-center min-w-[220px]">
          <img
            onClick={() => navigate("/")}
            className="w-52 cursor-pointer ml-1"
            src={assets.logo}
            alt="MediBridge"
          />
        </div>

        {/* Center: Desktop Nav Links */}
        <ul className="hidden md:flex flex-1 items-center justify-center gap-1 font-medium text-gray-600">
          {navLinks.map(({ to, label, onClick }) => (
            to ? (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `group relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? "text-primary bg-primary/10"
                      : "text-gray-700 hover:text-primary hover:bg-primary/5"
                  }`
                }
              >
                {label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full w-0 group-hover:w-4/5 transition-all duration-300 ease-out" />
              </NavLink>
            ) : (
              <button
                key={label}
                onClick={onClick}
                className="group relative px-4 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 text-gray-700 hover:text-primary hover:bg-primary/5"
              >
                {label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 bg-primary rounded-full w-0 group-hover:w-4/5 transition-all duration-300 ease-out" />
              </button>
            )
          ))}
        </ul>

        {/* Right: Auth / User */}
        <div className="flex items-center justify-end gap-3 min-w-[240px]">
          {isLoggedIn ? (
            /* User Dropdown */
            <div className="relative group cursor-pointer">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 hover:border-primary/40 hover:bg-primary/5 transition-all duration-200">
                <img
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-primary/20"
                  src={userData.image}
                  alt="profile"
                />
                <span className="hidden md:block text-xs font-semibold text-gray-700 max-w-[100px] truncate">
                  {userData.name?.split(" ")[0]}
                </span>
                <svg className="w-3.5 h-3.5 text-gray-400 transition-transform duration-200 group-hover:rotate-180" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                  <path d="M19 9l-7 7-7-7" />
                </svg>
              </div>

              {/* Dropdown Menu */}
              <div className="absolute top-full right-0 mt-2 w-52 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/60 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-1 group-hover:translate-y-0 transition-all duration-200 z-30 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-xs font-semibold text-gray-800 truncate">{userData.name}</p>
                  <p className="text-xs text-gray-400 truncate">{userData.email}</p>
                </div>
                <div className="py-1.5">
                  {[
                    { label: "My Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z", path: "/my-profile" },
                    { label: "My Appointments", icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z", path: "/my-appointments" },
                  ].map(({ label, icon, path }) => (
                    <button
                      key={path}
                      onClick={() => navigate(path)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-600 hover:text-primary hover:bg-primary/5 transition-colors"
                    >
                      <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
                      </svg>
                      {label}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 py-1.5">
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
                  >
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Auth Buttons */
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => navigate("/login")}
                className="text-sm font-semibold text-gray-800 px-5 py-2.5 rounded-full bg-white border border-sky-300 hover:border-primary hover:text-primary transition-all duration-200"
              >
                Login
              </button>
              <button
                onClick={() => navigate("/signup")}
                className="text-sm font-semibold text-white bg-primary px-6 py-2.5 rounded-full hover:bg-primary/90 active:scale-95 transition-all duration-200 shadow-sm shadow-primary/20"
              >
                Create Account
              </button>
            </div>
          )}

          {/* Mobile Hamburger */}
          <button
            onClick={() => setShowMenu(true)}
            className="md:hidden p-2 rounded-lg hover:bg-sky-100 transition-colors"
          >
            <img className="w-5" src={assets.menu_icon} alt="menu" />
          </button>
        </div>
        </nav>
      </div>

      {/* ─── Mobile Menu ─────────────────────────────────────────── */}
      <div
        className={`fixed inset-0 z-40 md:hidden transition-all duration-300 ${
          showMenu ? "visible" : "invisible"
        }`}
      >
        {/* Backdrop */}
        <div
          className={`absolute inset-0 bg-black/30 transition-opacity duration-300 ${
            showMenu ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setShowMenu(false)}
        />

        {/* Slide-in Panel */}
        <div
          className={`absolute right-0 top-0 bottom-0 w-72 bg-white shadow-2xl transition-transform duration-300 flex flex-col ${
            showMenu ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100">
            <img className="w-44" src={assets.logo} alt="MediBridge" />
            <button
              onClick={() => setShowMenu(false)}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <img className="w-5" src={assets.cross_icon} alt="close" />
            </button>
          </div>

          <ul className="flex flex-col px-4 pt-4 gap-1">
            {navLinks.map(({ to, label, onClick }) => (
              to ? (
                <NavLink
                  key={to}
                  to={to}
                  onClick={() => setShowMenu(false)}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl text-sm font-semibold tracking-wide transition-colors ${
                      isActive
                        ? "text-primary bg-primary/8"
                        : "text-gray-600 hover:text-primary hover:bg-primary/5"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ) : (
                <button
                  key={label}
                  onClick={() => { setShowMenu(false); onClick?.(); }}
                  className="block w-full text-left px-4 py-3 rounded-xl text-sm font-semibold tracking-wide text-gray-700 hover:text-primary hover:bg-primary/5 transition-colors"
                >
                  {label}
                </button>
              )
            ))}
          </ul>

          {!isLoggedIn && (
            <div className="mt-auto px-6 py-6 flex flex-col gap-2 border-t border-gray-100 bg-white">
              <button
                onClick={() => { setShowMenu(false); navigate("/login"); }}
                className="w-full py-3 rounded-full border border-primary text-primary font-semibold text-sm hover:bg-primary/5 transition-colors"
              >
                Login
              </button>
              <button
                onClick={() => { setShowMenu(false); navigate("/signup"); }}
                className="w-full py-3 rounded-full bg-primary text-white font-semibold text-sm hover:bg-primary/90 transition-colors"
              >
                Create Account
              </button>
            </div>
          )}

          {isLoggedIn && (
            <div className="mt-auto px-6 py-6 flex flex-col gap-2 border-t border-gray-100 bg-white">
              <button
                onClick={() => { setShowMenu(false); navigate("/my-profile"); }}
                className="w-full py-3 rounded-full border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                My Profile
              </button>
              <button
                onClick={() => { setShowMenu(false); navigate("/my-appointments"); }}
                className="w-full py-3 rounded-full border border-gray-200 text-gray-600 font-semibold text-sm hover:bg-gray-50 transition-colors"
              >
                My Appointments
              </button>
              <button
                onClick={() => { setShowMenu(false); logout(); }}
                className="w-full py-3 rounded-full bg-red-50 text-red-500 font-semibold text-sm hover:bg-red-100 transition-colors"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Modal Animation ─────────────────────────────────────── */}
      <style>{`
        @keyframes modalIn {
          from { opacity: 0; transform: scale(0.95) translateY(8px); }
          to   { opacity: 1; transform: scale(1)    translateY(0); }
        }
        .animate-modal-in { animation: modalIn 0.2s ease-out both; }
      `}</style>
    </>
  );
};

export default Navbar;