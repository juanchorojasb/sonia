import { NextRequest, NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/prisma';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

// Función para detectar si la pregunta es sobre un paciente específico
function detectarConsultaPaciente(message: string): { tipo: 'buscar_paciente' | 'info_general', nombrePaciente?: string } {
  const lowerMessage = message.toLowerCase();
  
  // Patrones de búsqueda
  const patronesNombre = [
    /(?:paciente|señor|señora|sr\.|sra\.|don|doña)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*)/i,
    /información (?:de|del|sobre)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*)/i,
    /(?:cómo está|estado de)\s+([a-záéíóúñ]+(?:\s+[a-záéíóúñ]+)*)/i,
  ];

  // Palabras clave de consulta
  const palabrasClave = [
    'medicamento', 'medicación', 'medicina', 'fármaco', 'toma',
    'cita', 'consulta', 'próxima cita', 'cuándo',
    'diagnóstico', 'enfermedad', 'condición',
    'tratamiento', 'terapia',
    'edad', 'años',
    'teléfono', 'contacto',
    'familia', 'cuidador',
  ];

  const tienePalabraClave = palabrasClave.some(palabra => lowerMessage.includes(palabra));

  // Buscar nombre del paciente en el mensaje
  for (const patron of patronesNombre) {
    const match = message.match(patron);
    if (match && match[1]) {
      return {
        tipo: 'buscar_paciente',
        nombrePaciente: match[1].trim()
      };
    }
  }

  // Si tiene palabras clave pero no encontramos nombre específico
  if (tienePalabraClave) {
    return { tipo: 'buscar_paciente' };
  }

  return { tipo: 'info_general' };
}

// Función para buscar paciente por nombre
async function buscarPaciente(nombre: string, userId: string) {
  try {
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
      take: 5 // Máximo 5 resultados
    });

    return pacientes;
  } catch (error) {
    console.error('Error buscando paciente:', error);
    return [];
  }
}

// Función para buscar todos los pacientes del usuario
async function obtenerTodosPacientes(userId: string) {
  try {
    const pacientes = await prisma.patient.findMany({
      where: { userId },
      include: {
        treatments: {
          where: { activo: true },
          orderBy: { updatedAt: 'desc' },
          take: 1
        }
      },
      take: 10,
      orderBy: { updatedAt: 'desc' }
    });

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
  if (paciente.situacionSocial) info.push(`- Situación Social: ${paciente.situacionSocial}`);
  if (paciente.contextoCultural) info.push(`- Contexto Cultural: ${paciente.contextoCultural}`);
  
  // Valores personales
  if (paciente.valoresPersonales && Array.isArray(paciente.valoresPersonales) && paciente.valoresPersonales.length > 0) {
    info.push(`- Valores: ${paciente.valoresPersonales.join(', ')}`);
  }
  
  // Preocupaciones
  if (paciente.preocupaciones && Array.isArray(paciente.preocupaciones) && paciente.preocupaciones.length > 0) {
    info.push(`- Preocupaciones: ${paciente.preocupaciones.join(', ')}`);
  }

  // Información del tratamiento
  if (paciente.treatments && paciente.treatments.length > 0) {
    const tratamiento = paciente.treatments[0];
    
    if (tratamiento.metasPersonales && Array.isArray(tratamiento.metasPersonales) && tratamiento.metasPersonales.length > 0) {
      info.push(`- Metas: ${tratamiento.metasPersonales.join(', ')}`);
    }
    
    if (tratamiento.calidadVidaDeseada) {
      info.push(`- Calidad de vida deseada: ${tratamiento.calidadVidaDeseada}`);
    }

    // Metas clínicas
    if (tratamiento.metasClinicas && Array.isArray(tratamiento.metasClinicas) && tratamiento.metasClinicas.length > 0) {
      const metas = tratamiento.metasClinicas.map((m: any) => `${m.objetivo}: ${m.valor}`).join(', ');
      info.push(`- Metas clínicas: ${metas}`);
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

    // Detectar tipo de consulta
    const consulta = detectarConsultaPaciente(message);
    console.log('[AI Chat] Tipo de consulta:', consulta);

    let contextoDB = '';
    
    // Si es consulta sobre paciente, buscar en BD
    if (consulta.tipo === 'buscar_paciente') {
      let pacientes: any[] = [];
      
      if (consulta.nombrePaciente) {
        console.log('[AI Chat] Buscando paciente:', consulta.nombrePaciente);
        pacientes = await buscarPaciente(consulta.nombrePaciente, userId);
      } else {
        console.log('[AI Chat] Obteniendo todos los pacientes');
        pacientes = await obtenerTodosPacientes(userId);
      }

      if (pacientes.length > 0) {
        console.log(`[AI Chat] Encontrados ${pacientes.length} paciente(s)`);
        contextoDB = '\n\n**INFORMACIÓN DE PACIENTES EN LA BASE DE DATOS:**\n\n';
        contextoDB += pacientes.map(p => formatearInfoPaciente(p)).join('\n\n---\n\n');
      } else {
        console.log('[AI Chat] No se encontraron pacientes');
        contextoDB = '\n\n**NOTA:** No se encontraron pacientes con ese nombre en la base de datos.';
      }
    }

    // Construir prompt con contexto
    const systemPrompt = `Eres un asistente especializado en cuidados paliativos que ayuda a profesionales de salud con el Lienzo de Tratamiento Centrado en el Paciente (LTCP).

${contextoDB}

INSTRUCCIONES:
- Si tienes información de pacientes arriba, úsala para responder preguntas específicas
- Sé conciso, claro y empático
- Si no tienes la información, dilo claramente
- Ofrece ayuda para completar información faltante
- Usa un tono profesional pero cálido`;

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
      temperature: 0.7,
      max_tokens: 1024,
    });

    const aiMessage = completion.choices[0]?.message?.content || 'No pude generar una respuesta.';
    
    console.log('[AI Chat] Respuesta generada exitosamente');

    return NextResponse.json({ 
      message: aiMessage,
      pacientesEncontrados: consulta.tipo === 'buscar_paciente' ? true : false
    });

  } catch (error) {
    console.error('[AI Chat] Error:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}