import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const MAX_DAY_WIDTH = 75; 
export const dayWidth = Math.min((screenWidth - 8) / 7, MAX_DAY_WIDTH);

const MIN_DAY_WIDTH = 30;

export const calculateDayWidth = (containerWidth?: number) => {
  const availableWidth = containerWidth ? containerWidth - 80 : screenWidth - 80;
  const calculatedWidth = availableWidth / 7;
  return Math.max(MIN_DAY_WIDTH, Math.min(calculatedWidth, MAX_DAY_WIDTH));
};

export const createCalendarStyles = (colors: any, dayWidthOverride?: number) => {
  const resolvedDayWidth = dayWidthOverride ?? dayWidth;

  return StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    zIndex: 0,
  },
  scrollView: {
    flex: 1,
    zIndex: 5,
  },

  selectedDay: {
    backgroundColor: colors.primary,
    borderRadius: (resolvedDayWidth * 0.8) / 2, 
  },

  selectedDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },

  disabledDay: {
    opacity: 0.3,
  },

  disabledDayText: {
    color: colors.textSecondary,
    opacity: 0.5,
  },

  header: {
    padding: 20,
    paddingTop: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    color: colors.text,
    marginBottom: 8,
    textAlign: 'center',
    fontFamily: 'CabinSketch-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'CabinSketch-Regular',
  },
  calendarContainer: {
    backgroundColor: colors.surface,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    // @ts-ignore
    boxShadow: `0 3px 6px ${colors.secondary}33`,
    opacity: 0.75,
  },
  monthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  navButton: {
    padding: 18,
    borderRadius: 20,
    backgroundColor: colors.secondary + '30',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
  },
  monthTitle: {
    fontSize: 18,
    color: colors.text,
    fontFamily: 'ComicNeue-Bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    width: resolvedDayWidth,
    fontFamily: 'ComicNeue-Bold',
    alignItems: 'center',
  },
  daysContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    textAlign: 'center',
    alignItems: 'center',
  },
  dayContainer: {
    width: resolvedDayWidth,
    height: resolvedDayWidth, 
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCell: {
    width: resolvedDayWidth * 0.8,
    height: resolvedDayWidth * 0.8, 
    borderRadius: (resolvedDayWidth * 0.8) / 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: colors.text,
    fontFamily: 'ComicNeue-Regular',
  },
  otherMonth: {
    opacity: 0.3,
  },
  otherMonthText: {
    color: colors.textSecondary,
  },
  today: {
    backgroundColor: colors.primary + '50',
    borderRadius: (resolvedDayWidth * 0.8) / 2, 
    borderWidth: 2,
    borderColor: colors.primary,
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  completeDay: {
    borderWidth: 2,
    borderColor: colors.accent,
    // @ts-ignore
    boxShadow: `0 0 12px ${colors.accent}cc`,
  },
  partialDay: {
    borderWidth: 2,
    borderColor: colors.secondary,
    // @ts-ignore
    boxShadow: `0 0 12px ${colors.secondary}cc`,
  },
  snoozedDay: {
    borderWidth: 2,
    borderColor: colors.primary,
    // @ts-ignore
    boxShadow: `0 0 12px ${colors.primary}cc`,
  },
  statusDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    alignSelf: 'center',
    alignItems: 'center',
  },
  statusEmoji: {
    fontSize: 12,
  },
  statsContainer: {
    backgroundColor: colors.surface,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    // @ts-ignore
    boxShadow: `0 2px 4px ${colors.secondary}66`,
    opacity: 0.75,
  },
  statsTitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'CabinSketch-Regular',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statItem: {
    width: '48%',
    alignItems: 'center',
    marginBottom: 16,
  },
  statNumber: {
    fontSize: 24,
    color: colors.secondary,
    marginBottom: 4,
    fontFamily: 'ComicNeue-Bold',
  },
  statLabel: {
    fontSize: 15,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'ComicNeue-Regular',
  },

  // Базовый стиль для всех карточек (card container)
  card: {
    backgroundColor: colors.surface,
    borderRadius: 16,
    padding: 16,
    // @ts-ignore
    boxShadow: `0 2px 4px ${colors.secondary}66`,
    opacity: 0.85,
    marginVertical: 14,
  },

  // Компактная карточка (меньше padding, для статов)
  compactCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    // @ts-ignore
    boxShadow: `0 1px 3px ${colors.secondary}4d`,
    opacity: 0.85,
  },

  // Карточка для строк в списках
  rowCard: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    // @ts-ignore
    boxShadow: `0 1px 3px ${colors.secondary}4d`,
    opacity: 0.85,
  },

  // Заголовок для секций
  sectionHeader: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 12,
    fontFamily: 'CabinSketch-Regular',
  },

  // Акцентная линия на левом краю карточки
  accentBorder: {
    borderLeftWidth: 4,
    borderLeftColor: colors.accent,
  },

  secondaryBorder: {
    borderLeftWidth: 4,
    borderLeftColor: colors.secondary,
  },

  primaryBorder: {
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
  },

  // Контейнер для ряда статс-карт (3 или 2 колонки)
  statCardRow: {
    flexDirection: 'row',
    gap: 12,
  },

  // Отдельная карточка статса (получает flex: 1)
  statCard: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  // Иконка задачи на дне календаря
  taskIcon: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: 9 }, { translateY: 9 }],
  },
  taskIconText: {
    fontSize: 14,
  },

  // Tooltip для информации
  tooltip: {
    backgroundColor: colors.surface,
    borderRadius: 10,
    padding: 12,
    // @ts-ignore
    boxShadow: `0 2px 4px ${colors.secondary}66`,
    minWidth: 160,
    maxWidth: 260,
  },
  tooltipContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1001,
  },

  // Badge для достижений
  achievementBadge: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.accent,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    // @ts-ignore
    boxShadow: `0 0 12px ${colors.accent}cc`,
  },
  achievementEmoji: {
    fontSize: 24,
  },

  // Заголовок секции с иконкой
  sectionHeaderWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  sectionHeaderWithIconVertical: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 8,
  },
});
};