// src/pages/Dashboard/Sections/Anuncios.tsx
import React from "react";

interface Noticia {
  id: number;
  titulo: string;
  descripcion: string;
  imagen: string;
  fecha: string;
  categoria: string;
  enlace?: string;
}

export const Anuncios: React.FC = () => {
  const noticias: Noticia[] = [
    {
      id: 1,
      titulo: "GTA VI confirma su lanzamiento para 2025",
      descripcion:
        "Rockstar Games revela nuevos detalles sobre el esperado Grand Theft Auto VI, confirmando su llegada en 2025.",
      imagen:
        "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 2 horas",
      categoria: "Noticias",
    },
    {
      id: 2,
      titulo: "Elden Ring: Shadow of the Erdtree - Nueva expansi贸n",
      descripcion:
        "FromSoftware anuncia una masiva expansi贸n que promete 40+ horas de contenido adicional.",
      imagen:
        "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 4 horas",
      categoria: "DLC",
    },
    {
      id: 3,
      titulo: "Steam Deck OLED ya disponible",
      descripcion:
        "Valve lanza la nueva versi贸n OLED de Steam Deck con mejor pantalla y mayor duraci贸n de bater铆a.",
      imagen:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 6 horas",
      categoria: "Hardware",
    },
    {
      id: 4,
      titulo: "PlayStation 5 Pro oficialmente anunciada",
      descripcion:
        "Sony revela la versi贸n Pro de PS5 con soporte para 8K y ray tracing mejorado.",
      imagen:
        "https://images.unsplash.com/photo-1606144042614-b2417e99c4e3?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 8 horas",
      categoria: "Consolas",
    },
    {
      id: 5,
      titulo: "Ofertas de Steam: -75% en juegos AAA",
      descripcion:
        "Gran oferta de primavera con descuentos masivos en Red Dead Redemption 2, Cyberpunk 2077 y m谩s.",
      imagen:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 1 d铆a",
      categoria: "Ofertas",
    },
    {
      id: 6,
      titulo: "Epic Games regala Borderlands 3",
      descripcion:
        "El popular shooter looter estar谩 disponible gratuitamente por tiempo limitado en Epic Games Store.",
      imagen:
        "https://images.unsplash.com/photo-1556438064-2d7646166914?w=400&h=200&fit=crop&auto=format",
      fecha: "Hace 1 d铆a",
      categoria: "Gratis",
    },
  ];

  const getCategoriaColor = (categoria: string) => {
    const colores: { [key: string]: string } = {
      Noticias: "#007bff",
      DLC: "#28a745",
      Hardware: "#fd7e14",
      Consolas: "#6f42c1",
      Ofertas: "#dc3545",
      Gratis: "#20c997",
    };
    return colores[categoria] || "#6c757d";
  };

  return (
    <div style={{ padding: "1.5rem" }}>
      <h2
        style={{
          marginBottom: "1.5rem",
          color: "#333",
          fontSize: "1.8rem",
          fontWeight: "bold",
        }}
      >
        馃幃 Noticias y Ofertas Gaming
      </h2>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          maxHeight: "70vh",
          overflowY: "auto",
          paddingRight: "0.5rem",
        }}
      >
        {noticias.map((noticia) => (
          <div
            key={noticia.id}
            style={{
              display: "flex",
              backgroundColor: "#fff",
              borderRadius: "12px",
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              cursor: "pointer",
              border: "1px solid #e9ecef",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
            }}
          >
            {/* Imagen */}
            <div
              style={{
                width: "120px",
                height: "80px",
                flexShrink: 0,
                position: "relative",
              }}
            >
              <img
                src={noticia.imagen}
                alt={noticia.titulo}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  top: "4px",
                  left: "4px",
                  backgroundColor: getCategoriaColor(noticia.categoria),
                  color: "white",
                  padding: "2px 6px",
                  borderRadius: "4px",
                  fontSize: "0.7rem",
                  fontWeight: "bold",
                }}
              >
                {noticia.categoria}
              </div>
            </div>

            {/* Contenido */}
            <div
              style={{
                flex: 1,
                padding: "0.75rem",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h4
                  style={{
                    margin: "0 0 0.5rem 0",
                    fontSize: "0.9rem",
                    fontWeight: "600",
                    color: "#333",
                    lineHeight: "1.3",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {noticia.titulo}
                </h4>
                <p
                  style={{
                    margin: "0",
                    fontSize: "0.75rem",
                    color: "#666",
                    lineHeight: "1.4",
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                  }}
                >
                  {noticia.descripcion}
                </p>
              </div>

              <div
                style={{
                  marginTop: "0.5rem",
                  fontSize: "0.7rem",
                  color: "#999",
                  fontWeight: "500",
                }}
              >
                {noticia.fecha}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bot贸n para ver m谩s */}
      <div
        style={{
          textAlign: "center",
          marginTop: "1rem",
          paddingTop: "1rem",
          borderTop: "1px solid #e9ecef",
        }}
      >
        <button
          style={{
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            padding: "0.5rem 1.5rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: "0.9rem",
            fontWeight: "500",
            transition: "background-color 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#0056b3";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#007bff";
          }}
        >
          Ver m谩s noticias
        </button>
      </div>
    </div>
  );
};
