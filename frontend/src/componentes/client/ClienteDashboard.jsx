import React, { useState } from 'react';
import { Calendar, Droplet, History, User, CreditCard, Headphones, Plus, Clock, MapPin, ChevronRight } from 'lucide-react';

// ==================== DATOS DE EJEMPLO ====================
const reservasActivas = [
  {
    id: 1,
    lavadora: "LG WashTower Premium",
    ubicacion: "Centro Comercial Santafé",
    fecha: "13 de noviembre de 2025",
    hora: "15:00 - 17:00",
    tiempoRestante: "3h 31m",
    estado: "En curso",
    color: "cyan"
  },
  {
    id: 2,
    lavadora: "Samsung EcoBubble Max",
    ubicacion: "Centro Comercial Titán Plaza",
    fecha: "14 de noviembre de 2025",
    hora: "10:00 - 12:00",
    tiempoRestante: null,
    estado: "Próxima",
    color: "yellow"
  }
];

// ==================== COMPONENTE PRINCIPAL ====================
export default function ClienteDashboard() {
  const [activeSection, setActiveSection] = useState('inicio');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <Droplet className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-800 hidden sm:block">Servilavadora</span>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex items-center gap-6">
              <NavLink 
                icon={Calendar} 
                label="Mis Reservas"
                active={activeSection === 'reservas'}
                onClick={() => setActiveSection('reservas')}
              />
              <NavLink 
                icon={Droplet} 
                label="Lavadoras"
                active={activeSection === 'lavadoras'}
                onClick={() => setActiveSection('lavadoras')}
              />
              <NavLink 
                icon={History} 
                label="Historial"
                active={activeSection === 'historial'}
                onClick={() => setActiveSection('historial')}
              />
              <NavLink 
                icon={User} 
                label="Mi Perfil"
                active={activeSection === 'perfil'}
                onClick={() => setActiveSection('perfil')}
              />
              <NavLink 
                icon={CreditCard} 
                label="Pagos"
                active={activeSection === 'pagos'}
                onClick={() => setActiveSection('pagos')}
              />
              <NavLink 
                icon={Headphones} 
                label="Soporte"
                active={activeSection === 'soporte'}
                onClick={() => setActiveSection('soporte')}
              />
            </nav>

            {/* Usuario */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end">
                <span className="text-sm font-semibold text-gray-800">María González</span>
                <span className="text-xs text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full">Premium</span>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Hola, María!</h1>
          <p className="text-gray-600">Gestiona tus reservas y alquila lavadoras de forma rápida y sencilla</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <StatCard
            icon={Calendar}
            value="2"
            label="Reservas Activas"
            color="cyan"
          />
          <StatCard
            icon={Check}
            value="15"
            label="Reservas Completadas"
            color="cyan"
          />
        </div>

        {/* Acciones Rápidas */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ActionCard
              icon={Plus}
              title="Nueva Reserva"
              description="Reserva una lavadora ahora"
              onClick={() => alert('Nueva reserva')}
            />
            <ActionCard
              icon={Clock}
              title="Extender Reserva"
              description="Añade más tiempo a tu reserva actual"
              onClick={() => alert('Extender reserva')}
            />
            <ActionCard
              icon={MapPin}
              title="Encontrar Ubicación"
              description="Busca lavadoras cerca de ti"
              onClick={() => alert('Buscar ubicación')}
            />
            <ActionCard
              icon={Headphones}
              title="Soporte"
              description="¿Necesitas ayuda?"
              onClick={() => alert('Soporte')}
            />
          </div>
        </div>

        {/* Reservas Activas */}
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Reservas Activas</h2>
            <button className="text-cyan-600 hover:text-cyan-700 font-semibold text-sm flex items-center gap-1">
              Ver todas
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {reservasActivas.map(reserva => (
              <ReservaCard key={reserva.id} reserva={reserva} />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-bold mb-4">Servilavadora</h3>
              <p className="text-gray-400 text-sm">El servicio de alquiler de lavadoras más confiable y económico.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Enlaces Rápidos</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Mis Reservas</li>
                <li>Lavadoras</li>
                <li>Historial</li>
                <li>Mi Perfil</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Soporte</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>Términos y Condiciones</li>
                <li>Política de Privacidad</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contacto</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li>📞 +57 1 234 5678</li>
                <li>📧 hola@servilavadora.com</li>
                <li>📍 Bogotá, Colombia</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            © 2025 Servilavadora. Todos los derechos reservados.
          </div>
        </div>
      </footer>
    </div>
  );
}

// ==================== COMPONENTES AUXILIARES ====================

const Check = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

function NavLink({ icon: Icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
        active 
          ? 'bg-cyan-50 text-cyan-600' 
          : 'text-gray-600 hover:bg-gray-50'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );
}

function StatCard({ icon: Icon, value, label, color }) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <div className="flex items-center gap-4">
        <div className={`w-14 h-14 bg-gradient-to-br from-${color}-500 to-${color}-600 rounded-xl flex items-center justify-center flex-shrink-0`}>
          <Icon className="w-7 h-7 text-white" />
        </div>
        <div>
          <div className="text-3xl font-bold text-gray-900">{value}</div>
          <div className="text-sm text-gray-600">{label}</div>
        </div>
      </div>
    </div>
  );
}

function ActionCard({ icon: Icon, title, description, onClick }) {
  return (
    <button
      onClick={onClick}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-1 transition-all text-center group"
    >
      <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}

function ReservaCard({ reserva }) {
  const borderColor = reserva.color === 'cyan' ? 'border-cyan-500' : 'border-yellow-500';
  const badgeColor = reserva.color === 'cyan' 
    ? 'bg-cyan-100 text-cyan-700' 
    : 'bg-yellow-100 text-yellow-700';

  return (
    <div className={`bg-white rounded-xl p-6 shadow-sm border-l-4 ${borderColor}`}>
      <div className="flex justify-between items-start mb-4">
        <h3 className="font-bold text-gray-900 text-lg">{reserva.lavadora}</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${badgeColor}`}>
          {reserva.estado}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4 text-cyan-500" />
          <span>{reserva.ubicacion}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Calendar className="w-4 h-4 text-cyan-500" />
          <span>{reserva.fecha}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4 text-cyan-500" />
          <span>{reserva.hora}</span>
        </div>
        {reserva.tiempoRestante && (
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-cyan-500" />
            <span className="text-gray-600">Tiempo restante: </span>
            <span className="font-semibold text-gray-900">{reserva.tiempoRestante}</span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {reserva.estado === "En curso" ? (
          <>
            <button className="flex-1 px-4 py-2 border-2 border-cyan-500 text-cyan-600 rounded-full hover:bg-cyan-50 transition-colors font-semibold text-sm">
              + Extender
            </button>
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-cyan-500 to-cyan-600 text-white rounded-full hover:shadow-lg transition-all font-semibold text-sm">
              Finalizar
            </button>
          </>
        ) : (
          <>
            <button className="flex-1 px-4 py-2 border-2 border-cyan-500 text-cyan-600 rounded-full hover:bg-cyan-50 transition-colors font-semibold text-sm">
              Modificar
            </button>
            <button className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-full hover:shadow-lg transition-all font-semibold text-sm">
              Cancelar
            </button>
          </>
        )}
      </div>
    </div>
  );
}