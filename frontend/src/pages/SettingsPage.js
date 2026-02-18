import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Settings, Server, Wifi, Globe, Save, Info } from 'lucide-react';
import axios from 'axios';

export default function SettingsPage() {
  const { authHeaders, API, user } = useAuth();
  const [config, setConfig] = useState({ server_ip: '', server_port: '3000', backend_port: '8001' });
  const [saving, setSaving] = useState(false);

  const loadSettings = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/settings`, { headers: authHeaders });
      setConfig(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [API, authHeaders]);

  useEffect(() => { loadSettings(); }, [loadSettings]);

  const handleSave = async () => {
    if (!config.server_ip) {
      toast.error('O IP do servidor é obrigatório');
      return;
    }
    setSaving(true);
    try {
      await axios.post(`${API}/settings`, config, { headers: authHeaders });
      toast.success('Configurações salvas com sucesso');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar configurações');
    }
    setSaving(false);
  };

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-6" data-testid="settings-page">
      <div className="border-b border-slate-200 pb-4">
        <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
          Configurações
        </h1>
        <p className="text-sm text-slate-500 mt-1">Configure o servidor e a rede do sistema</p>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border border-blue-200" data-testid="settings-info-card">
        <CardContent className="p-4 flex items-start gap-3">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" strokeWidth={1.5} />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Como usar o sistema na sua rede local</p>
            <ol className="list-decimal list-inside space-y-1 text-blue-700">
              <li>Descubra o IP da sua máquina na rede (ex: <code className="bg-blue-100 px-1 rounded font-mono text-xs">ipconfig</code> no Windows ou <code className="bg-blue-100 px-1 rounded font-mono text-xs">ifconfig</code> no Linux)</li>
              <li>Configure o IP abaixo com o IP da sua máquina</li>
              <li>Outros dispositivos na mesma rede poderão acessar via <code className="bg-blue-100 px-1 rounded font-mono text-xs">http://SEU_IP:PORTA</code></li>
              <li>Para acesso externo (internet), configure o redirecionamento de portas no roteador</li>
            </ol>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Server Configuration */}
        <Card className="bg-white border border-slate-200 shadow-sm" data-testid="server-config-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Server className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
              Configuração do Servidor
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                <Globe className="w-3 h-3 inline mr-1" strokeWidth={1.5} />IP do Servidor
              </Label>
              <Input
                data-testid="settings-server-ip"
                placeholder="Ex: 192.168.1.100 ou 0.0.0.0"
                className="bg-white border-slate-300 font-mono"
                value={config.server_ip}
                onChange={(e) => setConfig({...config, server_ip: e.target.value})}
                disabled={!isAdmin}
              />
              <p className="text-xs text-slate-400">Use 0.0.0.0 para aceitar conexões de qualquer IP</p>
            </div>
            <div className="grid gap-4 grid-cols-2">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Wifi className="w-3 h-3 inline mr-1" strokeWidth={1.5} />Porta Frontend
                </Label>
                <Input
                  data-testid="settings-server-port"
                  placeholder="3000"
                  className="bg-white border-slate-300 font-mono"
                  value={config.server_port}
                  onChange={(e) => setConfig({...config, server_port: e.target.value})}
                  disabled={!isAdmin}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  <Server className="w-3 h-3 inline mr-1" strokeWidth={1.5} />Porta Backend (API)
                </Label>
                <Input
                  data-testid="settings-backend-port"
                  placeholder="8001"
                  className="bg-white border-slate-300 font-mono"
                  value={config.backend_port}
                  onChange={(e) => setConfig({...config, backend_port: e.target.value})}
                  disabled={!isAdmin}
                />
              </div>
            </div>
            {isAdmin ? (
              <Button
                data-testid="settings-save-button"
                className="w-full bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-2" strokeWidth={1.5} />
                {saving ? 'Salvando...' : 'Salvar Configurações'}
              </Button>
            ) : (
              <p className="text-sm text-amber-600 text-center py-2">Apenas administradores podem alterar configurações</p>
            )}
          </CardContent>
        </Card>

        {/* Current Connection Info */}
        <Card className="bg-white border border-slate-200 shadow-sm" data-testid="connection-info-card">
          <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
            <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              <Wifi className="w-5 h-5 text-emerald-600" strokeWidth={1.5} />
              Conexão Atual
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">URL do Backend</span>
                <code className="font-mono text-sm text-slate-700 bg-slate-100 px-2 py-1 rounded" data-testid="current-backend-url">
                  {process.env.REACT_APP_BACKEND_URL || 'Não configurado'}
                </code>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Status</span>
                <Badge className="border-transparent bg-emerald-100 text-emerald-800">
                  Conectado
                </Badge>
              </div>
              <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">Usuário</span>
                <span className="text-sm text-slate-700">{user?.name} ({user?.role})</span>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mt-4">
              <p className="text-xs font-bold uppercase tracking-wide text-amber-700 mb-2">Deploy Local</p>
              <p className="text-sm text-amber-800">
                Para rodar em seu computador como servidor, faça o download do código, configure o IP no arquivo <code className="bg-amber-100 px-1 rounded font-mono text-xs">.env</code> do frontend com o IP da sua máquina, e inicie os serviços. As configurações salvas aqui ficam registradas no banco de dados para referência.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
