import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserWithRole, canEditPatient } from '@/lib/roles';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithRole();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    const canEdit = await canEditPatient(id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este paciente' }, 
        { status: 403 }
      );
    }

    const patient = await prisma.patient.findUnique({ where: { id } });
    if (!patient) {
      return NextResponse.json({ error: 'Paciente no encontrado' }, { status: 404 });
    }

    const body = await request.json();
    const { contactos, canalesComunicacion, protocoloComunicacion, frecuenciaReuniones } = body;

    const treatment = await prisma.treatment.upsert({
      where: { patientId: id },
      update: {
        contactosEquipo: contactos,
        canalesComunicacion,
        protocoloComunicacion,
        frecuenciaReuniones,
      },
      create: {
        patientId: id,
        contactosEquipo: contactos,
        canalesComunicacion,
        protocoloComunicacion,
        frecuenciaReuniones,
      },
    });

    return NextResponse.json(treatment);
  } catch (error) {
    console.error('Error al guardar comunicación:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}