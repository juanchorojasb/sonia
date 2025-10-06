import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserWithRole, tienePermiso } from '@/lib/roles';

export async function POST(request: Request) {
  try {
    // 1. Verificar autenticación
    const user = await getUserWithRole();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // 2. Verificar que el usuario tiene permiso para crear pacientes
    if (!tienePermiso(user.rol, 'crearPacientes')) {
      return NextResponse.json(
        { error: 'Tu rol no tiene permisos para crear pacientes' },
        { status: 403 }
      );
    }

    // 3. Procesar datos del paciente
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

    // 4. Validar campos requeridos
    if (!nombre || !edad) {
      return NextResponse.json(
        { error: 'Nombre y edad son campos obligatorios' },
        { status: 400 }
      );
    }

    // 5. Crear paciente
    const patient = await prisma.patient.create({
      data: {
        clerkUserId: user.userId,
        nombre,
        edad: parseInt(edad),
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
        genero,
        telefono,
        email,
        direccion,
        ocupacionAnterior,
        situacionSocial,
        situacionEconomica,
        contextoCultural,
        valoresPersonales: valoresPersonales || [],
        preocupaciones: preocupaciones || [],
        esperanzas: esperanzas || [],
        diagnosticoPrincipal,
        condicionesCronicas: condicionesCronicas || [],
        medicamentos: medicamentos || [],
        alergias: alergias || [],
      },
    });

    return NextResponse.json(patient, { status: 201 });
  } catch (error) {
    console.error('Error al crear paciente:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}