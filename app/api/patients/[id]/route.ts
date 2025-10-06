import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserWithRole, canAccessPatient, canEditPatient, canDeletePatient } from '@/lib/roles';

// GET - Obtener paciente
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithRole();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar acceso
    const hasAccess = await canAccessPatient(id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: 'No tienes acceso a este paciente' },
        { status: 403 }
      );
    }

    // Obtener paciente con relaciones
    const patient = await prisma.patient.findUnique({
      where: { id },
      include: {
        tratamientos: true,
        cuidadores: true,
        equipoCuidado: true,
        evaluaciones: {
          orderBy: { fecha: 'desc' },
          take: 5,
        },
        notas: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    });

    if (!patient) {
      return NextResponse.json(
        { error: 'Paciente no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error al obtener paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// PUT - Actualizar paciente
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithRole();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permisos de edición
    const canEdit = await canEditPatient(id);
    if (!canEdit) {
      return NextResponse.json(
        { error: 'No tienes permisos para editar este paciente' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      nombre,
      edad,
      fechaNacimiento,
      genero,
      telefono,
      email,
      direccion,
      ocupacionAnterior,
      situacionSocial,
      situacionEconomica,
      contextoCultural,
      valoresPersonales,
      preocupaciones,
      esperanzas,
      diagnosticoPrincipal,
      condicionesCronicas,
      medicamentos,
      alergias,
    } = body;

    // Actualizar paciente
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        nombre,
        edad: edad ? parseInt(edad) : undefined,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : undefined,
        genero,
        telefono,
        email,
        direccion,
        ocupacionAnterior,
        situacionSocial,
        situacionEconomica,
        contextoCultural,
        valoresPersonales,
        preocupaciones,
        esperanzas,
        diagnosticoPrincipal,
        condicionesCronicas,
        medicamentos,
        alergias,
      },
    });

    return NextResponse.json(patient);
  } catch (error) {
    console.error('Error al actualizar paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar paciente
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserWithRole();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { id } = await params;

    // Verificar permisos de eliminación
    const canDelete = await canDeletePatient(id);
    if (!canDelete) {
      return NextResponse.json(
        { error: 'No tienes permisos para eliminar este paciente' },
        { status: 403 }
      );
    }

    // Eliminar paciente (cascade eliminará relaciones)
    await prisma.patient.delete({
      where: { id },
    });

    return NextResponse.json(
      { message: 'Paciente eliminado correctamente' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error al eliminar paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}