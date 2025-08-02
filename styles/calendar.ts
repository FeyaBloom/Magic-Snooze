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
  // Добавьте только эти стили в ваш createCalendarStyles:

selectedDay: {
  backgroundColor: colors.primary,
},

selectedDayText: {
  color: '#FFFFFF',
  fontWeight: '700',
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
    fontSize: 24,
    fontWeight: '1000',
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
    backgroundColor: colors.primary + '30',
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 20,
    marginRight: 20,
  },
  monthTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.text,
    fontFamily: 'CabinSketch-Bold',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
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
    height: 60,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCell: {
    width: dayWidth * 0.8,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  dayText: {
    fontSize: 16,
    color: colors.text,
    fontWeight: '500',
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
  },
  todayText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  completeDay: {
    backgroundColor: colors.accent,
  },
  partialDay: {
    backgroundColor: colors.primary,
  },
  snoozedDay: {
    backgroundColor: colors.secondary,
  },
  statusDayText: {
    color: '#FFFFFF',
    fontWeight: '700',
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
    padding: 20,
    shadowColor: '#cccccc',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    opacity: 0.75,
  },
  legendTitle: {
    fontSize: 18,
    fontWeight: '1000',
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
    width: '48%',
    marginBottom: 12,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 6,
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
    fontSize: 14,
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
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
    marginBottom: 16,
    textAlign: 'center',
    fontFamily: 'CabinSketch-Bold',
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
    fontWeight: '700',
    color: colors.secondary,
    marginBottom: 4,
    fontFamily: 'ComicNeue-Bold',
  },
  statLabel: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
    fontFamily: 'ComicNeue-Regular',
  },
});
