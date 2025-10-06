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
    
    const treatment = await prisma.treatment.create({
      data: {
        patientId: patientId,
        nombre: body.nombre,
        activo: body.activo,
        metasClinicas: body.metasClinicas || [],
        metasPersonales: body.metasPersonales || [],
        calidadVidaDeseada: body.calidadVidaDeseada,
        tipoRelacion: body.tipoRelacion,
        frecuenciaComunicacion: body.frecuenciaComunicacion,
        mediosComunicacion: body.mediosComunicacion || [],
        procesoDecisiones: body.procesoDecisiones,
        rolFamilia: body.rolFamilia,
        puntosAtencionFisicos: body.puntosAtencionFisicos || [],
        plataformasDigitales: body.plataformasDigitales || [],
        recursosHumanos: body.recursosHumanos || [],
        recursosFisicos: body.recursosFisicos || [],
        recursosIntelectuales: body.recursosIntelectuales || [],
        recursosFinancieros: body.recursosFinancieros || [],
        costosFinancieros: body.costosFinancieros || [],
        cargaTiempo: body.cargaTiempo,
        cargaFisica: body.cargaFisica,
        cargaEmocional: body.cargaEmocional,
        cargaSocialLaboral: body.cargaSocialLaboral,
        metricasClinicas: body.metricasClinicas || [],
        resultadosFuncionales: body.resultadosFuncionales || [],
        resultadosReportados: body.resultadosReportados || [],
        valorSistema: body.valorSistema || [],
      },
    });

    return NextResponse.json(treatment, { status: 201 });
  } catch (error: any) {
    console.error('Error al crear tratamiento:', error);
    return NextResponse.json(
      { error: 'Error al crear tratamiento', details: error.message },
      { status: 500 }
    );
  }
}