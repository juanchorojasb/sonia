import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from './prisma';

export type UserRole = 'ADMIN' | 'PROFESIONAL_SALUD' | 'CUIDADOR' | 'FAMILIAR';

export interface UserWithRole {
  userId: string;
  email: string;
  nombre: string;
  rol: UserRole;
  especialidad?: string;
  institucion?: string;
  relacionPaciente?: string;
}

// Obtener o crear usuario con rol
export async function getUserWithRole(): Promise<UserWithRole | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

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
        rol: 'CUIDADOR', // Rol por defecto
      },
    });
  }

  return {
    userId: dbUser.clerkUserId,
    email: dbUser.email,
    nombre: dbUser.nombre,
    rol: dbUser.rol as UserRole,
    especialidad: dbUser.especialidad || undefined,
    institucion: dbUser.institucion || undefined,
    relacionPaciente: dbUser.relacionPaciente || undefined,
  };
}

// Verificar si el usuario tiene acceso a un paciente
export async function canAccessPatient(patientId: string): Promise<boolean> {
  const user = await getUserWithRole();
  if (!user) return false;

  // Admin puede ver todo
  if (user.rol === 'ADMIN') return true;

  // Verificar si el usuario creó el paciente o tiene acceso asignado
  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      OR: [
        { clerkUserId: user.userId }, // Usuario creador
        { usuariosConAcceso: { some: { clerkUserId: user.userId } } }, // Usuario con acceso
      ],
    },
  });

  return !!patient;
}

// Verificar si el usuario puede editar un paciente
export async function canEditPatient(patientId: string): Promise<boolean> {
  const user = await getUserWithRole();
  if (!user) return false;

  // Admin puede editar todo
  if (user.rol === 'ADMIN') {
    return await canAccessPatient(patientId);
  }

  // Profesionales pueden editar si tienen acceso
  if (user.rol === 'PROFESIONAL_SALUD') {
    return await canAccessPatient(patientId);
  }

  // Cuidadores solo pueden editar si son creadores
  if (user.rol === 'CUIDADOR') {
    const patient = await prisma.patient.findFirst({
      where: {
        id: patientId,
        clerkUserId: user.userId,
      },
    });
    return !!patient;
  }

  // Familiares no pueden editar
  return false;
}

// Verificar si el usuario puede eliminar un paciente
export async function canDeletePatient(patientId: string): Promise<boolean> {
  const user = await getUserWithRole();
  if (!user) return false;

  // Solo Admin y el creador pueden eliminar
  if (user.rol === 'ADMIN') return true;

  const patient = await prisma.patient.findFirst({
    where: {
      id: patientId,
      clerkUserId: user.userId,
    },
  });

  return !!patient;
}

// Verificar si el usuario puede asignar equipo
export async function canAssignTeam(patientId: string): Promise<boolean> {
  const user = await getUserWithRole();
  if (!user) return false;

  // Solo Admin y Profesionales pueden asignar equipo
  if (user.rol === 'ADMIN' || user.rol === 'PROFESIONAL_SALUD') {
    return await canAccessPatient(patientId);
  }

  return false;
}

// Permisos según rol
export const PERMISOS = {
  ADMIN: {
    verTodosPacientes: true,
    crearPacientes: true,
    editarPacientes: true,
    eliminarPacientes: true,
    asignarEquipo: true,
    verEstadisticas: true,
  },
  PROFESIONAL_SALUD: {
    verTodosPacientes: false,
    crearPacientes: true,
    editarPacientes: true,
    eliminarPacientes: false,
    asignarEquipo: true,
    verEstadisticas: true,
  },
  CUIDADOR: {
    verTodosPacientes: false,
    crearPacientes: true,
    editarPacientes: true, // Solo sus propios pacientes
    eliminarPacientes: true, // Solo sus propios pacientes
    asignarEquipo: false,
    verEstadisticas: false,
  },
  FAMILIAR: {
    verTodosPacientes: false,
    crearPacientes: false,
    editarPacientes: false,
    eliminarPacientes: false,
    asignarEquipo: false,
    verEstadisticas: false,
  },
};

export function tienePermiso(rol: UserRole, permiso: keyof typeof PERMISOS.ADMIN): boolean {
  return PERMISOS[rol][permiso];
}

// Función helper para respuestas de error
export function unauthorizedResponse(message: string = 'No autorizado') {
  return new Response(JSON.stringify({ error: message }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  });
}