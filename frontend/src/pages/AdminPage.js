import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { UserCog, Plus, Pencil, Trash2, Shield, Users } from 'lucide-react';
import axios from 'axios';

export default function AdminPage() {
  const { authHeaders, API } = useAuth();
  const [users, setUsers] = useState([]);
  const [dialog, setDialog] = useState({ open: false, mode: 'create', user: null });
  const [form, setForm] = useState({ username: '', password: '', name: '', role: 'porteiro' });

  const loadUsers = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/users`, { headers: authHeaders });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  }, [API, authHeaders]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const openCreate = () => {
    setForm({ username: '', password: '', name: '', role: 'porteiro' });
    setDialog({ open: true, mode: 'create', user: null });
  };

  const openEdit = (user) => {
    setForm({ username: user.username, password: '', name: user.name, role: user.role });
    setDialog({ open: true, mode: 'edit', user });
  };

  const handleSubmit = async () => {
    try {
      if (dialog.mode === 'create') {
        if (!form.username || !form.password || !form.name) {
          toast.error('Todos os campos são obrigatórios');
          return;
        }
        await axios.post(`${API}/users`, form, { headers: authHeaders });
        toast.success('Usuário criado com sucesso');
      } else {
        const updateData = {};
        if (form.username) updateData.username = form.username;
        if (form.password) updateData.password = form.password;
        if (form.name) updateData.name = form.name;
        if (form.role) updateData.role = form.role;
        await axios.put(`${API}/users/${dialog.user.id}`, updateData, { headers: authHeaders });
        toast.success('Usuário atualizado');
      }
      setDialog({ open: false, mode: 'create', user: null });
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao salvar');
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Tem certeza que deseja deletar este usuário?')) return;
    try {
      await axios.delete(`${API}/users/${userId}`, { headers: authHeaders });
      toast.success('Usuário deletado');
      loadUsers();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Erro ao deletar');
    }
  };

  return (
    <div className="space-y-6" data-testid="admin-page">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Gerenciar Usuários
          </h1>
          <p className="text-sm text-slate-500 mt-1">Crie e gerencie os acessos ao sistema</p>
        </div>
        <Button
          data-testid="admin-add-user-button"
          className="bg-slate-900 text-white hover:bg-slate-800 active:scale-95 transition-all"
          onClick={openCreate}
        >
          <Plus className="w-4 h-4 mr-2" strokeWidth={1.5} />
          Novo Usuário
        </Button>
      </div>

      <Card className="bg-white border border-slate-200 shadow-sm" data-testid="users-table-card">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 p-4">
          <CardTitle className="flex items-center gap-2 text-lg font-medium text-slate-800" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Users className="w-5 h-5 text-blue-600" strokeWidth={1.5} />
            Usuários do Sistema
            <Badge className="border-transparent bg-blue-100 text-blue-800 ml-auto">{users.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Nome</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Usuário</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Perfil</TableHead>
                <TableHead className="font-medium text-slate-500 text-xs uppercase tracking-wide">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((u) => (
                <TableRow key={u.id} className="hover:bg-slate-50/50">
                  <TableCell className="font-medium text-slate-700">{u.name}</TableCell>
                  <TableCell className="font-mono text-sm text-slate-600">{u.username}</TableCell>
                  <TableCell>
                    {u.role === 'admin' ? (
                      <Badge className="border-transparent bg-blue-100 text-blue-800">
                        <Shield className="w-3 h-3 mr-1" strokeWidth={1.5} />Admin
                      </Badge>
                    ) : (
                      <Badge className="border-transparent bg-slate-100 text-slate-700">
                        <UserCog className="w-3 h-3 mr-1" strokeWidth={1.5} />Porteiro
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        data-testid={`edit-user-${u.id}`}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-slate-600 hover:bg-slate-100"
                        onClick={() => openEdit(u)}
                      >
                        <Pencil className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                      <Button
                        data-testid={`delete-user-${u.id}`}
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:bg-red-50"
                        onClick={() => handleDelete(u.id)}
                      >
                        <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialog.open} onOpenChange={(open) => setDialog({ ...dialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Outfit, sans-serif' }}>
              {dialog.mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}
            </DialogTitle>
            <DialogDescription>
              {dialog.mode === 'create' ? 'Preencha os dados do novo usuário' : 'Atualize os dados do usuário'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Nome Completo</Label>
              <Input
                data-testid="admin-user-name-input"
                placeholder="Nome completo"
                className="bg-white border-slate-300"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Usuário (Login)</Label>
              <Input
                data-testid="admin-user-username-input"
                placeholder="Nome de usuário"
                className="bg-white border-slate-300 font-mono"
                value={form.username}
                onChange={(e) => setForm({...form, username: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">
                Senha {dialog.mode === 'edit' && '(deixe vazio para manter)'}
              </Label>
              <Input
                data-testid="admin-user-password-input"
                type="password"
                placeholder="Senha"
                className="bg-white border-slate-300"
                value={form.password}
                onChange={(e) => setForm({...form, password: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide text-slate-500">Perfil</Label>
              <Select value={form.role} onValueChange={(val) => setForm({...form, role: val})}>
                <SelectTrigger data-testid="admin-user-role-select" className="bg-white border-slate-300">
                  <SelectValue placeholder="Selecione o perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="porteiro">Porteiro</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialog({ open: false, mode: 'create', user: null })}>
              Cancelar
            </Button>
            <Button
              data-testid="admin-save-user-button"
              className="bg-slate-900 text-white hover:bg-slate-800"
              onClick={handleSubmit}
            >
              {dialog.mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
