import React, { createContext, useContext, useState, ReactNode } from "react";

interface NavigationContextType {
  navigateToGameForum: (gameId: string, gameName: string) => void;
  currentGameForum: { gameId: string; gameName: string } | null;
  clearGameForum: () => void;
}

const NavigationContext = createContext<NavigationContextType | undefined>(
  undefined
);

export const useNavigation = () => {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within NavigationProvider");
  }
  return context;
};

export const NavigationProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [currentGameForum, setCurrentGameForum] = useState<{
    gameId: string;
    gameName: string;
  } | null>(null);

  const navigateToGameForum = (gameId: string, gameName: string) => {
    setCurrentGameForum({ gameId, gameName });
  };

  const clearGameForum = () => {
    setCurrentGameForum(null);
  };

  return (
    <NavigationContext.Provider
      value={{ navigateToGameForum, currentGameForum, clearGameForum }}
    >
      {children}
    </NavigationContext.Provider>
  );
};
