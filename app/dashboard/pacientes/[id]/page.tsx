import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Edit, Users } from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PacienteDetailPage({ params }: PageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      tratamientos: true,
      cuidadores: true,
    },
  });

  if (!patient || patient.clerkUserId !== userId) {
    redirect('/dashboard');
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/dashboard">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.nombre}</h1>
                <p className="text-sm text-gray-600">{patient.edad} años</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/dashboard/pacientes/${patient.id}/canvas`}>
                <Button variant="outline">
                  Ver Canvas LTCP
                </Button>
              </Link>
              <Link href={`/dashboard/pacientes/${patient.id}/editar`}>
                <Button>
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Bloque 1: Perfil y Contexto del Paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-600">Nombre</p>
                  <p className="text-base">{patient.nombre}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-600">Edad</p>
                  <p className="text-base">{patient.edad} años</p>
                </div>
                {patient.genero && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Género</p>
                    <p className="text-base capitalize">{patient.genero}</p>
                  </div>
                )}
                {patient.telefono && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Teléfono</p>
                    <p className="text-base">{patient.telefono}</p>
                  </div>
                )}
                {patient.email && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Email</p>
                    <p className="text-base">{patient.email}</p>
                  </div>
                )}
                {patient.ocupacionAnterior && (
                  <div>
                    <p className="text-sm font-medium text-gray-600">Ocupación Anterior</p>
                    <p className="text-base">{patient.ocupacionAnterior}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Contexto de Vida */}
          <Card>
            <CardHeader>
              <CardTitle>Contexto de Vida</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.situacionSocial && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Situación Social</p>
                  <p className="text-base text-gray-700">{patient.situacionSocial}</p>
                </div>
              )}
              {patient.situacionEconomica && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Situación Económica</p>
                  <p className="text-base text-gray-700">{patient.situacionEconomica}</p>
                </div>
              )}
              {patient.contextoCultural && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-1">Contexto Cultural</p>
                  <p className="text-base text-gray-700">{patient.contextoCultural}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Valores, Preocupaciones y Esperanzas */}
          <Card>
            <CardHeader>
              <CardTitle>Valores, Preocupaciones y Esperanzas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {patient.valoresPersonales.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Valores Personales</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.valoresPersonales.map((valor: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{valor}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {patient.preocupaciones.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Preocupaciones</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.preocupaciones.map((preocupacion: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{preocupacion}</Badge>
                    ))}
                  </div>
                </div>
              )}
              {patient.esperanzas.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-600 mb-2">Esperanzas</p>
                  <div className="flex flex-wrap gap-2">
                    {patient.esperanzas.map((esperanza: string, idx: number) => (
                      <Badge key={idx} variant="secondary">{esperanza}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Gestión de Equipo */}
          <Card className="bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle>Equipo de Cuidado</CardTitle>
              <CardDescription>Gestiona quién tiene acceso a este paciente</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Invita a profesionales de salud, cuidadores o familiares a colaborar en el plan de cuidado.
              </p>
              <Link href={`/dashboard/pacientes/${patient.id}/equipo`}>
                <Button variant="outline" className="w-full">
                  <Users className="w-4 h-4 mr-2" />
                  Gestionar Equipo de Cuidado
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Próximos Pasos - TODOS LOS 9 BLOQUES */}
          <Card className="bg-blue-50 border-blue-200">
            <CardHeader>
              <CardTitle>Próximos Pasos</CardTitle>
              <CardDescription>Completa el plan de tratamiento LTCP completo</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4">
                Has completado el Bloque 1. Continúa definiendo los demás bloques del LTCP.
              </p>
              <div className="flex flex-col gap-3">
                <Link href={`/dashboard/pacientes/${patient.id}/metas`}>
                  <Button className="w-full">Definir Metas de Salud (Bloque 2)</Button>
                </Link>
                <Link href={`/dashboard/pacientes/${patient.id}/relacion`}>
                  <Button variant="outline" className="w-full">Relación de Cuidado (Bloque 3)</Button>
                </Link>
                <Link href={`/dashboard/pacientes/${patient.id}/puntos-cuidado`}>
                  <Button variant="outline" className="w-full">Puntos de Cuidado (Bloque 4)</Button>
                </Link>
                <Link href={`/dashboard/pacientes/${patient.id}/actividades`}>
                  <Button variant="outline" className="w-full">Actividades de Cuidado (Bloque 5)</Button>
                </Link>
                <Link href={`/dashboard/pacientes/${patient.id}/recursos`}>
                  <Button variant="outline" className="w-full">Recursos Clave (Bloque 6)</Button>
                </Link>
                <Link href={`/dashboard/pacientes/${patient.id}/calendario`}>
                  <Button variant="outline" className="w-full">Calendario de Actividades (Bloque 7)</Button>
                </Link>
                <Link href={`/dashboard/pacientes/${patient.id}/evaluacion`}>
                  <Button variant="outline" className="w-full">Evaluación y Seguimiento (Bloque 8)</Button>
                </Link>
                <Link href={`/dashboard/pacientes/${patient.id}/comunicacion`}>
                  <Button variant="outline" className="w-full">Comunicación y Coordinación (Bloque 9)</Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}