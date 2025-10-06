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
import { ArrowLeft, Save, Trash2, X, Plus } from 'lucide-react';
import Link from 'next/link';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditarPacientePage({ params }: PageProps) {
  const router = useRouter();
  const [patientId, setPatientId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: '',
    edad: '',
    fechaNacimiento: '',
    genero: '',
    telefono: '',
    email: '',
    direccion: '',
    ocupacionAnterior: '',
    situacionSocial: '',
    situacionEconomica: '',
    contextoCultural: '',
    valoresPersonales: [] as string[],
    preocupaciones: [] as string[],
    esperanzas: [] as string[],
    diagnosticoPrincipal: '',
    condicionesCronicas: [] as string[],
    medicamentos: [] as string[],
    alergias: [] as string[],
  });

  const [nuevoValor, setNuevoValor] = useState('');
  const [nuevaPreocupacion, setNuevaPreocupacion] = useState('');
  const [nuevaEsperanza, setNuevaEsperanza] = useState('');
  const [nuevaCondicion, setNuevaCondicion] = useState('');
  const [nuevoMedicamento, setNuevoMedicamento] = useState('');
  const [nuevaAlergia, setNuevaAlergia] = useState('');

  useEffect(() => {
    params.then(p => {
      setPatientId(p.id);
      fetchPatientData(p.id);
    });
  }, [params]);

  const fetchPatientData = async (id: string) => {
    try {
      const response = await fetch(`/api/patients/${id}`);
      if (response.ok) {
        const patient = await response.json();
        setFormData({
          nombre: patient.nombre || '',
          edad: patient.edad?.toString() || '',
          fechaNacimiento: patient.fechaNacimiento 
            ? new Date(patient.fechaNacimiento).toISOString().split('T')[0] 
            : '',
          genero: patient.genero || '',
          telefono: patient.telefono || '',
          email: patient.email || '',
          direccion: patient.direccion || '',
          ocupacionAnterior: patient.ocupacionAnterior || '',
          situacionSocial: patient.situacionSocial || '',
          situacionEconomica: patient.situacionEconomica || '',
          contextoCultural: patient.contextoCultural || '',
          valoresPersonales: Array.isArray(patient.valoresPersonales) ? patient.valoresPersonales : [],
          preocupaciones: Array.isArray(patient.preocupaciones) ? patient.preocupaciones : [],
          esperanzas: Array.isArray(patient.esperanzas) ? patient.esperanzas : [],
          diagnosticoPrincipal: patient.diagnosticoPrincipal || '',
          condicionesCronicas: Array.isArray(patient.condicionesCronicas) ? patient.condicionesCronicas : [],
          medicamentos: Array.isArray(patient.medicamentos) ? patient.medicamentos : [],
          alergias: Array.isArray(patient.alergias) ? patient.alergias : [],
        });
      } else if (response.status === 403) {
        alert('No tienes permisos para editar este paciente');
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Error al cargar paciente:', error);
      alert('Error al cargar los datos del paciente');
    } finally {
      setLoadingData(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          edad: parseInt(formData.edad),
        }),
      });

      if (response.ok) {
        router.push(`/dashboard/pacientes/${patientId}`);
      } else if (response.status === 403) {
        alert('No tienes permisos para editar este paciente');
      } else {
        alert('Error al actualizar el paciente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al actualizar el paciente');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/patients/${patientId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        router.push('/dashboard');
      } else if (response.status === 403) {
        alert('No tienes permisos para eliminar este paciente');
      } else {
        alert('Error al eliminar el paciente');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al eliminar el paciente');
    } finally {
      setLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  // Funciones para agregar items a arrays
  const agregarValor = () => {
    if (nuevoValor.trim()) {
      setFormData({...formData, valoresPersonales: [...formData.valoresPersonales, nuevoValor.trim()]});
      setNuevoValor('');
    }
  };

  const agregarPreocupacion = () => {
    if (nuevaPreocupacion.trim()) {
      setFormData({...formData, preocupaciones: [...formData.preocupaciones, nuevaPreocupacion.trim()]});
      setNuevaPreocupacion('');
    }
  };

  const agregarEsperanza = () => {
    if (nuevaEsperanza.trim()) {
      setFormData({...formData, esperanzas: [...formData.esperanzas, nuevaEsperanza.trim()]});
      setNuevaEsperanza('');
    }
  };

  const agregarCondicion = () => {
    if (nuevaCondicion.trim()) {
      setFormData({...formData, condicionesCronicas: [...formData.condicionesCronicas, nuevaCondicion.trim()]});
      setNuevaCondicion('');
    }
  };

  const agregarMedicamento = () => {
    if (nuevoMedicamento.trim()) {
      setFormData({...formData, medicamentos: [...formData.medicamentos, nuevoMedicamento.trim()]});
      setNuevoMedicamento('');
    }
  };

  const agregarAlergia = () => {
    if (nuevaAlergia.trim()) {
      setFormData({...formData, alergias: [...formData.alergias, nuevaAlergia.trim()]});
      setNuevaAlergia('');
    }
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos del paciente...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/dashboard/pacientes/${patientId}`}>
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Editar Paciente</h1>
                <p className="text-sm text-gray-600">Actualiza la información del paciente</p>
              </div>
            </div>
            <Button 
              variant="destructive" 
              onClick={() => setShowDeleteConfirm(true)}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar Paciente
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          
          {/* Información Básica */}
          <Card>
            <CardHeader>
              <CardTitle>Información Básica</CardTitle>
              <CardDescription>Datos personales del paciente</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo *</Label>
                  <Input
                    id="nombre"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    placeholder="Nombre del paciente"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edad">Edad *</Label>
                  <Input
                    id="edad"
                    type="number"
                    value={formData.edad}
                    onChange={(e) => setFormData({...formData, edad: e.target.value})}
                    placeholder="Edad"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <Input
                    id="fechaNacimiento"
                    type="date"
                    value={formData.fechaNacimiento}
                    onChange={(e) => setFormData({...formData, fechaNacimiento: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Select
                    value={formData.genero}
                    onValueChange={(value) => setFormData({...formData, genero: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="masculino">Masculino</SelectItem>
                      <SelectItem value="femenino">Femenino</SelectItem>
                      <SelectItem value="otro">Otro</SelectItem>
                      <SelectItem value="prefiero_no_decir">Prefiero no decir</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <Input
                    id="telefono"
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    placeholder="+57 300 123 4567"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="email@ejemplo.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="direccion">Dirección</Label>
                <Input
                  id="direccion"
                  value={formData.direccion}
                  onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                  placeholder="Dirección completa"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ocupacionAnterior">Ocupación Anterior</Label>
                <Input
                  id="ocupacionAnterior"
                  value={formData.ocupacionAnterior}
                  onChange={(e) => setFormData({...formData, ocupacionAnterior: e.target.value})}
                  placeholder="Ej: Profesor, Ingeniero, etc."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contexto de Vida */}
          <Card>
            <CardHeader>
              <CardTitle>Contexto de Vida</CardTitle>
              <CardDescription>Situación social, económica y cultural</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="situacionSocial">Situación Social</Label>
                <Textarea
                  id="situacionSocial"
                  value={formData.situacionSocial}
                  onChange={(e) => setFormData({...formData, situacionSocial: e.target.value})}
                  placeholder="Describe la situación social del paciente..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="situacionEconomica">Situación Económica</Label>
                <Textarea
                  id="situacionEconomica"
                  value={formData.situacionEconomica}
                  onChange={(e) => setFormData({...formData, situacionEconomica: e.target.value})}
                  placeholder="Describe la situación económica..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="contextoCultural">Contexto Cultural</Label>
                <Textarea
                  id="contextoCultural"
                  value={formData.contextoCultural}
                  onChange={(e) => setFormData({...formData, contextoCultural: e.target.value})}
                  placeholder="Aspectos culturales relevantes..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Valores, Preocupaciones y Esperanzas */}
          <Card>
            <CardHeader>
              <CardTitle>Valores, Preocupaciones y Esperanzas</CardTitle>
              <CardDescription>Aspectos emocionales y personales</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Valores */}
              <div className="space-y-2">
                <Label>Valores Personales</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar valor personal"
                    value={nuevoValor}
                    onChange={(e) => setNuevoValor(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarValor())}
                  />
                  <Button type="button" onClick={agregarValor}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.valoresPersonales.map((valor, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {valor}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setFormData({
                          ...formData, 
                          valoresPersonales: formData.valoresPersonales.filter((_, i) => i !== idx)
                        })} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Preocupaciones */}
              <div className="space-y-2">
                <Label>Preocupaciones</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar preocupación"
                    value={nuevaPreocupacion}
                    onChange={(e) => setNuevaPreocupacion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarPreocupacion())}
                  />
                  <Button type="button" onClick={agregarPreocupacion}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.preocupaciones.map((preocupacion, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {preocupacion}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setFormData({
                          ...formData, 
                          preocupaciones: formData.preocupaciones.filter((_, i) => i !== idx)
                        })} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Esperanzas */}
              <div className="space-y-2">
                <Label>Esperanzas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar esperanza"
                    value={nuevaEsperanza}
                    onChange={(e) => setNuevaEsperanza(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarEsperanza())}
                  />
                  <Button type="button" onClick={agregarEsperanza}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.esperanzas.map((esperanza, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {esperanza}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setFormData({
                          ...formData, 
                          esperanzas: formData.esperanzas.filter((_, i) => i !== idx)
                        })} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Historia Clínica */}
          <Card>
            <CardHeader>
              <CardTitle>Historia Clínica Resumida</CardTitle>
              <CardDescription>Información médica relevante</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="diagnosticoPrincipal">Diagnóstico Principal</Label>
                <Input
                  id="diagnosticoPrincipal"
                  value={formData.diagnosticoPrincipal}
                  onChange={(e) => setFormData({...formData, diagnosticoPrincipal: e.target.value})}
                  placeholder="Ej: Cáncer de pulmón estadio IV"
                />
              </div>

              {/* Condiciones Crónicas */}
              <div className="space-y-2">
                <Label>Condiciones Crónicas</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar condición"
                    value={nuevaCondicion}
                    onChange={(e) => setNuevaCondicion(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarCondicion())}
                  />
                  <Button type="button" onClick={agregarCondicion}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.condicionesCronicas.map((condicion, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {condicion}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setFormData({
                          ...formData, 
                          condicionesCronicas: formData.condicionesCronicas.filter((_, i) => i !== idx)
                        })} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Medicamentos */}
              <div className="space-y-2">
                <Label>Medicamentos Actuales</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar medicamento"
                    value={nuevoMedicamento}
                    onChange={(e) => setNuevoMedicamento(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarMedicamento())}
                  />
                  <Button type="button" onClick={agregarMedicamento}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.medicamentos.map((medicamento, idx) => (
                    <Badge key={idx} variant="secondary" className="gap-1">
                      {medicamento}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setFormData({
                          ...formData, 
                          medicamentos: formData.medicamentos.filter((_, i) => i !== idx)
                        })} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Alergias */}
              <div className="space-y-2">
                <Label>Alergias</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Agregar alergia"
                    value={nuevaAlergia}
                    onChange={(e) => setNuevaAlergia(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), agregarAlergia())}
                  />
                  <Button type="button" onClick={agregarAlergia}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.alergias.map((alergia, idx) => (
                    <Badge key={idx} variant="destructive" className="gap-1">
                      {alergia}
                      <X 
                        className="w-3 h-3 cursor-pointer" 
                        onClick={() => setFormData({
                          ...formData, 
                          alergias: formData.alergias.filter((_, i) => i !== idx)
                        })} 
                      />
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Botones de Acción */}
          <div className="flex gap-4">
            <Link href={`/dashboard/pacientes/${patientId}`} className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </Link>
            <Button type="submit" disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Guardando...' : 'Guardar Cambios'}
            </Button>
          </div>
        </form>
      </main>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600">¿Eliminar Paciente?</CardTitle>
              <CardDescription>
                Esta acción no se puede deshacer. Se eliminarán todos los datos del paciente y su plan de tratamiento.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleDelete}
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? 'Eliminando...' : 'Eliminar'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}