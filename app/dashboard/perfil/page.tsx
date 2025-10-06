import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserWithRole } from '@/lib/roles';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowLeft, User, Briefcase, Heart } from 'lucide-react';

export default async function PerfilPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const user = await getUserWithRole();

  if (!user) {
    redirect('/sign-in');
  }

  const getRoleBadgeColor = (rol: string) => {
    switch(rol) {
      case 'ADMIN': return 'bg-red-500';
      case 'PROFESIONAL_SALUD': return 'bg-blue-500';
      case 'CUIDADOR': return 'bg-green-500';
      case 'FAMILIAR': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (rol: string) => {
    switch(rol) {
      case 'ADMIN': return User;
      case 'PROFESIONAL_SALUD': return Briefcase;
      case 'CUIDADOR': return Heart;
      case 'FAMILIAR': return User;
      default: return User;
    }
  };

  const Icon = getRoleIcon(user.rol);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
              <p className="text-sm text-gray-600">Información de tu cuenta</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre</p>
                <p className="text-lg">{user.nombre}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-lg">{user.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 mb-2">Rol</p>
                <Badge className={`${getRoleBadgeColor(user.rol)} text-white`}>
                  <Icon className="w-4 h-4 mr-1" />
                  {user.rol.replace('_', ' ')}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Información Adicional según Rol */}
          {user.rol === 'PROFESIONAL_SALUD' && (
            <Card>
              <CardHeader>
                <CardTitle>Información Profesional</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {user.especialidad && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Especialidad</p>
                    <p className="text-lg">{user.especialidad}</p>
                  </div>
                )}
                {user.institucion && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Institución</p>
                    <p className="text-lg">{user.institucion}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {(user.rol === 'CUIDADOR' || user.rol === 'FAMILIAR') && user.relacionPaciente && (
            <Card>
              <CardHeader>
                <CardTitle>Información de Cuidado</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <p className="text-sm font-medium text-gray-600">Relación con el paciente</p>
                  <p className="text-lg">{user.relacionPaciente}</p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Permisos */}
          <Card>
            <CardHeader>
              <CardTitle>Permisos de tu Rol</CardTitle>
              <CardDescription>Acciones que puedes realizar en la plataforma</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {user.rol === 'ADMIN' && (
                  <>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">✓</Badge>
                      <span className="text-sm">Ver todos los pacientes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="default">✓</Badge>
                      <span className="text-sm">Gestionar usuarios y roles</span>
                    </div>
                  </>
                )}
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓</Badge>
                  <span className="text-sm">Crear pacientes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="default">✓</Badge>
                  <span className="text-sm">Editar información de pacientes</span>
                </div>
                {user.rol === 'PROFESIONAL_SALUD' && (
                  <div className="flex items-center gap-2">
                    <Badge variant="default">✓</Badge>
                    <span className="text-sm">Asignar equipo de cuidado</span>
                  </div>
                )}
                {user.rol === 'FAMILIAR' && (
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">○</Badge>
                    <span className="text-sm text-gray-500">Solo lectura (no puede editar)</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Link href="/dashboard/perfil/editar" className="flex-1">
              <Button className="w-full">Editar Perfil</Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}