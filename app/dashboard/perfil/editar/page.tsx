'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, User, Briefcase, Heart, Shield } from 'lucide-react';
import Link from 'next/link';

interface UserProfile {
  nombre: string;
  email: string;
  rol: string;
  especialidad?: string;
  institucion?: string;
  relacionPaciente?: string;
}

export default function EditarPerfilPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  
  const [formData, setFormData] = useState<UserProfile>({
    nombre: '',
    email: '',
    rol: 'CUIDADOR',
    especialidad: '',
    institucion: '',
    relacionPaciente: '',
  });

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        setFormData({
          nombre: data.nombre || '',
          email: data.email || '',
          rol: data.rol || 'CUIDADOR',
          especialidad: data.especialidad || '',
          institucion: data.institucion || '',
          relacionPaciente: data.relacionPaciente || '',
        });
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push('/dashboard/perfil');
      } else {
        alert('Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const getRoleIcon = (rol: string) => {
    switch(rol) {
      case 'ADMIN': return Shield;
      case 'PROFESIONAL_SALUD': return Briefcase;
      case 'CUIDADOR': return Heart;
      case 'FAMILIAR': return User;
      default: return User;
    }
  };

  const RoleIcon = getRoleIcon(formData.rol);

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/perfil">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
              <p className="text-sm text-gray-600">Actualiza tu información personal</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-2xl mx-auto space-y-6">
          
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos personales de tu cuenta</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre Completo</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                  placeholder="Ej: Juan Pérez"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">El email no se puede modificar</p>
              </div>
            </CardContent>
          </Card>

          {/* Rol y Tipo de Usuario */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <RoleIcon className="w-5 h-5 text-blue-600" />
                <CardTitle>Rol en la Plataforma</CardTitle>
              </div>
              <CardDescription>Define cómo usarás sonIA</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="rol">Selecciona tu Rol</Label>
                <Select 
                  value={formData.rol}
                  onValueChange={(value) => setFormData({...formData, rol: value})}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CUIDADOR">
                      <div className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        <span>Cuidador Principal</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="PROFESIONAL_SALUD">
                      <div className="flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        <span>Profesional de Salud</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="FAMILIAR">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Familiar (Solo lectura)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="ADMIN">
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4" />
                        <span>Administrador</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Descripción del rol seleccionado */}
              <div className="bg-blue-50 p-4 rounded-lg">
                <p className="text-sm text-blue-900 font-medium mb-2">
                  {formData.rol === 'CUIDADOR' && '👨‍👩‍👧 Cuidador Principal'}
                  {formData.rol === 'PROFESIONAL_SALUD' && '👨‍⚕️ Profesional de Salud'}
                  {formData.rol === 'FAMILIAR' && '👥 Familiar'}
                  {formData.rol === 'ADMIN' && '🛡️ Administrador'}
                </p>
                <p className="text-sm text-blue-700">
                  {formData.rol === 'CUIDADOR' && 'Puede crear, editar y gestionar planes de cuidado completos para sus pacientes.'}
                  {formData.rol === 'PROFESIONAL_SALUD' && 'Acceso completo para crear planes, asignar equipos y supervisar múltiples pacientes.'}
                  {formData.rol === 'FAMILIAR' && 'Solo puede ver información de pacientes asignados. No puede editar.'}
                  {formData.rol === 'ADMIN' && 'Acceso total a la plataforma, gestión de usuarios y configuración del sistema.'}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Campos específicos para Profesional de Salud */}
          {formData.rol === 'PROFESIONAL_SALUD' && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                  <CardTitle>Información Profesional</CardTitle>
                </div>
                <CardDescription>Datos de tu práctica médica</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="especialidad">Especialidad</Label>
                  <Input
                    id="especialidad"
                    value={formData.especialidad}
                    onChange={(e) => setFormData({...formData, especialidad: e.target.value})}
                    placeholder="Ej: Medicina Interna, Enfermería, Fisioterapia"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="institucion">Institución / Centro de Salud</Label>
                  <Input
                    id="institucion"
                    value={formData.institucion}
                    onChange={(e) => setFormData({...formData, institucion: e.target.value})}
                    placeholder="Ej: Hospital Universitario San Ignacio"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Campos específicos para Cuidador/Familiar */}
          {(formData.rol === 'CUIDADOR' || formData.rol === 'FAMILIAR') && (
            <Card>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <CardTitle>Información de Cuidado</CardTitle>
                </div>
                <CardDescription>Tu relación con el paciente</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="relacionPaciente">Relación con el Paciente</Label>
                  <Select
                    value={formData.relacionPaciente}
                    onValueChange={(value) => setFormData({...formData, relacionPaciente: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona una relación" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hijo">Hijo/a</SelectItem>
                      <SelectItem value="esposo">Esposo/a</SelectItem>
                      <SelectItem value="padre">Padre/Madre</SelectItem>
                      <SelectItem value="hermano">Hermano/a</SelectItem>
                      <SelectItem value="nieto">Nieto/a</SelectItem>
                      <SelectItem value="amigo">Amigo/a cercano</SelectItem>
                      <SelectItem value="otro">Otro familiar</SelectItem>
                      <SelectItem value="cuidador_profesional">Cuidador profesional</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <Link href="/dashboard/perfil" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}