import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Función mejorada para detectar consultas sobre pacientes
function detectarConsultaPaciente(message: string): { 
  tipo: 'buscar_paciente' | 'info_general', 
  nombrePaciente?: string,
  buscarTodos?: boolean 
} {
  const lowerMessage = message.toLowerCase();
  
  // Palabras clave que indican búsqueda de pacientes
  const palabrasClaveBusqueda = [
    'paciente', 'edad', 'años', 'teléfono', 'telefono', 'contacto',
    'medicamento', 'medicina', 'toma', 'cita', 'consulta',
    'diagnóstico', 'diagnostico', 'enfermedad', 'condición',
    'tratamiento', 'terapia', 'información', 'informacion',
    'datos', 'dime', 'muestra', 'cuál', 'cual', 'quién', 'quien',
    'cuándo', 'cuando', 'dónde', 'donde', 'metas', 'objetivos'
  ];

  // Detectar si pregunta por todos los pacientes
  const preguntaTodos = [
    'qué pacientes', 'que pacientes', 'cuántos pacientes', 'cuantos pacientes',
    'mis pacientes', 'todos los pacientes', 'lista de pacientes',
    'mostrar pacientes', 'listar pacientes'
  ];

  if (preguntaTodos.some(frase => lowerMessage.includes(frase))) {
    return { tipo: 'buscar_paciente', buscarTodos: true };
  }

  // Buscar nombres propios en el mensaje (palabras con mayúscula inicial)
  const palabras = message.split(/\s+/);
  const nombresEncontrados: string[] = [];
  
  for (let i = 0; i < palabras.length; i++) {
    const palabra = palabras[i].trim();
    // Si empieza con mayúscula y tiene más de 2 letras
    if (palabra.length > 2 && /^[A-ZÁÉÍÓÚÑ]/.test(palabra)) {
      // Incluir también la siguiente palabra si también empieza con mayúscula
      let nombreCompleto = palabra;
      if (i + 1 < palabras.length && /^[A-ZÁÉÍÓÚÑ]/.test(palabras[i + 1])) {
        nombreCompleto += ' ' + palabras[i + 1];
        i++; // Saltar la siguiente palabra
      }
      nombresEncontrados.push(nombreCompleto);
    }
  }

  // Si encontramos nombres y hay palabras clave de búsqueda
  const tienePalabraClave = palabrasClaveBusqueda.some(palabra => lowerMessage.includes(palabra));
  
  if (nombresEncontrados.length > 0 && tienePalabraClave) {
    return {
      tipo: 'buscar_paciente',
      nombrePaciente: nombresEncontrados[0]
    };
  }

  // Si solo hay palabras clave pero no nombre específico
  if (tienePalabraClave) {
    return { tipo: 'buscar_paciente', buscarTodos: true };
  }

  return { tipo: 'info_general' };
}

// Función para buscar paciente por nombre
async function buscarPaciente(nombre: string, userId: string) {
  try {
    console.log(`[AI Chat] Buscando paciente con nombre: "${nombre}"`);
    
    const pacientes = await prisma.patient.findMany({
      where: {
        userId,
        nombre: {
          contains: nombre,
          mode: 'insensitive'
        }
      },
      include: {
        treatments: {
          where: { activo: true },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      },
      take: 5
    });

    console.log(`[AI Chat] Encontrados ${pacientes.length} paciente(s)`);
    return pacientes;
  } catch (error) {
    console.error('Error buscando paciente:', error);
    return [];
  }
}

// Función para obtener todos los pacientes
async function obtenerTodosPacientes(userId: string) {
  try {
    console.log('[AI Chat] Obteniendo todos los pacientes del usuario');
    
    const pacientes = await prisma.patient.findMany({
      where: { userId },
      include: {
        treatments: {
          where: { activo: true },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      },
      take: 20,
      orderBy: { updatedAt: 'desc' }
    });

    console.log(`[AI Chat] Total de pacientes: ${pacientes.length}`);
    return pacientes;
  } catch (error) {
    console.error('Error obteniendo pacientes:', error);
    return [];
  }
}

// Función para formatear información del paciente
function formatearInfoPaciente(paciente: any): string {
  const info: string[] = [];
  
  info.push(`**${paciente.nombre}**`);
  info.push(`- Edad: ${paciente.edad} años`);
  if (paciente.genero) info.push(`- Género: ${paciente.genero}`);
  if (paciente.telefono) info.push(`- Teléfono: ${paciente.telefono}`);
  if (paciente.email) info.push(`- Email: ${paciente.email}`);
  if (paciente.situacionSocial) info.push(`- Situación Social: ${paciente.situacionSocial}`);
  if (paciente.situacionEconomica) info.push(`- Situación Económica: ${paciente.situacionEconomica}`);
  if (paciente.contextoCultural) info.push(`- Contexto Cultural: ${paciente.contextoCultural}`);
  if (paciente.ocupacionAnterior) info.push(`- Ocupación Anterior: ${paciente.ocupacionAnterior}`);
  
  // Valores personales
  if (paciente.valoresPersonales && Array.isArray(paciente.valoresPersonales) && paciente.valoresPersonales.length > 0) {
    info.push(`- Valores: ${paciente.valoresPersonales.join(', ')}`);
  }
  
  // Preocupaciones
  if (paciente.preocupaciones && Array.isArray(paciente.preocupaciones) && paciente.preocupaciones.length > 0) {
    info.push(`- Preocupaciones: ${paciente.preocupaciones.join(', ')}`);
  }

  // Esperanzas
  if (paciente.esperanzas && Array.isArray(paciente.esperanzas) && paciente.esperanzas.length > 0) {
    info.push(`- Esperanzas: ${paciente.esperanzas.join(', ')}`);
  }

  // Información del tratamiento
  if (paciente.treatments && paciente.treatments.length > 0) {
    const tratamiento = paciente.treatments[0];
    
    if (tratamiento.metasPersonales && Array.isArray(tratamiento.metasPersonales) && tratamiento.metasPersonales.length > 0) {
      info.push(`- Metas Personales: ${tratamiento.metasPersonales.join(', ')}`);
    }
    
    if (tratamiento.calidadVidaDeseada) {
      info.push(`- Calidad de Vida Deseada: ${tratamiento.calidadVidaDeseada}`);
    }

    // Metas clínicas
    if (tratamiento.metasClinicas && Array.isArray(tratamiento.metasClinicas) && tratamiento.metasClinicas.length > 0) {
      const metas = tratamiento.metasClinicas.map((m: any) => 
        `${m.objetivo || m.tipo}: ${m.valor || m.descripcion || m.meta}`
      ).join(', ');
      info.push(`- Metas Clínicas: ${metas}`);
    }
  }

  return info.join('\n');
}

export async function POST(request: NextRequest) {
  try {
    console.log('[AI Chat] Nueva solicitud recibida');
    
    const { userId } = await auth();
    if (!userId) {
      console.log('[AI Chat] Usuario no autenticado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    console.log('[AI Chat] Procesando mensaje para usuario:', userId);

    const body = await request.json();
    const { message, context } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    console.log('[AI Chat] Mensaje recibido:', message);

    // Detectar tipo de consulta
    const consulta = detectarConsultaPaciente(message);
    console.log('[AI Chat] Análisis de consulta:', consulta);

    let contextoDB = '';
    
    // Si es consulta sobre paciente, buscar en BD
    if (consulta.tipo === 'buscar_paciente') {
      let pacientes: any[] = [];
      
      if (consulta.buscarTodos) {
        console.log('[AI Chat] Buscando todos los pacientes');
        pacientes = await obtenerTodosPacientes(userId);
      } else if (consulta.nombrePaciente) {
        console.log('[AI Chat] Buscando paciente específico:', consulta.nombrePaciente);
        pacientes = await buscarPaciente(consulta.nombrePaciente, userId);
      } else {
        // Si no hay nombre específico, buscar todos
        console.log('[AI Chat] No se detectó nombre, buscando todos');
        pacientes = await obtenerTodosPacientes(userId);
      }

      if (pacientes.length > 0) {
        console.log(`[AI Chat] Encontrados ${pacientes.length} paciente(s), generando contexto`);
        contextoDB = '\n\n**INFORMACIÓN DE PACIENTES EN LA BASE DE DATOS:**\n\n';
        contextoDB += pacientes.map(p => formatearInfoPaciente(p)).join('\n\n---\n\n');
      } else {
        console.log('[AI Chat] No se encontraron pacientes');
        contextoDB = '\n\n**NOTA:** No se encontraron pacientes' + 
          (consulta.nombrePaciente ? ` con el nombre "${consulta.nombrePaciente}"` : '') + 
          ' en la base de datos.';
      }
    }

    // Construir prompt con contexto
    const systemPrompt = `Eres un asistente especializado en cuidados paliativos para la plataforma SONIA (Sistema de Optimización para Navegación Integral Avanzada en salud).

${contextoDB}

INSTRUCCIONES:
- Si tienes información de pacientes arriba, úsala para responder las preguntas
- Sé conciso, claro y empático
- Si la pregunta es sobre un paciente específico y tienes sus datos, responde con esa información
- Si no tienes la información, dilo claramente y pregunta si quieren agregar esa información al sistema
- Ofrece ayuda para completar el LTCP (Lienzo de Tratamiento Centrado en el Paciente)
- Usa un tono profesional pero cálido y cercano`;

    console.log('[AI Chat] Llamando a Groq API...');

    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: context ? `${context}\n\n${message}` : message
        }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      max_tokens: 1024,
    });

    const aiMessage = completion.choices[0]?.message?.content || 'No pude generar una respuesta.';
    
    console.log('[AI Chat] Respuesta generada exitosamente');

    return NextResponse.json({ 
      message: aiMessage,
      pacientesEncontrados: consulta.tipo === 'buscar_paciente'
    });

  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}