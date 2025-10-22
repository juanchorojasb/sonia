'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X, Plus, Users } from 'lucide-react';
import Link from 'next/link';
import FieldWithAssistant from '@/components/forms/FieldWithAssistant';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Miembro {
  nombre: string;
  rol: string;
  especialidad: string;
  contacto: string;
}

export default function EquipoPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [equipo, setEquipo] = useState<Miembro[]>([]);
  const [nuevoMiembro, setNuevoMiembro] = useState<Miembro>({
    nombre: '',
    rol: '',
    especialidad: '',
    contacto: ''
  });

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarMiembro = () => {
    if (nuevoMiembro.nombre && nuevoMiembro.rol) {
      setEquipo([...equipo, nuevoMiembro]);
      setNuevoMiembro({ nombre: '', rol: '', especialidad: '', contacto: '' });
    }
  };

  const eliminarMiembro = (idx: number) => {
    setEquipo(equipo.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/patients/${patientId}/treatments/update-equipo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ equipo }),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else {
        alert('Error al guardar el equipo');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar el equipo');
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
              <h1 className="text-2xl font-bold text-gray-900">Equipo de Cuidado</h1>
              <p className="text-sm text-gray-600">Bloque 7: Miembros del equipo multidisciplinario</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <CardTitle>Miembros del Equipo</CardTitle>
              </div>
              <CardDescription>Profesionales que conforman el equipo de cuidado</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <FieldWithAssistant
                  label="Nombre Completo"
                  name="nombre"
                  value={nuevoMiembro.nombre}
                  onChange={(value) => setNuevoMiembro({...nuevoMiembro, nombre: value})}
                  placeholder="Ej: Dr. Juan Pérez"
                  fieldType="input"
                  contextPrompt="Dame un ejemplo de nombre completo con título profesional para un miembro del equipo de cuidados paliativos"
                />
                
                <FieldWithAssistant
                  label="Rol en el Equipo"
                  name="rol"
                  value={nuevoMiembro.rol}
                  onChange={(value) => setNuevoMiembro({...nuevoMiembro, rol: value})}
                  placeholder="Ej: Médico de cabecera"
                  fieldType="input"
                  contextPrompt="Dame un ejemplo de rol específico en un equipo de cuidados paliativos"
                />

                <FieldWithAssistant
                  label="Especialidad"
                  name="especialidad"
                  value={nuevoMiembro.especialidad}
                  onChange={(value) => setNuevoMiembro({...nuevoMiembro, especialidad: value})}
                  placeholder="Ej: Medicina Paliativa"
                  fieldType="input"
                  contextPrompt="Dame un ejemplo de especialidad médica relevante para cuidados paliativos"
                />

                <FieldWithAssistant
                  label="Contacto"
                  name="contacto"
                  value={nuevoMiembro.contacto}
                  onChange={(value) => setNuevoMiembro({...nuevoMiembro, contacto: value})}
                  placeholder="Ej: +57 300 123 4567"
                  fieldType="input"
                  contextPrompt="Dame un ejemplo de número de teléfono colombiano"
                />
              </div>

              <Button type="button" onClick={agregarMiembro} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Miembro
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Equipo */}
          {equipo.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Equipo Actual ({equipo.length} miembros)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {equipo.map((miembro, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{miembro.nombre}</h4>
                            <Badge variant="secondary">{miembro.rol}</Badge>
                          </div>
                          <p className="text-sm text-gray-600">{miembro.especialidad}</p>
                          {miembro.contacto && (
                            <p className="text-sm text-gray-500">📞 {miembro.contacto}</p>
                          )}
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => eliminarMiembro(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex justify-end gap-4">
            <Link href={`/dashboard/pacientes/${patientId}`}>
              <Button type="button" variant="outline">Cancelar</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Equipo'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}