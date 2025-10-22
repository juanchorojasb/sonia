'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Save } from 'lucide-react';
import Link from 'next/link';
import FieldWithAssistant from '@/components/forms/FieldWithAssistant';
import TagFieldWithAssistant from '@/components/forms/TagFieldWithAssistant';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function RelacionCuidadoPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Tipo de relación
  const [tipoRelacion, setTipoRelacion] = useState('');
  
  // Comunicación
  const [frecuenciaComunicacion, setFrecuenciaComunicacion] = useState('');
  const [mediosComunicacion, setMediosComunicacion] = useState<string[]>([]);
  
  // Decisiones
  const [procesoDecisiones, setProcesoDecisiones] = useState('');
  
  // Rol de la familia
  const [rolFamilia, setRolFamilia] = useState('');

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarMedio = (medio: string) => {
    setMediosComunicacion([...mediosComunicacion, medio]);
  };

  const eliminarMedio = (index: number) => {
    setMediosComunicacion(mediosComunicacion.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const treatmentData = {
      tipoRelacion,
      frecuenciaComunicacion,
      mediosComunicacion,
      procesoDecisiones,
      rolFamilia,
    };

    try {
      // ✅ CORREGIDO: cambiar 'update-relation' a 'update-relacion'
      const response = await fetch(`/api/patients/${patientId}/treatments/update-relacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentData),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else {
        alert('Error al guardar la relación de cuidado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la relación de cuidado');
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
              <h1 className="text-2xl font-bold text-gray-900">Relación de Cuidado y Compromiso</h1>
              <p className="text-sm text-gray-600">Bloque 3: Define cómo colaborará el equipo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Tipo de Relación */}
          <Card>
            <CardHeader>
              <CardTitle>Tipo de Relación de Cuidado</CardTitle>
              <CardDescription>
                ¿Cómo trabajaremos juntos? Define la naturaleza de la colaboración
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tipoRelacion">Tipo de Relación</Label>
                <Select value={tipoRelacion} onValueChange={setTipoRelacion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="co-creacion">Co-creación intensiva</SelectItem>
                    <SelectItem value="apoyo-personalizado">Apoyo personalizado</SelectItem>
                    <SelectItem value="seguimiento-automatizado">Seguimiento automatizado</SelectItem>
                    <SelectItem value="mixto">Mixto (combinación)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  Co-creación: Decisiones conjuntas activas | Apoyo: Guía y soporte continuo | Automatizado: Recordatorios y check-ins programados
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Comunicación */}
          <Card>
            <CardHeader>
              <CardTitle>Plan de Comunicación</CardTitle>
              <CardDescription>
                Frecuencia y medios para mantenerse en contacto
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="frecuencia">Frecuencia de Comunicación</Label>
                <Select value={frecuenciaComunicacion} onValueChange={setFrecuenciaComunicacion}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar frecuencia..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="diaria">Diaria</SelectItem>
                    <SelectItem value="semanal">Semanal</SelectItem>
                    <SelectItem value="quincenal">Quincenal</SelectItem>
                    <SelectItem value="mensual">Mensual</SelectItem>
                    <SelectItem value="segun-necesidad">Según necesidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <TagFieldWithAssistant
                label="Medios de Comunicación"
                values={mediosComunicacion}
                onAdd={agregarMedio}
                onRemove={eliminarMedio}
                placeholder="Ej: Videollamada, teléfono, mensajería"
                description="¿A través de qué medios se mantendrá el contacto?"
                contextPrompt="Dame ejemplos de medios de comunicación efectivos para equipos de cuidados paliativos y familias"
              />
            </CardContent>
          </Card>

          {/* Proceso de Decisiones */}
          <Card>
            <CardHeader>
              <CardTitle>Toma de Decisiones Compartida</CardTitle>
              <CardDescription>
                ¿Cómo se tomarán las decisiones importantes?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldWithAssistant
                label="Proceso de Decisiones"
                name="procesoDecisiones"
                value={procesoDecisiones}
                onChange={setProcesoDecisiones}
                placeholder="Describe cómo se tomarán las decisiones sobre tratamiento, medicamentos, procedimientos, etc."
                description="¿Quién participa? ¿Cómo se llega a consenso?"
                contextPrompt="Describe un proceso claro y práctico de toma de decisiones compartida en cuidados paliativos, incluyendo quién participa, cómo se comunican las opciones, y cómo se llega a acuerdos. Máximo 4 líneas."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">
                Ejemplo: "Las decisiones sobre cambios en medicamentos se discutirán en consulta trimestral con el especialista, con la hija presente. Las decisiones urgentes se tomarán por teléfono con consentimiento verbal."
              </p>
            </CardContent>
          </Card>

          {/* Rol de la Familia */}
          <Card>
            <CardHeader>
              <CardTitle>Rol de la Familia y Cuidadores</CardTitle>
              <CardDescription>
                ¿Cuál es el papel específico de familiares y amigos?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldWithAssistant
                label="Roles y Responsabilidades"
                name="rolFamilia"
                value={rolFamilia}
                onChange={setRolFamilia}
                placeholder="Describe el rol de cada miembro de la familia o cuidador en el plan de cuidado"
                description="Especifica tareas, responsabilidades y tipo de apoyo de cada persona"
                contextPrompt="Describe roles específicos y realistas de diferentes miembros de la familia en el cuidado de un paciente paliativo. Incluye tareas prácticas, apoyo emocional y gestiones administrativas. Máximo 4 líneas."
                rows={4}
              />
              <p className="text-xs text-gray-500 mt-2">
                Ejemplo: "Hija: Acompaña a citas médicas y gestiona medicamentos. Vecina: Visita diaria para verificar bienestar. Nieto: Apoyo emocional telefónico semanal."
              </p>
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
              {loading ? 'Guardando...' : 'Guardar Relación de Cuidado'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}