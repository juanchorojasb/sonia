'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Save, X } from 'lucide-react';
import Link from 'next/link';

export default function NuevoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [valores, setValores] = useState<string[]>([]);
  const [nuevoValor, setNuevoValor] = useState('');
  const [preocupaciones, setPreocupaciones] = useState<string[]>([]);
  const [nuevaPreocupacion, setNuevaPreocupacion] = useState('');
  const [esperanzas, setEsperanzas] = useState<string[]>([]);
  const [nuevaEsperanza, setNuevaEsperanza] = useState('');

  const agregarValor = () => {
    if (nuevoValor.trim()) {
      setValores([...valores, nuevoValor.trim()]);
      setNuevoValor('');
    }
  };

  const eliminarValor = (index: number) => {
    setValores(valores.filter((_, i) => i !== index));
  };

  const agregarPreocupacion = () => {
    if (nuevaPreocupacion.trim()) {
      setPreocupaciones([...preocupaciones, nuevaPreocupacion.trim()]);
      setNuevaPreocupacion('');
    }
  };

  const eliminarPreocupacion = (index: number) => {
    setPreocupaciones(preocupaciones.filter((_, i) => i !== index));
  };

  const agregarEsperanza = () => {
    if (nuevaEsperanza.trim()) {
      setEsperanzas([...esperanzas, nuevaEsperanza.trim()]);
      setNuevaEsperanza('');
    }
  };

  const eliminarEsperanza = (index: number) => {
    setEsperanzas(esperanzas.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      nombre: formData.get('nombre'),
      edad: parseInt(formData.get('edad') as string),
      genero: formData.get('genero'),
      telefono: formData.get('telefono'),
      email: formData.get('email'),
      situacionSocial: formData.get('situacionSocial'),
      situacionEconomica: formData.get('situacionEconomica'),
      contextoCultural: formData.get('contextoCultural'),
      ocupacionAnterior: formData.get('ocupacionAnterior'),
      valoresPersonales: valores,
      preocupaciones: preocupaciones,
      esperanzas: esperanzas,
    };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const patient = await response.json();
        router.push(`/dashboard/pacientes/${patient.id}`);
      } else {
        alert('Error al crear el paciente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear el paciente');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Nuevo Paciente</h1>
              <p className="text-sm text-gray-600">Bloque 1: Perfil y Contexto del Paciente</p>
            </div>
          </div>
        </div>
      </header>

      {/* Form */}
      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>
                Datos personales del paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input 
                    id="nombre" 
                    name="nombre" 
                    placeholder="Ej: María García López"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edad">Edad *</Label>
                  <Input 
                    id="edad" 
                    name="edad" 
                    type="number" 
                    placeholder="Ej: 68"
                    required 
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Select name="genero">
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="prefiero-no-decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input 
                    id="telefono" 
                    name="telefono" 
                    type="tel"
                    placeholder="Ej: +57 300 123 4567"
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="email">Correo Electrónico</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    type="email"
                    placeholder="Ej: maria@email.com"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contexto de Vida */}
          <Card>
            <CardHeader>
              <CardTitle>Contexto de Vida</CardTitle>
              <CardDescription>
                Circunstancias sociales, económicas y culturales
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="situacionSocial">Situación Social</Label>
                <Textarea 
                  id="situacionSocial" 
                  name="situacionSocial"
                  placeholder="Ej: Vive sola, hija vive cerca pero trabaja tiempo completo"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  ¿Con quién vive? ¿Tiene apoyo familiar?
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="situacionEconomica">Situación Económica</Label>
                <Textarea 
                  id="situacionEconomica" 
                  name="situacionEconomica"
                  placeholder="Ej: Ingresos fijos de pensión, sin mayores recursos"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Fuentes de ingreso, estabilidad financiera
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="contextoCultural">Contexto Cultural</Label>
                <Textarea 
                  id="contextoCultural" 
                  name="contextoCultural"
                  placeholder="Ej: Católica practicante, tradiciones familiares importantes"
                  rows={3}
                />
                <p className="text-xs text-gray-500">
                  Creencias, prácticas culturales o religiosas relevantes
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ocupacionAnterior">Ocupación Anterior</Label>
                <Input 
                  id="ocupacionAnterior" 
                  name="ocupacionAnterior"
                  placeholder="Ej: Maestra de primaria (jubilada)"
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores, Preocupaciones y Esperanzas */}
          <Card>
            <CardHeader>
              <CardTitle>Valores, Preocupaciones y Esperanzas</CardTitle>
              <CardDescription>
                Lo que es importante para el paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Valores */}
              <div className="space-y-2">
                <Label>Valores Personales</Label>
                <div className="flex gap-2">
                  <Input 
                    value={nuevoValor}
                    onChange={(e) => setNuevoValor(e.target.value)}
                    placeholder="Ej: Independencia, familia, dignidad"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarValor())}
                  />
                  <Button type="button" onClick={agregarValor}>Agregar</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {valores.map((valor, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {valor}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => eliminarValor(idx)}
                      />
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  ¿Qué es lo más importante para esta persona?
                </p>
              </div>

              {/* Preocupaciones */}
              <div className="space-y-2">
                <Label>Preocupaciones Principales</Label>
                <div className="flex gap-2">
                  <Input 
                    value={nuevaPreocupacion}
                    onChange={(e) => setNuevaPreocupacion(e.target.value)}
                    placeholder="Ej: Ser una carga, perder independencia"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarPreocupacion())}
                  />
                  <Button type="button" onClick={agregarPreocupacion}>Agregar</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {preocupaciones.map((preocupacion, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {preocupacion}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => eliminarPreocupacion(idx)}
                      />
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  ¿Qué le preocupa o le genera ansiedad?
                </p>
              </div>

              {/* Esperanzas */}
              <div className="space-y-2">
                <Label>Esperanzas y Aspiraciones</Label>
                <div className="flex gap-2">
                  <Input 
                    value={nuevaEsperanza}
                    onChange={(e) => setNuevaEsperanza(e.target.value)}
                    placeholder="Ej: Volver a cuidar mi jardín, pasar tiempo con nietos"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarEsperanza())}
                  />
                  <Button type="button" onClick={agregarEsperanza}>Agregar</Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {esperanzas.map((esperanza, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {esperanza}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => eliminarEsperanza(idx)}
                      />
                    </Badge>
                  ))}
                </div>
                <p className="text-xs text-gray-500">
                  ¿Qué espera lograr? ¿Cuáles son sus sueños?
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Acciones */}
          <div className="flex justify-end gap-4">
            <Link href="/dashboard">
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading}>
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Crear Paciente'}
            </Button>
          </div>
        </form>

      </main>
    </div>
  );
}