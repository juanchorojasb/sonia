import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    console.log('Datos recibidos:', body); // Debug
    
    const {
      nombre,
      edad,
      genero,
      telefono,
      email,
      situacionSocial,
      situacionEconomica,
      contextoCultural,
      ocupacionAnterior,
      valoresPersonales,
      preocupaciones,
      esperanzas,
    } = body;

    if (!nombre || !edad) {
      return NextResponse.json(
        { error: 'Nombre y edad son requeridos' },
        { status: 400 }
      );
    }

    console.log('Creando paciente...'); // Debug

    const patient = await prisma.patient.create({
      data: {
        clerkUserId: userId,
        nombre: String(nombre),
        edad: Number(edad),
        genero: genero || null,
        telefono: telefono || null,
        email: email || null,
        situacionSocial: situacionSocial || null,
        situacionEconomica: situacionEconomica || null,
        contextoCultural: contextoCultural || null,
        ocupacionAnterior: ocupacionAnterior || null,
        valoresPersonales: Array.isArray(valoresPersonales) ? valoresPersonales : [],
        preocupaciones: Array.isArray(preocupaciones) ? preocupaciones : [],
        esperanzas: Array.isArray(esperanzas) ? esperanzas : [],
      },
    });

    console.log('Paciente creado:', patient.id); // Debug
    return NextResponse.json(patient, { status: 201 });

  } catch (error: any) {
    console.error('ERROR COMPLETO:', error);
    console.error('Stack:', error.stack);
    return NextResponse.json(
      { error: 'Error al crear paciente', details: error.message },
      { status: 500 }
    );
  }
}