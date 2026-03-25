import { useNavigate } from "react-router-dom";

const HospitalPortalSection = () => {
  const navigate = useNavigate();

  return (
    <section className="my-16 sm:my-20">
      <div className="relative overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-r from-sky-50 via-white to-cyan-50 p-6 sm:p-10 shadow-[0_18px_40px_rgba(14,116,144,0.10)]">
        <div className="absolute -top-20 -right-16 h-56 w-56 rounded-full bg-cyan-200/30 blur-3xl" />
        <div className="absolute -bottom-16 -left-20 h-52 w-52 rounded-full bg-sky-200/30 blur-3xl" />

        <div className="relative z-10 grid gap-7 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
          <div>
            <p className="inline-flex items-center rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-semibold tracking-wide text-sky-700">
              Hospital Portal
            </p>
            <h2 className="mt-4 text-2xl sm:text-3xl font-semibold text-slate-900 leading-tight">
              Run your hospital operations in one secure dashboard
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-700 leading-7 max-w-2xl">
              Register your hospital, link doctors, manage care teams, and keep appointments organized across specialties and cities. MediBridge helps hospitals stay discoverable and operational from a single control center.
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => navigate("/hospital/register")}
                className="rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary/90"
              >
                Register Hospital
              </button>
              <button
                onClick={() => navigate("/hospital/login")}
                className="rounded-full border border-sky-300 bg-white px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-primary hover:text-primary"
              >
                Hospital Login
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-sky-100 bg-white/90 p-5 sm:p-6 shadow-sm">
            <p className="text-sm font-semibold text-slate-900">What hospitals can do</p>
            <ul className="mt-4 space-y-3 text-sm text-slate-700">
              <li>Link and manage doctor profiles from one place</li>
              <li>Maintain city-specific visibility for better patient reach</li>
              <li>Track appointments and improve scheduling efficiency</li>
              <li>Offer trusted, verified care through one branded portal</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HospitalPortalSection;
