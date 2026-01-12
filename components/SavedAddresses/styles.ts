import { StyleSheet } from 'react-native';
import { ThemeColors } from '../../constants/Colors';

export const createStyles = (colors: ThemeColors) =>
    StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: colors.background,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: colors.background,
        },
        listContainer: {
            padding: 16,
            paddingBottom: 100,
        },
        addressCard: {
            backgroundColor: colors.white,
            borderRadius: 12,
            padding: 16,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 4,
            elevation: 2,
        },
        addressHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
        },
        addressLabelContainer: {
            flex: 1,
            flexDirection: 'row',
            alignItems: 'flex-start',
        },
        iconContainer: {
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.categoryBox,
            justifyContent: 'center',
            alignItems: 'center',
            marginRight: 12,
        },
        addressInfo: {
            flex: 1,
        },
        labelRow: {
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 4,
        },
        addressLabel: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.black,
            marginRight: 8,
        },
        defaultBadge: {
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: '#FFF9E6',
            paddingHorizontal: 8,
            paddingVertical: 2,
            borderRadius: 12,
            gap: 4,
        },
        defaultText: {
            fontSize: 11,
            fontWeight: '600',
            color: '#B8860B',
        },
        addressText: {
            fontSize: 14,
            color: colors.black,
            marginBottom: 2,
        },
        addressSubText: {
            fontSize: 13,
            color: colors.grey,
        },
        actionsContainer: {
            flexDirection: 'row',
            gap: 8,
        },
        actionButton: {
            padding: 8,
        },
        emptyContainer: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 60,
            paddingHorizontal: 40,
        },
        emptyText: {
            fontSize: 18,
            fontWeight: '600',
            color: colors.black,
            marginTop: 16,
            textAlign: 'center',
        },
        emptySubText: {
            fontSize: 14,
            color: colors.grey,
            marginTop: 8,
            textAlign: 'center',
        },
        addButton: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: colors.primary,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            paddingVertical: 16,
            borderRadius: 12,
            gap: 8,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.2,
            shadowRadius: 8,
            elevation: 6,
        },
        addButtonText: {
            fontSize: 16,
            fontWeight: '600',
            color: colors.white,
        },
    });
