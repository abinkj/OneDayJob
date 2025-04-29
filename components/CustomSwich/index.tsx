import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { styles } from './styles';
import { Colors } from '../../constants/Colors';

const CustomSwitch = ({
  value = false,
  onValueChange,
  disabled = false,
}) => {
  // Animation for thumb position
  const thumbPosition = useRef(new Animated.Value(value ? 20 : 0)).current;
  
  // Animation for thumb size
  const thumbSize = useRef(new Animated.Value(value ? 24 : 16)).current;
  
  // Update animations when value changes
  useEffect(() => {
    Animated.parallel([
      Animated.timing(thumbPosition, {
        toValue: value ? 20 : 0,
        duration: 200,
        useNativeDriver: false,
      }),
      Animated.timing(thumbSize, {
        toValue: value ? 24 : 16,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start();
  }, [value, thumbPosition, thumbSize]);

  const handleToggle = () => {
    if (!disabled) {
      onValueChange(!value);
    }
  };

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={handleToggle}
      disabled={disabled}
      style={[styles.container]}
    >
      <View
        style={[
          styles.track,
          {
            backgroundColor: value ? Colors.switchBlue : Colors.switchGrey,
            opacity: disabled ? 0.5 : 1,
          },
          !value&&{
            borderWidth:2,
            borderColor:Colors.switchBorder,
        }
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              transform: [{ translateX: thumbPosition }],
              width: thumbSize,
              height: thumbSize,
              backgroundColor:value? Colors.white:Colors.switchBorder,
            },
          ]}
        />
      </View>
    </TouchableOpacity>
  );
};


export default CustomSwitch;