import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  User, 
  Target, 
  Heart, 
  MapPin, 
  Activity, 
  Package, 
  Calendar, 
  TrendingUp, 
  MessageSquare,
  Edit,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CanvasPage({ params }: PageProps) {
  const { userId } = await auth();
  
  if (!userId) {
    redirect('/sign-in');
  }

  const { id } = await params;

  const patient = await prisma.patient.findUnique({
    where: { id },
    include: {
      tratamientos: true,
    },
  });

  if (!patient || patient.clerkUserId !== userId) {
    redirect('/dashboard');
  }

  const treatment = patient.tratamientos[0];

  // Función para verificar si un bloque está completo
  const isBlockComplete = (blockNumber: number): boolean => {
    switch(blockNumber) {
      case 1:
        return !!(patient.nombre && patient.edad);
      case 2:
        return !!(treatment?.metasClinicas && treatment.metasClinicas.length > 0);
      case 3:
        return !!(treatment?.relacionCuidado);
      case 4:
        return !!(treatment?.puntosCuidado && treatment.puntosCuidado.length > 0);
      case 5:
        return !!(treatment?.actividadesCuidado && treatment.actividadesCuidado.length > 0);
      case 6:
        return !!(treatment?.recursosHumanos && treatment.recursosHumanos.length > 0);
      case 7:
        return !!(treatment?.calendario && treatment.calendario.length > 0);
      case 8:
        return !!(treatment?.indicadoresEvaluacion && treatment.indicadoresEvaluacion.length > 0);
      case 9:
        return !!(treatment?.contactosEquipo && treatment.contactosEquipo.length > 0);
      default:
        return false;
    }
  };

  const blocksData = [
    {
      number: 1,
      title: 'Perfil del Paciente',
      icon: User,
      url: `/dashboard/pacientes/${id}`,
      color: 'bg-blue-500',
      data: {
        nombre: patient.nombre,
        edad: patient.edad,
        valores: patient.valoresPersonales.length,
        preocupaciones: patient.preocupaciones.length,
        esperanzas: patient.esperanzas.length,
      }
    },
    {
      number: 2,
      title: 'Metas de Salud',
      icon: Target,
      url: `/dashboard/pacientes/${id}/metas`,
      color: 'bg-green-500',
      data: treatment ? {
        metasClinicas: treatment.metasClinicas?.length || 0,
        metasPersonales: treatment.metasPersonales?.length || 0,
        metasCalidadVida: treatment.metasCalidadVida?.length || 0,
      } : null
    },
    {
      number: 3,
      title: 'Relación de Cuidado',
      icon: Heart,
      url: `/dashboard/pacientes/${id}/relacion`,
      color: 'bg-pink-500',
      data: treatment ? {
        relacionCuidado: treatment.relacionCuidado,
        expectativasCuidador: treatment.expectativasCuidador,
        necesidadesEmocionales: treatment.necesidadesEmocionales,
      } : null
    },
    {
      number: 4,
      title: 'Puntos de Cuidado',
      icon: MapPin,
      url: `/dashboard/pacientes/${id}/puntos-cuidado`,
      color: 'bg-purple-500',
      data: treatment ? {
        puntosCuidado: treatment.puntosCuidado?.length || 0,
      } : null
    },
    {
      number: 5,
      title: 'Actividades de Cuidado',
      icon: Activity,
      url: `/dashboard/pacientes/${id}/actividades`,
      color: 'bg-orange-500',
      data: treatment ? {
        actividades: treatment.actividadesCuidado?.length || 0,
      } : null
    },
    {
      number: 6,
      title: 'Recursos Clave',
      icon: Package,
      url: `/dashboard/pacientes/${id}/recursos`,
      color: 'bg-cyan-500',
      data: treatment ? {
        humanos: treatment.recursosHumanos?.length || 0,
        fisicos: treatment.recursosFisicos?.length || 0,
        intelectuales: treatment.recursosIntelectuales?.length || 0,
        financieros: treatment.recursosFinancieros?.length || 0,
      } : null
    },
    {
      number: 7,
      title: 'Calendario',
      icon: Calendar,
      url: `/dashboard/pacientes/${id}/calendario`,
      color: 'bg-indigo-500',
      data: treatment ? {
        actividades: treatment.calendario?.length || 0,
      } : null
    },
    {
      number: 8,
      title: 'Evaluación',
      icon: TrendingUp,
      url: `/dashboard/pacientes/${id}/evaluacion`,
      color: 'bg-teal-500',
      data: treatment ? {
        indicadores: treatment.indicadoresEvaluacion?.length || 0,
        criteriosExito: !!treatment.criteriosExito,
      } : null
    },
    {
      number: 9,
      title: 'Comunicación',
      icon: MessageSquare,
      url: `/dashboard/pacientes/${id}/comunicacion`,
      color: 'bg-amber-500',
      data: treatment ? {
        contactos: treatment.contactosEquipo?.length || 0,
        canales: treatment.canalesComunicacion?.length || 0,
      } : null
    },
  ];

  const completedBlocks = blocksData.filter(block => isBlockComplete(block.number)).length;
  const progress = (completedBlocks / 9) * 100;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/pacientes/${id}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Canvas LTCP: {patient.nombre}</h1>
                <p className="text-sm text-gray-600">Vista completa del plan de tratamiento</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Barra de Progreso */}
          <Card className="border-2 border-blue-200">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Progreso del LTCP</CardTitle>
                  <CardDescription>
                    {completedBlocks} de 9 bloques completados
                  </CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-blue-600">{Math.round(progress)}%</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Grid de Bloques */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blocksData.map((block) => {
              const Icon = block.icon;
              const isComplete = isBlockComplete(block.number);
              
              return (
                <Link key={block.number} href={block.url}>
                  <Card className={`hover:shadow-lg transition-all cursor-pointer h-full ${
                    isComplete ? 'border-2 border-green-500' : 'border-2 border-gray-200'
                  }`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`${block.color} p-3 rounded-lg`}>
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <CardTitle className="text-lg">Bloque {block.number}</CardTitle>
                              {isComplete ? (
                                <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                <AlertCircle className="w-5 h-5 text-gray-400" />
                              )}
                            </div>
                            <CardDescription>{block.title}</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      {block.data ? (
                        <div className="space-y-2">
                          {block.number === 1 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Valores:</span>
                                <Badge variant="secondary">{block.data.valores}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Preocupaciones:</span>
                                <Badge variant="secondary">{block.data.preocupaciones}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Esperanzas:</span>
                                <Badge variant="secondary">{block.data.esperanzas}</Badge>
                              </div>
                            </>
                          )}
                          {block.number === 2 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Metas Clínicas:</span>
                                <Badge variant="secondary">{block.data.metasClinicas}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Metas Personales:</span>
                                <Badge variant="secondary">{block.data.metasPersonales}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Calidad de Vida:</span>
                                <Badge variant="secondary">{block.data.metasCalidadVida}</Badge>
                              </div>
                            </>
                          )}
                          {block.number === 3 && (
                            <div className="text-sm text-gray-600">
                              {block.data.relacionCuidado ? (
                                <p className="line-clamp-3">{block.data.relacionCuidado}</p>
                              ) : (
                                <p className="text-gray-400 italic">Sin información</p>
                              )}
                            </div>
                          )}
                          {block.number === 4 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Puntos definidos:</span>
                              <Badge variant="secondary">{block.data.puntosCuidado}</Badge>
                            </div>
                          )}
                          {block.number === 5 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Actividades:</span>
                              <Badge variant="secondary">{block.data.actividades}</Badge>
                            </div>
                          )}
                          {block.number === 6 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Recursos Humanos:</span>
                                <Badge variant="secondary">{block.data.humanos}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Recursos Físicos:</span>
                                <Badge variant="secondary">{block.data.fisicos}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Intelectuales:</span>
                                <Badge variant="secondary">{block.data.intelectuales}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Financieros:</span>
                                <Badge variant="secondary">{block.data.financieros}</Badge>
                              </div>
                            </>
                          )}
                          {block.number === 7 && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Actividades programadas:</span>
                              <Badge variant="secondary">{block.data.actividades}</Badge>
                            </div>
                          )}
                          {block.number === 8 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Indicadores:</span>
                                <Badge variant="secondary">{block.data.indicadores}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Criterios de éxito:</span>
                                <Badge variant={block.data.criteriosExito ? "default" : "secondary"}>
                                  {block.data.criteriosExito ? "Definidos" : "Pendiente"}
                                </Badge>
                              </div>
                            </>
                          )}
                          {block.number === 9 && (
                            <>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Contactos:</span>
                                <Badge variant="secondary">{block.data.contactos}</Badge>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Canales:</span>
                                <Badge variant="secondary">{block.data.canales}</Badge>
                              </div>
                            </>
                          )}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-400 italic">
                          Haz clic para completar este bloque
                        </p>
                      )}
                      
                      <div className="mt-4 pt-4 border-t">
                        <Button variant="ghost" size="sm" className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          {isComplete ? 'Editar' : 'Completar'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>

          {/* Acciones Rápidas */}
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
            <CardHeader>
              <CardTitle>Acciones Rápidas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href={`/dashboard/pacientes/${id}`}>
                  <Button variant="outline" className="w-full">
                    Ver Perfil Completo
                  </Button>
                </Link>
                <Button variant="outline" className="w-full">
                  Exportar PDF
                </Button>
                <Button variant="outline" className="w-full">
                  Compartir Plan
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}