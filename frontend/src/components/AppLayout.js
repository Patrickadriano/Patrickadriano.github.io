import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  LayoutDashboard, Users, CalendarDays, Car, FileText,
  UserCog, LogOut, Shield, Bell, ChevronLeft, ChevronRight, Menu, X, Settings
} from 'lucide-react';
import axios from 'axios';

const navItems = [
  { path: '/', label: 'Painel', icon: LayoutDashboard },
  { path: '/visitors', label: 'Visitantes', icon: Users },
  { path: '/schedules', label: 'Agendamentos', icon: CalendarDays },
  { path: '/fleet', label: 'Frota', icon: Car },
  { path: '/reports', label: 'Relatórios', icon: FileText },
  { path: '/settings', label: 'Configurações', icon: Settings },
];

const adminItems = [
  { path: '/admin', label: 'Usuários', icon: UserCog },
];

export default function AppLayout({ children }) {
  const { user, logout, authHeaders, API } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifications, setNotifications] = useState(0);

  const checkNotifications = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/schedules/today`, { headers: authHeaders });
      setNotifications(res.data.length);
    } catch { /* ignore */ }
  }, [API, authHeaders]);

  useEffect(() => {
    checkNotifications();
    const interval = setInterval(checkNotifications, 60000);
    return () => clearInterval(interval);
  }, [checkNotifications]);

  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  const allItems = user?.role === 'admin' ? [...navItems, ...adminItems] : navItems;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-50 h-full bg-slate-900 text-slate-300 flex flex-col
          transition-all duration-200 ease-out
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${collapsed ? 'w-[68px]' : 'w-[240px]'}
        `}
        data-testid="app-sidebar"
      >
        {/* Logo */}
        <div className={`flex items-center h-16 border-b border-slate-800 px-4 ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 h-4 text-white" strokeWidth={1.5} />
          </div>
          {!collapsed && (
            <span className="text-sm font-bold text-white tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              GATEKEEPER
            </span>
          )}
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-slate-800 hidden md:flex"
            onClick={() => setCollapsed(!collapsed)}
            data-testid="sidebar-toggle"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto h-7 w-7 p-0 text-slate-500 hover:text-white hover:bg-slate-800 md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {allItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                data-testid={`nav-${item.path.replace('/', '') || 'dashboard'}`}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all
                  ${isActive ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}
                  ${collapsed ? 'justify-center px-2' : ''}
                `}
              >
                <item.icon className="w-[18px] h-[18px] flex-shrink-0" strokeWidth={1.5} />
                {!collapsed && <span>{item.label}</span>}
                {!collapsed && item.path === '/schedules' && notifications > 0 && (
                  <Badge className="ml-auto border-transparent bg-amber-500 text-white text-[10px] h-5 min-w-[20px] flex items-center justify-center">
                    {notifications}
                  </Badge>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* User footer */}
        <div className={`border-t border-slate-800 p-3 ${collapsed ? 'items-center' : ''}`}>
          <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <span className="text-xs font-bold text-white">{user?.name?.charAt(0) || 'U'}</span>
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{user?.name}</p>
                <p className="text-[10px] text-slate-500 uppercase tracking-wider">{user?.role}</p>
              </div>
            )}
            {!collapsed && (
              <Button
                data-testid="logout-button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-slate-500 hover:text-white hover:bg-slate-800"
                onClick={logout}
              >
                <LogOut className="w-4 h-4" strokeWidth={1.5} />
              </Button>
            )}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        {/* Top bar (mobile) */}
        <div className="md:hidden flex items-center justify-between h-14 px-4 border-b border-slate-200 bg-white">
          <Button
            variant="ghost"
            size="sm"
            className="h-9 w-9 p-0"
            onClick={() => setMobileOpen(true)}
            data-testid="mobile-menu-button"
          >
            <Menu className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
          </Button>
          <span className="text-sm font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>GATEKEEPER</span>
          <div className="relative">
            {notifications > 0 && (
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 rounded-full flex items-center justify-center">
                <span className="text-[8px] text-white font-bold">{notifications}</span>
              </div>
            )}
            <Bell className="w-5 h-5 text-slate-500" strokeWidth={1.5} />
          </div>
        </div>

        <div className="p-6 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
