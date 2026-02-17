import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { toast } from 'sonner';
import { Car, ArrowRight, RotateCcw, Gauge } from 'lucide-react';
import axios from 'axios';

export default function FleetPage() {
  const { authHeaders, API } = useAuth();
  const [trips, setTrips] = useState([]);
  const [form, setForm] = useState({ driver_name: '', vehicle: '', departure_km: '' });
  const [loading, setLoading] = useState(false);
  const [returnDialog, setReturnDialog] = useState({ open: false, trip: null, arrival_km: '' });

  const loadTrips = useCallback(async () => {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const res = await axios.get(`${API}/fleet?date=${today}`, { headers: authHeaders });
      setTrips(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [API, authHeaders]);

  useEffect(() => { loadTrips(); }, [loadTrips]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.driver_name || !form.vehicle || !form.departure_km) {
      toast.error('Todos os campos são obrigatórios');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API}/fleet`, {
        ...form,
        departure_km: parseFloat(form.departure_km)
      }, { headers: authHeaders });
      toast.success('Saída de veículo registrada');
      setForm({ driver_name: '', vehicle: '', departure_km: '' });
      loadTrips();
    } catch (err) {
      toast.error('Erro ao registrar saída');
    }
    setLoading(false);
  };

  const handleReturn = async () => {
    if (!returnDialog.arrival_km) {
      toast.error('KM de entrada é obrigatório');
      return;
    }
    try {
      const res = await axios.put(`${API}/fleet/${returnDialog.trip.id}/return`, {
        arrival_km: parseFloat(returnDialog.arrival_km)
      }, { headers: authHeaders });
      toast.success(`Retorno registrado! Distância: ${res.data.distance} km`);
      setReturnDialog({ open: false, trip: null, arrival_km: '' });
      loadTrips();
    } catch (err) {
      toast.error('Erro ao registrar retorno');
    }
  };

  const activeTrips = trips.filter(t => t.status === 'em_viagem');

  return (
    <div className="space-y-6" data-testid="fleet-page">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Controle de Frota
        </h1>
        <p className="text-sm text-slate-500 mt-1">Gerencie as viagens dos veículos da empresa</p>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Vehicle Out Form */}
        <Card className="bg-white border border-slate-200 shadow-sm" data-testid="fleet-departure-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <ArrowRight className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              Registrar Saída
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4" data-testid="fleet-form">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Motorista *</Label>
                <Input
                  data-testid="fleet-driver-input"
                  placeholder="Nome do motorista"
                  className="bg-white border-slate-300"
                  value={form.driver_name}
                  onChange={(e) => setForm({...form, driver_name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Veículo *</Label>
                <Input
                  data-testid="fleet-vehicle-input"
                  placeholder="Ex: Fiat Toro - ABC-1234"
                  className="bg-white border-slate-300"
                  value={form.vehicle}
                  onChange={(e) => setForm({...form, vehicle: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Gauge className="w-3 h-3 inline mr-1" strokeWidth={1.5} />KM de Saída *
                </Label>
                <Input
                  data-testid="fleet-departure-km-input"
                  type="number"
                  step="0.1"
                  placeholder="Ex: 45230"
                  className="bg-white border-slate-300 font-mono"
                  value={form.departure_km}
                  onChange={(e) => setForm({...form, departure_km: e.target.value})}
                  required
                />
              </div>
              <Button
                data-testid="fleet-submit-button"
                type="submit"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
                disabled={loading}
              >
                <Car className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {loading ? 'Registrando...' : 'Registrar Saída'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Active Vehicles */}
        <Card className="bg-white border border-slate-200 shadow-sm" data-testid="fleet-active-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Car className="w-5 h-5 text-amber-600" strokeWidth={1.5} />
              Veículos em Viagem
              <Badge className="border-transparent bg-amber-100 text-amber-800 ml-auto">{activeTrips.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            {activeTrips.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-8">Nenhum veículo em viagem</p>
            ) : (
              <div className="space-y-3">
                {activeTrips.map((t) => (
                  <div key={t.id} className="p-4 bg-slate-50 rounded-lg border border-slate-100 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-sm text-slate-800">{t.driver_name}</p>
                        <p className="text-xs text-slate-500">{t.vehicle}</p>
                      </div>
                      <span className="font-mono text-xs bg-slate-200 text-slate-700 px-2 py-1 rounded tabular-nums">
                        {t.departure_km} km
                      </span>
                    </div>
                    <Button
                      data-testid={`fleet-return-button-${t.id}`}
                      variant="outline"
                      size="sm"
                      className="w-full text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                      onClick={() => setReturnDialog({ open: true, trip: t, arrival_km: '' })}
                    >
                      <RotateCcw className="w-3 h-3 mr-1" strokeWidth={1.5} />
                      Registrar Retorno
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Trip History Table */}
      <Card className="bg-white border border-slate-200 shadow-sm" data-testid="fleet-history-card">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
          <CardTitle className="text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Histórico de Hoje
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
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide bg-slate-100 font-bold">Distância (KM)</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {trips.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-sm text-slate-400">
                    Nenhum registro de frota hoje
                  </TableCell>
                </TableRow>
              ) : (
                trips.map((t) => (
                  <TableRow key={t.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-700">{t.driver_name}</TableCell>
                    <TableCell className="text-sm text-slate-600">{t.vehicle}</TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-slate-600">{t.departure_km}</TableCell>
                    <TableCell className="font-mono text-sm tabular-nums text-slate-600">
                      {t.arrival_km != null ? t.arrival_km : '—'}
                    </TableCell>
                    <TableCell className="font-mono text-sm tabular-nums font-bold bg-slate-50 text-slate-900">
                      {t.distance != null ? `${t.distance} km` : '—'}
                    </TableCell>
                    <TableCell>
                      {t.status === 'retornado' ? (
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

      {/* Return Dialog */}
      <Dialog open={returnDialog.open} onOpenChange={(open) => setReturnDialog({ ...returnDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Outfit, sans-serif' }}>Registrar Retorno</DialogTitle>
            <DialogDescription>
              {returnDialog.trip && (
                <span className="text-sm text-slate-500">
                  {returnDialog.trip.driver_name} — {returnDialog.trip.vehicle}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {returnDialog.trip && (
              <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                <p className="text-xs font-bold uppercase tracking-wide text-slate-500">KM de Saída</p>
                <p className="font-mono text-lg font-bold text-slate-900 tabular-nums">{returnDialog.trip.departure_km} km</p>
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">KM de Entrada *</Label>
              <Input
                data-testid="fleet-arrival-km-input"
                type="number"
                step="0.1"
                placeholder="Ex: 45380"
                className="bg-white border-slate-300 font-mono text-lg"
                value={returnDialog.arrival_km}
                onChange={(e) => setReturnDialog({ ...returnDialog, arrival_km: e.target.value })}
              />
            </div>
            {returnDialog.trip && returnDialog.arrival_km && (
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="text-xs font-bold uppercase tracking-wide text-blue-600">Distância Percorrida</p>
                <p className="font-mono text-2xl font-bold text-blue-700 tabular-nums">
                  {(parseFloat(returnDialog.arrival_km) - returnDialog.trip.departure_km).toFixed(1)} km
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReturnDialog({ open: false, trip: null, arrival_km: '' })}>
              Cancelar
            </Button>
            <Button
              data-testid="fleet-confirm-return-button"
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleReturn}
            >
              Confirmar Retorno
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
