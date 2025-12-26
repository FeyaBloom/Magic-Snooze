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
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
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
    height: dayWidth, 
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  dayCell: {
    width: dayWidth * 0.8,
    height: dayWidth * 0.8, 
    borderRadius: (dayWidth * 0.8) / 2,
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
    borderRadius: (dayWidth * 0.8) / 2, 
    borderWidth: 2,
    borderColor: colors.primary,
  },
  todayText: {
    color: colors.primary,
    fontWeight: 'bold',
  },
  completeDay: {
    backgroundColor: colors.accent,
    borderRadius: (dayWidth * 0.8) / 2, 
  },
  partialDay: {
    backgroundColor: colors.secondary,
    borderRadius: (dayWidth * 0.8) / 2, 
  },
  snoozedDay: {
    backgroundColor: colors.primary,
    borderRadius: (dayWidth * 0.8) / 2, 
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
  legendContainer: {
    backgroundColor: colors.surface,
    marginBottom: 20,
    borderRadius: 16,    
    padding: 20,
    paddingLeft: 30,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 3,
    opacity: 0.75,
    justifyContent: 'center',

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
    width: 14,
    height: 14,
    borderRadius: 7,
    marginHorizontal: 8,
  },
  completeLegend: {
    backgroundColor: colors.accent,
  },
  partialLegend: {
    backgroundColor: colors.secondary,
  },
  snoozedLegend: {
    backgroundColor: colors.primary,
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
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
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