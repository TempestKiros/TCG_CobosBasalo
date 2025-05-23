// src/components/ForosSection/ForosSection.tsx
import React from "react";
import { useTheme } from "./contexts/SettingsContext";
import {
  MessageCircle,
  Users,
  Wrench,
  TrendingUp,
  Clock,
  Star,
} from "lucide-react";

export const ForosSection: React.FC = () => {
  const { theme, themeClasses } = useTheme();

  const forumCategories = [
    {
      icon: MessageCircle,
      title: "Discusiones Generales",
      description: "Habla sobre cualquier tema relacionado con gaming",
      posts: 1247,
      lastActivity: "hace 2 min",
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
    },
    {
      icon: Users,
      title: "Sugerencias de Juegos",
      description: "Recomienda y descubre nuevos juegos increíbles",
      posts: 856,
      lastActivity: "hace 15 min",
      color: "text-green-400",
      bgColor: "bg-green-500/10",
    },
    {
      icon: Wrench,
      title: "Reportes y Soporte",
      description: "Ayuda técnica y reportes de problemas",
      posts: 342,
      lastActivity: "hace 1 hora",
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
    },
    {
      icon: TrendingUp,
      title: "Gaming News",
      description: "Las últimas noticias del mundo gamer",
      posts: 623,
      lastActivity: "hace 30 min",
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
    },
  ];

  const recentTopics = [
    {
      title: "¿Cuál es tu juego favorito de 2024?",
      author: "GameMaster",
      replies: 45,
      time: "hace 10 min",
      hot: true,
    },
    {
      title: "Problema con la biblioteca de juegos",
      author: "TechUser",
      replies: 12,
      time: "hace 25 min",
      hot: false,
    },
    {
      title: "Recomendaciones para juegos indie",
      author: "IndieExplorer",
      replies: 28,
      time: "hace 1 hora",
      hot: true,
    },
  ];

  return (
    <div
      className={`min-h-screen ${themeClasses.bg} ${themeClasses.text} p-6 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            🗨️ Foros de la Comunidad
          </h2>
          <p className={`text-lg ${themeClasses.textSecondary} max-w-3xl`}>
            ¡Bienvenido a la sección de foros! Aquí podrás debatir, compartir
            ideas y conectar con otros jugadores de la comunidad.
          </p>
        </div>

        {/* Stats rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div
            className={`${themeClasses.cardBg} rounded-xl p-4 border ${themeClasses.borderColor}`}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-blue-500/20 p-2 rounded-lg">
                <Users className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">2,547</p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Miembros activos
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${themeClasses.cardBg} rounded-xl p-4 border ${themeClasses.borderColor}`}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-green-500/20 p-2 rounded-lg">
                <MessageCircle className="w-5 h-5 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">18,342</p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Posts totales
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${themeClasses.cardBg} rounded-xl p-4 border ${themeClasses.borderColor}`}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-purple-500/20 p-2 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">156</p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Temas activos
                </p>
              </div>
            </div>
          </div>

          <div
            className={`${themeClasses.cardBg} rounded-xl p-4 border ${themeClasses.borderColor}`}
          >
            <div className="flex items-center space-x-3">
              <div className="bg-orange-500/20 p-2 rounded-lg">
                <Clock className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">24/7</p>
                <p className={`text-sm ${themeClasses.textSecondary}`}>
                  Soporte activo
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categorías de foros */}
          <div className="lg:col-span-2">
            <h3 className="text-2xl font-semibold mb-6">Categorías de Foros</h3>
            <div className="space-y-4">
              {forumCategories.map((category, index) => {
                const Icon = category.icon;
                return (
                  <div
                    key={index}
                    className={`${themeClasses.cardBg} rounded-xl p-6 border ${themeClasses.borderColor} ${themeClasses.hover} transition-all duration-300 hover:scale-105 cursor-pointer group`}
                  >
                    <div className="flex items-start space-x-4">
                      <div
                        className={`${category.bgColor} p-3 rounded-xl group-hover:scale-110 transition-transform duration-300`}
                      >
                        <Icon className={`w-6 h-6 ${category.color}`} />
                      </div>
                      <div className="flex-1">
                        <h4 className="text-xl font-semibold mb-2 group-hover:text-blue-400 transition-colors">
                          {category.title}
                        </h4>
                        <p className={`${themeClasses.textSecondary} mb-3`}>
                          {category.description}
                        </p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4 text-sm">
                            <span className={`${themeClasses.textSecondary}`}>
                              📝 {category.posts.toLocaleString()} posts
                            </span>
                            <span className={`${themeClasses.textSecondary}`}>
                              🕒 {category.lastActivity}
                            </span>
                          </div>
                          <button
                            className={`${themeClasses.accent} hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105`}
                          >
                            Ver Foro
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sidebar con temas recientes */}
          <div className="lg:col-span-1">
            <div
              className={`${themeClasses.cardBg} rounded-xl p-6 border ${themeClasses.borderColor} sticky top-6`}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-400" />
                <span>Temas Populares</span>
              </h3>

              <div className="space-y-4">
                {recentTopics.map((topic, index) => (
                  <div
                    key={index}
                    className={`${themeClasses.inputBg} rounded-lg p-4 ${themeClasses.hover} transition-all duration-200 hover:scale-102 cursor-pointer`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-medium text-sm leading-tight hover:text-blue-400 transition-colors">
                        {topic.title}
                      </h4>
                      {topic.hot && (
                        <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full ml-2 flex-shrink-0">
                          🔥
                        </span>
                      )}
                    </div>
                    <div
                      className={`flex items-center justify-between text-xs ${themeClasses.textSecondary}`}
                    >
                      <span>por {topic.author}</span>
                      <div className="flex items-center space-x-2">
                        <span>💬 {topic.replies}</span>
                        <span>• {topic.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Botón para crear nuevo tema */}
              <button
                className={`w-full mt-6 ${themeClasses.accent} hover:opacity-90 text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 hover:scale-105 flex items-center justify-center space-x-2`}
              >
                <MessageCircle className="w-4 h-4" />
                <span>Crear Nuevo Tema</span>
              </button>

              {/* Reglas del foro */}
              <div className={`mt-6 ${themeClasses.inputBg} rounded-lg p-4`}>
                <h4 className="font-semibold mb-3 text-sm">
                  📋 Reglas del Foro
                </h4>
                <ul
                  className={`text-xs ${themeClasses.textSecondary} space-y-1`}
                >
                  <li>• Mantén el respeto hacia otros usuarios</li>
                  <li>• No spam ni contenido ofensivo</li>
                  <li>• Usa las categorías correctas</li>
                  <li>• Busca antes de crear un tema nuevo</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de acción flotantes */}
        <div className="fixed bottom-6 right-6 space-y-3">
          <button
            className={`${themeClasses.accent} hover:opacity-90 text-white p-4 rounded-full shadow-2xl transition-all duration-300 hover:scale-110`}
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};
