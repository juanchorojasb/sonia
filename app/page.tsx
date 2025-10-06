import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Calendar, BarChart3, Shield, Clock } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            sonIA
          </h1>
          <p className="text-xl text-gray-600 mb-4">
            Plataforma digital inteligente para gestionar el tratamiento médico y apoyar a los cuidadores
          </p>
          <p className="text-lg text-gray-500 mb-8">
            Organiza, coordina y optimiza el cuidado de tus seres queridos basado en el Lienzo de Tratamiento Centrado en el Paciente
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/sign-up">
              <Button size="lg" className="text-lg px-8">
                Comenzar Ahora
              </Button>
            </Link>
            <Link href="/sign-in">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Iniciar Sesión
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Características Principales
        </h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <Heart className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Centrado en el Paciente</CardTitle>
              <CardDescription>
                Todo el plan de tratamiento gira alrededor de las necesidades, valores y metas del paciente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Users className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Equipo de Cuidado Integrado</CardTitle>
              <CardDescription>
                Coordina médicos, especialistas, familiares y cuidadores en un solo lugar
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Gestión de Actividades</CardTitle>
              <CardDescription>
                Organiza citas, medicamentos, terapias y seguimientos con recordatorios inteligentes
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <BarChart3 className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Seguimiento de Resultados</CardTitle>
              <CardDescription>
                Mide el progreso con métricas clínicas y resultados reportados por el paciente
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Seguridad y Privacidad</CardTitle>
              <CardDescription>
                Tus datos médicos protegidos con los más altos estándares de seguridad
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Clock className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Ahorra Tiempo</CardTitle>
              <CardDescription>
                Reduce la carga administrativa del cuidador y enfócate en lo importante
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* LTCP Section */}
      <section className="bg-blue-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-6">
            Basado en el Lienzo de Tratamiento Centrado en el Paciente
          </h2>
          <p className="text-center text-gray-600 max-w-3xl mx-auto mb-12">
            Nuestra metodología está fundamentada en la adaptación del Business Model Canvas 
            específicamente diseñada para gestionar tratamientos médicos de forma integral y humana.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle className="text-blue-600">El Núcleo del Paciente</CardTitle>
                <CardDescription>
                  Perfil, metas, relaciones y puntos de cuidado enfocados en la persona
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-green-600">Infraestructura de Cuidado</CardTitle>
                <CardDescription>
                  Actividades, recursos y equipo necesarios para ejecutar el plan
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-purple-600">Economía de la Salud</CardTitle>
                <CardDescription>
                  Cargas, costos y resultados positivos del tratamiento
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-3xl font-bold mb-4">
          ¿Listo para mejorar el cuidado de tu ser querido?
        </h2>
        <p className="text-gray-600 mb-8">
          Únete a sonIA y transforma la manera en que gestionas el tratamiento médico
        </p>
        <Link href="/sign-up">
          <Button size="lg" className="text-lg px-8">
            Crear Cuenta Gratis
          </Button>
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">
            © 2024 sonIA - Plataforma de Gestión de Tratamiento Médico
          </p>
        </div>
      </footer>
    </div>
  );
}