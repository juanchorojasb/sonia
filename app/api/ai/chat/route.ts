import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const { userId } = await auth();
    
    if (!userId) {
      console.error('[AI Chat] Usuario no autenticado');
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { message, patientId, context } = body;

    if (!message || typeof message !== 'string') {
      console.error('[AI Chat] Mensaje inválido:', message);
      return NextResponse.json(
        { error: 'Mensaje requerido' },
        { status: 400 }
      );
    }

    console.log('[AI Chat] Procesando mensaje para usuario:', userId);

    // Construir contexto del paciente si se proporciona patientId
    let patientContext = '';
    if (patientId) {
      try {
        const patient = await prisma.patient.findUnique({
          where: { id: patientId },
          include: {
            tratamientos: {
              where: { activo: true },
              take: 1,
            },
          },
        });

        if (patient && patient.clerkUserId === userId) {
          patientContext = `
Contexto del Paciente:
- Nombre: ${patient.nombre}
- Edad: ${patient.edad} años
- Situación Social: ${patient.situacionSocial || 'No especificada'}
- Valores: ${patient.valoresPersonales.join(', ')}
- Preocupaciones: ${patient.preocupaciones.join(', ')}
- Esperanzas: ${patient.esperanzas.join(', ')}
`;
          console.log('[AI Chat] Contexto del paciente cargado para:', patient.nombre);
        }
      } catch (patientError) {
        console.error('[AI Chat] Error al cargar paciente:', patientError);
        // Continuar sin contexto de paciente
      }
    }

    const systemPrompt = `Eres sonIA, un asistente médico especializado en ayudar a cuidadores a gestionar el tratamiento usando el Lienzo de Tratamiento Centrado en el Paciente (LTCP).

El LTCP tiene 9 bloques organizados en 3 categorías:

**Núcleo del Paciente:**
1. Perfil y Contexto del Paciente
2. Metas de Salud
3. Relación de Cuidado
4. Puntos de Cuidado

**Infraestructura:**
5. Actividades Clave
6. Recursos Clave
7. Equipo de Cuidado

**Economía:**
8. Cargas y Costos
9. Resultados Positivos

Tu rol es:
- Ayudar a completar cada bloque del LTCP
- Hacer preguntas relevantes para obtener información importante
- Ser empático y comprensivo
- Proporcionar orientación basada en mejores prácticas de cuidados paliativos
- IMPORTANTE: NO eres un médico. Siempre recomienda consultar con profesionales de salud para decisiones médicas

${patientContext}

Contexto adicional: ${context || 'Ninguno'}

Responde SIEMPRE en español, de manera clara, concisa y compasiva.`;

    // Validar que la API key de Groq existe
    if (!process.env.GROQ_API_KEY) {
      console.error('[AI Chat] GROQ_API_KEY no configurada');
      return NextResponse.json(
        { error: 'Configuración del servidor incompleta' },
        { status: 500 }
      );
    }

    console.log('[AI Chat] Llamando a Groq API...');

    // Llamar a Groq API
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
      top_p: 1,
    });

    const assistantMessage = chatCompletion.choices[0]?.message?.content ||
      'Lo siento, no pude generar una respuesta. Por favor, intenta de nuevo.';

    console.log('[AI Chat] Respuesta generada exitosamente');

    return NextResponse.json({
      message: assistantMessage,
      usage: chatCompletion.usage,
    });

  } catch (error: any) {
    console.error('[AI Chat] Error completo:', error);
    console.error('[AI Chat] Stack trace:', error.stack);
    
    // Manejo de errores específicos
    let errorMessage = 'Error al procesar tu mensaje';
    let statusCode = 500;

    if (error.message?.includes('API key')) {
      errorMessage = 'Error de configuración del servicio de IA';
      console.error('[AI Chat] Error de API key de Groq');
    } else if (error.message?.includes('rate limit')) {
      errorMessage = 'Servicio temporalmente sobrecargado. Intenta de nuevo en unos segundos';
      statusCode = 429;
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'El servicio tardó demasiado en responder. Intenta de nuevo';
      statusCode = 504;
    } else if (error.message?.includes('network') || error.code === 'ECONNREFUSED') {
      errorMessage = 'Error de conexión con el servicio de IA';
    }

    return NextResponse.json(
      { 
        error: errorMessage,
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: statusCode }
    );
  }
}
