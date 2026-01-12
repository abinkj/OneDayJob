import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants/Colors';

export const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        modalContainer: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
        },
        modalContent: {
            backgroundColor: colors.white,
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            maxHeight: '90%',
        },
        modalHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 20,
            borderBottomWidth: 1,
            borderBottomColor: colors.border,
        },
        modalTitle: {
            fontSize: 20,
            fontWeight: '700',
            color: colors.black,
        },
        closeButton: {
            padding: 4,
        },
        modalBody: {
            padding: 20,
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
            marginTop: 12,
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
        checkboxContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            marginTop: 16,
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
        modalFooter: {
            padding: 20,
            borderTopWidth: 1,
            borderTopColor: colors.border,
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
    });
