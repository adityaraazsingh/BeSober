import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import {
  addCounter,
  deleteCounter,
  getCounters,
  initDB,
  resetCounter,
  seedMockData,
  updateDailyCounters,
  updateLabel,
} from "@/lib/db";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal, Pressable, StyleSheet,
  Text,
  TextInput,
  TouchableOpacity, useColorScheme, View
} from "react-native";

export default function TabTwoScreen() {
  const [counters, setCounters] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newCounterName, setNewCounterName] = useState("");
  const colorScheme = useColorScheme(); // light or dark

  const loadCounters = async () => {
    await updateDailyCounters();
    const data = await getCounters();
    setCounters(data);
  };

  useEffect(() => {
    const setup = async () => {
      initDB();
      const existing = await getCounters();
      if (existing.length === 0) {
        await seedMockData();
      }
      await loadCounters();
    };

    setup();
  }, []);

  const handlePlusPress = () => {
    setModalVisible(true);
  };

  const handleAddCounter = async () => {
    if (newCounterName.trim()) {
      await addCounter(newCounterName.trim());
      await loadCounters();
      setNewCounterName("");
      setModalVisible(false);
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Delete Counter", "Are you sure you want to delete this counter?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteCounter(id);
          await loadCounters();
        },
      },
    ]);
  };

  const handleReset = async (id: number) => {
    await resetCounter(id);
    await loadCounters();
  };

  const handleRename = async (id: number, name: string) => {
    await updateLabel(id, name);
    await loadCounters();
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View
        style={[
          styles.counterItem,
          { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#f2f2f2" },
        ]}
      >
        <TextInput
          defaultValue={item.name}
          onSubmitEditing={(e) => handleRename(item.id, e.nativeEvent.text)}
          style={[
            styles.counterText,
            { color: colorScheme === "dark" ? "#fff" : "#000" },
          ]}
          placeholderTextColor="#888"
        />
        <Text
          style={[
            styles.counterValue,
            { color: colorScheme === "dark" ? "#ccc" : "#333" },
          ]}
        >
          {item.counter} days
        </Text>

        <View style={styles.actions}>
          <TouchableOpacity onPress={() => handleReset(item.id)}>
            <Ionicons name="refresh" size={22} color="#007AFF" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleDelete(item.id)}>
            <Ionicons
              name="trash"
              size={22}
              color="red"
              style={{ marginLeft: 16 }}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <>
      <ThemedView style={styles.container}>
        <ThemedText type="title">Sobriety Tracker</ThemedText>
        <ThemedText type="default">
          Track your progress day by day. You’ve got this.
        </ThemedText>

        <FlatList
          data={counters}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 100 }}
        />
      </ThemedView>

      {/* Floating Action Button */}
      <TouchableOpacity style={styles.fab} onPress={handlePlusPress}>
        <Ionicons name="add" size={28} color="white" />
      </TouchableOpacity>

      {/* Add Counter Modal */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View
            style={[
              styles.modalBox,
              {
                backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#fff",
              },
            ]}
          >
            <Text
              style={[
                styles.modalTitle,
                { color: colorScheme === "dark" ? "#fff" : "#000" },
              ]}
            >
              Add New Counter
            </Text>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor:
                    colorScheme === "dark" ? "#3a3a3a" : "#f2f2f2",
                  color: colorScheme === "dark" ? "#fff" : "#000",
                },
              ]}
              placeholder="Enter counter name"
              placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
              value={newCounterName}
              onChangeText={setNewCounterName}
            />
            <View style={styles.modalButtons}>
              <Pressable onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddCounter}>
                <Text style={styles.modalOk}>OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    marginTop:24,
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 30,
    backgroundColor: "#007AFF",
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  counterItem: {
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  counterText: {
    fontSize: 18,
    fontWeight: "bold",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    marginBottom: 8,
  },
  counterValue: {
    fontSize: 16,
    marginBottom: 8,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalBox: {
    width: "85%",
    padding: 20,
    borderRadius: 12,
    elevation: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 24,
  },
  modalCancel: {
    fontSize: 16,
    color: "#999",
    marginRight: 16,
  },
  modalOk: {
    fontSize: 16,
    color: "#007AFF",
    fontWeight: "bold",
  },
});
