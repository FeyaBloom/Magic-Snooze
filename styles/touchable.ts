// Универсальные параметры для тачабл элементов
export const TOUCHABLE_CONFIG = {
  // Прозрачность при нажатии (0.0 - 1.0)
  activeOpacity: 0.7,
  
  // Параметры для hover/press эффектов
  pressScale: 0.98, // Легкое "вдавливание" при нажатии
  
  // Увеличение тени при hover
  shadowHover: {
    // @ts-ignore
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.3)',
  },
  
  // Обычная тень
  shadowNormal: {
    // @ts-ignore
    boxShadow: '0 2px 3px rgba(0, 0, 0, 0.1)',
  },
} as const;

// Утилита для добавления тени к карточкам
export const getCardShadowStyle = (colors: any) => ({
  // @ts-ignore
  boxShadow: `0 2px 4px ${colors.secondary || '#000'}26`,
});
