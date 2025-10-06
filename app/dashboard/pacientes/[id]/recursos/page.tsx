'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus, Users, Package, FileText, DollarSign } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Recurso {
  nombre: string;
  detalles?: string;
}

export default function RecursosPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Recursos humanos
  const [recursosHumanos, setRecursosHumanos] = useState<Recurso[]>([]);
  const [nuevoHumano, setNuevoHumano] = useState<Recurso>({ nombre: '', detalles: '' });
  
  // Recursos físicos
  const [recursosFisicos, setRecursosFisicos] = useState<Recurso[]>([]);
  const [nuevoFisico, setNuevoFisico] = useState<Recurso>({ nombre: '', detalles: '' });
  
  // Recursos intelectuales
  const [recursosIntelectuales, setRecursosIntelectuales] = useState<Recurso[]>([]);
  const [nuevoIntelectual, setNuevoIntelectual] = useState<Recurso>({ nombre: '', detalles: '' });
  
  // Recursos financieros
  const [recursosFinancieros, setRecursosFinancieros] = useState<Recurso[]>([]);
  const [nuevoFinanciero, setNuevoFinanciero] = useState<Recurso>({ nombre: '', detalles: '' });

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarHumano = () => {
    if (nuevoHumano.nombre) {
      setRecursosHumanos([...recursosHumanos, nuevoHumano]);
      setNuevoHumano({ nombre: '', detalles: '' });
    }
  };

  const agregarFisico = () => {
    if (nuevoFisico.nombre) {
      setRecursosFisicos([...recursosFisicos, nuevoFisico]);
      setNuevoFisico({ nombre: '', detalles: '' });
    }
  };

  const agregarIntelectual = () => {
    if (nuevoIntelectual.nombre) {
      setRecursosIntelectuales([...recursosIntelectuales, nuevoIntelectual]);
      setNuevoIntelectual({ nombre: '', detalles: '' });
    }
  };

  const agregarFinanciero = () => {
    if (nuevoFinanciero.nombre) {
      setRecursosFinancieros([...recursosFinancieros, nuevoFinanciero]);
      setNuevoFinanciero({ nombre: '', detalles: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/patients/${patientId}/treatments/update-recursos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recursosHumanos,
          recursosFisicos,
          recursosIntelectuales,
          recursosFinancieros,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else {
        alert('Error al guardar los recursos');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar los recursos');
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
              <h1 className="text-2xl font-bold text-gray-900">Recursos Clave de Cuidado</h1>
              <p className="text-sm text-gray-600">Bloque 6: Activos necesarios para la atención</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Recursos Humanos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <CardTitle>Recursos Humanos</CardTitle>
              </div>
              <CardDescription>Profesionales de salud necesarios</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Ej: Médico de cabecera, Enfermera, Fisioterapeuta"
                  value={nuevoHumano.nombre}
                  onChange={(e) => setNuevoHumano({...nuevoHumano, nombre: e.target.value})}
                />
                <Button type="button" onClick={agregarHumano}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recursosHumanos.map((recurso, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {recurso.nombre}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setRecursosHumanos(recursosHumanos.filter((_, i) => i !== idx))} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recursos Físicos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Package className="w-5 h-5 text-green-600" />
                <CardTitle>Recursos Físicos</CardTitle>
              </div>
              <CardDescription>Equipos médicos y tecnología</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Ej: Tensiómetro, Glucómetro, Silla de ruedas"
                  value={nuevoFisico.nombre}
                  onChange={(e) => setNuevoFisico({...nuevoFisico, nombre: e.target.value})}
                />
                <Button type="button" onClick={agregarFisico}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recursosFisicos.map((recurso, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {recurso.nombre}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setRecursosFisicos(recursosFisicos.filter((_, i) => i !== idx))} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recursos Intelectuales */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                <CardTitle>Recursos Intelectuales</CardTitle>
              </div>
              <CardDescription>Protocolos, guías, conocimiento</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Ej: Guía de manejo de diabetes, Protocolo de medicación"
                  value={nuevoIntelectual.nombre}
                  onChange={(e) => setNuevoIntelectual({...nuevoIntelectual, nombre: e.target.value})}
                />
                <Button type="button" onClick={agregarIntelectual}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recursosIntelectuales.map((recurso, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {recurso.nombre}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setRecursosIntelectuales(recursosIntelectuales.filter((_, i) => i !== idx))} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recursos Financieros */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <CardTitle>Recursos Financieros</CardTitle>
              </div>
              <CardDescription>Cobertura y asistencia financiera</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  placeholder="Ej: Seguro de salud EPS, Programa de asistencia"
                  value={nuevoFinanciero.nombre}
                  onChange={(e) => setNuevoFinanciero({...nuevoFinanciero, nombre: e.target.value})}
                />
                <Button type="button" onClick={agregarFinanciero}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {recursosFinancieros.map((recurso, idx) => (
                  <Badge key={idx} variant="secondary" className="gap-1">
                    {recurso.nombre}
                    <X className="w-3 h-3 cursor-pointer" onClick={() => setRecursosFinancieros(recursosFinancieros.filter((_, i) => i !== idx))} />
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Link href={`/dashboard/pacientes/${patientId}`}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Recursos'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}