'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus, MapPin, Smartphone } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface PuntoFisico {
  tipo: string;
  nombre: string;
  direccion?: string;
}

interface PlataformaDigital {
  tipo: string;
  nombre: string;
  url?: string;
}

export default function PuntosCuidadoPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  // Puntos físicos
  const [puntosAtencionFisicos, setPuntosAtencionFisicos] = useState<PuntoFisico[]>([]);
  const [nuevoPunto, setNuevoPunto] = useState<PuntoFisico>({ tipo: '', nombre: '', direccion: '' });
  
  // Plataformas digitales
  const [plataformasDigitales, setPlataformasDigitales] = useState<PlataformaDigital[]>([]);
  const [nuevaPlataforma, setNuevaPlataforma] = useState<PlataformaDigital>({ tipo: '', nombre: '', url: '' });

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarPuntoFisico = () => {
    if (nuevoPunto.tipo && nuevoPunto.nombre) {
      setPuntosAtencionFisicos([...puntosAtencionFisicos, nuevoPunto]);
      setNuevoPunto({ tipo: '', nombre: '', direccion: '' });
    }
  };

  const eliminarPuntoFisico = (index: number) => {
    setPuntosAtencionFisicos(puntosAtencionFisicos.filter((_, i) => i !== index));
  };

  const agregarPlataforma = () => {
    if (nuevaPlataforma.tipo && nuevaPlataforma.nombre) {
      setPlataformasDigitales([...plataformasDigitales, nuevaPlataforma]);
      setNuevaPlataforma({ tipo: '', nombre: '', url: '' });
    }
  };

  const eliminarPlataforma = (index: number) => {
    setPlataformasDigitales(plataformasDigitales.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const treatmentData = {
      puntosAtencionFisicos,
      plataformasDigitales,
    };

    try {
      const response = await fetch(`/api/patients/${patientId}/treatments/update-puntos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(treatmentData),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else {
        alert('Error al guardar los puntos de cuidado');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar los puntos de cuidado');
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
              <h1 className="text-2xl font-bold text-gray-900">Puntos de Cuidado y Comunicación</h1>
              <p className="text-sm text-gray-600">Bloque 4: Dónde y cómo se entrega la atención</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Puntos de Atención Físicos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <CardTitle>Puntos de Atención Físicos</CardTitle>
              </div>
              <CardDescription>
                Ubicaciones donde se brinda atención: clínicas, hospitales, hogar, etc.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input 
                    placeholder="Clínica, Hospital, Hogar"
                    value={nuevoPunto.tipo}
                    onChange={(e) => setNuevoPunto({...nuevoPunto, tipo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input 
                    placeholder="Hospital General"
                    value={nuevoPunto.nombre}
                    onChange={(e) => setNuevoPunto({...nuevoPunto, nombre: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dirección</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Calle 123 #45-67"
                      value={nuevoPunto.direccion}
                      onChange={(e) => setNuevoPunto({...nuevoPunto, direccion: e.target.value})}
                    />
                    <Button type="button" onClick={agregarPuntoFisico}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {puntosAtencionFisicos.map((punto, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <div>
                      <p className="font-medium">{punto.tipo}: {punto.nombre}</p>
                      {punto.direccion && <p className="text-sm text-gray-600">{punto.direccion}</p>}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => eliminarPuntoFisico(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Ejemplos: Clínica de atención primaria, Hospital regional, Hogar del paciente, Consultorio del especialista
              </p>
            </CardContent>
          </Card>

          {/* Plataformas Digitales */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-green-600" />
                <CardTitle>Plataformas Digitales</CardTitle>
              </div>
              <CardDescription>
                Herramientas tecnológicas para comunicación y monitoreo
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Input 
                    placeholder="Portal, App, Telemedicina"
                    value={nuevaPlataforma.tipo}
                    onChange={(e) => setNuevaPlataforma({...nuevaPlataforma, tipo: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Nombre</Label>
                  <Input 
                    placeholder="Portal del Paciente"
                    value={nuevaPlataforma.nombre}
                    onChange={(e) => setNuevaPlataforma({...nuevaPlataforma, nombre: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>URL/Acceso</Label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="https://..."
                      value={nuevaPlataforma.url}
                      onChange={(e) => setNuevaPlataforma({...nuevaPlataforma, url: e.target.value})}
                    />
                    <Button type="button" onClick={agregarPlataforma}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                {plataformasDigitales.map((plataforma, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div>
                      <p className="font-medium">{plataforma.tipo}: {plataforma.nombre}</p>
                      {plataforma.url && <p className="text-sm text-gray-600 truncate">{plataforma.url}</p>}
                    </div>
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm"
                      onClick={() => eliminarPlataforma(idx)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Ejemplos: Portal del paciente del hospital, App de monitoreo de presión arterial, Plataforma de telemedicina, WhatsApp para comunicación
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
              {loading ? 'Guardando...' : 'Guardar Puntos de Cuidado'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}