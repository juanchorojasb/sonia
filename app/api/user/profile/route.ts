import { auth, currentUser } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GET - Obtener perfil del usuario
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const clerkUser = await currentUser();
    if (!clerkUser) {
      return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
    }

    // Buscar o crear usuario en la base de datos
    let dbUser = await prisma.user.findUnique({
      where: { clerkUserId: userId },
    });

    if (!dbUser) {
      // Crear usuario si no existe
      dbUser = await prisma.user.create({
        data: {
          clerkUserId: userId,
          email: clerkUser.emailAddresses[0].emailAddress,
          nombre: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Usuario',
          rol: 'CUIDADOR',
        },
      });
    }

    return NextResponse.json(dbUser);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}

// PUT - Actualizar perfil del usuario
export async function PUT(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { nombre, rol, especialidad, institucion, relacionPaciente } = body;

    // Validar rol
    const rolesValidos = ['ADMIN', 'PROFESIONAL_SALUD', 'CUIDADOR', 'FAMILIAR'];
    if (rol && !rolesValidos.includes(rol)) {
      return NextResponse.json({ error: 'Rol inválido' }, { status: 400 });
    }

    // Actualizar usuario
    const updatedUser = await prisma.user.update({
      where: { clerkUserId: userId },
      data: {
        nombre,
        rol,
        especialidad: rol === 'PROFESIONAL_SALUD' ? especialidad : null,
        institucion: rol === 'PROFESIONAL_SALUD' ? institucion : null,
        relacionPaciente: (rol === 'CUIDADOR' || rol === 'FAMILIAR') ? relacionPaciente : null,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}