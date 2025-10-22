'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus, CheckSquare, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import FieldWithAssistant from '@/components/forms/FieldWithAssistant';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Actividad {
  tipo: string;
  titulo: string;
  descripcion: string;
  frecuencia: string;
}

export default function ActividadesPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  
  const [actividades, setActividades] = useState<Actividad[]>([]);
  const [nuevaActividad, setNuevaActividad] = useState<Actividad>({
    tipo: '',
    titulo: '',
    descripcion: '',
    frecuencia: ''
  });

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarActividad = () => {
    if (nuevaActividad.tipo && nuevaActividad.titulo && nuevaActividad.frecuencia) {
      setActividades([...actividades, nuevaActividad]);
      setNuevaActividad({ tipo: '', titulo: '', descripcion: '', frecuencia: '' });
    }
  };

  const eliminarActividad = (index: number) => {
    setActividades(actividades.filter((_, i) => i !== index));
  };

  // Generar actividades con IA
  const generarActividadesIA = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Dame 4 ejemplos de actividades clave para un plan de cuidados paliativos. Para cada actividad usa el formato: Tipo | Título | Descripción | Frecuencia. Tipos válidos: medicamento, cita, terapia, prueba, educacion, ejercicio. Frecuencias válidas: diaria, semanal, mensual. Separa cada actividad con línea nueva.',
          context: 'Necesito actividades realistas y específicas para cuidados paliativos.'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const actividadesIA = data.message
          .split('\n')
          .filter((line: string) => line.includes('|'))
          .map((line: string) => {
            const [tipo, titulo, descripcion, frecuencia] = line.split('|').map(s => s.trim());
            return { tipo, titulo, descripcion, frecuencia };
          })
          .filter((a: any) => a.tipo && a.titulo && a.frecuencia);
        
        if (actividadesIA.length > 0) {
          setActividades([...actividades, ...actividadesIA]);
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/patients/${patientId}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actividades }),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else {
        alert('Error al guardar las actividades');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar las actividades');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href={`/dashboard/pacientes/${patientId}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Actividades Clave de Cuidado</h1>
              <p className="text-sm text-gray-600">Bloque 5: Tareas esenciales del plan de tratamiento</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckSquare className="w-5 h-5 text-blue-600" />
                  <div>
                    <CardTitle>Actividades del Tratamiento</CardTitle>
                    <CardDescription>
                      Medicamentos, citas, terapias, pruebas y educación necesarias
                    </CardDescription>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generarActividadesIA}
                  disabled={loadingAI}
                >
                  {loadingAI ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="w-4 h-4 mr-2" />
                  )}
                  Generar con IA
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de Actividad</Label>
                  <Select 
                    value={nuevaActividad.tipo} 
                    onValueChange={(value) => setNuevaActividad({...nuevaActividad, tipo: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="medicamento">Medicamento</SelectItem>
                      <SelectItem value="cita">Cita médica</SelectItem>
                      <SelectItem value="terapia">Terapia/Rehabilitación</SelectItem>
                      <SelectItem value="prueba">Prueba/Examen</SelectItem>
                      <SelectItem value="educacion">Educación</SelectItem>
                      <SelectItem value="ejercicio">Ejercicio</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Select 
                    value={nuevaActividad.frecuencia} 
                    onValueChange={(value) => setNuevaActividad({...nuevaActividad, frecuencia: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Diaria</SelectItem>
                      <SelectItem value="dos-veces-dia">2 veces al día</SelectItem>
                      <SelectItem value="tres-veces-dia">3 veces al día</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quincenal">Quincenal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                      <SelectItem value="trimestral">Trimestral</SelectItem>
                      <SelectItem value="segun-necesidad">Según necesidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <FieldWithAssistant
                    label="Título/Nombre"
                    name="titulo"
                    value={nuevaActividad.titulo}
                    onChange={(value) => setNuevaActividad({...nuevaActividad, titulo: value})}
                    placeholder="Ej: Tomar Losartán 50mg, Cita con cardiólogo"
                    fieldType="input"
                    contextPrompt="Dame un ejemplo de título para una actividad de cuidados paliativos. Solo el título, una línea."
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <FieldWithAssistant
                    label="Descripción (opcional)"
                    name="descripcion"
                    value={nuevaActividad.descripcion}
                    onChange={(value) => setNuevaActividad({...nuevaActividad, descripcion: value})}
                    placeholder="Detalles adicionales: dosis, horario, instrucciones especiales"
                    contextPrompt="Dame detalles específicos para una actividad de cuidados paliativos. 2-3 líneas máximo."
                    rows={2}
                  />
                </div>
              </div>

              <Button type="button" onClick={agregarActividad} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Actividad
              </Button>

              <div className="space-y-2">
                {actividades.map((actividad, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge>{actividad.tipo}</Badge>
                        <Badge variant="outline">{actividad.frecuencia}</Badge>
                      </div>
                      <p className="font-medium">{actividad.titulo}</p>
                      {actividad.descripcion && (
                        <p className="text-sm text-gray-600 mt-1">{actividad.descripcion}</p>
                      )}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => eliminarActividad(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>

              {actividades.length === 0 && (
                <p className="text-center text-gray-500 py-8">
                  No hay actividades registradas. Agrega la primera actividad arriba.
                </p>
              )}
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/dashboard/pacientes/${patientId}`}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Actividades'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}