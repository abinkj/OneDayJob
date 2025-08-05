import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  TextInput,
  FlatList,
  ImageBackground,
  Button,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "../../../constants/Colors";
import { styles } from "./styles";
import { SafeAreaView } from "react-native-safe-area-context";
import { getCurrentLocation } from "../../../services/currentLocation";
import CustomButton from "../../../components/CustomButton";
import { useDispatch } from "react-redux";
import Toast from "react-native-toast-message";
import { logout } from "../../../redux/reducers/authReducers";
import { logoutUser } from "../../../utilities/authentication";
import { useNavigation } from "@react-navigation/native";

const HomeScreen = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState(null);
  const navigation = useNavigation();

  const handleNotificationPress = () => {
    console.log("Notification icon pressed");
    navigation.navigate("Notification");
  };

  useEffect(() => {
    (async () => {
      const loc = await getCurrentLocation();
      setLocation(loc);
      console.log("Current Location:", loc);
    })();
  }, []);

  const jobListings = [
    {
      id: 1,
      category: "PAINTING",
      price: "₹500/hr",
      title: "Need a painter to paint a 2-bedroom apartment. Contact ASAP!",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      vacancies: "0/1",
      timeAgo: "5 Hours ago",
      status: "Open",
    },
    {
      id: 2,
      category: "PAINTING",
      price: "₹500/hr",
      title: "Need a painter to paint a 2-bedroom apartment. Contact ASAP!",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      vacancies: "0/1",
      timeAgo: "5 Hours ago",
      status: "Open",
    },
    {
      id: 3,
      category: "PAINTING",
      price: "₹500/hr",
      title: "Need a painter to paint a 2-bedroom apartment. Contact ASAP!",
      location: "Downtown, New York",
      date: "Monday, Mar, 31",
      vacancies: "0/1",
      timeAgo: "5 Hours ago",
      status: "Open",
    },
    // You can add more job listings here
  ];

  const dispatch = useDispatch();

  const renderJobCard = ({ item }) => (
    <TouchableOpacity style={styles.jobCard}>
      <View style={styles.jobCardHeader}>
        <View style={styles.categoryContainer}>
          <Image
            style={styles.avatarContainer}
            source={require("../../../assets/images/paint.png")}
          />

          <Text style={styles.categoryText}>{item.category}</Text>
        </View>
        <Text style={styles.priceText}>{item.price}</Text>
      </View>
      <View style={styles.titleContainer}>
        <Text style={styles.jobTitle}>{item.title}</Text>
        <View style={styles.statusContainer}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>

      <View style={styles.jobDetailsContainer}>
        <View style={styles.locationContainer}>
          <Ionicons name="location-outline" size={16} color={Colors.grey} />
          <Text style={styles.locationText}>{item.location}</Text>
        </View>

        <View style={styles.dateContainer}>
          <Ionicons name="calendar-outline" size={16} color={Colors.grey} />
          <Text style={styles.dateText}>{item.date}</Text>
        </View>
      </View>

      <View style={styles.jobFooter}>
        <View style={styles.vacanciesContainer}>
          <Text style={styles.vacanciesText}>Vacancies: {item.vacancies} </Text>
          <Ionicons name="people" size={16} color={Colors.primary} />
        </View>
        <Text style={styles.timeAgoText}>{item.timeAgo}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.locationHeader}>
          <Ionicons name="location" size={24} color={Colors.primary} />
          <View>
            <TouchableOpacity style={styles.locationSelector}>
              <Text style={styles.locationTitle}>XYZ Junction</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.black} />
            </TouchableOpacity>
            <Text style={styles.locationSubtitle}>
              MG Road, Kochi {location?.latitude}, {location?.longitude}
            </Text>
          </View>
        </View>
        <TouchableOpacity onPress={handleNotificationPress}>
          <Ionicons
            name="notifications-outline"
            size={24}
            color={Colors.black}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color={Colors.grey}
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Find Jobs"
          placeholderTextColor={Colors.black}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      {/* Banner */}
      <View style={styles.bannerContainer}>
        <ImageBackground
          style={styles.banner}
          source={require("../../../assets/images/banner.png")}
          resizeMode="stretch"
        >
          <View style={styles.bannerTextContainer}>
            <Text style={styles.bannerTitle}>Help Is One Click Away –</Text>
            <Text style={styles.bannerSubtitle}>Post Your Task Now!</Text>
            <TouchableOpacity style={styles.postNowButton}>
              <Text style={styles.postNowText}>Post Now</Text>
            </TouchableOpacity>
          </View>
        </ImageBackground>
      </View>

      <View style={styles.filtersScrollContainer}>
        <CustomButton
          color={"red"}
          text={"logout"}
          onPress={() => {
            console.log("Logout button pressed");
            dispatch(logoutUser());
          }}
        />
        <Button
          title="Show Success Toast"
          onPress={() =>
            Toast.show({
              type: "success",
              text1: "Verification Successful",
              position: "top",
              visibilityTime: 2000,
            })
          }
        />

        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[
            { id: "category", name: "Category" },
            { id: "price", name: "Price" },
            { id: "distance", name: "Distance" },
            { id: "clear", name: "Clear" },
          ]}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity style={styles.filterButton}>
              <Text style={styles.filterText}>{item.name}</Text>
              <Ionicons name="chevron-down" size={16} color={Colors.black} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.filtersContainer}
        />
      </View>

      {/* Job Listings using FlatList */}
      <FlatList
        data={jobListings}
        renderItem={renderJobCard}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
};

export default HomeScreen;
