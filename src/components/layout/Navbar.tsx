import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { ArrowRight, Menu, Moon, Sun, X } from 'lucide-react';
import { Logo } from '../ui/Logo';
import { useTheme, useAuth } from '../../context';
import { ROUTES } from '../../constants';
import styles from './Navbar.module.css';

const publicLinks = [
  { to: ROUTES.HOME, label: 'Inicio' },
  { to: ROUTES.CARACTERISTICAS, label: 'Cómo funciona' },
  { to: ROUTES.LICENCIAMIENTOS, label: 'Planes' },
  { to: ROUTES.FAQ, label: 'Ayuda' },
  { to: ROUTES.CONTACTO, label: 'Contacto' },
];

export function Navbar() {
  const { theme, toggleTheme } = useTheme();
  const { isAuthenticated } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={styles.navbar}>
      <div className={styles.container}>
        <Link to={ROUTES.HOME} className={styles.brand} onClick={closeMenu} aria-label="BioGuard, inicio">
          <Logo size={42} showText={false} decorative />
          <span className={styles.brandName}>BioGuard</span>
        </Link>

        <nav className={styles.navLinks} aria-label="Navegación principal">
          {publicLinks.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === ROUTES.HOME}
              className={({ isActive }) => isActive ? styles.activeLink : styles.link}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className={styles.actions}>
          <button onClick={toggleTheme} className={styles.iconButton} aria-label={theme === 'dark' ? 'Usar tema claro' : 'Usar tema oscuro'}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {isAuthenticated ? (
            <Link to={ROUTES.DASHBOARD} className={styles.consoleLink}>
              Ir al panel <ArrowRight size={15} aria-hidden="true" />
            </Link>
          ) : (
            <div className={styles.authLinks}>
              <Link to={ROUTES.LOGIN} className={styles.loginLink}>Iniciar sesión</Link>
              <Link to={ROUTES.REGISTRO} className={styles.registerLink}>Crear cuenta</Link>
            </div>
          )}

          <button
            type="button"
            className={styles.menuButton}
            aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
            aria-expanded={menuOpen}
            aria-controls="public-mobile-menu"
            onClick={() => setMenuOpen((value) => !value)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav id="public-mobile-menu" className={styles.mobileMenu} aria-label="Navegación móvil">
          {publicLinks.map((item) => (
            <NavLink key={item.to} to={item.to} onClick={closeMenu}>
              {item.label}
            </NavLink>
          ))}
          {!isAuthenticated && <Link to={ROUTES.LOGIN} onClick={closeMenu}>Iniciar sesión</Link>}
        </nav>
      )}
    </header>
  );
}
