import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

// This function will ask for notification permissions and return the Expo push token
export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  // Only physical devices support push notifications
  if (!Device.isDevice) {
    alert("Must use physical device for Push Notifications");
    return;
  }

  // Check current permission status
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  // If not granted, ask the user
  if (existingStatus !== "granted") {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  // If still not granted, exit
  if (finalStatus !== "granted") {
    alert("Failed to get push token for push notification!");
    return;
  }

  // ✅ Only now: Get Expo push token
  const tokenResponse = await Notifications.getExpoPushTokenAsync();
  const expoPushToken = tokenResponse.data;

  console.log("Expo Push Token:", expoPushToken);

  return expoPushToken;
}
