import { assets } from "../assets/assets";

const Footer = () => {
  return (
    <footer className="mt-12 border-t border-sky-100 bg-gradient-to-b from-sky-50/70 to-white">
      <div className="mx-4 sm:mx-[10%] py-7">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-8 text-sm">
        {/* ------------ Left Section ------------ */}
        <div>
          <img className="mb-3 w-32" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-5 text-xs sm:text-sm">
            MediBridge is a full-stack, role-based appointment booking system tailored for hospitals, clinics, and individual practitioners. With secure authentication for patients and doctors, it streamlines appointment management, enhances communication, and simplifies healthcare operations, all in one unified platform.
          </p>
        </div>

        {/* ------------ Center Section ------------ */}
        <div>
          <p className="text-base font-semibold mb-3">COMPANY</p>
          <ul className="flex flex-col gap-1.5 text-gray-600 text-sm">
            <li>Home</li>
            <li>About us</li>
            <li>Contact us</li>
            <li>Privacy policy</li>
          </ul>
        </div>

        {/* ------------ Right Section ------------ */}
        <div>
          <p className="text-base font-semibold mb-3">GET IN TOUCH</p>
          <ul className="flex flex-col gap-1.5 text-gray-600 text-sm">
            <li>Tel: +91 90210 12345</li>
            <li>kalpeshbonde04@gmail.com</li>
          </ul>
        </div>
      </div>

      {/* ------------ Copyright Text ------------ */}
      <div className="mt-5">
        <hr />
        <p className="py-3 text-xs sm:text-sm text-center">
          Copyright © 2025  - All Right Reserved
        </p>
      </div>
      </div>
    </footer>
  );
};

export default Footer;
