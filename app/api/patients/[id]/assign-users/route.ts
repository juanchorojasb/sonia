import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserWithRole, canAssignTeam } from '@/lib/roles';

// POST - Asignar usuarios al paciente
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

    // Verificar permisos para asignar equipo
    const canAssign = await canAssignTeam(id);
    if (!canAssign) {
      return NextResponse.json(
        { error: 'No tienes permisos para asignar equipo a este paciente' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userEmails } = body; // Array de emails de usuarios a asignar

    if (!Array.isArray(userEmails) || userEmails.length === 0) {
      return NextResponse.json(
        { error: 'Debes proporcionar al menos un email de usuario' },
        { status: 400 }
      );
    }

    // Buscar usuarios por email
    const usersToAssign = await prisma.user.findMany({
      where: {
        email: { in: userEmails },
      },
    });

    if (usersToAssign.length === 0) {
      return NextResponse.json(
        { error: 'No se encontraron usuarios con esos emails' },
        { status: 404 }
      );
    }

    // Asignar usuarios al paciente
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        usuariosConAcceso: {
          connect: usersToAssign.map(u => ({ id: u.id })),
        },
      },
      include: {
        usuariosConAcceso: {
          select: {
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Usuarios asignados correctamente',
      patient,
    });
  } catch (error) {
    console.error('Error al asignar usuarios:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

// DELETE - Remover usuario del paciente
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

    const canAssign = await canAssignTeam(id);
    if (!canAssign) {
      return NextResponse.json(
        { error: 'No tienes permisos para modificar el equipo de este paciente' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userEmail } = body;

    if (!userEmail) {
      return NextResponse.json(
        { error: 'Debes proporcionar el email del usuario a remover' },
        { status: 400 }
      );
    }

    // Buscar usuario
    const userToRemove = await prisma.user.findUnique({
      where: { email: userEmail },
    });

    if (!userToRemove) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Remover usuario del paciente
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        usuariosConAcceso: {
          disconnect: { id: userToRemove.id },
        },
      },
      include: {
        usuariosConAcceso: {
          select: {
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
    });

    return NextResponse.json({
      message: 'Usuario removido correctamente',
      patient,
    });
  } catch (error) {
    console.error('Error al remover usuario:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}