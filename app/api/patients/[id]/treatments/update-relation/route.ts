import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function POST(request: Request, { params }: RouteParams) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id: patientId } = await params;
    
    // Verificar que el paciente pertenece al usuario
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    
    // Buscar tratamiento activo o crear uno nuevo
    let treatment = await prisma.treatment.findFirst({
      where: {
        patientId: patientId,
        activo: true,
      },
    });

    if (treatment) {
      // Actualizar tratamiento existente
      treatment = await prisma.treatment.update({
        where: { id: treatment.id },
        data: {
          tipoRelacion: body.tipoRelacion,
          frecuenciaComunicacion: body.frecuenciaComunicacion,
          mediosComunicacion: body.mediosComunicacion || [],
          procesoDecisiones: body.procesoDecisiones,
          rolFamilia: body.rolFamilia,
        },
      });
    } else {
      // Crear nuevo tratamiento con valores por defecto
      treatment = await prisma.treatment.create({
        data: {
          patientId: patientId,
          nombre: 'Plan de Tratamiento Principal',
          activo: true,
          tipoRelacion: body.tipoRelacion,
          frecuenciaComunicacion: body.frecuenciaComunicacion,
          mediosComunicacion: body.mediosComunicacion || [],
          procesoDecisiones: body.procesoDecisiones,
          rolFamilia: body.rolFamilia,
          // Valores por defecto para campos requeridos
          metasClinicas: [],
          metasPersonales: [],
          puntosAtencionFisicos: [],
          plataformasDigitales: [],
          recursosHumanos: [],
          recursosFisicos: [],
          recursosIntelectuales: [],
          recursosFinancieros: [],
          costosFinancieros: [],
          metricasClinicas: [],
          resultadosFuncionales: [],
          resultadosReportados: [],
          valorSistema: [],
        },
      });
    }

    return NextResponse.json(treatment, { status: 200 });
  } catch (error: any) {
    console.error('Error al actualizar relación:', error);
    return NextResponse.json(
      { error: 'Error al actualizar relación', details: error.message },
      { status: 500 }
    );
  }
}