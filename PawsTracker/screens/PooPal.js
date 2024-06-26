import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Switch, Pressable, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import AddReminder from "../components/AddReminder";
import { auth } from "../firebase-files/firebaseSetup";
import { database } from "../firebase-files/firebaseSetup";
import { useDogContext } from "../context-files/DogContext";
import { onSnapshot, collection, updateDoc, doc } from "@firebase/firestore";
import ReminderList from "../components/ReminderList";
import {
  cancelNotification,
  scheduleNotification,
} from "../components/NotificationManager";
import font from "../config/font";
import PressableButton from "../components/PressableButton";
import colors from "../config/colors";
export default function PooPal() {
  const [reminders, setReminders] = useState([]);
  const [isAddReminderModalVisible, setAddReminderModalVisible] =
    useState(false);
  const { selectedDog, userLocation, setUserLocation } = useDogContext();

  // Fetch reminders for the selected dog when it changes
  useEffect(() => {
    if (selectedDog) {
      const unsubscribe = onSnapshot(
        collection(
          database,
          "users",
          auth.currentUser.uid,
          "dogs",
          selectedDog.value,
          "reminders"
        ),
        (snapshot) => {
          const updatedReminders = [];
          snapshot.forEach((doc) => {
            updatedReminders.push({
              id: doc.id,
              ...doc.data(),
            });
          });
          setReminders(updatedReminders);
        },
        (error) => {
          console.error("Error fetching reminders:", error);
        }
      );

      return () => unsubscribe();
    }
  }, [selectedDog]);

  // Function to ensure location permission and retrieve current user location
  const ensureLocationAndGetPermission = async () => {
    if (!userLocation) {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Location Permission",
          "Location permission is required to add reminders."
        );
        return false;
      }
      let location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    }
    return true;
  };

  // Function to open the add reminder screen
  const openAddReminderScreen = async () => {
    if (!selectedDog) {
      Alert.alert(
        "No Dog Selected",
        "Please select a dog before adding a reminder.",
        [{ text: "OK" }]
      );
      return;
    }

    const hasLocation = await ensureLocationAndGetPermission();
    if (hasLocation) {
      setAddReminderModalVisible(true);
    }
  };

  // Function to format time from string
  const formatTime = (timeString) => {
    const date = new Date(timeString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  };

  // Function to toggle reminder switch
  const toggleSwitch = async (index) => {
    const updatedReminders = [...reminders];
    updatedReminders[index].isEnabled = !updatedReminders[index].isEnabled;
    setReminders(updatedReminders);

    try {
      const reminderRef = doc(
        database,
        "users",
        auth.currentUser.uid,
        "dogs",
        selectedDog.value,
        "reminders",
        reminders[index].id
      );
      await updateDoc(reminderRef, {
        isEnabled: updatedReminders[index].isEnabled,
      });

      // Schedule or cancel notification based on switch state
      if (updatedReminders[index].isEnabled) {
        // Schedule notification if switch is turned on
        await scheduleNotification(updatedReminders[index], userLocation);
      } else {
        // Cancel notification if switch is turned off
        await cancelNotification(updatedReminders[index]);
      }
    } catch (error) {
      console.error("Error updating reminder:", error);
    }
  };

  // Function to close add reminder screen
  const closeAddReminderScreen = () => {
    setAddReminderModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Potty Reminder</Text>
        <PressableButton onPressFunction={openAddReminderScreen}>
          <Ionicons name="add-circle-outline" size={35} color="black" />
        </PressableButton>
      </View>
      {/* Render the list of reminders */}
      <ReminderList
          reminders={reminders}
          formatTime={formatTime}
          toggleSwitch={toggleSwitch}
        />


      {/* Render the add reminder modal */}
      <AddReminder
        isVisible={isAddReminderModalVisible}
        onClose={closeAddReminderScreen}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: font.large,
    fontWeight: "bold",
  },
  groupContainer: {
    padding: 20,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: colors.black,
    marginBottom: 20,
  },
  switch: {
    transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }],
  },
  reminderContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 20,
    marginBottom: 20,
  },
  timeAndDaysContainer: {
    justifyContent: "center",
  },
  time: {
    fontSize: font.small,
    fontWeight: "bold",
    marginBottom: 5,
  },
  days: {
    fontSize: font.extraSmall,
  },
  noReminder: {
    fontSize: font.extraSmall,
    color: colors.shadow,
    textAlign: "center",
    marginTop: 20,
  },
});
