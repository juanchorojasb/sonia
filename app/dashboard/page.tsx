import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, User, Users, Activity, List } from 'lucide-react';
import AIAssistant from '@/components/AIAssistant';

export default async function DashboardPage() {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const patients = await prisma.patient.findMany({
    where: { 
      OR: [
        { clerkUserId: userId },
        { usuariosConAcceso: { some: { clerkUserId: userId } } }
      ]
    },
    include: {
      tratamientos: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 5, // Solo mostrar los 5 más recientes
  });

  const stats = {
    totalPacientes: patients.length,
    planesActivos: patients.filter(p => p.tratamientos.length > 0).length,
    planesCompletos: patients.filter(p => {
      const t = p.tratamientos[0];
      return t && t.metasClinicas && t.calendario;
    }).length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Dashboard sonIA</h1>
              <p className="text-gray-600">Gestión de cuidados paliativos</p>
            </div>
            <div className="flex gap-2">
              <Link href="/dashboard/perfil">
                <Button variant="outline">
                  <User className="w-4 h-4 mr-2" />
                  Mi Perfil
                </Button>
              </Link>
              <Link href="/dashboard/pacientes/nuevo">
                <Button>
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Nuevo Paciente
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Estadísticas */}
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Total Pacientes
                </CardTitle>
                <Users className="w-5 h-5 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.totalPacientes}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Pacientes bajo tu cuidado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Planes Activos
                </CardTitle>
                <Activity className="w-5 h-5 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.planesActivos}</div>
                <p className="text-xs text-gray-500 mt-1">
                  Con tratamiento definido
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Planes Completos
                </CardTitle>
                <Activity className="w-5 h-5 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stats.planesCompletos}</div>
                <p className="text-xs text-gray-500 mt-1">
                  LTCP completo (9 bloques)
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Lista de Pacientes Recientes */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Pacientes Recientes</CardTitle>
                  <CardDescription>
                    {patients.length === 0 
                      ? 'No tienes pacientes registrados'
                      : `Últimos ${patients.length} paciente${patients.length !== 1 ? 's' : ''}`
                    }
                  </CardDescription>
                </div>
                {patients.length > 0 && (
                  <Link href="/dashboard/pacientes">
                    <Button variant="outline" size="sm">
                      <List className="w-4 h-4 mr-2" />
                      Ver Todos
                    </Button>
                  </Link>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {patients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    Aún no has creado ningún paciente
                  </p>
                  <Link href="/dashboard/pacientes/nuevo">
                    <Button>
                      <PlusCircle className="w-4 h-4 mr-2" />
                      Crear Primer Paciente
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <Link 
                      key={patient.id} 
                      href={`/dashboard/pacientes/${patient.id}`}
                      className="block"
                    >
                      <div className="border rounded-lg p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-lg">{patient.nombre}</h3>
                              <p className="text-sm text-gray-600">{patient.edad} años</p>
                              {patient.diagnosticoPrincipal && (
                                <p className="text-sm text-gray-500 mt-1">
                                  {patient.diagnosticoPrincipal}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            {patient.tratamientos.length > 0 ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Plan activo
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                Sin plan
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                  
                  {/* Botón para ver más si hay muchos pacientes */}
                  <Link href="/dashboard/pacientes">
                    <Button variant="outline" className="w-full">
                      <List className="w-4 h-4 mr-2" />
                      Ver Lista Completa de Pacientes
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Asistente IA */}
      <AIAssistant />
    </div>
  );
}
