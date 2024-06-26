import React from "react";
import { Alert } from "react-native";
import * as Notifications from "expo-notifications";
import { WEATHER_API_KEY } from "@env";
// Function to verify notification permissions
export async function verifyPermission() {
  try {
    const status = await Notifications.getPermissionsAsync();
    if (status.granted) {
      return true;
    }

    const permissionResponse = await Notifications.requestPermissionsAsync();
    return permissionResponse.granted;
  } catch (err) {
    console.log(err);
  }
}
// Function to schedule notifications
export const scheduleNotification = async (reminder, userLocation) => {
  try {
    // Check permission for notifications
    const havePermission = await verifyPermission();
    if (!havePermission) {
      Alert.alert("You need to give permission for notifications");
      return;
    }

    const { id, time, days, isEnabled } = reminder;
    // Function to fetch weather and temperature
    const getWeatherAndTemperature = async (latitude, longitude) => {
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      const data = await response.json();
      const weather = data.weather[0].description;
      const temperature = data.main.temp;
      return { weather, temperature };
    };

    if (isEnabled) {
      // Get weather and temperature
      const { weather, temperature } = await getWeatherAndTemperature(
        userLocation.latitude,
        userLocation.longitude
      );

      // Iterate through each selected day
      days.forEach(async (day) => {
        const dayIndex = getDayIndex(day);
        const timeObject = new Date(time);
        const hour = timeObject.getHours();
        const minute = timeObject.getMinutes();
        // Set trigger for the notification
        const trigger = {
          hour,
          minute,
          repeats: true,
          weekday: dayIndex,
        };

        // Generate message based on weather conditions
        let message = `Time to walk the dog! Current temp: ${temperature}°C.`;

        if (weather.includes("rain")) {
          message += " Don't forget your umbrella, it's raining. Stay dry!";
        } else if (weather.includes("clear")) {
          message += " It's a beautiful clear day out. Perfect for a walk!";
        } else if (weather.includes("snow")) {
          message += " Bundle up, it's snowy. Enjoy the winter wonderland!";
        } else if (weather.includes("cloud")) {
          message += " It's a bit cloudy, but still great for a walk.";
        } else {
          message += ` Weather condition: ${weather}. Enjoy your time outside!`;
        }
        // Schedule the notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: "Potty Time Reminder",
            body: message,
            data: { reminderId: id },
          },
          trigger,
        });
      });
    }
  } catch (error) {
    console.error("Error scheduling notifications:", error);
  }
};

export const cancelNotification = async (reminder) => {
  try {
    const allScheduledNotifications =
      await Notifications.getAllScheduledNotificationsAsync();
    allScheduledNotifications.forEach(async (notification) => {
      if (
        notification.content.data &&
        notification.content.data.reminderId === reminder.id
      ) {
        await Notifications.cancelScheduledNotificationAsync(
          notification.identifier
        );
      }
      const result = await Notifications.cancelScheduledNotificationAsync(
        notification.identifier
      );
    });
  } catch (error) {
    console.error("Error cancelling notifications:", error);
  }
};

const getDayIndex = (day) => {
  const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const index = daysOfWeek.indexOf(day);
  return index === 6 ? 1 : index + 2;
};
