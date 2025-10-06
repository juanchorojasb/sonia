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
    
    const patient = await prisma.patient.findUnique({
      where: { id: patientId },
    });

    if (!patient || patient.clerkUserId !== userId) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { actividades } = body;

    // Buscar o crear tratamiento activo
    let treatment = await prisma.treatment.findFirst({
      where: { patientId, activo: true },
    });

    if (!treatment) {
      treatment = await prisma.treatment.create({
        data: {
          patientId,
          nombre: 'Plan de Tratamiento Principal',
          activo: true,
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
          mediosComunicacion: [],
        },
      });
    }

    // Crear las actividades
    const actividadesCreadas = await Promise.all(
      actividades.map((act: any) =>
        prisma.careActivity.create({
          data: {
            treatmentId: treatment.id,
            patientId,
            tipo: act.tipo,
            titulo: act.titulo,
            descripcion: act.descripcion || null,
            fechaInicio: new Date(),
            esRecurrente: true,
            frecuencia: act.frecuencia,
          },
        })
      )
    );

    return NextResponse.json({ actividades: actividadesCreadas }, { status: 200 });
  } catch (error: any) {
    console.error('Error al crear actividades:', error);
    return NextResponse.json(
      { error: 'Error al crear actividades', details: error.message },
      { status: 500 }
    );
  }
}