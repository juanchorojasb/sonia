import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserWithRole, tienePermiso } from '@/lib/roles';

export async function GET(request: Request) {
  try {
    const user = await getUserWithRole();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Construir filtros según el rol
    let whereClause: any = {};

    if (user.rol === 'ADMIN') {
      // Admin ve todos los pacientes
      whereClause = {};
    } else {
      // Otros usuarios solo ven sus pacientes o los asignados
      whereClause = {
        OR: [
          { clerkUserId: user.userId },
          { usuariosConAcceso: { some: { clerkUserId: user.userId } } },
        ],
      };
    }

    // Agregar búsqueda por nombre si existe
    if (search) {
      whereClause.nombre = {
        contains: search,
        mode: 'insensitive',
      };
    }

    // Obtener total de pacientes
    const total = await prisma.patient.count({ where: whereClause });

    // Obtener pacientes con paginación
    const patients = await prisma.patient.findMany({
      where: whereClause,
      include: {
        tratamientos: {
          select: {
            id: true,
            metasClinicas: true,
            calendario: true,
          },
        },
        creador: {
          select: {
            nombre: true,
            email: true,
            rol: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take: limit,
    });

    return NextResponse.json({
      patients,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error al listar pacientes:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}