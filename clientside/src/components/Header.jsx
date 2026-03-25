import { useContext } from 'react'
import { assets } from '../assets/assets'
import { AppContext } from '../context/AppContext'
import { useNavigate } from 'react-router-dom'

const Header = () => {
  const { selectedCity, setSelectedCity } = useContext(AppContext)
  const navigate = useNavigate()
  const cities = ["Pune", "Mumbai", "Bangalore", "Delhi", "Hyderabad"]

  return (
    <>
      <div className="mt-1 mb-4 md:mb-6 bg-sky-50 border border-sky-100 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-700">Choose your city and find verified doctors near you</p>
          <p className="text-xs text-gray-500 mt-1">Compare doctors, hospitals, fees, and availability before booking online.</p>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="border border-sky-200 bg-white rounded-full px-4 py-2 text-sm font-medium text-gray-600 focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="">All Cities</option>
            {cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>

          <button
            onClick={() => navigate(localStorage.getItem("hospitalToken") ? "/hospital/dashboard" : "/hospital/login")}
            className="px-4 py-2 rounded-full text-sm font-semibold text-emerald-600 border border-emerald-200 bg-white hover:bg-emerald-50 transition-colors"
          >
            Hospital Portal
          </button>
        </div>
      </div>

      <div className='flex flex-col md:flex-row flex-wrap bg-primary rounded-lg px-6 md:px-10 lg:px-20'>
      {/* ------- Left Side ------- */}
      <div className='md:w-1/2 flex flex-col items-start justify-center gap-4 py-10 m-auto md:py-[10vw] md:mb-[-30px]'>
        <p className='text-3xl md:text-4xl lg:text-5xl text-white font-semibold leading-tight md:leading-tight lg:leading-tight'>
          Find Trusted Doctors <br /> In Your City
        </p>
        <div className='flex flex-col md:flex-row items-center gap-3 text-white text-sm font-light'>
            <img className='w-28' src={assets.group_profiles} alt="" loading="lazy" />
          <p>Explore doctor profiles, hospital information, consultation fees, and real-time slots, <br className='hidden sm:block' /> then confirm your appointment in minutes.</p>
        </div>
        <div className='flex flex-col sm:flex-row items-center gap-3 m-auto md:m-0'>
          <a href="#speciality" className='flex items-center gap-2 bg-white px-8 py-3 rounded-full text-gray-700 text-sm font-semibold hover:scale-105 transition-all duration-300'>
          Explore Specialists <img className='w-3' src={assets.arrow_icon} alt="" loading="lazy" />
          </a>
          <button
            onClick={() => navigate('/doctors')}
            className='flex items-center gap-2 bg-sky-100 px-8 py-3 rounded-full text-sky-900 text-sm font-semibold border border-sky-200 hover:bg-sky-200 transition-all duration-300'
          >
            Book Appointment Now
          </button>
        </div>
      </div>

      {/* ------- Right Side ------- */}
      <div className='md:w-1/2 relative'>
        <img className='w-full md:absolute bottom-0 h-auto rounded-lg' src={assets.header_img} alt="" loading="lazy" />
      </div>
      </div>
    </>
  )
}

export default Header
