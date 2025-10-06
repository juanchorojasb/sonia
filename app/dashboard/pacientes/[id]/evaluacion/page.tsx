'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save, ClipboardCheck, TrendingUp } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Indicador {
  nombre: string;
  valorObjetivo: string;
  frecuenciaMedicion: string;
  responsable: string;
}

export default function EvaluacionPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [indicadores, setIndicadores] = useState<Indicador[]>([]);
  const [nuevoIndicador, setNuevoIndicador] = useState<Indicador>({
    nombre: '',
    valorObjetivo: '',
    frecuenciaMedicion: 'semanal',
    responsable: ''
  });

  const [criteriosExito, setCriteriosExito] = useState('');
  const [metodosEvaluacion, setMetodosEvaluacion] = useState('');

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarIndicador = () => {
    if (nuevoIndicador.nombre && nuevoIndicador.valorObjetivo) {
      setIndicadores([...indicadores, nuevoIndicador]);
      setNuevoIndicador({
        nombre: '',
        valorObjetivo: '',
        frecuenciaMedicion: 'semanal',
        responsable: ''
      });
    }
  };

  const eliminarIndicador = (idx: number) => {
    setIndicadores(indicadores.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/patients/${patientId}/treatments/update-evaluacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          indicadores,
          criteriosExito,
          metodosEvaluacion,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else {
        alert('Error al guardar la evaluación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la evaluación');
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
              <h1 className="text-2xl font-bold text-gray-900">Evaluación y Seguimiento</h1>
              <p className="text-sm text-gray-600">Bloque 8: Indicadores y criterios de éxito</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Criterios de Éxito */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <CardTitle>Criterios de Éxito</CardTitle>
              </div>
              <CardDescription>¿Cómo sabremos que el plan está funcionando?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Definir Criterios de Éxito</Label>
                <Textarea 
                  placeholder="Ej: Reducción del dolor en 50%, mejora en movilidad, mayor independencia en actividades diarias..."
                  value={criteriosExito}
                  onChange={(e) => setCriteriosExito(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Indicadores de Seguimiento */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-5 h-5 text-blue-600" />
                <CardTitle>Indicadores de Seguimiento</CardTitle>
              </div>
              <CardDescription>Métricas específicas para monitorear progreso</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre del Indicador</Label>
                  <Input 
                    placeholder="Ej: Nivel de dolor (escala 1-10)"
                    value={nuevoIndicador.nombre}
                    onChange={(e) => setNuevoIndicador({...nuevoIndicador, nombre: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Valor Objetivo</Label>
                  <Input 
                    placeholder="Ej: Dolor < 3/10"
                    value={nuevoIndicador.valorObjetivo}
                    onChange={(e) => setNuevoIndicador({...nuevoIndicador, valorObjetivo: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Frecuencia de Medición</Label>
                  <Select 
                    value={nuevoIndicador.frecuenciaMedicion}
                    onValueChange={(value) => setNuevoIndicador({...nuevoIndicador, frecuenciaMedicion: value})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="diaria">Diaria</SelectItem>
                      <SelectItem value="semanal">Semanal</SelectItem>
                      <SelectItem value="quincenal">Quincenal</SelectItem>
                      <SelectItem value="mensual">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Responsable de Medición</Label>
                  <Input 
                    placeholder="Ej: Enfermera, Cuidador"
                    value={nuevoIndicador.responsable}
                    onChange={(e) => setNuevoIndicador({...nuevoIndicador, responsable: e.target.value})}
                  />
                </div>
              </div>

              <Button type="button" onClick={agregarIndicador} className="w-full">
                Agregar Indicador
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Indicadores */}
          {indicadores.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Indicadores Definidos ({indicadores.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {indicadores.map((ind, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="font-semibold">{ind.nombre}</h4>
                          <p className="text-sm text-gray-600">Objetivo: {ind.valorObjetivo}</p>
                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>📊 {ind.frecuenciaMedicion}</span>
                            <span>👤 {ind.responsable}</span>
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => eliminarIndicador(idx)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Métodos de Evaluación */}
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Evaluación</CardTitle>
              <CardDescription>¿Cómo se medirán y registrarán los resultados?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Describir Métodos</Label>
                <Textarea 
                  placeholder="Ej: Escalas de evaluación, cuestionarios, exámenes físicos, reportes del cuidador..."
                  value={metodosEvaluacion}
                  onChange={(e) => setMetodosEvaluacion(e.target.value)}
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/dashboard/pacientes/${patientId}`}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Evaluación'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}