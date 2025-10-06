'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  UserPlus, 
  Mail, 
  Trash2, 
  Users, 
  Shield,
  Briefcase,
  Heart,
  User,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface UserAccess {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  especialidad?: string;
  relacionPaciente?: string;
}

interface Patient {
  id: string;
  nombre: string;
  edad: number;
  creador: {
    nombre: string;
    email: string;
    rol: string;
  };
  usuariosConAcceso: UserAccess[];
}

export default function GestionEquipoPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [patient, setPatient] = useState<Patient | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [canManageTeam, setCanManageTeam] = useState(false);

  useEffect(() => {
    params.then(p => {
      setPatientId(p.id);
      fetchPatientData(p.id);
      checkPermissions(p.id);
    });
  }, [params]);

  const fetchPatientData = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (response.ok) {
        const data = await response.json();
        setPatient(data);
      } else if (response.status === 403) {
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error al cargar paciente:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkPermissions = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}/can-manage-team`);
      if (response.ok) {
        const data = await response.json();
        setCanManageTeam(data.canManage);
      }
    } catch (error) {
      console.error('Error al verificar permisos:', error);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    if (!newUserEmail.trim()) {
      setError('Por favor ingresa un email');
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/patients/${patientId}/assign-users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmails: [newUserEmail.trim()] }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Usuario ${newUserEmail} agregado correctamente al equipo`);
        setNewUserEmail('');
        // Recargar datos del paciente
        await fetchPatientData(patientId);
      } else {
        setError(data.error || 'Error al agregar usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al agregar usuario al equipo');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveUser = async (userEmail: string) => {
    if (!confirm(`¿Estás seguro de que quieres remover a ${userEmail} del equipo?`)) {
      return;
    }

    setError('');
    setSuccess('');

    try {
      const response = await fetch(`/api/patients/${patientId}/assign-users`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userEmail }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(`Usuario ${userEmail} removido del equipo`);
        // Recargar datos del paciente
        await fetchPatientData(patientId);
      } else {
        setError(data.error || 'Error al remover usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      setError('Error al remover usuario del equipo');
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

  const getRoleBadgeColor = (rol: string) => {
    switch(rol) {
      case 'ADMIN': return 'bg-red-100 text-red-800 border-red-200';
      case 'PROFESIONAL_SALUD': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'CUIDADOR': return 'bg-green-100 text-green-800 border-green-200';
      case 'FAMILIAR': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRoleName = (rol: string) => {
    switch(rol) {
      case 'ADMIN': return 'Administrador';
      case 'PROFESIONAL_SALUD': return 'Profesional de Salud';
      case 'CUIDADOR': return 'Cuidador';
      case 'FAMILIAR': return 'Familiar';
      default: return rol;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando equipo de cuidado...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <p className="text-center text-gray-600">Paciente no encontrado</p>
            <Link href="/dashboard" className="block mt-4">
              <Button className="w-full">Volver al Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/pacientes/${patientId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Equipo de Cuidado</h1>
              <p className="text-sm text-gray-600">
                Gestiona el acceso al plan de {patient.nombre}
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          {/* Mensajes de error/éxito */}
          {error && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-red-800">
                  <AlertCircle className="w-5 h-5" />
                  <p>{error}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {success && (
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-green-800">
                  <CheckCircle className="w-5 h-5" />
                  <p>{success}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Creador del Paciente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Creador del Paciente
              </CardTitle>
              <CardDescription>
                Usuario que registró inicialmente al paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-blue-50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {(() => {
                      const Icon = getRoleIcon(patient.creador.rol);
                      return <Icon className="w-6 h-6 text-blue-600" />;
                    })()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{patient.creador.nombre}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {patient.creador.email}
                    </p>
                  </div>
                </div>
                <Badge className={getRoleBadgeColor(patient.creador.rol)}>
                  {getRoleName(patient.creador.rol)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Agregar Usuario al Equipo */}
          {canManageTeam ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-green-600" />
                  Agregar Miembro al Equipo
                </CardTitle>
                <CardDescription>
                  Invita a otros usuarios a colaborar en el cuidado de este paciente
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAddUser} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email del Usuario</Label>
                    <div className="flex gap-2">
                      <Input
                        id="email"
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        value={newUserEmail}
                        onChange={(e) => setNewUserEmail(e.target.value)}
                        disabled={submitting}
                      />
                      <Button type="submit" disabled={submitting}>
                        <UserPlus className="w-4 h-4 mr-2" />
                        {submitting ? 'Agregando...' : 'Agregar'}
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500">
                    El usuario debe estar registrado en la plataforma para poder agregarlo al equipo.
                  </p>
                </form>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertCircle className="w-5 h-5" />
                  <p>No tienes permisos para gestionar el equipo de este paciente. Solo Administradores y Profesionales de Salud pueden asignar usuarios.</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Lista de Miembros del Equipo */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-600" />
                Miembros del Equipo
                <Badge variant="secondary">{patient.usuariosConAcceso.length}</Badge>
              </CardTitle>
              <CardDescription>
                Usuarios con acceso al plan de cuidado de este paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patient.usuariosConAcceso.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Aún no hay miembros adicionales en el equipo
                  </p>
                  {canManageTeam && (
                    <p className="text-sm text-gray-400 mt-2">
                      Agrega usuarios para colaborar en el cuidado
                    </p>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {patient.usuariosConAcceso.map((user) => {
                    const Icon = getRoleIcon(user.rol);
                    return (
                      <div
                        key={user.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            <Icon className="w-6 h-6 text-gray-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{user.nombre}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </p>
                            {user.especialidad && (
                              <p className="text-xs text-gray-500 mt-1">
                                Especialidad: {user.especialidad}
                              </p>
                            )}
                            {user.relacionPaciente && (
                              <p className="text-xs text-gray-500 mt-1">
                                Relación: {user.relacionPaciente}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getRoleBadgeColor(user.rol)}>
                            {getRoleName(user.rol)}
                          </Badge>
                          {canManageTeam && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveUser(user.email)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Información de Permisos */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle className="text-sm">💡 Información sobre Roles</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-gray-700 space-y-2">
              <p><strong>Administradores:</strong> Acceso completo, pueden gestionar todos los pacientes y usuarios.</p>
              <p><strong>Profesionales de Salud:</strong> Pueden crear pacientes, asignar equipos y editar planes.</p>
              <p><strong>Cuidadores:</strong> Pueden crear y editar sus propios pacientes, pero no asignar equipos.</p>
              <p><strong>Familiares:</strong> Solo pueden ver la información, sin permisos de edición.</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}