import { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '../../utils/COLORS';
const { width } = Dimensions.get('window');
const Calendar = ({ visible, onClose, selectedDate, onDateSelect, minDate, maxDate }) => {
  const currentYear = new Date().getFullYear();
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(currentYear);
  const [selectedDay, setSelectedDay] = useState(selectedDate ? new Date(selectedDate) : null);
  const [showMonthDropdown, setShowMonthDropdown] = useState(false);
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const months = [
    'Ianuarie', 'Februarie', 'Martie', 'Aprilie', 'Mai', 'Iunie',
    'Iulie', 'August', 'Septembrie', 'Octombrie', 'Noiembrie', 'Decembrie'
  ];
  const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  // Generate year options starting from current year
  const generateYears = () => {
    const years = [];
    for (let i = currentYear; i <= currentYear + 50; i++) {
      years.push(i);
    }
    return years;
  };
  useEffect(() => {
    if (selectedDate) {
      const date = new Date(selectedDate);
      setSelectedDay(date);
      setSelectedMonth(date.getMonth());
      setSelectedYear(date.getFullYear());
    }
  }, [selectedDate]);
  const getDaysInMonth = (month, year) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startDate = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Monday = 0
    const days = [];
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startDate; i++) {
      days.push(null);
    }
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };
  const handleDayPress = (day) => {
    if (!day) return;
    const newDate = new Date(selectedYear, selectedMonth, day);
    // Check if date is within allowed range
    if (minDate && newDate < new Date(minDate)) return;
    if (maxDate && newDate > new Date(maxDate)) return;
    setSelectedDay(newDate);
  };
  const handleConfirm = () => {
    if (selectedDay) {
      // Format date as YYYY-MM-DD
      const year = selectedDay.getFullYear();
      const month = String(selectedDay.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDay.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      onDateSelect(formattedDate);
    }
    onClose();
  };
  const isDateDisabled = (day) => {
    if (!day) return true;
    const date = new Date(selectedYear, selectedMonth, day);
    if (minDate && date < new Date(minDate)) return true;
    if (maxDate && date > new Date(maxDate)) return true;
    return false;
  };
  const isToday = (day) => {
    if (!day) return false;
    const today = new Date();
    const date = new Date(selectedYear, selectedMonth, day);
    return date.toDateString() === today.toDateString();
  };
  const isSelected = (day) => {
    if (!day || !selectedDay) return false;
    const date = new Date(selectedYear, selectedMonth, day);
    return date.toDateString() === selectedDay.toDateString();
  };
  const renderCalendarGrid = () => {
    const days = getDaysInMonth(selectedMonth, selectedYear);
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks.map((week, weekIndex) => (
      <View key={weekIndex} style={styles.weekRow}>
        {week.map((day, dayIndex) => (
          <TouchableOpacity
            key={`${weekIndex}-${dayIndex}`}
            style={[
              styles.dayButton,
              isSelected(day) && styles.selectedDayButton,
              isToday(day) && !isSelected(day) && styles.todayButton,
              isDateDisabled(day) && styles.disabledDayButton,
            ]}
            onPress={() => handleDayPress(day)}
            disabled={isDateDisabled(day)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayText,
                isSelected(day) && styles.selectedDayText,
                isToday(day) && !isSelected(day) && styles.todayText,
                isDateDisabled(day) && styles.disabledDayText,
              ]}
            >
              {day || ''}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    ));
  };
  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.calendarContainer}>
          {/* Header with Month and Year Selectors */}
          <View style={styles.calendarHeader}>
            <View style={styles.selectorContainer}>
              <TouchableOpacity 
                style={styles.selector}
                onPress={() => {
                  setShowMonthDropdown(!showMonthDropdown);
                  setShowYearDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.selectorText}>
                  {months[selectedMonth]}
                </Text>
                <Ionicons 
                  name={showMonthDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={COLORS.primary} 
                />
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.selector}
                onPress={() => {
                  setShowYearDropdown(!showYearDropdown);
                  setShowMonthDropdown(false);
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.selectorText}>
                  {selectedYear}
                </Text>
                <Ionicons 
                  name={showYearDropdown ? "chevron-up" : "chevron-down"} 
                  size={20} 
                  color={COLORS.primary} 
                />
              </TouchableOpacity>
            </View>
          </View>
          {/* Month Dropdown */}
          {showMonthDropdown && (
            <View style={styles.dropdown}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {months.map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.dropdownItem,
                      selectedMonth === index && styles.selectedDropdownItem
                    ]}
                    onPress={() => {
                      setSelectedMonth(index);
                      setShowMonthDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedMonth === index && styles.selectedDropdownItemText
                    ]}>
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {/* Year Dropdown */}
          {showYearDropdown && (
            <View style={styles.dropdown}>
              <ScrollView showsVerticalScrollIndicator={false}>
                {generateYears().map((year) => (
                  <TouchableOpacity
                    key={year}
                    style={[
                      styles.dropdownItem,
                      selectedYear === year && styles.selectedDropdownItem
                    ]}
                    onPress={() => {
                      setSelectedYear(year);
                      setShowYearDropdown(false);
                    }}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.dropdownItemText,
                      selectedYear === year && styles.selectedDropdownItemText
                    ]}>
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}
          {/* Week days header */}
          <View style={styles.weekDaysContainer}>
            {weekDays.map((day, index) => (
              <View key={index} style={styles.weekDayContainer}>
                <Text style={styles.weekDayText}>{day}</Text>
              </View>
            ))}
          </View>
          {/* Calendar grid */}
          <View style={styles.calendarGrid}>
            {renderCalendarGrid()}
          </View>
          {/* Footer buttons */}
          <View style={styles.calendarFooter}>
            <TouchableOpacity
              style={[styles.footerButton, styles.cancelButton]}
              onPress={onClose}
              activeOpacity={0.7}
            >
              <Text style={styles.cancelButtonText}>Anulează</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.footerButton, styles.confirmButton]}
              onPress={handleConfirm}
              activeOpacity={0.7}
            >
              <Text style={styles.confirmButtonText}>Confirmă</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};
const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarContainer: {
    backgroundColor: COLORS.background,
    borderRadius: 20,
    width: width - 40,
    maxHeight: '80%',
    // Neumorphic shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
    // Inner light effect
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  calendarHeader: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  selectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  selector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.card,
    minWidth: 120,
    justifyContent: 'center',
    // Neumorphic shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  selectorText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.dark,
    marginRight: 8,
  },
  dropdown: {
    backgroundColor: COLORS.card,
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 12,
    maxHeight: 200,
    // Neumorphic shadow
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: COLORS.border,
  },
  selectedDropdownItem: {
    backgroundColor: COLORS.selected,
  },
  dropdownItemText: {
    fontSize: 16,
    color: COLORS.dark,
    textAlign: 'center',
  },
  selectedDropdownItemText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  weekDaysContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  weekDayContainer: {
    flex: 1,
    alignItems: 'center',
  },
  weekDayText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.medium,
  },
  calendarGrid: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  weekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  dayButton: {
    flex: 1,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 22,
    marginHorizontal: 2,
  },
  selectedDayButton: {
    backgroundColor: COLORS.primary,
    // Neumorphic selected effect
    shadowColor: COLORS.primary,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  todayButton: {
    backgroundColor: COLORS.accent2,
    opacity: 0.8,
  },
  disabledDayButton: {
    opacity: 0.3,
  },
  dayText: {
    fontSize: 16,
    color: COLORS.dark,
    fontWeight: '500',
  },
  selectedDayText: {
    color: COLORS.card,
    fontWeight: '600',
  },
  todayText: {
    color: COLORS.card,
    fontWeight: '600',
  },
  disabledDayText: {
    color: COLORS.light,
  },
  calendarFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  footerButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
    // Neumorphic button base
    shadowColor: '#000000',
    shadowOffset: {
      width: 2,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cancelButton: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.medium,
  },
  confirmButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.card,
  },
});
export default Calendar;