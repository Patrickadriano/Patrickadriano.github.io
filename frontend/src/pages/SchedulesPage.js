import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { CalendarPlus, CalendarDays, Check, Trash2, CalendarIcon } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function SchedulesPage() {
  const { authHeaders, API } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [form, setForm] = useState({ visitor_name: '', company: '', visit_date: '', visit_time: '', notes: '' });
  const [loading, setLoading] = useState(false);
  const [datePickerOpen, setDatePickerOpen] = useState(false);

  const loadSchedules = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/schedules`, { headers: authHeaders });
      setSchedules(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [API, authHeaders]);

  useEffect(() => { loadSchedules(); }, [loadSchedules]);

  const handleDateSelect = (date) => {
    if (date) {
      setForm({ ...form, visit_date: format(date, 'yyyy-MM-dd') });
      setSelectedDate(date);
      setDatePickerOpen(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.visitor_name || !form.visit_date || !form.visit_time) {
      toast.error('Nome, data e horário são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/schedules`, form, { headers: authHeaders });
      toast.success('Agendamento criado com sucesso');
      setForm({ visitor_name: '', company: '', visit_date: '', visit_time: '', notes: '' });
      loadSchedules();
    } catch (err) {
      toast.error('Erro ao criar agendamento');
    }
    setLoading(false);
  };

  const handleComplete = async (id) => {
    try {
      await axios.put(`${API}/schedules/${id}/complete`, {}, { headers: authHeaders });
      toast.success('Agendamento concluído');
      loadSchedules();
    } catch (err) {
      toast.error('Erro ao concluir agendamento');
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API}/schedules/${id}`, { headers: authHeaders });
      toast.success('Agendamento removido');
      loadSchedules();
    } catch (err) {
      toast.error('Erro ao remover agendamento');
    }
  };

  // Get dates with schedules for calendar highlighting
  const scheduleDates = [...new Set(schedules.map(s => s.visit_date))];

  return (
    <div className="space-y-6" data-testid="schedules-page">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Agendamento de Visitas
        </h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie os agendamentos de visitas</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Calendar + Form */}
        <div className="md:col-span-5 space-y-6">
          <Card className="bg-white border border-slate-200 shadow-sm" data-testid="schedule-calendar-card">
            <CardContent className="p-4 flex justify-center">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(d) => d && handleDateSelect(d)}
                locale={ptBR}
                modifiers={{ scheduled: scheduleDates.map(d => new Date(d + 'T12:00:00')) }}
                modifiersStyles={{ scheduled: { fontWeight: 'bold', textDecoration: 'underline', color: '#2563EB' } }}
                className="rounded-md"
              />
            </CardContent>
          </Card>

          <Card className="bg-white border border-slate-200 shadow-sm" data-testid="schedule-form-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <CalendarPlus className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                Novo Agendamento
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="schedule-form">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Nome do Visitante *</Label>
                  <Input
                    data-testid="schedule-visitor-name"
                    placeholder="Nome completo"
                    className="bg-white border-slate-300"
                    value={form.visitor_name}
                    onChange={(e) => setForm({...form, visitor_name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Empresa</Label>
                  <Input
                    data-testid="schedule-company"
                    placeholder="Nome da empresa"
                    className="bg-white border-slate-300"
                    value={form.company}
                    onChange={(e) => setForm({...form, company: e.target.value})}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Data *</Label>
                    <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          data-testid="schedule-date-picker"
                          variant="outline"
                          className="w-full justify-start text-left font-normal bg-white border-slate-300 h-10"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                          {form.visit_date ? format(new Date(form.visit_date + 'T12:00:00'), 'dd/MM/yyyy') : 'Selecione'}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={form.visit_date ? new Date(form.visit_date + 'T12:00:00') : undefined}
                          onSelect={handleDateSelect}
                          locale={ptBR}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Horário *</Label>
                    <Input
                      data-testid="schedule-time"
                      type="time"
                      className="bg-white border-slate-300 font-mono"
                      value={form.visit_time}
                      onChange={(e) => setForm({...form, visit_time: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Observações</Label>
                  <Textarea
                    data-testid="schedule-notes"
                    placeholder="Notas adicionais..."
                    className="bg-white border-slate-300 min-h-[60px]"
                    value={form.notes}
                    onChange={(e) => setForm({...form, notes: e.target.value})}
                  />
                </div>
                <Button
                  data-testid="schedule-submit-button"
                  type="submit"
                  className="w-full bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
                  disabled={loading}
                >
                  <CalendarPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                  {loading ? 'Agendando...' : 'Agendar Visita'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Schedule List */}
        <Card className="md:col-span-7 bg-white border border-slate-200 shadow-sm" data-testid="schedules-list-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <CalendarDays className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              Todos os Agendamentos
              <Badge className="border-transparent bg-blue-100 text-blue-800 ml-auto">{schedules.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Visitante</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Empresa</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Data</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Horário</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Status</TableHead>
                  <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-sm text-slate-400">
                      Nenhum agendamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  schedules.map((s) => (
                    <TableRow key={s.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-700">{s.visitor_name}</TableCell>
                      <TableCell className="text-sm text-slate-600">{s.company || '—'}</TableCell>
                      <TableCell className="font-mono text-sm tabular-nums text-slate-600">
                        {s.visit_date ? format(new Date(s.visit_date + 'T12:00:00'), 'dd/MM/yyyy') : '—'}
                      </TableCell>
                      <TableCell className="font-mono text-sm tabular-nums text-blue-600 font-medium">{s.visit_time}</TableCell>
                      <TableCell>
                        {s.status === 'completed' ? (
                          <Badge className="border-transparent bg-emerald-100 text-emerald-800">Concluído</Badge>
                        ) : (
                          <Badge className="border-transparent bg-amber-100 text-amber-800">Pendente</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {s.status === 'pending' && (
                            <Button
                              data-testid={`complete-schedule-${s.id}`}
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-emerald-600 hover:bg-emerald-50"
                              onClick={() => handleComplete(s.id)}
                            >
                              <Check className="w-4 h-4" strokeWidth={1.5} />
                            </Button>
                          )}
                          <Button
                            data-testid={`delete-schedule-${s.id}`}
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                            onClick={() => handleDelete(s.id)}
                          >
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
