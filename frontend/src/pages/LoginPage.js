import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Shield, Lock, User } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch {
      setError('Credenciais inválidas. Tente novamente.');
    }
    setLoading(false);
  };

  return (
    <div className="grid lg:grid-cols-2 h-screen w-full" data-testid="login-page">
      {/* Left brand panel */}
      <div className="hidden lg:flex flex-col justify-center items-center bg-slate-900 text-white p-12 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
        }} />
        <div className="relative z-10 text-center space-y-8">
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto">
            <Shield className="w-10 h-10 text-white" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-4xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>
              GATEKEEPER
            </h1>
            <p className="text-slate-400 mt-3 text-lg" style={{ fontFamily: 'DM Sans, sans-serif' }}>
              Sistema de Controle de Acesso
            </p>
          </div>
          <div className="grid grid-cols-3 gap-6 mt-12 max-w-sm mx-auto">
            {['Visitantes', 'Frota', 'Relatórios'].map((item) => (
              <div key={item} className="text-center">
                <div className="w-12 h-12 rounded-lg bg-slate-800 flex items-center justify-center mx-auto mb-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500" />
                </div>
                <span className="text-xs text-slate-500 uppercase tracking-wider">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right login panel */}
      <div className="flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-sm space-y-8">
          <div className="lg:hidden flex items-center gap-3 justify-center mb-4">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-white" strokeWidth={1.5} />
            </div>
            <span className="text-xl font-bold tracking-tight" style={{ fontFamily: 'Outfit, sans-serif' }}>GATEKEEPER</span>
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Bem-vindo de volta
            </h2>
            <p className="text-sm text-slate-500 mt-1">Faça login para acessar o sistema</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" data-testid="login-form">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Usuário</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <Input
                  data-testid="login-username-input"
                  className="pl-10 h-11 bg-white border-slate-300"
                  placeholder="Digite seu usuário"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Senha</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" strokeWidth={1.5} />
                <Input
                  data-testid="login-password-input"
                  type="password"
                  className="pl-10 h-11 bg-white border-slate-300"
                  placeholder="Digite sua senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg" data-testid="login-error">
                {error}
              </div>
            )}

            <Button
              data-testid="login-submit-button"
              type="submit"
              className="w-full h-11 bg-slate-900 text-white hover:bg-slate-800 font-medium active:scale-95 transition-all"
              disabled={loading}
            >
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>

          <p className="text-xs text-center text-slate-400 mt-8">
            Credenciais padrão: admin / admin123
          </p>
        </div>
      </div>
    </div>
  );
}
