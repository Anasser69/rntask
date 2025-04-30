import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  StatusBar,
  Image,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { useTheme } from "../theme/ThemeProvider";
import { buildApiUrl } from "../config/api";


interface Event {
  id: string;
  title: string;
  name?: string;
  date: string;
  price: string;
  image: string;
  imageUrl?: string;
  location: string;
  description?: string;
}


type RootStackParamList = {
  HomeScreen: undefined;
  EventDetails: { event: Event };
};

type HomeScreenProps = {
  navigation: NativeStackNavigationProp<RootStackParamList, "HomeScreen">;
};


type RenderItemProps = {
  item: Event;
  index: number;
};

const HomeScreen = ({ navigation }: HomeScreenProps) => {
  const { colors, theme } = useTheme();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userName, setUserName] = useState("User");

  useEffect(() => {
    fetchEvents();
    fetchUserInfo();
  }, []);

  const fetchUserInfo = async () => {
    try {
      setError(""); 
      const userId = await AsyncStorage.getItem("userId");
      if (!userId) {
        console.warn("No user ID found in storage");
        return;
      }

      const response = await fetch(buildApiUrl(`users/${userId}`));

      if (!response.ok) {
        throw new Error(`Failed to fetch user info: ${response.status}`);
      }

      const userData = await response.json();
      if (userData && userData.name) {
        setUserName(userData.name);
      } else if (userData && userData.email) {
        
        const emailName = userData.email.split("@")[0];
        setUserName(emailName);
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
     
      setUserName("User");
    }
  };

  const fetchEvents = async () => {
    try {
      const response = await fetch(buildApiUrl("events"));

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      setEvents(data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events. Please try again later.");
      setLoading(false);
    }
  };

  const renderEventCard = ({ item, index }: RenderItemProps) => (
    <TouchableOpacity
      style={[
        styles.eventCard,
        {
          transform: [{ translateY: index % 2 === 0 ? 0 : 10 }],
          backgroundColor: colors.card,
        },
      ]}
      onPress={() => navigation.navigate("EventDetails", { event: item })}
    >
      <Image
        source={{
          uri:
            item.imageUrl ||
            item.image ||
            "https://via.placeholder.com/300x150?text=No+Image",
        }}
        style={styles.eventImage}
        resizeMode="cover"
      />
      <View style={styles.eventContent}>
        <Text style={[styles.eventTitle, { color: colors.text }]}>
          {item.title}
        </Text>
        {item.name && item.name !== item.title && (
          <Text style={[styles.eventName, { color: colors.text }]}>
            {item.name}
          </Text>
        )}
        <View style={styles.eventInfo}>
          <View style={styles.eventInfoItem}>
            <Ionicons
              name="calendar-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.eventInfoText, { color: colors.text }]}>
              {item.date}
            </Text>
          </View>
          <View style={styles.eventInfoItem}>
            <Ionicons
              name="pricetag-outline"
              size={16}
              color={colors.primary}
            />
            <Text style={[styles.eventInfoText, { color: colors.text }]}>
              ${item.price}
            </Text>
          </View>
        </View>
        <View style={styles.eventInfoItem}>
          <Ionicons name="location-outline" size={16} color={colors.primary} />
          <Text style={[styles.eventInfoText, { color: colors.text }]}>
            {item.location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: colors.background }]}
      edges={["top", "left", "right"]}
    >
      <StatusBar
        barStyle={theme === "dark" ? "light-content" : "dark-content"}
        backgroundColor={colors.background}
      />

      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <View>
          <Text style={[styles.greeting, { color: colors.text }]}>Hello,</Text>
          <Text style={[styles.username, { color: colors.text }]}>
            {userName}
          </Text>
        </View>
      </View>

      <View style={styles.listHeader}>
        <Text style={[styles.listTitle, { color: colors.text }]}>
          Upcoming Events
        </Text>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.error}
          />
          <Text style={[styles.errorText, { color: colors.error }]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, { backgroundColor: colors.primary }]}
            onPress={fetchEvents}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventCard}
          keyExtractor={(item) => item.id}
          style={styles.list}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  greeting: {
    fontSize: 16,
    color: "#666",
  },
  username: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
  },
  notificationButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  notificationBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#FF3B30",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 20,
    marginBottom: 10,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  seeAllText: {
    fontSize: 14,
    color: "#007BFF",
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  errorText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007BFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  eventCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  eventImage: {
    width: "100%",
    height: 150,
  },
  eventContent: {
    padding: 15,
  },
  eventTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  eventInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  eventInfoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  eventInfoText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 5,
  },
  eventName: {
    fontSize: 14,
    color: "#555",
    marginBottom: 8,
    fontStyle: "italic",
  },
});

export default HomeScreen;
