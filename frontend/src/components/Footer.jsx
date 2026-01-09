import { Link } from "react-router-dom";
import { FiPhone, FiMail, FiMapPin } from "react-icons/fi";

function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-800 bg-slate-950 text-slate-200">
      <div className="mx-auto flex w-full flex-col gap-6 px-[6vw] py-10 sm:flex-row sm:items-start sm:justify-between lg:gap-8">
        {/* Logo + company + contact */}
        <div className="flex flex-col gap-4 sm:max-w-sm">
          <div className="flex items-center gap-3">
            <img
              src="/icons/Hetave_Logo-removebg-preview.png"
              alt="Hetave logo"
              className="h-12 w-auto"
            />
            <div className="flex flex-col leading-tight">
              <span className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-50">
                Hetave Enterprises
              </span>
              <span className="text-xs uppercase tracking-[0.18em] text-slate-400">
                PPE &amp; Insurance
              </span>
            </div>
          </div>

          <p className="mb-4 ml-0 text-sm text-slate-300 sm:ml-[30px]">
            Personal Protective Equipment and safety solutions for factories,
            logistics and high‑risk worksites.
          </p>

          <div className="space-y-2 text-sm">
            <p className="font-semibold text-slate-100 sm:ml-[30px]">Contact</p>

            <p className="flex items-center gap-2 sm:ml-[30px]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[0.75rem]">
                <FiPhone className="h-3 w-3" />
              </span>
              <span>+91 80952 89835, +91 76248 18724</span>
            </p>

            <p className="flex items-center gap-2 sm:ml-[30px]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[0.75rem]">
                <FiMail className="h-3 w-3" />
              </span>
              <a
                href="mailto:sales@hetave.co.in"
                className="underline-offset-2 hover:underline"
              >
                sales@hetave.co.in
              </a>
            </p>

            <p className="flex items-center gap-2 sm:ml-[30px]">
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-800 text-[0.75rem]">
                <FiMapPin className="h-3 w-3" />
              </span>
              <span>292, Rama Vihar, Bhilwara, Rajasthan - 311001</span>
            </p>
          </div>
        </div>

        {/* Pages / links */}
        <div className="text-sm">
          <p className="mb-3 mr-40 font-semibold text-slate-100">Pages</p>
          <ul className="space-y-2 text-slate-300">
            <li>
              <Link to="/" className="hover:text-orange-400 transition">
                Home
              </Link>
            </li>
            <li>
              <Link to="/about" className="hover:text-orange-400 transition">
                About
              </Link>
            </li>
            <li>
              <Link to="/services" className="hover:text-orange-400 transition">
                Services
              </Link>
            </li>
            <li>
              <Link to="/products" className="hover:text-orange-400 transition">
                Products
              </Link>
            </li>
            <li>
              <Link to="/contact" className="hover:text-orange-400 transition">
                Contact
              </Link>
            </li>
          </ul>
        </div>

        {/* Extra column */}
        <div className="text-sm">
          <p className="mb-3 font-semibold text-slate-100">Quick Info</p>
          <ul className="space-y-2 text-slate-300">
            <li>
              <span className="cursor-default text-slate-300">
                Certified PPE supplier
              </span>
            </li>
            <li>
              <span className="cursor-default text-slate-300">
                Industrial &amp; logistics focus
              </span>
            </li>
            <li>
              <span className="cursor-default text-slate-300">
                Based in Bhilwara, Rajasthan
              </span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-800 bg-slate-950/95">
        <div className="mx-auto max-w-6xl px-4 py-3 text-center text-xs text-slate-500 sm:px-6 lg:px-8">
          © {new Date().getFullYear()} Hetave Enterprises. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;


