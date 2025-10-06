import { NextResponse } from 'next/server';
import { getUserWithRole, canAssignTeam } from '@/lib/roles';

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
    const canManage = await canAssignTeam(id);

    return NextResponse.json({ canManage });
  } catch (error) {
    console.error('Error al verificar permisos:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}