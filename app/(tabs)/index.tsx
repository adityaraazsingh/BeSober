// File: HomeScreen.tsx
import { registerForPushNotificationsAsync } from "@/hooks/registerForPushNotifiactionsAsync";
import type { DefaultCounter } from "@/lib/db";
import {
  getDefaultCounter,
  initDB,
  initDefaultCounter,
  resetDefaultCounter,
} from "@/lib/db";
import React, { useEffect, useState } from "react";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { AnimatedCircularProgress } from "react-native-circular-progress";

export default function HomeScreen() {
  const colorScheme = useColorScheme();

  const [defaultCounter, setDefaultCounter] = useState<DefaultCounter | null>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});

  useEffect(() => {
    registerForPushNotificationsAsync();
    const load = async () => {
      await initDB();
      await initDefaultCounter();
      const data = await getDefaultCounter();
      if (data) {
        setDefaultCounter(data);
        markDates(data.startDate);
      }
    };
    load();
  }, []);

  const markDates = (start: string) => {
    const startDate = new Date(start);
    const today = new Date();
    const days = Math.floor((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const marked: Record<string, any> = {};
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      const iso = date.toISOString().split("T")[0];
      marked[iso] = { marked: true, dotColor: "green" };
    }
    setMarkedDates(marked);
  };

  const confirmReset = () => {
    if (!defaultCounter) return;
    Alert.alert("Reset Timer", "Are you sure you want to reset your streak?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: async () => {
          await resetDefaultCounter();
          const updated = await getDefaultCounter();
          if (updated) {
            setDefaultCounter(updated);
            markDates(updated.startDate);
          }
        },
      },
    ]);
  };

  const streakDays = defaultCounter
    ? Math.floor(
        (new Date().getTime() - new Date(defaultCounter.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : 0;

  const progressValue = Math.min(streakDays / 100, 1); // Max = 100 days visual

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Sobriety Tracker</Text>

      {defaultCounter ? (
        <>
          {/* Semi-Circle Progress */}
          <View style={styles.progressWrapper}>
            <AnimatedCircularProgress
              size={200}
              width={18}
              fill={progressValue * 100}
              tintColor="#00e0ff"
              backgroundColor="#e0e0e0"
              arcSweepAngle={180}
              rotation={90}
              lineCap="round"
              style={styles.semicircle}
            >
              {() => (
                <View style={[styles.progressContent, { transform: [{ rotate: "-180deg" }] }]}>
                  <Text style={styles.daysText}>{streakDays}</Text>
                  <Text style={styles.label}>DAYS</Text>
                </View>
              )}
            </AnimatedCircularProgress>
          </View>

          {/* Longest Streak */}
          <Text style={styles.longestText}>
            Longest streak: {defaultCounter.longestStreak} days
          </Text>

          {/* Reset Button */}
          <TouchableOpacity style={styles.resetButton} onPress={confirmReset}>
            <Text style={styles.resetText}>Reset Streak</Text>
          </TouchableOpacity>

          {/* Calendar */}
          <Calendar
            markedDates={markedDates}
            markingType="dot"
            style={styles.calendar}
            theme={{
              calendarBackground: colorScheme === "dark" ? "#1e1e1e" : "#fff",
              dayTextColor: colorScheme === "dark" ? "#fff" : "#000",
              dotColor: "green",
              arrowColor: "#00e0ff",
              monthTextColor: "#00e0ff",
              selectedDayBackgroundColor: "#00e0ff",
            }}
          />
        </>
      ) : (
        <Text style={{ textAlign: "center", marginTop: 40 }}>
          No sobriety data found.
        </Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 24,
  },
  progressWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  semicircle: {
    transform: [{ rotate: "180deg" }],
  },
  progressContent: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: -30,
  },
  daysText: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#007AFF",
  },
  label: {
    fontSize: 18,
    color: "#666",
    fontWeight: "500",
    marginTop: 4,
  },
  resetButton: {
    backgroundColor: "#FF3B30",
    alignSelf: "center",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginBottom: 16,
  },
  resetText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  calendar: {
    borderRadius: 12,
  },
  longestText: {
    textAlign: "center",
    fontSize: 16,
    marginBottom: 10,
    color: "#666",
  },
});
