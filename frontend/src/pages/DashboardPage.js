import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Users, Car, CalendarClock, UserCheck, ArrowRightLeft, Bell } from 'lucide-react';
import axios from 'axios';

export default function DashboardPage() {
  const { authHeaders, API } = useAuth();
  const [stats, setStats] = useState(null);
  const [todaySchedules, setTodaySchedules] = useState([]);
  const [recentVisitors, setRecentVisitors] = useState([]);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, schedulesRes, visitorsRes] = await Promise.all([
        axios.get(`${API}/dashboard/stats`, { headers: authHeaders }),
        axios.get(`${API}/schedules/today`, { headers: authHeaders }),
        axios.get(`${API}/visitors?active=true`, { headers: authHeaders }),
      ]);
      setStats(statsRes.data);
      setTodaySchedules(schedulesRes.data);
      setRecentVisitors(visitorsRes.data.slice(0, 5));
    } catch (err) {
      console.error('Dashboard load error', err);
    }
  }, [API, authHeaders]);

  useEffect(() => { loadData(); }, [loadData]);

  const kpis = stats ? [
    { label: 'Visitantes Ativos', value: stats.active_visitors, icon: Users, color: 'bg-blue-600' },
    { label: 'Visitantes Hoje', value: stats.today_visitors, icon: UserCheck, color: 'bg-emerald-600' },
    { label: 'Agendamentos Hoje', value: stats.today_schedules, icon: CalendarClock, color: 'bg-amber-600' },
    { label: 'Veículos em Viagem', value: stats.active_trips, icon: Car, color: 'bg-slate-700' },
  ] : [];

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Painel de Controle
          </h1>
          <p className="text-sm text-slate-500 mt-1">Resumo das atividades do dia</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" data-testid="kpi-section">
        {kpis.map((kpi, i) => (
          <Card key={kpi.label} className={`bg-white border border-slate-200 shadow-sm animate-fade-in stagger-${i + 1}`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wide text-slate-500">{kpi.label}</p>
                  <p className="text-3xl font-bold text-slate-900 mt-2 font-mono tabular-nums" data-testid={`kpi-${kpi.label.toLowerCase().replace(/\s/g, '-')}`}>
                    {kpi.value}
                  </p>
                </div>
                <div className={`w-12 h-12 ${kpi.color} rounded-lg flex items-center justify-center`}>
                  <kpi.icon className="w-6 h-6 text-white" strokeWidth={1.5} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Today's Schedules */}
        <Card className="bg-white border border-slate-200 shadow-sm" data-testid="today-schedules-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Bell className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
              Agendamentos de Hoje
              {todaySchedules.length > 0 && (
                <Badge className="border-transparent bg-amber-100 text-amber-800 ml-auto">
                  {todaySchedules.length} pendente{todaySchedules.length > 1 ? 's' : ''}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {todaySchedules.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum agendamento para hoje</p>
            ) : (
              <div className="space-y-3">
                {todaySchedules.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-medium text-sm text-slate-800">{s.visitor_name}</p>
                      <p className="text-xs text-slate-500">{s.company}</p>
                    </div>
                    <span className="font-mono text-sm font-medium text-blue-600 tabular-nums">{s.visit_time}</span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Visitors */}
        <Card className="bg-white border border-slate-200 shadow-sm" data-testid="active-visitors-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <ArrowRightLeft className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              Visitantes Ativos
              {recentVisitors.length > 0 && (
                <Badge className="border-transparent bg-emerald-100 text-emerald-800 ml-auto">
                  {recentVisitors.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {recentVisitors.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-6">Nenhum visitante ativo</p>
            ) : (
              <div className="space-y-3">
                {recentVisitors.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                    <div>
                      <p className="font-medium text-sm text-slate-800">{v.name}</p>
                      <p className="text-xs text-slate-500 font-mono">{v.document}</p>
                    </div>
                    <span className="font-mono text-xs text-slate-500 tabular-nums">
                      {v.entry_time ? v.entry_time.slice(11, 16) : ''}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
