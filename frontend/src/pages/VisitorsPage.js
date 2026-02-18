import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { UserPlus, LogOut, Clock, Building2, Car, FileText, Receipt } from 'lucide-react';
import axios from 'axios';

export default function VisitorsPage() {
  const { authHeaders, API } = useAuth();
  const [visitors, setVisitors] = useState([]);
  const [form, setForm] = useState({ name: '', document: '', vehicle_plate: '', company: '', observation: '', invoice: '' });
  const [loading, setLoading] = useState(false);

  const loadVisitors = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await axios.get(`${API}/visitors?date=${today}`, { headers: authHeaders });
      setVisitors(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [API, authHeaders]);

  useEffect(() => { loadVisitors(); }, [loadVisitors]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.document) {
      toast.error('Nome e documento são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/visitors`, form, { headers: authHeaders });
      toast.success('Visitante registrado com sucesso');
      setForm({ name: '', document: '', vehicle_plate: '', company: '', observation: '', invoice: '' });
      loadVisitors();
    } catch (err) {
      toast.error('Erro ao registrar visitante');
    }
    setLoading(false);
  };

  const handleCheckout = async (id) => {
    try {
      await axios.put(`${API}/visitors/${id}/checkout`, {}, { headers: authHeaders });
      toast.success('Saída registrada com sucesso');
      loadVisitors();
    } catch (err) {
      toast.error('Erro ao registrar saída');
    }
  };

  const activeVisitors = visitors.filter(v => !v.exit_time);

  return (
    <div className="space-y-6" data-testid="visitors-page">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Cadastro de Visitantes
        </h1>
        <p className="text-sm text-slate-500 mt-1">Registre a entrada e saída de visitantes</p>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        {/* Registration Form */}
        <Card className="md:col-span-8 bg-white border border-slate-200 shadow-sm" data-testid="visitor-form-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <UserPlus className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              Novo Visitante
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="visitor-form">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Nome *</Label>
                  <Input
                    data-testid="visitor-name-input"
                    placeholder="Nome completo"
                    className="bg-white border-slate-300"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Documento *</Label>
                  <Input
                    data-testid="visitor-document-input"
                    placeholder="RG / CPF"
                    className="bg-white border-slate-300"
                    value={form.document}
                    onChange={(e) => setForm({...form, document: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    <Car className="w-3 h-3 inline mr-1" strokeWidth={1.5} />Placa do Veículo
                  </Label>
                  <Input
                    data-testid="visitor-plate-input"
                    placeholder="ABC-1234"
                    className="bg-white border-slate-300 font-mono"
                    value={form.vehicle_plate}
                    onChange={(e) => setForm({...form, vehicle_plate: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                    <Building2 className="w-3 h-3 inline mr-1" strokeWidth={1.5} />Empresa
                  </Label>
                  <Input
                    data-testid="visitor-company-input"
                    placeholder="Nome da empresa"
                    className="bg-white border-slate-300"
                    value={form.company}
                    onChange={(e) => setForm({...form, company: e.target.value})}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Receipt className="w-3 h-3 inline mr-1" strokeWidth={1.5} />Nota Fiscal
                </Label>
                <Input
                  data-testid="visitor-invoice-input"
                  placeholder="Número da nota fiscal"
                  className="bg-white border-slate-300 font-mono"
                  value={form.invoice}
                  onChange={(e) => setForm({...form, invoice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <FileText className="w-3 h-3 inline mr-1" strokeWidth={1.5} />Observação
                </Label>
                <Textarea
                  data-testid="visitor-observation-input"
                  placeholder="Observações sobre a visita..."
                  className="bg-white border-slate-300 min-h-[80px]"
                  value={form.observation}
                  onChange={(e) => setForm({...form, observation: e.target.value})}
                />
              </div>
              <Button
                data-testid="visitor-submit-button"
                type="submit"
                className="bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
                disabled={loading}
              >
                <UserPlus className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {loading ? 'Registrando...' : 'Registrar Entrada'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Visitors Sidebar */}
        <Card className="md:col-span-4 bg-white border border-slate-200 shadow-sm h-fit" data-testid="active-visitors-sidebar">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-base font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Clock className="w-4 h-4 text-emerald-600" strokeWidth={1.5} />
              Ativos
              <Badge className="border-transparent bg-emerald-100 text-emerald-800 ml-auto">
                {activeVisitors.length}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 max-h-[400px] overflow-y-auto">
            {activeVisitors.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum visitante ativo</p>
            ) : (
              <div className="space-y-2">
                {activeVisitors.map((v) => (
                  <div key={v.id} className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-slate-800">{v.name}</p>
                        <p className="text-xs text-slate-500 font-mono">{v.document}</p>
                        {v.company && <p className="text-xs text-slate-400 mt-0.5">{v.company}</p>}
                      </div>
                      <span className="font-mono text-xs text-slate-500 tabular-nums">
                        {v.entry_time ? v.entry_time.slice(11, 16) : ''}
                      </span>
                    </div>
                    <Button
                      data-testid={`checkout-button-${v.id}`}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-red-200 text-red-700 hover:bg-red-50 hover:text-red-800"
                      onClick={() => handleCheckout(v.id)}
                    >
                      <LogOut className="w-3 h-3 mr-1" strokeWidth={1.5} />
                      Registrar Saída
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Today's Visitor Table */}
      <Card className="bg-white border border-slate-200 shadow-sm" data-testid="visitors-table-card">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
          <CardTitle className="text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Registros de Hoje
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Documento</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Entrada</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Saída</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Placa</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Empresa</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Nota Fiscal</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {visitors.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-sm text-slate-400">
                    Nenhum visitante registrado hoje
                  </TableCell>
                </TableRow>
              ) : (
                visitors.map((v) => (
                  <TableRow key={v.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-700">{v.name}</TableCell>
                    <TableCell className="font-mono text-sm text-slate-600 tabular-nums">{v.document}</TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-slate-600">
                      {v.entry_time ? v.entry_time.slice(11, 16) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-slate-600">
                      {v.exit_time ? v.exit_time.slice(11, 16) : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-slate-600">{v.vehicle_plate || '—'}</TableCell>
                    <TableCell className="text-sm text-slate-600">{v.company || '—'}</TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-slate-600">{v.invoice || '—'}</TableCell>
                    <TableCell>
                      {v.exit_time ? (
                        <Badge className="border-transparent bg-slate-100 text-slate-600">Saiu</Badge>
                      ) : (
                        <Badge className="border-transparent bg-emerald-100 text-emerald-800">Ativo</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
