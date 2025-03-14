import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';

export default function HeartScoreUI({ score = 0 }) {
  const radius = 60; // รัศมีวงกลม
  const strokeWidth = 12; // ความหนาของเส้น
  const circumference = 2 * Math.PI * radius; // คำนวณเส้นรอบวง
  const animatedValue = new Animated.Value(0); // Animation ค่าเริ่มต้น
  
  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: Math.min(score, 100), // ป้องกันค่าเกิน 100 ใน animation
      duration: 1000, // ทำให้เคลื่อนที่ลื่นใน 1 วินาที
      useNativeDriver: false,
    }).start();
  }, [score]);

  const strokeDashoffset = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
  });

  return (
    <View style={{ alignItems: 'center', justifyContent: 'center', marginTop: 20 }}>
      {/* ข้อความแจ้งเตือนเมื่อเกิน 100 */}
      {score > 100 && (
        <View style={{
          position: 'absolute', 
          top: -15, 
          right: -10, 
          backgroundColor: '#43B75D', // สีเขียว
          paddingVertical: 4, 
          paddingHorizontal: 10, 
          borderRadius: 8,
        }}>
          <Text style={{ fontSize: 14, fontWeight: 'bold', color: '#FFFFFF' }}>
            You've reached the max! 🎉
          </Text>
        </View>
      )}

      <Svg width={160} height={160} viewBox="0 0 160 160">
        <Defs>
          <LinearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#FF8C00" />
            <Stop offset="100%" stopColor="#FF0080" />
          </LinearGradient>
        </Defs>

        {/* วงกลมพื้นหลัง */}
        <Circle cx="80" cy="80" r={radius} stroke="#eee" strokeWidth={strokeWidth} fill="none" />

        {/* วงกลมแสดงคะแนนแบบ Gradient */}
        <Circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#grad)"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          fill="none"
          rotation="-90"
          origin="80,80"
        />
      </Svg>

      {/* แสดงผลคะแนนตรงกลาง */}
      <View style={{ position: 'absolute', alignItems: 'center' }}>
        <Text style={{ fontSize: 36, fontWeight: 'bold' }}>{Math.min(score, 100)}</Text>
        <Text style={{ fontSize: 16, color: 'gray' }}>out of 100</Text>
      </View>
    </View>
  );
}
