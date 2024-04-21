import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { useDogContext } from "../context-files/DogContext";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native";
import { Pressable } from "react-native";
import colors from "../config/colors";
import font from "../config/font";
export default function Header({ isWeight }) {
  const { dogs, selectedDog, setSelectedDog } = useDogContext();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(null);

  useEffect(() => {
    if (selectedDog) {
      setValue(selectedDog.value);
    }
    //delete "selectedDog" dependency for switch dogs for Nutri and Poopal
  }, [selectedDog]);

  const handleDogChange = (value) => {
    const dog = dogs.find((d) => d.value === value);
    if (dog) {
      setSelectedDog(dog);
    }
  };
  const toggleDropdown = () => {
    setOpen(!open);
  };

  return (
    <SafeAreaView>
      <Pressable
        onPress={isWeight ? toggleDropdown : undefined}
        style={styles.container}
      >
        <MaterialCommunityIcons
          name="dog"
          size={40}
          color={colors.black}
          style={styles.icon}
        />
        <DropDownPicker
          open={isWeight ? open : false}
          value={value}
          items={dogs.map((dog) => ({ label: dog.label, value: dog.value }))}
          setOpen={setOpen}
          setValue={setValue}
          onChangeValue={handleDogChange}
          labelStyle={styles.dropdownLabel}
          containerStyle={styles.dropdownContainer}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownBox}
          arrowIconStyle={styles.dropdownArrow}
          placeholder="Select Dog"
          placeholderStyle={styles.dropdownPlaceholder}
          listItemContainerStyle={styles.listItemContainer}
          listMode="SCROLLVIEW"
          scrollViewProps={{
            nestedScrollEnabled: true,
          }}
        />
        {isWeight ? (
          <AntDesign
            name="down"
            size={35}
            color={colors.black}
            style={styles.icon}
          />
        ) : (
          ""
        )}
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    justifyContent: "center",
    backgroundColor: colors.header,
    shadowColor: colors.shadow,
    shadowOffset: 10,
    shadowOpacity: 50,
  },
  icon: {
    width: 40,
    height: 40,
  },
  dropdownContainer: {
    width: 150,
    textAlign: "center",
  },
  dropdownLabel: {
    fontSize: font.medium,
    textAlign: "center",
  },
  dropdown: {
    backgroundColor: colors.transparent,
    borderWidth: 0,
    textAlign: "center",
  },
  dropdownBox: {
    borderColor: colors.placeholder,
  },
  dropdownArrow: {
    display: "none",
  },
  dropdownPlaceholder: {
    color: colors.black,
    fontSize: font.medium,
    textAlign: "center",
  },
  title: {
    display: "none",
  },
});
