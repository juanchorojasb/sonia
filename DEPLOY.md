# Guía de Deploy - Plataforma sonIA a Producción

## Estado Actual del Proyecto

### ✅ Completado
- Infraestructura: Next.js 15.5.4 + PostgreSQL + Prisma
- Autenticación: Clerk con español
- Sistema de roles: 4 roles (Admin, Profesional, Cuidador, Familiar)
- 9 bloques LTCP completos
- Canvas visual con progreso
- CRUD pacientes con permisos
- Lista con búsqueda y paginación
- Gestión de equipo de cuidado
- Asistente IA (Groq/Llama 3.3)
- APIs protegidas con verificación de roles

### 📋 Base de Datos
- 9 modelos principales
- Sistema de usuarios con roles
- Relaciones many-to-many para equipos
- Migraciones funcionando

---

## Pre-requisitos del Servidor

### Servidor Recomendado
- Ubuntu 20.04+ o Debian 11+
- 2GB RAM mínimo (4GB recomendado)
- 20GB espacio en disco
- Node.js 18.x o superior
- PostgreSQL 14+
- Nginx
- SSL (Let's Encrypt)

### Dominio
- sonia.uno apuntando a tu IP del servidor
- www.sonia.uno (opcional)

---

## Paso 1: Preparación Local

### 1.1 Verificar que todo funciona localmente
```powershell
# Verificar build
npm run build

# Si hay errores, corregirlos antes de continuar