import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TouchableWithoutFeedback, Dimensions } from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';

interface CalendarModalProps {
    isVisible: boolean;
    onClose: () => void;
    onSelectDate: (date: Date) => void;
    initialDate?: Date;
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export default function CalendarModal({ isVisible, onClose, onSelectDate, initialDate }: CalendarModalProps) {
    const [currentMonth, setCurrentMonth] = useState(initialDate || new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(initialDate || null);

    useEffect(() => {
        if (isVisible && initialDate) {
            setCurrentMonth(new Date(initialDate));
            setSelectedDate(new Date(initialDate));
        } else if (isVisible) {
            setCurrentMonth(new Date());
        }
    }, [isVisible, initialDate]);

    const getDaysInMonth = (year: number, month: number) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year: number, month: number) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDatePress = (day: number) => {
        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        setSelectedDate(newDate);
        onSelectDate(newDate);
        onClose();
    };

    const renderCalendarGrid = () => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const daysInPrevMonth = getDaysInMonth(year, month - 1);

        const days = [];
        let key = 0;

        // Previous month's padding days
        for (let i = firstDay - 1; i >= 0; i--) {
             days.push(
                <View key={`prev-${key++}`} style={styles.dayCell}>
                     <Text style={[styles.dayText, styles.fadedDayText]}>{daysInPrevMonth - i}</Text>
                </View>
             );
        }

        // Current month's days
        for (let i = 1; i <= daysInMonth; i++) {
            const date = new Date(year, month, i);
            const isSelected = selectedDate?.getDate() === i && 
                               selectedDate?.getMonth() === month && 
                               selectedDate?.getFullYear() === year;
            
            const today = new Date();
            today.setHours(23, 59, 59, 999);
            const isFuture = date > today;

            days.push(
                <TouchableOpacity 
                    key={`curr-${key++}`} 
                    style={[styles.dayCell, isSelected && styles.selectedDayCell]}
                    onPress={() => !isFuture && handleDatePress(i)}
                    disabled={isFuture}
                >
                    <Text style={[
                        styles.dayText, 
                        isSelected && styles.selectedDayText,
                        isFuture && styles.fadedDayText
                    ]}>{i}</Text>
                </TouchableOpacity>
            );
        }

        // Next month's padding days to finish the grid (mostly to make 6 rows if needed)
        const remainingCells = 42 - days.length; // 6 rows * 7 days = 42
        for (let i = 1; i <= remainingCells; i++) {
            days.push(
                <View key={`next-${key++}`} style={styles.dayCell}>
                     <Text style={[styles.dayText, styles.fadedDayText]}>{i}</Text>
                </View>
            );
        }

        // Chunk by weeks
        const weeks = [];
        for (let i = 0; i < days.length; i += 7) {
            weeks.push(
                <View key={`week-${i}`} style={styles.weekRow}>
                    {days.slice(i, i + 7)}
                </View>
            );
        }

        return weeks;
    };

    const monthYearString = currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return (
        <Modal
            visible={isVisible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <View style={styles.overlay}>
                <TouchableWithoutFeedback onPress={onClose}>
                    <View style={styles.backdrop} />
                </TouchableWithoutFeedback>
                
                <View style={styles.modalContent}>
                    {/* Header */}
                    <View style={styles.header}>
                        <TouchableOpacity onPress={handlePrevMonth} style={styles.navButton}>
                            <ChevronLeft size={24} color="#111827" />
                        </TouchableOpacity>
                        <Text style={styles.monthTitle}>{monthYearString}</Text>
                        <TouchableOpacity onPress={handleNextMonth} style={styles.navButton}>
                            <ChevronRight size={24} color="#111827" />
                        </TouchableOpacity>
                    </View>

                    {/* Weekdays */}
                    <View style={styles.weekdaysRow}>
                        {WEEKDAYS.map((day) => (
                            <Text key={day} style={styles.weekdayText}>{day}</Text>
                        ))}
                    </View>

                    {/* Calendar Grid */}
                    <View style={styles.gridContainer}>
                        {renderCalendarGrid()}
                    </View>
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    backdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    modalContent: {
        width: 340,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        elevation: 5,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 24,
    },
    navButton: {
        padding: 4,
    },
    monthTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    weekdaysRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    weekdayText: {
        width: 40,
        textAlign: 'center',
        fontSize: 12,
        fontWeight: '500',
        color: '#9CA3AF',
    },
    gridContainer: {
        flexDirection: 'column',
    },
    weekRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    dayCell: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 20,
    },
    selectedDayCell: {
        backgroundColor: '#3B5998', // Adjust mapping if standard is different
    },
    dayText: {
        fontSize: 15,
        color: '#111827',
        fontWeight: '500',
    },
    fadedDayText: {
        color: '#D1D5DB',
    },
    selectedDayText: {
        color: '#FFFFFF',
        fontWeight: 'bold',
    }
});
