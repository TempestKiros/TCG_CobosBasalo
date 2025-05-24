import React, { useState, useEffect, useCallback } from "react";
import { User } from "firebase/auth";
import {
  getDatabase,
  ref,
  get,
  set,
  push,
  onValue,
  off,
  remove,
} from "firebase/database";
import {
  MessageCircle,
  Users,
  Wrench,
  TrendingUp,
  Clock,
  Star,
  ArrowLeft,
  Send,
  Heart,
  Reply,
  MoreVertical,
  Search,
  Plus,
  User as UserIcon,
  Trash2,
  X,
} from "lucide-react";

// 🏗️ Interfaces y Types
interface ForosSectionProps {
  user: User;
}

interface UserData {
  username: string;
  email: string;
  avatar: string;
  timezone: string;
  favoriteGames: string[];
  description?: string;
  status?: string;
}

interface ForumTopic {
  id: string;
  title: string;
  content: string;
  author: string;
  authorAvatar: string;
  authorId: string;
  categoryId: number;
  createdAt: number;
  replies: number;
  views: number;
  likes: number;
  likedBy: string[];
  hot: boolean;
  pinned: boolean;
  posts: ForumPost[];
  time?: string;
}

interface ForumPost {
  id: string;
  content: string;
  author: string;
  authorAvatar: string;
  authorId: string;
  topicId: string;
  createdAt: number;
  likes: number;
  likedBy: string[];
  replyTo?: string;
}

// 🎨 Hooks y Funciones Utilitarias
const useTheme = () => ({
  bg: "bg-gray-900",
  cardBg: "bg-gray-800",
  text: "text-white",
  textSecondary: "text-gray-300",
  textMuted: "text-gray-500",
  border: "border-gray-700",
  hover: "hover:bg-gray-700",
  accent: "text-blue-400",
  success: "text-green-400",
  warning: "text-yellow-400",
  danger: "text-red-400",
});

const formatTime = (timestamp: number): string => {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Ahora";
  if (minutes < 60) return `${minutes}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;

  return new Date(timestamp).toLocaleDateString();
};

// Componente separado para el formulario de nuevo tema
const NewTopicForm: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (title: string, content: string) => void;
  theme: any;
}> = ({ isOpen, onClose, onSubmit, theme }) => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (title.trim() && content.trim()) {
      onSubmit(title.trim(), content.trim());
      setTitle("");
      setContent("");
      onClose();
    }
  };

  const handleClose = () => {
    setTitle("");
    setContent("");
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className={`${theme.cardBg} rounded-lg p-6 w-full max-w-md`}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold">Crear Nuevo Tema</h3>
          <button
            onClick={handleClose}
            className={`p-1 rounded ${theme.hover}`}
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full p-2 ${theme.cardBg} border ${theme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="¿De qué quieres hablar?"
              autoComplete="off"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Contenido</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className={`w-full p-2 ${theme.cardBg} border ${theme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
              placeholder="Comparte tus pensamientos..."
              autoComplete="off"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <button
              onClick={handleSubmit}
              disabled={!title.trim() || !content.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Crear Tema
            </button>
            <button
              onClick={handleClose}
              className={`px-4 py-2 rounded-lg ${theme.hover} transition-colors`}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Avatar: React.FC<{
  avatar: string;
  username: string;
  size?: string;
  textSize?: string;
  interactive?: boolean;
  showBorder?: boolean;
  onClick?: () => void;
}> = ({
  avatar,
  username,
  size = "w-16 h-16",
  textSize = "text-xl",
  interactive = false,
  showBorder = true,
  onClick,
}) => {
  const borderClass = showBorder ? "border-2 border-gray-600" : "";
  const interactiveClass = interactive
    ? "cursor-pointer hover:scale-105 transition-transform duration-200 hover:shadow-lg"
    : "";

  if (avatar && avatar !== "") {
    return (
      <img
        src={avatar}
        alt={username}
        onClick={onClick}
        className={`${size} rounded-full object-cover ${borderClass} ${interactiveClass}`}
      />
    );
  }

  const initial = username.charAt(0).toUpperCase();

  return (
    <div
      onClick={onClick}
      className={`${size} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ${borderClass} ${interactiveClass} shadow-md`}
    >
      <span className={`font-semibold text-white ${textSize}`}>{initial}</span>
    </div>
  );
};
const ReplyForm: React.FC<{
  onSubmit: (content: string) => void;
  replyToPost: string | null;
  onClearReplyTo: () => void;
  userData: UserData | null;
  theme: any;
}> = ({ onSubmit, replyToPost, onClearReplyTo, userData, theme }) => {
  const [content, setContent] = useState("");

  const handleSubmit = () => {
    if (content.trim()) {
      onSubmit(content.trim());
      setContent("");
    }
  };

  return (
    <div className={`${theme.cardBg} border ${theme.border} rounded-lg p-4`}>
      {replyToPost && (
        <div
          className={`mb-3 p-2 ${theme.bg} rounded border-l-2 border-blue-500`}
        >
          <div className="flex items-center justify-between">
            <span className={`text-sm ${theme.textMuted}`}>
              Respondiendo a un mensaje
            </span>
            <button
              onClick={onClearReplyTo}
              className={`p-1 rounded ${theme.hover}`}
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        {userData && (
          <Avatar
            avatar={userData.avatar}
            username={userData.username}
            size="w-10 h-10"
            textSize="text-base"
            interactive={true}
          />
        )}

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Escribe tu respuesta..."
            rows={3}
            className={`w-full p-3 ${theme.cardBg} border ${theme.border} rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none`}
            autoComplete="off"
          />

          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleSubmit}
              disabled={!content.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Send size={16} />
              Responder
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const initialCategories = [
  {
    id: 1,
    name: "Discusión General",
    description: "Conversaciones abiertas sobre gaming",
    icon: MessageCircle,
    color: "from-blue-500 to-blue-600",
    topics: 156,
    posts: 2340,
  },
  {
    id: 2,
    name: "Comunidad",
    description: "Conecta con otros jugadores",
    icon: Users,
    color: "from-green-500 to-green-600",
    topics: 89,
    posts: 1250,
  },
  {
    id: 3,
    name: "Soporte Técnico",
    description: "Ayuda y resolución de problemas",
    icon: Wrench,
    color: "from-yellow-500 to-yellow-600",
    topics: 234,
    posts: 890,
  },
  {
    id: 4,
    name: "Tendencias",
    description: "Lo más popular del momento",
    icon: TrendingUp,
    color: "from-purple-500 to-purple-600",
    topics: 67,
    posts: 445,
  },
];

export const ForosSection: React.FC<ForosSectionProps> = ({ user }) => {
  const theme = useTheme();

  // 📊 Estados de navegación
  const [currentView, setCurrentView] = useState("categories");
  const [selectedCategory, setSelectedCategory] = useState<any>(null);
  const [selectedTopic, setSelectedTopic] = useState<ForumTopic | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewTopicForm, setShowNewTopicForm] = useState(false);

  // Estados de formularios simplificados
  const [replyToPost, setReplyToPost] = useState<string | null>(null);
  const [newTopicTitle, setNewTopicTitle] = useState("");
  const [newTopicContent, setNewTopicContent] = useState("");
  const [newReplyContent, setNewReplyContent] = useState("");

  // Estados de datos
  const [userData, setUserData] = useState<UserData | null>(null);
  const [topics, setTopics] = useState<ForumTopic[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [loading, setLoading] = useState(true);

  const db = getDatabase();

  // 🔄 Effects - Cargar datos del usuario
  useEffect(() => {
    let isMounted = true;

    const loadUserData = async () => {
      try {
        const userRef = ref(db, `users/${user.uid}`);
        const snapshot = await get(userRef);

        if (!isMounted) return;

        if (snapshot.exists()) {
          setUserData(snapshot.val());
        } else {
          // Crear perfil de usuario por defecto
          const defaultUserData: UserData = {
            username:
              user.displayName || user.email?.split("@")[0] || "Usuario",
            email: user.email || "",
            avatar: user.photoURL || "",
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            favoriteGames: [],
          };

          await set(userRef, defaultUserData);
          if (isMounted) {
            setUserData(defaultUserData);
          }
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        if (isMounted) {
          // Crear datos de usuario de emergencia sin Firebase
          const fallbackUserData: UserData = {
            username:
              user.displayName || user.email?.split("@")[0] || "Usuario",
            email: user.email || "",
            avatar: user.photoURL || "",
            timezone: "UTC",
            favoriteGames: [],
          };
          setUserData(fallbackUserData);
        }
      }
    };

    loadUserData();

    return () => {
      isMounted = false;
    };
  }, [user, db]);

  // Cargar topics desde Firebase
  useEffect(() => {
    let isMounted = true;

    const topicsRef = ref(db, "forumTopics");

    const unsubscribe = onValue(
      topicsRef,
      (snapshot) => {
        if (!isMounted) return;

        try {
          if (snapshot.exists()) {
            const topicsData = snapshot.val();
            const topicsArray = Object.keys(topicsData).map((id) => ({
              id,
              ...topicsData[id],
              posts: topicsData[id].posts || [],
            }));
            setTopics(topicsArray);
          } else {
            setTopics([]);
          }
        } catch (error) {
          console.error("Error loading topics:", error);
          setTopics([]);
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error("Firebase topics listener error:", error);
        if (isMounted) {
          setTopics([]);
          setLoading(false);
        }
      }
    );

    // Timeout de seguridad para evitar carga infinita
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        console.log("Timeout reached, setting loading to false");
        setLoading(false);
      }
    }, 5000);

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      off(topicsRef, "value", unsubscribe);
    };
  }, [db, loading]);

  // Cargar posts desde Firebase
  useEffect(() => {
    let isMounted = true;

    const postsRef = ref(db, "forumPosts");

    const unsubscribe = onValue(
      postsRef,
      (snapshot) => {
        if (!isMounted) return;

        try {
          if (snapshot.exists()) {
            const postsData = snapshot.val();
            const postsArray = Object.keys(postsData).map((id) => ({
              id,
              ...postsData[id],
            }));
            setPosts(postsArray);
          } else {
            setPosts([]);
          }
        } catch (error) {
          console.error("Error loading posts:", error);
          setPosts([]);
        }
      },
      (error) => {
        console.error("Firebase posts listener error:", error);
        if (isMounted) {
          setPosts([]);
        }
      }
    );

    return () => {
      isMounted = false;
      off(postsRef, "value", unsubscribe);
    };
  }, [db]);

  // Función para crear datos de ejemplo
  const createSampleData = async () => {
    if (!userData) return;

    try {
      setLoading(true);

      // Crear algunos topics de ejemplo
      const sampleTopics = [
        {
          title: "¡Bienvenidos al foro de gaming!",
          content:
            "Este es el primer tema de nuestro foro. ¡Comparte tus juegos favoritos y conecta con otros jugadores!",
          categoryId: 1,
          hot: true,
          pinned: true,
        },
        {
          title: "¿Cuál es tu juego favorito actualmente?",
          content:
            "Me encantaría conocer qué están jugando todos. Yo estoy obsesionado con el último RPG que salió.",
          categoryId: 1,
          hot: false,
          pinned: false,
        },
        {
          title: "Problema con lag en juegos online",
          content:
            "Últimamente tengo mucho lag en los juegos multijugador. ¿Alguien sabe cómo solucionarlo?",
          categoryId: 3,
          hot: false,
          pinned: false,
        },
        {
          title: "Los mejores juegos indie de 2024",
          content:
            "He estado explorando muchos juegos indie increíbles este año. ¿Cuáles recomiendan?",
          categoryId: 4,
          hot: true,
          pinned: false,
        },
      ];

      const topicsRef = ref(db, "forumTopics");

      for (const topicData of sampleTopics) {
        const newTopicRef = push(topicsRef);
        await set(newTopicRef, {
          ...topicData,
          author: userData.username,
          authorAvatar: userData.avatar,
          authorId: user.uid,
          createdAt: Date.now() - Math.random() * 86400000 * 7, // Últimos 7 días
          replies: Math.floor(Math.random() * 10),
          views: Math.floor(Math.random() * 100),
          likes: Math.floor(Math.random() * 15),
          likedBy: [],
          posts: [],
        });
      }

      console.log("Sample data created successfully!");
    } catch (error) {
      console.error("Error creating sample data:", error);
    } finally {
      setLoading(false);
    }
  };
  const createNewTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !userData) return;

    try {
      const topicsRef = ref(db, "forumTopics");
      const newTopicRef = push(topicsRef);

      const newTopic: Omit<ForumTopic, "id"> = {
        title: newTopicTitle.trim(),
        content: newTopicContent.trim(),
        author: userData.username,
        authorAvatar: userData.avatar,
        authorId: user.uid,
        categoryId: selectedCategory.id,
        createdAt: Date.now(),
        replies: 0,
        views: 0,
        likes: 0,
        likedBy: [],
        hot: false,
        pinned: false,
        posts: [],
      };

      await set(newTopicRef, newTopic);

      // Reset form
      setNewTopicTitle("");
      setNewTopicContent("");
      setShowNewTopicForm(false);

      console.log("Topic created successfully");
    } catch (error) {
      console.error("Error creating topic:", error);
    }
  };

  const addReply = async () => {
    if (!newReplyContent.trim() || !selectedTopic || !userData) return;

    try {
      const postsRef = ref(db, "forumPosts");
      const newPostRef = push(postsRef);

      const newPost: Omit<ForumPost, "id"> = {
        content: newReplyContent.trim(),
        author: userData.username,
        authorAvatar: userData.avatar,
        authorId: user.uid,
        topicId: selectedTopic.id,
        createdAt: Date.now(),
        likes: 0,
        likedBy: [],
        ...(replyToPost ? { replyTo: replyToPost } : {}),
      };

      await set(newPostRef, newPost);

      // Update topic reply count
      const topicRef = ref(db, `forumTopics/${selectedTopic.id}/replies`);
      await set(topicRef, (selectedTopic.replies || 0) + 1);

      // Reset form
      setNewReplyContent("");
      setReplyToPost(null);

      console.log("Reply added successfully");
    } catch (error) {
      console.error("Error adding reply:", error);
    }
  };

  const deleteTopic = async (topicId: string) => {
    if (
      !window.confirm(
        "¿Estás seguro de que quieres eliminar este tema? Esta acción no se puede deshacer."
      )
    ) {
      return;
    }

    try {
      // Delete topic
      await remove(ref(db, `forumTopics/${topicId}`));

      // Delete all posts related to this topic
      const relatedPosts = posts.filter((post) => post.topicId === topicId);
      for (const post of relatedPosts) {
        await remove(ref(db, `forumPosts/${post.id}`));
      }

      // Navigate back to topics view
      if (currentView === "thread") {
        setCurrentView("topics");
        setSelectedTopic(null);
      }

      console.log("Topic deleted successfully");
    } catch (error) {
      console.error("Error deleting topic:", error);
    }
  };

  const deletePost = async (postId: string, topicId: string) => {
    if (
      !window.confirm("¿Estás seguro de que quieres eliminar esta respuesta?")
    ) {
      return;
    }

    try {
      await remove(ref(db, `forumPosts/${postId}`));

      // Update topic reply count
      const topic = topics.find((t) => t.id === topicId);
      if (topic) {
        const topicRef = ref(db, `forumTopics/${topicId}/replies`);
        await set(topicRef, Math.max(0, (topic.replies || 0) - 1));
      }

      console.log("Post deleted successfully");
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const toggleLike = useCallback(
    async (itemId: string, isPost: boolean) => {
      if (!userData) return;

      try {
        const itemRef = isPost
          ? ref(db, `forumPosts/${itemId}`)
          : ref(db, `forumTopics/${itemId}`);

        const snapshot = await get(itemRef);
        if (!snapshot.exists()) return;

        const item = snapshot.val();
        const likedBy = item.likedBy || [];
        const hasLiked = likedBy.includes(user.uid);

        let newLikes;
        let newLikedBy;

        if (hasLiked) {
          newLikes = Math.max(0, (item.likes || 0) - 1);
          newLikedBy = likedBy.filter((id: string) => id !== user.uid);
        } else {
          newLikes = (item.likes || 0) + 1;
          newLikedBy = [...likedBy, user.uid];
        }

        await set(
          ref(db, `${isPost ? "forumPosts" : "forumTopics"}/${itemId}/likes`),
          newLikes
        );
        await set(
          ref(db, `${isPost ? "forumPosts" : "forumTopics"}/${itemId}/likedBy`),
          newLikedBy
        );
      } catch (error) {
        console.error("Error toggling like:", error);
      }
    },
    [userData, user.uid, db]
  );

  // 📈 Funciones de Datos
  const getTopicsForCategory = (categoryId: number) => {
    return topics.filter((topic) => topic.categoryId === categoryId);
  };

  const getStats = () => {
    const totalMembers = 1234; // This would come from user count
    const totalPosts = posts.length;
    const totalTopics = topics.length;
    const activeSupport = topics.filter((t) => t.categoryId === 3).length;

    return {
      members: totalMembers,
      posts: totalPosts,
      topics: totalTopics,
      support: activeSupport,
    };
  };

  // 🖼️ Componentes de Vista
  const LoadingView = () => (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} flex flex-col items-center justify-center p-6`}
    >
      <div className="text-center">
        <div className="animate-pulse mb-6">
          <MessageCircle size={48} className={theme.accent} />
        </div>
        <p className="text-xl mb-4">Cargando foros...</p>
        <p className={`text-sm ${theme.textMuted} mb-8`}>
          Conectando con Firebase...
        </p>

        {/* Botón para crear datos de ejemplo si no hay contenido */}
        <div className="space-y-4">
          <button
            onClick={createSampleData}
            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Crear Contenido de Ejemplo
          </button>
          <p className={`text-xs ${theme.textMuted} max-w-md`}>
            Si es la primera vez que usas el foro, puedes crear algunos temas de
            ejemplo para empezar.
          </p>
        </div>
      </div>
    </div>
  );

  const CategoriesView = () => {
    const stats = getStats();

    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
        {/* Header */}
        <div className={`${theme.cardBg} border-b ${theme.border} p-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">
                  Foros de la Comunidad
                </h1>
                <p className={theme.textSecondary}>
                  Conecta, discute y comparte con la comunidad gaming
                </p>
              </div>

              {userData && (
                <div className="flex items-center gap-3">
                  <Avatar
                    avatar={userData.avatar}
                    username={userData.username}
                    size="w-10 h-10"
                  />
                  <div className="hidden md:block">
                    <p className="font-medium">{userData.username}</p>
                    <p className={`text-sm ${theme.textMuted}`}>En línea</p>
                  </div>
                </div>
              )}
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
              <Search
                size={20}
                className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme.textMuted}`}
              />
              <input
                type="text"
                placeholder="Buscar en los foros..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-10 pr-4 py-2 ${theme.cardBg} ${theme.border} border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500`}
              />
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div
              className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}
            >
              <div className="flex items-center gap-3">
                <Users className={theme.accent} />
                <div>
                  <p className="text-2xl font-bold">
                    {stats.members.toLocaleString()}
                  </p>
                  <p className={`text-sm ${theme.textMuted}`}>Miembros</p>
                </div>
              </div>
            </div>

            <div
              className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}
            >
              <div className="flex items-center gap-3">
                <MessageCircle className={theme.success} />
                <div>
                  <p className="text-2xl font-bold">{stats.posts}</p>
                  <p className={`text-sm ${theme.textMuted}`}>Posts</p>
                </div>
              </div>
            </div>

            <div
              className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}
            >
              <div className="flex items-center gap-3">
                <TrendingUp className={theme.warning} />
                <div>
                  <p className="text-2xl font-bold">{stats.topics}</p>
                  <p className={`text-sm ${theme.textMuted}`}>Temas Activos</p>
                </div>
              </div>
            </div>

            <div
              className={`${theme.cardBg} p-4 rounded-lg border ${theme.border}`}
            >
              <div className="flex items-center gap-3">
                <Wrench className={theme.danger} />
                <div>
                  <p className="text-2xl font-bold">{stats.support}</p>
                  <p className={`text-sm ${theme.textMuted}`}>Soporte</p>
                </div>
              </div>
            </div>
          </div>

          {/* Categories Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {initialCategories.map((category) => {
              const categoryTopics = getTopicsForCategory(category.id);
              const Icon = category.icon;

              return (
                <div
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category);
                    setCurrentView("topics");
                  }}
                  className={`${theme.cardBg} border ${theme.border} rounded-lg p-6 cursor-pointer transition-all duration-200 ${theme.hover} group`}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center group-hover:scale-105 transition-transform`}
                    >
                      <Icon size={24} className="text-white" />
                    </div>

                    <div className="flex-1">
                      <h3 className="text-xl font-bold mb-2">
                        {category.name}
                      </h3>
                      <p className={`${theme.textSecondary} mb-4`}>
                        {category.description}
                      </p>

                      <div className="flex items-center gap-4 text-sm">
                        <span className={theme.textMuted}>
                          {categoryTopics.length} temas
                        </span>
                        <span className={theme.textMuted}>
                          {categoryTopics.reduce(
                            (acc, topic) => acc + (topic.replies || 0),
                            0
                          )}{" "}
                          respuestas
                        </span>
                      </div>
                    </div>

                    <ArrowLeft
                      className={`transform rotate-180 ${theme.textMuted} group-hover:${theme.accent} transition-colors`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const TopicsView = () => {
    const categoryTopics = getTopicsForCategory(selectedCategory.id);
    const Icon = selectedCategory.icon;

    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
        {/* Header */}
        <div className={`${theme.cardBg} border-b ${theme.border} p-6`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setCurrentView("categories")}
                className={`p-2 rounded-lg ${theme.hover} transition-colors`}
              >
                <ArrowLeft size={20} />
              </button>

              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${selectedCategory.color} flex items-center justify-center`}
              >
                <Icon size={20} className="text-white" />
              </div>

              <div>
                <h1 className="text-2xl font-bold">{selectedCategory.name}</h1>
                <p className={theme.textSecondary}>
                  {selectedCategory.description}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowNewTopicForm(true)}
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Plus size={16} />
              Nuevo Tema
            </button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto p-6">
          {/* Topics List */}
          <div className="space-y-4">
            {categoryTopics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic);
                  setCurrentView("thread");
                }}
                className={`${theme.cardBg} border ${theme.border} rounded-lg p-6 cursor-pointer ${theme.hover} transition-colors`}
              >
                <div className="flex items-start gap-4">
                  <Avatar
                    avatar={topic.authorAvatar}
                    username={topic.author}
                    size="w-10 h-10"
                  />

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold">{topic.title}</h3>

                      {topic.authorId === user.uid && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteTopic(topic.id);
                          }}
                          className={`p-1 rounded ${theme.hover} ${theme.danger} transition-colors`}
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <p className={`${theme.textSecondary} mb-3 line-clamp-2`}>
                      {topic.content}
                    </p>

                    <div className="flex items-center gap-4 text-sm">
                      <span className={theme.textMuted}>
                        <Clock size={14} className="inline mr-1" />
                        {formatTime(topic.createdAt)}
                      </span>
                      <span className={theme.textMuted}>
                        <MessageCircle size={14} className="inline mr-1" />
                        {topic.replies || 0} respuestas
                      </span>
                      <span className={theme.textMuted}>
                        <Heart size={14} className="inline mr-1" />
                        {topic.likes || 0} likes
                      </span>
                      <span className={theme.textMuted}>
                        por {topic.author}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {categoryTopics.length === 0 && (
            <div className="text-center py-12">
              <MessageCircle
                size={48}
                className={`${theme.textMuted} mx-auto mb-4`}
              />
              <p className={theme.textMuted}>
                No hay temas en esta categoría aún.
              </p>
              <p className={theme.textMuted}>¡Sé el primero en crear uno!</p>
            </div>
          )}
        </div>

        {/* New Topic Modal */}
        <NewTopicForm
          isOpen={showNewTopicForm}
          onClose={() => setShowNewTopicForm(false)}
          onSubmit={createNewTopic}
          theme={theme}
        />
      </div>
    );
  };

  const ThreadView = () => {
    if (!selectedTopic) return null;

    const topicPosts = posts.filter(
      (post) => post.topicId === selectedTopic.id
    );
    const isAuthor = selectedTopic.authorId === user.uid;

    return (
      <div className={`min-h-screen ${theme.bg} ${theme.text}`}>
        {/* Header */}
        <div className={`${theme.cardBg} border-b ${theme.border} p-6`}>
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => setCurrentView("topics")}
                className={`p-2 rounded-lg ${theme.hover} transition-colors`}
              >
                <ArrowLeft size={20} />
              </button>

              {isAuthor && (
                <button
                  onClick={() => deleteTopic(selectedTopic.id)}
                  className={`p-2 rounded-lg ${theme.hover} ${theme.danger} transition-colors`}
                >
                  <Trash2 size={20} />
                </button>
              )}
            </div>

            <h1 className="text-2xl font-bold">{selectedTopic.title}</h1>
          </div>
        </div>

        <div className="max-w-4xl mx-auto p-6">
          {/* Main Topic Post */}
          <div
            className={`${theme.cardBg} border ${theme.border} rounded-lg p-6 mb-6`}
          >
            <div className="flex items-start gap-4">
              <Avatar
                avatar={selectedTopic.authorAvatar}
                username={selectedTopic.author}
                size="w-12 h-12"
              />

              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-medium">{selectedTopic.author}</span>
                  <span className={`text-sm ${theme.textMuted}`}>
                    {formatTime(selectedTopic.createdAt)}
                  </span>
                </div>

                <p className={`${theme.text} mb-4 whitespace-pre-wrap`}>
                  {selectedTopic.content}
                </p>

                <div className="flex items-center gap-4">
                  <button
                    onClick={() => toggleLike(selectedTopic.id, false)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full transition-colors ${
                      selectedTopic.likedBy?.includes(user.uid)
                        ? "bg-red-500/20 text-red-400"
                        : `${theme.hover} ${theme.textMuted}`
                    }`}
                  >
                    <Heart
                      size={16}
                      fill={
                        selectedTopic.likedBy?.includes(user.uid)
                          ? "currentColor"
                          : "none"
                      }
                    />
                    {selectedTopic.likes || 0}
                  </button>

                  <button
                    onClick={() => setReplyToPost(null)}
                    className={`flex items-center gap-2 px-3 py-1 rounded-full ${theme.hover} transition-colors`}
                  >
                    <Reply size={16} />
                    Responder
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts/Replies */}
          <div className="space-y-4 mb-6">
            {topicPosts.map((post) => (
              <div
                key={post.id}
                className={`${theme.cardBg} border ${theme.border} rounded-lg p-4`}
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    avatar={post.authorAvatar}
                    username={post.author}
                    size="w-8 h-8"
                  />

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">
                          {post.author}
                        </span>
                        <span className={`text-xs ${theme.textMuted}`}>
                          {formatTime(post.createdAt)}
                        </span>
                      </div>

                      {post.authorId === user.uid && (
                        <button
                          onClick={() => deletePost(post.id, post.topicId)}
                          className={`p-1 rounded ${theme.hover} ${theme.danger} transition-colors`}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>

                    {post.replyTo && (
                      <div
                        className={`${theme.bg} border-l-2 border-blue-500 pl-3 mb-2 text-sm ${theme.textMuted}`}
                      >
                        <p>Respondiendo a un mensaje anterior</p>
                      </div>
                    )}

                    <p
                      className={`${theme.text} mb-3 text-sm whitespace-pre-wrap`}
                    >
                      {post.content}
                    </p>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleLike(post.id, true)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full transition-colors ${
                          post.likedBy?.includes(user.uid)
                            ? "bg-red-500/20 text-red-400"
                            : `${theme.hover} ${theme.textMuted}`
                        }`}
                      >
                        <Heart
                          size={12}
                          fill={
                            post.likedBy?.includes(user.uid)
                              ? "currentColor"
                              : "none"
                          }
                        />
                        {post.likes || 0}
                      </button>

                      <button
                        onClick={() => setReplyToPost(post.id)}
                        className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${theme.hover} transition-colors`}
                      >
                        <Reply size={12} />
                        Responder
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Reply Form */}
          <ReplyForm
            onSubmit={addReply}
            replyToPost={replyToPost}
            onClearReplyTo={() => setReplyToPost(null)}
            userData={userData}
            theme={theme}
          />
        </div>
      </div>
    );
  };

  // 🎛️ Renderizado Principal
  const renderCurrentView = () => {
    if (loading) return <LoadingView />;

    switch (currentView) {
      case "categories":
        return <CategoriesView />;
      case "topics":
        return <TopicsView />;
      case "thread":
        return <ThreadView />;
      default:
        return <CategoriesView />;
    }
  };

  // 🎨 Elementos UI Flotantes
  return (
    <>
      {renderCurrentView()}

      {/* Botón flotante de acceso rápido */}
      {currentView !== "categories" && (
        <button
          onClick={() => {
            setCurrentView("categories");
            setSelectedCategory(null);
            setSelectedTopic(null);
          }}
          className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center shadow-lg transition-colors z-40"
        >
          <MessageCircle size={24} className="text-white" />
        </button>
      )}

      {/* Indicador de usuario en línea */}
      {userData && (
        <div className="fixed bottom-6 left-6 z-40">
          <div
            className={`${theme.cardBg} border ${theme.border} rounded-full px-3 py-2 flex items-center gap-2 shadow-lg`}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium">{userData.username}</span>
          </div>
        </div>
      )}

      {/* Botón volver al perfil */}
      {currentView !== "categories" && (
        <button
          onClick={() => window.history.back()}
          className={`fixed top-6 left-6 p-3 ${theme.cardBg} border ${theme.border} rounded-full ${theme.hover} transition-colors z-40`}
        >
          <ArrowLeft size={20} />
        </button>
      )}
    </>
  );
};
