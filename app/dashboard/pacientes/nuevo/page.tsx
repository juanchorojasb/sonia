'use client';

import { useState } from 'react';
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

export default function NuevoPacientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Estados básicos
  const [nombre, setNombre] = useState('');
  const [edad, setEdad] = useState('');
  const [genero, setGenero] = useState('');
  const [telefono, setTelefono] = useState('');
  const [email, setEmail] = useState('');
  
  // Estados de contexto
  const [situacionSocial, setSituacionSocial] = useState('');
  const [situacionEconomica, setSituacionEconomica] = useState('');
  const [contextoCultural, setContextoCultural] = useState('');
  const [ocupacionAnterior, setOcupacionAnterior] = useState('');
  
  // Estados de valores, preocupaciones y esperanzas
  const [valores, setValores] = useState<string[]>([]);
  const [preocupaciones, setPreocupaciones] = useState<string[]>([]);
  const [esperanzas, setEsperanzas] = useState<string[]>([]);

  const agregarValor = (valor: string) => {
    setValores([...valores, valor]);
  };

  const eliminarValor = (index: number) => {
    setValores(valores.filter((_, i) => i !== index));
  };

  const agregarPreocupacion = (preocupacion: string) => {
    setPreocupaciones([...preocupaciones, preocupacion]);
  };

  const eliminarPreocupacion = (index: number) => {
    setPreocupaciones(preocupaciones.filter((_, i) => i !== index));
  };

  const agregarEsperanza = (esperanza: string) => {
    setEsperanzas([...esperanzas, esperanza]);
  };

  const eliminarEsperanza = (index: number) => {
    setEsperanzas(esperanzas.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const data = {
      nombre,
      edad: parseInt(edad),
      genero,
      telefono,
      email,
      situacionSocial,
      situacionEconomica,
      contextoCultural,
      ocupacionAnterior,
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
                <FieldWithAssistant
                  label="Nombre Completo *"
                  name="nombre"
                  value={nombre}
                  onChange={setNombre}
                  placeholder="Ej: María García López"
                  fieldType="input"
                  contextPrompt="Dame un ejemplo de nombre completo realista para una persona mayor latina. Solo el nombre, sin explicaciones."
                />

                <FieldWithAssistant
                  label="Edad *"
                  name="edad"
                  value={edad}
                  onChange={setEdad}
                  placeholder="Ej: 68"
                  fieldType="input"
                  contextPrompt="Dame un ejemplo de edad típica para un paciente de cuidados paliativos. Solo el número."
                />

                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Select value={genero} onValueChange={setGenero}>
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

                <FieldWithAssistant
                  label="Teléfono"
                  name="telefono"
                  value={telefono}
                  onChange={setTelefono}
                  placeholder="Ej: +57 300 123 4567"
                  fieldType="input"
                  contextPrompt="Dame un ejemplo de número de teléfono móvil colombiano. Solo el número con formato."
                />

                <div className="md:col-span-2">
                  <FieldWithAssistant
                    label="Correo Electrónico"
                    name="email"
                    value={email}
                    onChange={setEmail}
                    placeholder="Ej: maria@email.com"
                    fieldType="input"
                    contextPrompt="Dame un ejemplo de correo electrónico simple y común. Solo el email."
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
              <FieldWithAssistant
                label="Situación Social"
                name="situacionSocial"
                value={situacionSocial}
                onChange={setSituacionSocial}
                placeholder="Ej: Vive sola, hija vive cerca pero trabaja tiempo completo"
                description="¿Con quién vive? ¿Tiene apoyo familiar?"
                contextPrompt="Genera un ejemplo realista de situación social para un paciente de cuidados paliativos en Colombia. Describe con quién vive, qué apoyo familiar tiene. Máximo 3 líneas."
                rows={3}
              />

              <FieldWithAssistant
                label="Situación Económica"
                name="situacionEconomica"
                value={situacionEconomica}
                onChange={setSituacionEconomica}
                placeholder="Ej: Ingresos fijos de pensión, sin mayores recursos"
                description="Fuentes de ingreso, estabilidad financiera"
                contextPrompt="Genera un ejemplo realista de situación económica para un paciente de cuidados paliativos en Colombia. Describe sus ingresos y estabilidad financiera. Máximo 3 líneas."
                rows={3}
              />

              <FieldWithAssistant
                label="Contexto Cultural"
                name="contextoCultural"
                value={contextoCultural}
                onChange={setContextoCultural}
                placeholder="Ej: Católica practicante, tradiciones familiares importantes"
                description="Creencias, prácticas culturales o religiosas relevantes"
                contextPrompt="Genera un ejemplo realista de contexto cultural para un paciente colombiano de cuidados paliativos. Describe creencias religiosas o prácticas culturales importantes. Máximo 3 líneas."
                rows={3}
              />

              <FieldWithAssistant
                label="Ocupación Anterior"
                name="ocupacionAnterior"
                value={ocupacionAnterior}
                onChange={setOcupacionAnterior}
                placeholder="Ej: Maestra de primaria (jubilada)"
                description="Profesión u oficio antes de jubilarse o enfermarse"
                contextPrompt="Dame un ejemplo de ocupación anterior común para una persona mayor en Colombia. Una línea."
                fieldType="input"
              />
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
              <TagFieldWithAssistant
                label="Valores Personales"
                values={valores}
                onAdd={agregarValor}
                onRemove={eliminarValor}
                placeholder="Ej: Independencia, familia, dignidad"
                description="¿Qué es lo más importante para esta persona?"
                contextPrompt="Dame ejemplos de valores personales importantes para pacientes de cuidados paliativos"
              />

              {/* Preocupaciones */}
              <TagFieldWithAssistant
                label="Preocupaciones Principales"
                values={preocupaciones}
                onAdd={agregarPreocupacion}
                onRemove={eliminarPreocupacion}
                placeholder="Ej: Ser una carga, perder independencia"
                description="¿Qué le preocupa o le genera ansiedad?"
                contextPrompt="Dame ejemplos de preocupaciones comunes en pacientes de cuidados paliativos"
              />

              {/* Esperanzas */}
              <TagFieldWithAssistant
                label="Esperanzas y Aspiraciones"
                values={esperanzas}
                onAdd={agregarEsperanza}
                onRemove={eliminarEsperanza}
                placeholder="Ej: Volver a cuidar mi jardín, pasar tiempo con nietos"
                description="¿Qué espera lograr? ¿Cuáles son sus sueños?"
                contextPrompt="Dame ejemplos de esperanzas y aspiraciones realistas para pacientes de cuidados paliativos"
              />
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