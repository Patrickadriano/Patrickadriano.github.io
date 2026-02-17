# Gatekeeper - Sistema de Controle de Acesso para Portaria

## Problem Statement
Sistema de controle de acesso para portaria com login/senha JWT, admin para gerenciar usuários, cadastro de visitantes, agendamento de visitas com notificações, controle de frota de veículos, e relatório diário exportável em Excel/PDF.

## Architecture
- **Backend**: FastAPI + MongoDB (Motor async driver)
- **Frontend**: React + Tailwind CSS + Shadcn UI
- **Auth**: JWT with bcrypt password hashing
- **Export**: openpyxl (Excel), reportlab (PDF)

## User Personas
1. **Administrador**: Gerencia usuários, acesso total ao sistema
2. **Porteiro**: Registra visitantes, controla frota, gera relatórios

## Core Requirements
- [x] Login/senha com JWT
- [x] Admin para gerenciar logins e senhas
- [x] Cadastro de visitantes (nome, documento, horário entrada/saída, placa, empresa, observação)
- [x] Botão de checkout automático para visitantes
- [x] Agendamento de visitas com data/horário e notificação no sistema
- [x] Controle de frota (motorista, veículo, km saída/entrada, cálculo distância)
- [x] Relatório diário com observações e nome do porteiro
- [x] Export Excel e PDF

## What's Been Implemented (2026-02-17)
- Full JWT auth system with admin/porteiro roles
- Complete CRUD for visitors, schedules, fleet, users
- Dashboard with KPIs and notifications
- Report generation with Excel/PDF export
- Modern white/blue design with Outfit/DM Sans fonts

## Prioritized Backlog
- P2: Improve mobile responsiveness
- P2: Add search/filter to tables
- P3: Data pagination for large datasets

## Next Tasks
- Monitor for user feedback
- Add data validation improvements
