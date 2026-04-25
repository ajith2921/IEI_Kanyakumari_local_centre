import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import './membership-navbar.css';

const IEI_LOGO =
  'https://alchetron.com/cdn/institution-of-engineers-india-9cb687ed-c30b-4f38-81f5-344346463d2-resize-750.png';

const NAV_ITEMS = [
  {
    id: 'about',
    label: 'About',
    icon: 'about',
    to: '/membership',
    dropdown: [
      { label: 'About IEI', to: '/membership' },
      { label: 'Engg Divisions', to: null },
      { label: 'IEI Council', to: null },
      { label: 'Policies and Regulations', to: null },
      { label: 'IEI Centres & Network', to: null },
      { label: 'IEI Guest House', to: null },
      { label: 'Tender Notice', to: null },
      { label: 'Leadership', to: null },
      { label: 'Career', to: null },
    ],
  },
  {
    id: 'membership',
    label: 'Membership',
    icon: 'membership',
    to: '/membership/become-member',
    dropdown: [
      { label: 'Membership Overview', to: '/membership' },
      { label: 'Become a Member', to: '/membership/become-member' },
      { label: 'Membership Types', to: '/membership/grades' },
      { label: 'Subscription / Renewal', to: '/membership/member-services' },
      { label: 'Member Benefits', to: '/membership/benefits' },
      { label: 'Downloads / Forms', to: null },
      { label: 'FAQ', to: '/membership/member-services' },
    ],
  },
  {
    id: 'certification',
    label: 'Certification and Arbitration',
    icon: 'certification',
    to: '/membership/certification',
    dropdown: [
      { label: 'Certification Overview', to: '/membership/certification' },
      { label: 'Chartered Engineer (CEng)', to: '/membership/certification' },
      { label: 'Professional Engineer (PEng)', to: '/membership/certification' },
      { label: 'Section A & B Examination', to: '/membership/certification' },
      { label: 'Arbitration Services', to: null },
      { label: 'Apply / Track Status', to: '/membership/certification' },
    ],
  },
  {
    id: 'publication',
    label: 'Publication',
    icon: 'publication',
    to: '/membership/publications',
    dropdown: [
      { label: 'Journals & Transactions', to: '/membership/publications' },
      { label: 'Newsletters', to: '/membership/publications' },
      { label: 'Conference Proceedings', to: '/membership/publications' },
      { label: 'IEI–Springer Book Series', to: null },
      { label: 'Publication Guidelines', to: null },
    ],
  },
  {
    id: 'technical-events',
    label: 'Technical Events',
    icon: 'events',
    to: '/membership/events-cpd',
    dropdown: [
      { label: 'Upcoming Events', to: '/membership/events-cpd' },
      { label: 'Conferences & Seminars', to: '/membership/events-cpd' },
      { label: 'Workshops', to: '/membership/events-cpd' },
      { label: 'Student Chapters', to: '/membership/events-cpd' },
      { label: 'Technical Competitions', to: null },
    ],
  },
  {
    id: 'prize-awards',
    label: 'Prize & Awards',
    icon: 'awards',
    to: null,
    dropdown: [
      { label: 'Award Categories', to: null },
      { label: 'Eligibility Criteria', to: null },
      { label: 'Nomination Process', to: null },
      { label: 'Past Awardees', to: null },
    ],
  },
  {
    id: 'research-grant',
    label: 'Research Grant-in-Aid',
    icon: 'research',
    to: null,
    dropdown: [
      { label: 'Scheme Details', to: null },
      { label: 'Eligibility & Guidelines', to: null },
      { label: 'Apply for Grant', to: null },
      { label: 'Check Status', to: null },
    ],
  },
  {
    id: 'education-cpd',
    label: 'Education and CPD',
    icon: 'cpd',
    to: '/membership/events-cpd',
    dropdown: [
      { label: 'CPD Programs', to: '/membership/events-cpd' },
      { label: 'Courses & Workshops', to: '/membership/events-cpd' },
      { label: 'Online Learning', to: null },
      { label: 'Registration', to: '/membership/events-cpd' },
      { label: 'CPD Certificate', to: null },
    ],
  },
];

const SOCIAL_LINKS = [
  { id: 'x', label: 'X', href: 'https://x.com' },
  { id: 'facebook', label: 'Facebook', href: 'https://facebook.com' },
  { id: 'youtube', label: 'YouTube', href: 'https://youtube.com' },
  { id: 'linkedin', label: 'LinkedIn', href: 'https://linkedin.com' },
  { id: 'instagram', label: 'Instagram', href: 'https://instagram.com' },
];

function normalizePath(value = '') {
  return String(value).split('#')[0] || '';
}

function isPathActive(pathname, to) {
  const targetPath = normalizePath(to);
  if (!targetPath) return false;
  if (targetPath === '/membership') {
    return pathname === '/membership';
  }
  return pathname === targetPath || pathname.startsWith(`${targetPath}/`);
}

function isMenuItemActive(pathname, item) {
  if (item.to && isPathActive(pathname, item.to)) return true;
  if (!item.dropdown) return false;
  return item.dropdown.some((entry) => isPathActive(pathname, entry.to));
}

function CaretIcon({ open }) {
  return (
    <svg
      viewBox='0 0 12 12'
      aria-hidden='true'
      className={`iei-membership-navbar__caret ${open ? 'is-open' : ''}`}
    >
      <path d='M2 4.25L6 8l4-3.75' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
    </svg>
  );
}

function MenuIcon({ name }) {
  switch (name) {
    case 'about':
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <circle cx='10' cy='10' r='8' fill='none' stroke='currentColor' strokeWidth='1.5' />
          <path d='M10 8v5' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
          <circle cx='10' cy='5.7' r='0.9' fill='currentColor' />
        </svg>
      );
    case 'membership':
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <circle cx='7' cy='7' r='2.5' fill='none' stroke='currentColor' strokeWidth='1.5' />
          <circle cx='13' cy='8' r='2.1' fill='none' stroke='currentColor' strokeWidth='1.5' />
          <path d='M3.2 15.2c0-2.1 1.7-3.9 3.8-3.9s3.8 1.8 3.8 3.9' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
          <path d='M10.2 15.2c0-1.7 1.3-3.1 2.9-3.1s2.9 1.4 2.9 3.1' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
        </svg>
      );
    case 'certification':
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <path d='M10 2.5l2.6 1.2 2.8-.4.7 2.8 2.2 1.8-1.7 2.2.2 2.8-2.8.7-1.5 2.4-2.5-1.3-2.5 1.3-1.5-2.4-2.8-.7.2-2.8L1.7 8.9l2.2-1.8.7-2.8 2.8.4L10 2.5z' fill='none' stroke='currentColor' strokeWidth='1.3' strokeLinejoin='round' />
          <path d='M7 10.3l1.8 1.8 3.4-3.6' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
        </svg>
      );
    case 'publication':
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <path d='M4.2 3.7h8.3a3 3 0 0 1 3 3v9.6H7.3a3.1 3.1 0 0 0-3.1 3V3.7z' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinejoin='round' />
          <path d='M7.3 19.3V8.1h8.2' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinejoin='round' />
        </svg>
      );
    case 'events':
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <rect x='3' y='4.2' width='14' height='12.5' rx='2' fill='none' stroke='currentColor' strokeWidth='1.5' />
          <path d='M6 2.8v3M14 2.8v3M3.5 8.3h13' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
          <circle cx='8' cy='11.6' r='1.1' fill='currentColor' />
          <circle cx='12.1' cy='11.6' r='1.1' fill='currentColor' />
        </svg>
      );
    case 'awards':
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <path d='M6 3h8v2.8a4 4 0 0 1-8 0V3z' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinejoin='round' />
          <path d='M6 4.8H3.5a2.3 2.3 0 0 0 2.3 2.3H6m8-2.3h2.5a2.3 2.3 0 0 1-2.3 2.3H14' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
          <path d='M10 9.8v4.2M7.1 16.8h5.8' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
        </svg>
      );
    case 'research':
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <path d='M7 3.2h6M8.1 3.2v3.6l-3.4 6.1a2 2 0 0 0 1.8 3h7a2 2 0 0 0 1.8-3L12 6.8V3.2' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' strokeLinejoin='round' />
          <path d='M7.1 11.2h5.8' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
        </svg>
      );
    case 'cpd':
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <path d='M2.5 7.4L10 3.5l7.5 3.9L10 11.3 2.5 7.4z' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinejoin='round' />
          <path d='M5.4 9.2v3.2c0 .8 2.1 2.1 4.6 2.1s4.6-1.3 4.6-2.1V9.2' fill='none' stroke='currentColor' strokeWidth='1.5' strokeLinecap='round' />
        </svg>
      );
    default:
      return (
        <svg viewBox='0 0 20 20' className='iei-membership-navbar__menu-icon' aria-hidden='true'>
          <circle cx='10' cy='10' r='7' fill='none' stroke='currentColor' strokeWidth='1.5' />
        </svg>
      );
  }
}

function SocialIcon({ name }) {
  switch (name) {
    case 'x':
      return (
        <svg viewBox='0 0 24 24' className='iei-membership-navbar__social-icon' aria-hidden='true'>
          <path d='M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L2 2.25h6.956l4.26 5.632L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z' fill='currentColor' />
        </svg>
      );
    case 'facebook':
      return (
        <svg viewBox='0 0 24 24' className='iei-membership-navbar__social-icon' aria-hidden='true'>
          <path d='M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073c0 6.027 4.388 11.021 10.125 11.927v-8.437H7.078v-3.49h3.047V9.413c0-3.022 1.792-4.688 4.533-4.688 1.312 0 2.686.234 2.686.234v2.97h-1.513c-1.491 0-1.956.928-1.956 1.879v2.255h3.328l-.532 3.49h-2.796v8.437C19.612 23.094 24 18.1 24 12.073z' fill='currentColor' />
        </svg>
      );
    case 'youtube':
      return (
        <svg viewBox='0 0 24 24' className='iei-membership-navbar__social-icon' aria-hidden='true'>
          <path d='M23.5 6.2a3 3 0 0 0-2.1-2.1c-1.9-.5-9.4-.5-9.4-.5s-7.5 0-9.4.5A3 3 0 0 0 .5 6.2C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1c.5-1.9.5-5.8.5-5.8s0-3.9-.5-5.8zM9.6 15.6V8.4L15.8 12l-6.2 3.6z' fill='currentColor' />
        </svg>
      );
    case 'linkedin':
      return (
        <svg viewBox='0 0 24 24' className='iei-membership-navbar__social-icon' aria-hidden='true'>
          <path d='M20.4 20.4h-3.5v-5.6c0-1.3 0-3-1.9-3s-2.1 1.5-2.1 2.9v5.7H9.4V9h3.4v1.6h.1c.5-.9 1.6-1.8 3.3-1.8 3.6 0 4.3 2.4 4.3 5.4v6.2zM5.3 7.4a2.1 2.1 0 1 1 0-4.1 2.1 2.1 0 0 1 0 4.1zm1.8 13H3.6V9h3.5v11.4zM22.2 0H1.8C.8 0 0 .8 0 1.8v20.4C0 23.2.8 24 1.8 24h20.4c1 0 1.8-.8 1.8-1.8V1.8C24 .8 23.2 0 22.2 0z' fill='currentColor' />
        </svg>
      );
    case 'instagram':
      return (
        <svg viewBox='0 0 24 24' className='iei-membership-navbar__social-icon' aria-hidden='true'>
          <path d='M7.1.1C5.9.2 5 .4 4.1.8a6.6 6.6 0 0 0-2.4 1.6A6.6 6.6 0 0 0 .1 4.8C-.3 5.7-.5 6.6-.6 7.8A59 59 0 0 0-.7 12c0 1.5 0 2.9.1 4.2.1 1.2.3 2.1.7 3a6.6 6.6 0 0 0 1.6 2.4 6.6 6.6 0 0 0 2.4 1.6c.9.4 1.8.6 3 .7A59 59 0 0 0 12 24c1.5 0 2.9 0 4.2-.1 1.2-.1 2.1-.3 3-.7a6.6 6.6 0 0 0 2.4-1.6 6.6 6.6 0 0 0 1.6-2.4c.4-.9.6-1.8.7-3 .1-1.3.1-2.7.1-4.2s0-2.9-.1-4.2c-.1-1.2-.3-2.1-.7-3a6.6 6.6 0 0 0-1.6-2.4A6.6 6.6 0 0 0 19.2.8c-.9-.4-1.8-.6-3-.7A59 59 0 0 0 12 0C10.5 0 9.1 0 7.8.1h-.7zm9 2.1c1.1.1 1.7.2 2.1.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.3 1 .4 2.1.1 1.2.1 1.6.1 4.9s0 3.7-.1 4.9c-.1 1.1-.2 1.7-.4 2.1-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .3-2.1.4-1.2.1-1.6.1-4.9.1s-3.7 0-4.9-.1c-1.1-.1-1.7-.2-2.1-.4-.6-.2-1-.5-1.4-.9-.4-.4-.7-.8-.9-1.4-.2-.4-.3-1-.4-2.1-.1-1.2-.1-1.6-.1-4.9s0-3.7.1-4.9c.1-1.1.2-1.7.4-2.1.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.3 2.1-.4 1.2-.1 1.6-.1 4.9-.1s3.7 0 4.9.1zM12 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4zm0 10.2a4 4 0 1 1 0-8.1 4 4 0 0 1 0 8.1zm6.4-11.9a1.4 1.4 0 1 0 0 2.8 1.4 1.4 0 0 0 0-2.8z' fill='currentColor' />
        </svg>
      );
    default:
      return null;
  }
}

function HamburgerIcon({ open }) {
  return (
    <span className='iei-membership-navbar__hamburger' aria-hidden='true'>
      <span className={open ? 'is-open' : ''} />
      <span className={open ? 'is-open' : ''} />
      <span className={open ? 'is-open' : ''} />
    </span>
  );
}

function DesktopMenuItem({
  item,
  isOpen,
  isActive,
  openMenu,
  closeMenu,
  toggleMenu,
  scheduleClose,
  cancelScheduledClose,
  registerContainer,
  registerTrigger,
  registerSubItem,
  onTriggerKeyDown,
  onSubmenuKeyDown,
}) {
  if (!item.dropdown) {
    return (
      <li className='iei-membership-navbar__menu-item'>
        <NavLink
          to={item.to || '/membership'}
          className={() =>
            `iei-membership-navbar__menu-link ${isActive ? 'is-active' : ''}`
          }
        >
          <MenuIcon name={item.icon} />
          <span>{item.label}</span>
        </NavLink>
      </li>
    );
  }

  const menuPanelId = `iei-membership-menu-${item.id}`;

  return (
    <li
      className={`iei-membership-navbar__menu-item iei-membership-navbar__menu-item--dropdown ${isOpen ? 'is-open' : ''}`}
      ref={(node) => registerContainer(item.id, node)}
      onMouseEnter={() => openMenu(item.id)}
      onMouseLeave={() => scheduleClose(item.id)}
      onFocusCapture={() => cancelScheduledClose()}
      onBlurCapture={() => {
        window.requestAnimationFrame(() => {
          const container = registerContainer(item.id);
          if (container && !container.contains(document.activeElement)) {
            closeMenu(item.id);
          }
        });
      }}
    >
      <button
        type='button'
        ref={(node) => registerTrigger(item.id, node)}
        className={`iei-membership-navbar__menu-trigger ${isOpen || isActive ? 'is-active' : ''}`}
        aria-expanded={isOpen ? 'true' : 'false'}
        aria-controls={menuPanelId}
        aria-haspopup='menu'
        onClick={() => toggleMenu(item.id)}
        onKeyDown={(event) => onTriggerKeyDown(event, item.id)}
      >
        <MenuIcon name={item.icon} />
        <span>{item.label}</span>
        <CaretIcon open={isOpen} />
      </button>

      <ul
        id={menuPanelId}
        role='menu'
        className='iei-membership-navbar__dropdown'
        onMouseEnter={() => cancelScheduledClose()}
        onMouseLeave={() => scheduleClose(item.id)}
      >
        {item.dropdown.map((entry, index) => {
          if (entry.to) {
            return (
              <li key={`${item.id}-${entry.label}`} role='none'>
                <NavLink
                  to={entry.to}
                  role='menuitem'
                  tabIndex={isOpen ? 0 : -1}
                  ref={(node) => registerSubItem(item.id, index, node)}
                  className={({ isActive: isChildActive }) =>
                    `iei-membership-navbar__dropdown-item ${isChildActive ? 'is-active' : ''}`
                  }
                  onClick={() => closeMenu(item.id)}
                  onKeyDown={(event) => onSubmenuKeyDown(event, item.id)}
                >
                  {entry.label}
                </NavLink>
              </li>
            );
          }

          return (
            <li key={`${item.id}-${entry.label}`} role='none'>
              <span
                role='menuitem'
                tabIndex={isOpen ? 0 : -1}
                ref={(node) => registerSubItem(item.id, index, node)}
                className='iei-membership-navbar__dropdown-item is-disabled'
                onKeyDown={(event) => onSubmenuKeyDown(event, item.id)}
              >
                {entry.label}
                <em>Soon</em>
              </span>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

function MobileMenuItem({ item, expanded, onToggle, onNavigate }) {
  const panelId = `iei-membership-mobile-panel-${item.id}`;

  if (!item.dropdown) {
    return (
      <li className='iei-membership-navbar__mobile-item'>
        <NavLink
          to={item.to || '/membership'}
          onClick={onNavigate}
          className={({ isActive }) =>
            `iei-membership-navbar__mobile-link ${isActive ? 'is-active' : ''}`
          }
        >
          <span className='iei-membership-navbar__mobile-trigger-label'>
            <MenuIcon name={item.icon} />
            <span>{item.label}</span>
          </span>
        </NavLink>
      </li>
    );
  }

  return (
    <li className='iei-membership-navbar__mobile-item'>
      <button
        type='button'
        className={`iei-membership-navbar__mobile-trigger ${expanded ? 'is-open' : ''}`}
        aria-expanded={expanded ? 'true' : 'false'}
        aria-controls={panelId}
        onClick={() => onToggle(item.id)}
      >
        <span className='iei-membership-navbar__mobile-trigger-label'>
          <MenuIcon name={item.icon} />
          <span>{item.label}</span>
        </span>
        <CaretIcon open={expanded} />
      </button>

      <ul id={panelId} className={`iei-membership-navbar__mobile-submenu ${expanded ? 'is-open' : ''}`}>
        {item.dropdown.map((entry) => {
          if (entry.to) {
            return (
              <li key={`${item.id}-${entry.label}`}>
                <NavLink
                  to={entry.to}
                  className={({ isActive }) =>
                    `iei-membership-navbar__mobile-submenu-link ${isActive ? 'is-active' : ''}`
                  }
                  onClick={onNavigate}
                >
                  {entry.label}
                </NavLink>
              </li>
            );
          }

          return (
            <li key={`${item.id}-${entry.label}`}>
              <span className='iei-membership-navbar__mobile-submenu-link is-disabled'>
                {entry.label}
                <em>Soon</em>
              </span>
            </li>
          );
        })}
      </ul>
    </li>
  );
}

export default function MembershipNavbar() {
  const [openDesktopMenuId, setOpenDesktopMenuId] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mobileExpandedMenus, setMobileExpandedMenus] = useState({});

  const location = useLocation();

  const desktopCloseTimerRef = useRef(null);
  const desktopContainerRefs = useRef({});
  const desktopTriggerRefs = useRef({});
  const desktopMenuItemRefs = useRef({});

  useEffect(() => {
    setOpenDesktopMenuId(null);
    setMobileOpen(false);
    setMobileExpandedMenus({});
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!mobileOpen) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!openDesktopMenuId) return undefined;

    const handleOutsidePointer = (event) => {
      const container = desktopContainerRefs.current[openDesktopMenuId];
      if (container && !container.contains(event.target)) {
        setOpenDesktopMenuId(null);
      }
    };

    document.addEventListener('mousedown', handleOutsidePointer);
    return () => {
      document.removeEventListener('mousedown', handleOutsidePointer);
    };
  }, [openDesktopMenuId]);

  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key !== 'Escape') return;

      if (mobileOpen) {
        setMobileOpen(false);
      }

      if (openDesktopMenuId) {
        setOpenDesktopMenuId(null);
        const trigger = desktopTriggerRefs.current[openDesktopMenuId];
        trigger?.focus();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [mobileOpen, openDesktopMenuId]);

  useEffect(() => {
    return () => {
      if (desktopCloseTimerRef.current) {
        window.clearTimeout(desktopCloseTimerRef.current);
      }
    };
  }, []);

  const clearDesktopCloseTimer = () => {
    if (desktopCloseTimerRef.current) {
      window.clearTimeout(desktopCloseTimerRef.current);
      desktopCloseTimerRef.current = null;
    }
  };

  const openDesktopMenu = (menuId) => {
    clearDesktopCloseTimer();
    setOpenDesktopMenuId(menuId);
  };

  const closeDesktopMenu = (menuId) => {
    clearDesktopCloseTimer();
    setOpenDesktopMenuId((current) => (current === menuId ? null : current));
  };

  const toggleDesktopMenu = (menuId) => {
    clearDesktopCloseTimer();
    setOpenDesktopMenuId((current) => (current === menuId ? null : menuId));
  };

  const scheduleDesktopClose = (menuId) => {
    clearDesktopCloseTimer();
    desktopCloseTimerRef.current = window.setTimeout(() => {
      setOpenDesktopMenuId((current) => (current === menuId ? null : current));
    }, 140);
  };

  const registerDesktopContainer = (menuId, node) => {
    if (typeof node !== 'undefined') {
      desktopContainerRefs.current[menuId] = node;
    }
    return desktopContainerRefs.current[menuId];
  };

  const registerDesktopTrigger = (menuId, node) => {
    if (typeof node !== 'undefined') {
      desktopTriggerRefs.current[menuId] = node;
    }
    return desktopTriggerRefs.current[menuId];
  };

  const registerDesktopSubItem = (menuId, index, node) => {
    if (!desktopMenuItemRefs.current[menuId]) {
      desktopMenuItemRefs.current[menuId] = [];
    }
    desktopMenuItemRefs.current[menuId][index] = node;
  };

  const getDesktopSubItems = (menuId) => {
    return (desktopMenuItemRefs.current[menuId] || []).filter(Boolean);
  };

  const focusDesktopSubItem = (menuId, index) => {
    const items = getDesktopSubItems(menuId);
    if (!items.length) return;

    const safeIndex = (index + items.length) % items.length;
    items[safeIndex].focus();
  };

  const handleDesktopTriggerKeyDown = (event, menuId) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openDesktopMenu(menuId);
      window.requestAnimationFrame(() => focusDesktopSubItem(menuId, 0));
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      openDesktopMenu(menuId);
      window.requestAnimationFrame(() => {
        const items = getDesktopSubItems(menuId);
        focusDesktopSubItem(menuId, items.length - 1);
      });
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      toggleDesktopMenu(menuId);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDesktopMenu(menuId);
    }
  };

  const handleDesktopSubmenuKeyDown = (event, menuId) => {
    const items = getDesktopSubItems(menuId);
    const currentIndex = items.indexOf(document.activeElement);

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      focusDesktopSubItem(menuId, currentIndex + 1);
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      focusDesktopSubItem(menuId, currentIndex - 1);
      return;
    }

    if (event.key === 'Home') {
      event.preventDefault();
      focusDesktopSubItem(menuId, 0);
      return;
    }

    if (event.key === 'End') {
      event.preventDefault();
      focusDesktopSubItem(menuId, items.length - 1);
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeDesktopMenu(menuId);
      const trigger = desktopTriggerRefs.current[menuId];
      trigger?.focus();
      return;
    }

    if (event.key === 'Tab') {
      if (!event.shiftKey && currentIndex === items.length - 1) {
        closeDesktopMenu(menuId);
      }
      if (event.shiftKey && currentIndex === 0) {
        closeDesktopMenu(menuId);
      }
    }
  };

  const toggleMobileMenuSection = (menuId) => {
    setMobileExpandedMenus((current) => ({
      ...current,
      [menuId]: !current[menuId],
    }));
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
  };

  return (
    <header className='iei-membership-navbar'>
      <a href='#main-content' className='iei-membership-navbar__skip-link'>
        Skip to main content
      </a>

      <div className='iei-membership-navbar__utility-bar'>
        <div className='iei-membership-navbar__utility-inner'>
          <Link to='/membership' className='iei-membership-navbar__brand' aria-label='Institution of Engineers India membership portal'>
            <img
              src={IEI_LOGO}
              alt='Institution of Engineers India logo'
              className='iei-membership-navbar__brand-logo'
              loading='eager'
              decoding='async'
              referrerPolicy='no-referrer'
            />
            <span className='iei-membership-navbar__brand-title'>Institution of Engineers (India)</span>
          </Link>

          <div className='iei-membership-navbar__utility-actions'>
            <Link to='/contact' className='iei-membership-navbar__contact-btn'>
              Contact Us
            </Link>

            <div className='iei-membership-navbar__social-list' aria-label='Social links'>
              {SOCIAL_LINKS.map((social) => (
                <a
                  key={social.id}
                  href={social.href}
                  target='_blank'
                  rel='noopener noreferrer'
                  title={social.label}
                  className='iei-membership-navbar__social-link'
                  aria-label={social.label}
                >
                  <SocialIcon name={social.id} />
                </a>
              ))}
            </div>

            <Link
              to='/membership/member-services#auth-panel'
              className='iei-membership-navbar__login-btn'
            >
              LOGIN
            </Link>
          </div>
        </div>
      </div>

      <div className='iei-membership-navbar__main-bar'>
        <div className='iei-membership-navbar__main-inner'>
          <nav className='iei-membership-navbar__desktop-nav' aria-label='Membership desktop menu'>
            <ul className='iei-membership-navbar__menu-list'>
              {NAV_ITEMS.map((item) => {
                const isOpen = openDesktopMenuId === item.id;
                const isActive = isMenuItemActive(location.pathname, item);

                return (
                  <DesktopMenuItem
                    key={item.id}
                    item={item}
                    isOpen={isOpen}
                    isActive={isActive}
                    openMenu={openDesktopMenu}
                    closeMenu={closeDesktopMenu}
                    toggleMenu={toggleDesktopMenu}
                    scheduleClose={scheduleDesktopClose}
                    cancelScheduledClose={clearDesktopCloseTimer}
                    registerContainer={registerDesktopContainer}
                    registerTrigger={registerDesktopTrigger}
                    registerSubItem={registerDesktopSubItem}
                    onTriggerKeyDown={handleDesktopTriggerKeyDown}
                    onSubmenuKeyDown={handleDesktopSubmenuKeyDown}
                  />
                );
              })}
            </ul>
          </nav>

          <button
            type='button'
            className='iei-membership-navbar__menu-toggle'
            aria-label='Open membership menu'
            aria-controls='iei-membership-mobile-nav'
            aria-expanded={mobileOpen ? 'true' : 'false'}
            onClick={() => setMobileOpen((current) => !current)}
          >
            <HamburgerIcon open={mobileOpen} />
          </button>
        </div>
      </div>

      <div
        className={`iei-membership-navbar__offcanvas-backdrop ${mobileOpen ? 'is-open' : ''}`}
        onClick={closeMobileMenu}
        aria-hidden='true'
      />

      <aside
        id='iei-membership-mobile-nav'
        className={`iei-membership-navbar__offcanvas ${mobileOpen ? 'is-open' : ''}`}
        aria-hidden={mobileOpen ? 'false' : 'true'}
      >
        <div className='iei-membership-navbar__offcanvas-header'>
          <p>Membership Menu</p>
          <button type='button' onClick={closeMobileMenu} aria-label='Close membership menu'>
            Close
          </button>
        </div>

        <nav className='iei-membership-navbar__mobile-nav' aria-label='Membership mobile menu'>
          <ul>
            {NAV_ITEMS.map((item) => (
              <MobileMenuItem
                key={item.id}
                item={item}
                expanded={Boolean(mobileExpandedMenus[item.id])}
                onToggle={toggleMobileMenuSection}
                onNavigate={closeMobileMenu}
              />
            ))}
          </ul>
        </nav>

        <div className='iei-membership-navbar__offcanvas-footer'>
          <Link to='/contact' className='iei-membership-navbar__offcanvas-contact' onClick={closeMobileMenu}>
            Contact Us
          </Link>
          <Link
            to='/membership/member-services#auth-panel'
            className='iei-membership-navbar__offcanvas-login'
            onClick={closeMobileMenu}
          >
            LOGIN
          </Link>

          <div className='iei-membership-navbar__offcanvas-social'>
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.id}
                href={social.href}
                target='_blank'
                rel='noopener noreferrer'
                title={social.label}
                className='iei-membership-navbar__social-link'
                aria-label={social.label}
              >
                <SocialIcon name={social.id} />
              </a>
            ))}
          </div>
        </div>
      </aside>
    </header>
  );
}
