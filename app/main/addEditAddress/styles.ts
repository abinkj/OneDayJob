import { StyleSheet, Platform } from 'react-native';
import { ThemeColors } from '../../../constants/Colors';

export const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        flex: {
            flex: 1,
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            padding: 20,
            paddingBottom: 20,
        },
        section: {
            marginBottom: 24,
        },
        label: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.black,
            marginBottom: 8,
        },
        pickerContainer: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            backgroundColor: colors.white,
        },
        picker: {
            height: 50,
        },
        selectedLocationCard: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            backgroundColor: colors.categoryBox,
            padding: 12,
            borderRadius: 8,
            marginBottom: 24,
            gap: 12,
        },
        selectedLocationInfo: {
            flex: 1,
        },
        selectedLocationText: {
            fontSize: 14,
            fontWeight: '600',
            color: colors.black,
            marginBottom: 4,
        },
        selectedLocationSubText: {
            fontSize: 13,
            color: colors.grey,
        },
        input: {
            borderWidth: 1,
            borderColor: colors.border,
            borderRadius: 8,
            paddingHorizontal: 12,
            paddingVertical: 12,
            fontSize: 16,
            color: colors.black,
            backgroundColor: colors.white,
        },
        required: {
            color: colors.primary,
            fontSize: 16,
        },
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 8,
            marginBottom: 24,
        },
        checkbox: {
            width: 24,
            height: 24,
            borderRadius: 6,
            borderWidth: 2,
            borderColor: colors.border,
            marginRight: 12,
            justifyContent: 'center',
            alignItems: 'center',
        },
        checkboxChecked: {
            backgroundColor: colors.primary,
            borderColor: colors.primary,
        },
        checkboxLabel: {
            fontSize: 15,
            color: colors.black,
        },
        footer: {
            padding: 20,
            paddingBottom: Platform.OS === 'ios' ? 30 : 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            backgroundColor: colors.white,
        },
        saveButton: {
            backgroundColor: colors.primary,
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
        },
        saveButtonDisabled: {
            opacity: 0.5,
        },
        saveButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.white,
        },
    });
