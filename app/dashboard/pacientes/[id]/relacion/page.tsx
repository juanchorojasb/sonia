'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import Link from 'next/link';

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
  const [nuevoMedio, setNuevoMedio] = useState('');
  
  // Decisiones
  const [procesoDecisiones, setProcesoDecisiones] = useState('');
  
  // Rol de la familia
  const [rolFamilia, setRolFamilia] = useState('');

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarMedio = () => {
    if (nuevoMedio.trim()) {
      setMediosComunicacion([...mediosComunicacion, nuevoMedio.trim()]);
      setNuevoMedio('');
    }
  };

  const eliminarMedio = (index: number) => {
    setMediosComunicacion(mediosComunicacion.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Buscar tratamiento existente o crear uno nuevo
    const treatmentData = {
      tipoRelacion,
      frecuenciaComunicacion,
      mediosComunicacion,
      procesoDecisiones,
      rolFamilia,
    };

    try {
      const response = await fetch(`/api/patients/${patientId}/treatments/update-relation`, {
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

              <div className="space-y-2">
                <Label>Medios de Comunicación</Label>
                <div className="flex gap-2">
                  <Input 
                    placeholder="Ej: Videollamada, teléfono, mensajería"
                    value={nuevoMedio}
                    onChange={(e) => setNuevoMedio(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarMedio())}
                  />
                  <Button type="button" onClick={agregarMedio}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {mediosComunicacion.map((medio, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {medio}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => eliminarMedio(idx)}
                      />
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  Ejemplos: Videollamada semanal, WhatsApp diario, llamada telefónica mensual, visita presencial
                </p>
              </div>
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
              <Textarea 
                rows={4}
                placeholder="Describe cómo se tomarán las decisiones sobre tratamiento, medicamentos, procedimientos, etc. ¿Quién participa? ¿Cómo se llega a consenso?"
                value={procesoDecisiones}
                onChange={(e) => setProcesoDecisiones(e.target.value)}
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
              <Textarea 
                rows={4}
                placeholder="Describe el rol de cada miembro de la familia o cuidador en el plan de cuidado"
                value={rolFamilia}
                onChange={(e) => setRolFamilia(e.target.value)}
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