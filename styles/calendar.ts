import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
export const dayWidth = (screenWidth - 80) / 7;

export const createCalendarStyles = (colors: any) => StyleSheet.create({
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
    borderRadius: (dayWidth * 0.8) / 2, // Делаем идеальный круг
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
    shadowColor: '#cccccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    opacity: 0.75,
    alignItems: 'center',
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
    fontSize: 20,
    color: colors.text,
    fontFamily: 'CabinSketch-Regular',
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
    width: dayWidth,
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
    width: dayWidth,
    height: dayWidth, // Делаем контейнер квадратным
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCell: {
    width: dayWidth * 0.8,
    height: dayWidth * 0.8, // ИСПРАВЛЕНО: делаем квадратным для идеального круга
    borderRadius: (dayWidth * 0.8) / 2, // ИСПРАВЛЕНО: радиус = половина размера для круга
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
    borderRadius: (dayWidth * 0.8) / 2, // ИСПРАВЛЕНО: тоже круг
    borderWidth: 2,
    borderColor: colors.primary,
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  completeDay: {
    backgroundColor: colors.accent,
    borderRadius: (dayWidth * 0.8) / 2, // ИСПРАВЛЕНО
  },
  partialDay: {
    backgroundColor: colors.primary,
    borderRadius: (dayWidth * 0.8) / 2, // ИСПРАВЛЕНО
  },
  snoozedDay: {
    backgroundColor: colors.secondary,
    borderRadius: (dayWidth * 0.8) / 2, // ИСПРАВЛЕНО
  },
  statusDayText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  statusDot: {
    position: 'absolute',
    top: 2,
    right: 2,
  },
  statusEmoji: {
    fontSize: 12,
  },
  legendContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,    
    padding: 10,
    shadowColor: '#cccccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    opacity: 0.75,
  },
  legendTitle: {
    fontSize: 20,
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'CabinSketch-Regular',
  },
  legendGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '49%',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  completeLegend: {
    backgroundColor: colors.accent,
  },
  partialLegend: {
    backgroundColor: colors.primary,
  },
  snoozedLegend: {
    backgroundColor: colors.secondary,
  },
  noneLegend: {
    backgroundColor: '#E5E7EB',
  },
  legendText: {
    fontSize: 13,
    color: colors.text,
    flex: 1,
    fontFamily: 'ComicNeue-Regular',
  },
  statsContainer: {
    backgroundColor: colors.surface,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#cccccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
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
});