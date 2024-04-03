import { StyleSheet, Text, View, FlatList, Pressable } from "react-native";
import React from "react";
import { Ionicons } from "@expo/vector-icons";
export default function WeightList({ weights, onWeightPress }) {
    const renderWeightItem = ({ item }) => (
      <Pressable onPress={() => onWeightPress(item)} style={styles.pressable}>
        <View style={styles.weightItem}>
          <Text style={styles.dateText}>
            {item.date
              ? new Date(item.date).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Invalid Date: " + item.date}
          </Text>
          <Text style={styles.weightText}>{item.record} kg</Text>
          <Ionicons name="chevron-forward-outline" size={24} color="black" />
        </View>
      </Pressable>
    );
  
    return (
      <FlatList
        data={weights}
        renderItem={renderWeightItem}
        keyExtractor={(item, index) => index.toString()}
      />
    );
  }
  
  const styles = StyleSheet.create({
    pressable: {
      marginBottom: 10,
    },
    weightItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 16,
      borderWidth: 1,
      borderRadius: 4,
      borderColor: '#000',
    },
    dateText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    weightText: {
      fontSize: 16,
      fontWeight: 'bold',
    },
    arrow: {
      fontSize: 16,
      fontWeight: 'bold',
    },
  });
  