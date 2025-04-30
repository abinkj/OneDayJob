import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import DeviceDimensions from '../constants/DeviceDimenions';
import { Colors } from '../constants/Colors';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';


const CustomTabBar = ({ state, descriptors, navigation }) => {
    const focusedOptions = descriptors[state.routes[state.index].key].options;
    const currentRoute = state.routes[state.index];
    const routeName =
        getFocusedRouteNameFromRoute(currentRoute) || currentRoute.name;

    // List of screens where tab bar should be hidden
    const hiddenTabBarScreens = ['PostJob']; // Add others as needed

    if (hiddenTabBarScreens.includes(routeName)) {
        return null; // Don't render the tab bar
    }

    if (focusedOptions.tabBarVisible === false) {
        return null;
    };
    if (['PostJob'].includes(routeName)) {
        return null;
    };

    return (
        <View style={styles.container}>
            <View style={styles.tabBar}>
                {/* Home Tab */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigation.navigate('Home')}
                >
                    <View style={styles.tabIconContainer}>
                        <Image
                            source={state.index === 0 ? require('../assets/icons/homeO.png') : require('../assets/icons/home.png')}
                            style={styles.icon}
                        />
                        {state.index === 0 && <View style={styles.activeTabLine} />}
                    </View>
                    <Text style={[
                        styles.tabText,
                        { color: state.index === 0 ? Colors.tabBlue : Colors.tabGrey }
                    ]}>
                        Home
                    </Text>
                </TouchableOpacity>

                {/* Status Tab */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigation.navigate('Status')}
                >
                    <View style={styles.tabIconContainer}>
                        <Image
                            source={state.index === 1 ? require('../assets/icons/statusO.png') : require('../assets/icons/status.png')}
                            style={styles.icon}
                        />
                        {state.index === 1 && <View style={styles.activeTabLine} />}
                    </View>
                    <Text style={[
                        styles.tabText,
                        { color: state.index === 1 ? Colors.tabBlue : Colors.tabGrey }
                    ]}>
                        Status
                    </Text>
                </TouchableOpacity>

                {/* Center Button for Post Job */}
                <View style={styles.centerButtonContainer}>
                    <TouchableOpacity
                        style={styles.centerButton}
                        onPress={() => navigation.navigate('PostJob')}
                    >
                        <View style={styles.centerButtonOutline}>
                            <Image
                                source={require('../assets/icons/plus.png')}
                                style={styles.addIcon}
                            />
                        </View>
                    </TouchableOpacity>
                    <Text style={[
                        styles.JobPostText,
                        { color: state.index === 2 ? Colors.tabBlue : Colors.tabGrey }
                    ]}>
                        Post Job
                    </Text>
                </View>

                {/* Chat Tab */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigation.navigate('Chat')}
                >
                    <View style={styles.tabIconContainer}>
                        <Image
                            source={state.index === 3 ? require('../assets/icons/chatO.png') : require('../assets/icons/chat.png')}
                            style={styles.icon}
                        />
                        {state.index === 3 && <View style={styles.activeTabLine} />}
                    </View>
                    <Text style={[
                        styles.tabText,
                        { color: state.index === 3 ? Colors.tabBlue : Colors.tabGrey }
                    ]}>
                        Chat
                    </Text>
                </TouchableOpacity>

                {/* Profile Tab */}
                <TouchableOpacity
                    style={styles.tabItem}
                    onPress={() => navigation.navigate('Profile')}
                >
                    <View style={styles.tabIconContainer}>
                        <Image
                            source={state.index === 4 ? require('../assets/icons/profileO.png') : require('../assets/icons/profile.png')}
                            style={styles.icon}
                        />
                        {state.index === 4 && <View style={styles.activeTabLine} />}
                    </View>
                    <Text style={[
                        styles.tabText,
                        { color: state.index === 4 ? Colors.tabBlue : Colors.tabGrey }
                    ]}>
                        Profile
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 0,
        width: DeviceDimensions.screenWidth,
        backgroundColor: 'transparent',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.8,
        shadowRadius: 3.84,
        elevation: 5,
    },
    tabBar: {
        flexDirection: 'row',
        backgroundColor: Colors.white,
        height: 75 * DeviceDimensions.heightRatio,
        width: DeviceDimensions.screenWidth,
        alignItems: 'center',
        justifyContent: 'space-around',

    },
    tabItem: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    tabIconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    activeTabLine: {
        position: 'absolute',
        top: -10, // Adjust this value to position the line above the icon
        width: 24, // Match the width of the icon
        height: 2,
        backgroundColor: Colors.tabBlue,
    },
    tabText: {
        fontSize: 12,
        fontFamily: 'regular',
        marginTop: 5,
    },
    JobPostText: {
        fontSize: 12,
        fontFamily: 'regular',
        marginTop: 5,
    },
    centerButtonContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20 * DeviceDimensions.heightRatio,
    },
    centerButton: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 55 * DeviceDimensions.widthRatio,
        height: 55 * DeviceDimensions.widthRatio,
        borderRadius: 27.5 * DeviceDimensions.widthRatio,
        backgroundColor: Colors.blue,
        borderWidth: 5, // Adjust border width
        borderColor: Colors.white,
    },
    centerButtonOutline: {
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderColor: Colors.white,
        height: 35 * DeviceDimensions.heightRatio,
        width: 35 * DeviceDimensions.widthRatio,
        borderRadius: 17.5,
        justifyContent: 'center',
        alignItems: 'center',
    },
    icon: {
        width: 24,
        height: 24,
    },
    addIcon: {
        width: 16,
        height: 16,
        tintColor: Colors.white,
    },
});

export default CustomTabBar;