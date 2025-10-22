'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Save, X, Plus, Sparkles, Loader2 } from 'lucide-react';
import Link from 'next/link';
import FieldWithAssistant from '@/components/forms/FieldWithAssistant';
import TagFieldWithAssistant from '@/components/forms/TagFieldWithAssistant';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function MetasSaludPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingAI, setLoadingAI] = useState(false);
  
  // Metas Clínicas
  const [metasClinicas, setMetasClinicas] = useState<Array<{objetivo: string, valor: string}>>([]);
  const [nuevaMetaClinica, setNuevaMetaClinica] = useState({ objetivo: '', valor: '' });
  
  // Metas Personales
  const [metasPersonales, setMetasPersonales] = useState<string[]>([]);
  
  // Calidad de Vida Deseada
  const [calidadVida, setCalidadVida] = useState('');

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarMetaClinica = () => {
    if (nuevaMetaClinica.objetivo && nuevaMetaClinica.valor) {
      setMetasClinicas([...metasClinicas, nuevaMetaClinica]);
      setNuevaMetaClinica({ objetivo: '', valor: '' });
    }
  };

  const eliminarMetaClinica = (index: number) => {
    setMetasClinicas(metasClinicas.filter((_, i) => i !== index));
  };

  const agregarMetaPersonal = (meta: string) => {
    setMetasPersonales([...metasPersonales, meta]);
  };

  const eliminarMetaPersonal = (index: number) => {
    setMetasPersonales(metasPersonales.filter((_, i) => i !== index));
  };

  // Función para generar sugerencias de metas clínicas con IA
  const generarMetasClinicasIA = async () => {
    setLoadingAI(true);
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: 'Dame 3 ejemplos de metas clínicas comunes para pacientes de cuidados paliativos. Para cada una, dame el objetivo y el valor meta. Formato: "Objetivo | Valor". Separa cada meta con una nueva línea.',
          context: 'Necesito ejemplos concretos y medibles de metas clínicas.'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        // Parsear las metas del formato "Objetivo | Valor"
        const metas = data.message
          .split('\n')
          .filter((line: string) => line.includes('|'))
          .map((line: string) => {
            const [objetivo, valor] = line.split('|').map(s => s.trim());
            return { objetivo, valor };
          })
          .filter((meta: any) => meta.objetivo && meta.valor);
        
        if (metas.length > 0) {
          setMetasClinicas([...metasClinicas, ...metas]);
        }
      }
    } catch (error) {
      console.error('Error al generar metas:', error);
    } finally {
      setLoadingAI(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      nombre: 'Plan de Tratamiento Principal',
      activo: true,
      metasClinicas: metasClinicas,
      metasPersonales: metasPersonales,
      calidadVidaDeseada: calidadVida,
      // Valores por defecto para campos requeridos
      puntosAtencionFisicos: [],
      plataformasDigitales: [],
      recursosHumanos: [],
      recursosFisicos: [],
      recursosIntelectuales: [],
      recursosFinancieros: [],
      costosFinancieros: [],
      metricasClinicas: [],
      resultadosFuncionales: [],
      resultadosReportados: [],
      valorSistema: [],
      mediosComunicacion: [],
    };

    try {
      const response = await fetch(`/api/patients/${patientId}/treatments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else {
        alert('Error al guardar las metas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar las metas');
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
              <h1 className="text-2xl font-bold text-gray-900">Metas de Salud y Bienestar</h1>
              <p className="text-sm text-gray-600">Bloque 2: Define objetivos clínicos y de vida</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Metas Clínicas */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Metas Clínicas</CardTitle>
                  <CardDescription>
                    Objetivos médicos medibles (ej: presión arterial, glucosa, peso)
                  </CardDescription>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={generarMetasClinicasIA}
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
                  <Label>Objetivo Clínico</Label>
                  <Input 
                    placeholder="Ej: Presión arterial"
                    value={nuevaMetaClinica.objetivo}
                    onChange={(e) => setNuevaMetaClinica({...nuevaMetaClinica, objetivo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Valor Meta</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Ej: Menor a 120/80 mmHg"
                      value={nuevaMetaClinica.valor}
                      onChange={(e) => setNuevaMetaClinica({...nuevaMetaClinica, valor: e.target.value})}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarMetaClinica())}
                    />
                    <Button type="button" onClick={agregarMetaClinica}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {metasClinicas.map((meta, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">{meta.objetivo}</p>
                      <p className="text-sm text-gray-600">{meta.valor}</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => eliminarMetaClinica(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              
              <p className="text-xs text-gray-500">
                💡 Ejemplos: Control de dolor (EVA &lt; 3/10), Nivel de glucosa (70-130 mg/dL), Peso estable (±2 kg)
              </p>
            </CardContent>
          </Card>

          {/* Metas Personales */}
          <Card>
            <CardHeader>
              <CardTitle>Metas Personales de Vida</CardTitle>
              <CardDescription>
                Objetivos funcionales y de calidad de vida del paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TagFieldWithAssistant
                label="Metas Personales"
                values={metasPersonales}
                onAdd={agregarMetaPersonal}
                onRemove={eliminarMetaPersonal}
                placeholder="Ej: Poder cuidar mi jardín sin cansarme"
                description="¿Qué actividades o logros son importantes para el paciente?"
                contextPrompt="Dame ejemplos de metas personales realistas y significativas para pacientes de cuidados paliativos. Enfócate en actividades cotidianas, relaciones familiares y momentos especiales"
              />
            </CardContent>
          </Card>

          {/* Calidad de Vida Deseada */}
          <Card>
            <CardHeader>
              <CardTitle>Calidad de Vida Deseada</CardTitle>
              <CardDescription>
                ¿Cómo se ve el "éxito" para este paciente?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldWithAssistant
                label="Visión de Éxito"
                name="calidadVida"
                value={calidadVida}
                onChange={setCalidadVida}
                placeholder="Describe cómo sería un día típico ideal para el paciente una vez alcanzadas sus metas..."
                description="Describe la vida diaria, actividades, relaciones y bienestar emocional deseado"
                contextPrompt="Describe de manera realista y emotiva cómo sería un día ideal en la vida de un paciente de cuidados paliativos que ha alcanzado sus metas de salud y bienestar. Incluye detalles sobre actividades, familia y emociones. Máximo 5 líneas."
                rows={5}
              />
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-4">
            <Link href={`/dashboard/pacientes/${patientId}`}>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Metas'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}