import { auth } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { prisma } from '@/lib/prisma';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const body = await request.json();
    const { message, patientId, context } = body;

    let patientContext = '';
    if (patientId) {
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
      }
    }

    const systemPrompt = `Eres un asistente médico experto en ayudar a cuidadores a gestionar el tratamiento usando el Lienzo de Tratamiento Centrado en el Paciente (LTCP).

El LTCP tiene 9 bloques en 3 categorías:

**Núcleo del Paciente:**
1. Perfil y Contexto
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

Ayuda a completar cada bloque, haz preguntas relevantes, sé empático. NO eres médico, recomienda consultar profesionales.

${patientContext}

Contexto: ${context || 'Ninguno'}

Responde en español, claro y conciso.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const assistantMessage = chatCompletion.choices[0]?.message?.content || 
      'Lo siento, no pude generar una respuesta.';

    return NextResponse.json({ 
      message: assistantMessage,
      usage: chatCompletion.usage,
    });

  } catch (error: any) {
    console.error('Error en asistente IA:', error);
    return NextResponse.json(
      { error: 'Error al procesar la solicitud', details: error.message },
      { status: 500 }
    );
  }
}