'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, MessageSquare, Users, Phone, Mail, X, Plus } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

interface Contacto {
  nombre: string;
  rol: string;
  telefono: string;
  email: string;
}

interface Canal {
  tipo: string;
  descripcion: string;
}

export default function ComunicacionPage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  
  const [contactos, setContactos] = useState<Contacto[]>([]);
  const [nuevoContacto, setNuevoContacto] = useState<Contacto>({
    nombre: '',
    rol: '',
    telefono: '',
    email: ''
  });

  const [canalesComunicacion, setCanalesComunicacion] = useState<Canal[]>([]);
  const [protocoloComunicacion, setProtocoloComunicacion] = useState('');
  const [frecuenciaReuniones, setFrecuenciaReuniones] = useState('');

  useEffect(() => {
    params.then(p => setPatientId(p.id));
  }, [params]);

  const agregarContacto = () => {
    if (nuevoContacto.nombre && nuevoContacto.rol) {
      setContactos([...contactos, nuevoContacto]);
      setNuevoContacto({
        nombre: '',
        rol: '',
        telefono: '',
        email: ''
      });
    }
  };

  const eliminarContacto = (idx: number) => {
    setContactos(contactos.filter((_, i) => i !== idx));
  };

  const canalesDisponibles = [
    { id: 'telefono', nombre: 'Teléfono', icon: '📞' },
    { id: 'email', nombre: 'Email', icon: '📧' },
    { id: 'whatsapp', nombre: 'WhatsApp', icon: '💬' },
    { id: 'videollamada', nombre: 'Videollamada', icon: '📹' },
    { id: 'presencial', nombre: 'Presencial', icon: '👥' },
  ];

  const toggleCanal = (canalId: string) => {
    const existe = canalesComunicacion.find(c => c.tipo === canalId);
    if (existe) {
      setCanalesComunicacion(canalesComunicacion.filter(c => c.tipo !== canalId));
    } else {
      setCanalesComunicacion([...canalesComunicacion, { tipo: canalId, descripcion: '' }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/patients/${patientId}/treatments/update-comunicacion`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactos,
          canalesComunicacion,
          protocoloComunicacion,
          frecuenciaReuniones,
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else {
        alert('Error al guardar la comunicación');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al guardar la comunicación');
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
              <h1 className="text-2xl font-bold text-gray-900">Comunicación y Coordinación</h1>
              <p className="text-sm text-gray-600">Bloque 9: Red de comunicación del equipo</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Directorio de Contactos */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                <CardTitle>Directorio de Contactos</CardTitle>
              </div>
              <CardDescription>Equipo de cuidado y personas de contacto</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nombre Completo</Label>
                  <Input 
                    placeholder="Ej: Dr. Juan Pérez"
                    value={nuevoContacto.nombre}
                    onChange={(e) => setNuevoContacto({...nuevoContacto, nombre: e.target.value})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Rol / Especialidad</Label>
                  <Input 
                    placeholder="Ej: Médico de cabecera"
                    value={nuevoContacto.rol}
                    onChange={(e) => setNuevoContacto({...nuevoContacto, rol: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Teléfono</Label>
                  <Input 
                    placeholder="Ej: +57 300 123 4567"
                    value={nuevoContacto.telefono}
                    onChange={(e) => setNuevoContacto({...nuevoContacto, telefono: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input 
                    type="email"
                    placeholder="ejemplo@correo.com"
                    value={nuevoContacto.email}
                    onChange={(e) => setNuevoContacto({...nuevoContacto, email: e.target.value})}
                  />
                </div>
              </div>

              <Button type="button" onClick={agregarContacto} className="w-full">
                <Plus className="w-4 h-4 mr-2" />
                Agregar Contacto
              </Button>
            </CardContent>
          </Card>

          {/* Lista de Contactos */}
          {contactos.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Contactos del Equipo ({contactos.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {contactos.map((contacto, idx) => (
                    <div key={idx} className="p-4 border rounded-lg bg-white">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{contacto.nombre}</h4>
                            <Badge variant="secondary">{contacto.rol}</Badge>
                          </div>
                          <div className="flex gap-4 text-sm text-gray-600">
                            {contacto.telefono && (
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {contacto.telefono}
                              </span>
                            )}
                            {contacto.email && (
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {contacto.email}
                              </span>
                            )}
                          </div>
                        </div>
                        <Button 
                          type="button" 
                          variant="ghost" 
                          size="sm"
                          onClick={() => eliminarContacto(idx)}
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

          {/* Canales de Comunicación */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-green-600" />
                <CardTitle>Canales de Comunicación</CardTitle>
              </div>
              <CardDescription>Medios preferidos para comunicación</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {canalesDisponibles.map((canal) => (
                  <Button
                    key={canal.id}
                    type="button"
                    variant={canalesComunicacion.find(c => c.tipo === canal.id) ? "default" : "outline"}
                    onClick={() => toggleCanal(canal.id)}
                    className="h-auto py-3"
                  >
                    <span className="text-2xl mr-2">{canal.icon}</span>
                    {canal.nombre}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Protocolo de Comunicación */}
          <Card>
            <CardHeader>
              <CardTitle>Protocolo de Comunicación</CardTitle>
              <CardDescription>¿Cómo y cuándo se comunica el equipo?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Descripción del Protocolo</Label>
                <Textarea 
                  placeholder="Ej: Reportes diarios por WhatsApp, llamadas semanales con el médico, actualizaciones inmediatas en emergencias..."
                  value={protocoloComunicacion}
                  onChange={(e) => setProtocoloComunicacion(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="space-y-2">
                <Label>Frecuencia de Reuniones</Label>
                <Input 
                  placeholder="Ej: Reuniones semanales todos los lunes a las 10am"
                  value={frecuenciaReuniones}
                  onChange={(e) => setFrecuenciaReuniones(e.target.value)}
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
              {loading ? 'Guardando...' : 'Guardar Comunicación'}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}