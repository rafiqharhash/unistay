import { Link } from 'react-router-dom';
import { GraduationCap, Github, Mail, MapPin } from 'lucide-react';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-dark-900 border-t border-dark-100 dark:border-dark-800 mt-auto">
      <div className="page-container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4 w-fit">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <GraduationCap size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-xl text-dark-900 dark:text-white">
                Uni<span className="text-primary-500">Stay</span>
              </span>
            </Link>
            <p className="text-sm text-dark-500 dark:text-dark-400 leading-relaxed max-w-xs">
              UniStay helps university students find furnished apartments quickly and easily.
              Browse areas, filter by price, and connect with landlords.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-4 text-sm uppercase tracking-wider">
              Quick Links
            </h3>
            <ul className="space-y-2.5">
              {[
                { label: 'Browse Districts', to: '/' },
                { label: 'Search Apartments', to: '/search' },
                { label: 'Admin Login', to: '/admin/login' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-dark-500 dark:text-dark-400 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-dark-800 dark:text-dark-200 mb-4 text-sm uppercase tracking-wider">
              Contact
            </h3>
            <ul className="space-y-2.5">
              <li className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                <Mail size={14} className="text-primary-500 shrink-0" />
                support@unistay.com
              </li>
              <li className="flex items-center gap-2 text-sm text-dark-500 dark:text-dark-400">
                <MapPin size={14} className="text-primary-500 shrink-0" />
                University District
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-dark-100 dark:border-dark-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-dark-400 dark:text-dark-500">
            © {currentYear} UniStay. All rights reserved.
          </p>
          <div className="flex items-center gap-1 text-sm text-dark-400 dark:text-dark-500">
            <span>Built with</span>
            <span className="text-primary-500 mx-1">♥</span>
            <span>for students</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
