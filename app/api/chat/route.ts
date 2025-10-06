import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';
import { getUserWithRole } from '@/lib/roles';

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export async function POST(request: Request) {
  try {
    // Verificar autenticación
    const user = await getUserWithRole();
    if (!user) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }

    const { message, patientContext } = await request.json();

    if (!message) {
      return NextResponse.json({ error: 'Mensaje requerido' }, { status: 400 });
    }

    // Construir el contexto del sistema
    let systemPrompt = `Eres sonIA, un asistente especializado en cuidados paliativos. 
Tu objetivo es ayudar a ${user.rol === 'PROFESIONAL_SALUD' ? 'profesionales de salud' : 'cuidadores'} 
a brindar mejor atención a sus pacientes.

Usuario actual: ${user.nombre} (${user.rol})
${user.especialidad ? `Especialidad: ${user.especialidad}` : ''}

Responde de manera empática, clara y profesional. Si hay información de un paciente, úsala para 
personalizar tus respuestas.`;

    if (patientContext) {
      systemPrompt += `\n\nInformación del paciente actual:
Nombre: ${patientContext.nombre}
Edad: ${patientContext.edad} años
${patientContext.diagnostico ? `Diagnóstico: ${patientContext.diagnostico}` : ''}`;
    }

    // Llamar a Groq
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message },
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.7,
      max_tokens: 1024,
    });

    const response = chatCompletion.choices[0]?.message?.content || 
      'Lo siento, no pude generar una respuesta.';

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error en chat:', error);
    return NextResponse.json(
      { error: 'Error al procesar el mensaje' },
      { status: 500 }
    );
  }
}