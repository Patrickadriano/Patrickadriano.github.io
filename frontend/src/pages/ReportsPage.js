import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Calendar } from '../components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '../components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { FileText, Download, CalendarIcon, Save } from 'lucide-react';
import axios from 'axios';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ReportsPage() {
  const { authHeaders, API, token } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateStr, setDateStr] = useState(new Date().toISOString().slice(0, 10));
  const [report, setReport] = useState(null);
  const [observation, setObservation] = useState('');
  const [porterName, setPorterName] = useState('');
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const loadReport = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/reports/daily?date=${dateStr}`, { headers: authHeaders });
      setReport(res.data);
      setObservation(res.data.observation || '');
      setPorterName(res.data.porter_name || '');
    } catch (err) {
      console.error(err);
    }
  }, [API, authHeaders, dateStr]);

  useEffect(() => { loadReport(); }, [loadReport]);

  const handleDateSelect = (date) => {
    if (date) {
      setSelectedDate(date);
      setDateStr(format(date, 'yyyy-MM-dd'));
      setDatePickerOpen(false);
    }
  };

  const handleSaveObservation = async () => {
    setSaving(true);
    try {
      await axios.post(`${API}/reports/observation?date=${dateStr}`, {
        observation,
        porter_name: porterName
      }, { headers: authHeaders });
      toast.success('Observações salvas');
    } catch (err) {
      toast.error('Erro ao salvar');
    }
    setSaving(false);
  };

  const handleExportExcel = () => {
    const url = `${API}/reports/export/excel?date=${dateStr}&authorization=Bearer ${token}`;
    window.open(url, '_blank');
  };

  const handleExportPDF = () => {
    const url = `${API}/reports/export/pdf?date=${dateStr}&authorization=Bearer ${token}`;
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-6" data-testid="reports-page">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 pb-4 gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Relatório Diário
          </h1>
          <p className="text-sm text-slate-500 mt-1">Gere e exporte o relatório completo do dia</p>
        </div>
        <div className="flex items-center gap-3">
          <Popover open={datePickerOpen} onOpenChange={setDatePickerOpen}>
            <PopoverTrigger asChild>
              <Button
                data-testid="report-date-picker"
                variant="outline"
                className="bg-white border-slate-300"
              >
                <CalendarIcon className="mr-2 h-4 w-4 text-slate-400" strokeWidth={1.5} />
                {format(selectedDate, 'dd/MM/yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                locale={ptBR}
              />
            </PopoverContent>
          </Popover>
          <Button
            data-testid="export-excel-button"
            variant="outline"
            className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
            onClick={handleExportExcel}
          >
            <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
            Excel
          </Button>
          <Button
            data-testid="export-pdf-button"
            variant="outline"
            className="border-red-200 text-red-700 hover:bg-red-50"
            onClick={handleExportPDF}
          >
            <Download className="w-4 h-4 mr-2" strokeWidth={1.5} />
            PDF
          </Button>
        </div>
      </div>

      {report && (
        <div className="space-y-6">
          {/* Visitors Section */}
          <Card className="bg-white border border-slate-200 shadow-sm" data-testid="report-visitors-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <FileText className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                Visitantes
                <Badge className="border-transparent bg-blue-100 text-blue-800 ml-auto">{report.visitors.length}</Badge>
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
                    <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.visitors.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-sm text-slate-400">Nenhum visitante neste dia</TableCell>
                    </TableRow>
                  ) : (
                    report.visitors.map((v) => (
                      <TableRow key={v.id}>
                        <TableCell className="font-medium text-slate-700">{v.name}</TableCell>
                        <TableCell className="font-mono text-sm tabular-nums text-slate-600">{v.document}</TableCell>
                        <TableCell className="font-mono text-sm tabular-nums text-slate-600">
                          {v.entry_time ? v.entry_time.slice(11, 16) : '—'}
                        </TableCell>
                        <TableCell className="font-mono text-sm tabular-nums text-slate-600">
                          {v.exit_time ? v.exit_time.slice(11, 16) : 'Em andamento'}
                        </TableCell>
                        <TableCell className="font-mono text-sm tabular-nums text-slate-600">{v.vehicle_plate || '—'}</TableCell>
                        <TableCell className="text-sm text-slate-600">{v.company || '—'}</TableCell>
                        <TableCell className="text-sm text-slate-600 max-w-[200px] truncate">{v.observation || '—'}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Fleet Section */}
          <Card className="bg-white border border-slate-200 shadow-sm" data-testid="report-fleet-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
              <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <FileText className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
                Controle de Frota
                <Badge className="border-transparent bg-blue-100 text-blue-800 ml-auto">{report.fleet.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Motorista</TableHead>
                    <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Veículo</TableHead>
                    <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">KM Saída</TableHead>
                    <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">KM Entrada</TableHead>
                    <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide bg-slate-100 font-bold">Distância</TableHead>
                    <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {report.fleet.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-sm text-slate-400">Nenhum registro de frota</TableCell>
                    </TableRow>
                  ) : (
                    report.fleet.map((f) => (
                      <TableRow key={f.id}>
                        <TableCell className="font-medium text-slate-700">{f.driver_name}</TableCell>
                        <TableCell className="text-sm text-slate-600">{f.vehicle}</TableCell>
                        <TableCell className="font-mono text-sm tabular-nums text-slate-600">{f.departure_km}</TableCell>
                        <TableCell className="font-mono text-sm tabular-nums text-slate-600">{f.arrival_km ?? '—'}</TableCell>
                        <TableCell className="font-mono text-sm tabular-nums font-bold bg-slate-50 text-slate-900">
                          {f.distance != null ? `${f.distance} km` : '—'}
                        </TableCell>
                        <TableCell>
                          {f.status === 'retornado' ? (
                            <Badge className="border-transparent bg-emerald-100 text-emerald-800">Retornado</Badge>
                          ) : (
                            <Badge className="border-transparent bg-amber-100 text-amber-800">Em viagem</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Observations Section */}
          <Card className="bg-white border border-slate-200 shadow-sm" data-testid="report-observations-card">
            <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
              <CardTitle className="text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
                Observações do Dia
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Observações Gerais</Label>
                <Textarea
                  data-testid="report-observation-textarea"
                  placeholder="Escreva as observações do dia..."
                  className="bg-white border-slate-300 min-h-[120px]"
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Nome do Porteiro Responsável</Label>
                <Input
                  data-testid="report-porter-name-input"
                  placeholder="Nome do porteiro em serviço"
                  className="bg-white border-slate-300"
                  value={porterName}
                  onChange={(e) => setPorterName(e.target.value)}
                />
              </div>
              <Button
                data-testid="report-save-observation-button"
                className="bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
                onClick={handleSaveObservation}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {saving ? 'Salvando...' : 'Salvar Observações'}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
