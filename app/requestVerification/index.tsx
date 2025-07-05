import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  Animated,
  FlatList,
  Image,
  TextInput,
} from "react-native";
import {
  TabView,
  SceneMap,
  SceneRendererProps,
  NavigationState,
} from "react-native-tab-view";
import { useNavigation } from "@react-navigation/native";
import styles from "./styles";
import { Header } from "../../components/header";
import ratingStars from "../../components/ratingStars";


type Route = {
  key: string;
  title: string;
};

type State = NavigationState<Route>;

const RequestCard = ({ data}) => {
  return (
    <TouchableOpacity style={styles.requestCard}>
      <View style={styles.requestHeader}>
        <View style={styles.profileSection}>
          <Image
            source={{ uri: data.avatar || 'https://via.placeholder.com/40' }}
            style={styles.profileImage}
          />
          <TouchableOpacity style={styles.profileInfo}>
            <Text style={styles.profileName}>{data.name}</Text>
            <View style={styles.ratingContainer}>
             { ratingStars(data.rating)}
              <Text style={styles.ratingText}>({data.rating})</Text>
            </View>
          </TouchableOpacity>
        </View>
        <Text style={styles.rate}>{data.rate}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.available}>Applied On:</Text>
        <Text style={styles.available}>{data.appliedOn}</Text>
      </View>
      <Text style={styles.requestDescription}>{data.description}</Text>
      
      <View style={styles.requestDetails}>
        <Text style={styles.detailText}>Available</Text>
        <Text style={styles.detailValue}>{data.availability}</Text>
      </View>
      
    </TouchableOpacity>
  );
};

const RequestsTab = () => {
  const navigation = useNavigation();
  
  const [requests, setRequests] = useState([
    {
      id: "1",
      name: "Daniel Steward",
      rate: "₹500/hr",
      rating: "5.0",
      appliedOn: "March15 2025 3:00 PM ",
      description: "I have experience moving heavy furniture and can help with your moving needs.",
      availability: "Mar 31, 2025 2:00 pm",
      avatar: null,
    },
    {
      id: "2",
      name: "Daniel Steward",
      rate: "₹500/hr",
      rating: "3",
      appliedOn: "March15 2025 3:00 PM ",
      description: "Applicant: We 15 2025 3:00 PM I have experience moving heavy furniture and can help with your moving needs.",
      availability: "Mar 31, 2025 2:00 pm",
      avatar: null,
    },
    {
      id: "3",
      name: "Daniel Steward",
      rate: "₹500/hr",
      rating: "5.0",
      appliedOn: "March15 2025 3:00 PM ",
      description: "Applicant: We 15 2025 3:00 PM I have experience moving heavy furniture and can help with your moving needs.",
      availability: "Mar 31, 2025 2:00 pm",
      avatar: null,
    },
    {
      id: "4",
      name: "Daniel Steward",
      rate: "₹500/hr",
      rating: "5.0",
      appliedOn: "March15 2025 3:00 PM ",
      description: "Applicant: We 15 2025 3:00 PM I have experience moving heavy furniture and can help with your moving needs.",
      availability: "Mar 31, 2025 2:00 pm",
      avatar: null,
    },
    {
      id: "5",
      name: "Daniel Steward",
      rate: "₹500/hr",
      rating: "5.0",
      appliedOn: "March15 2025 3:00 PM ",   
      description: "Applicant: We 15 2025 3:00 PM I have experience moving heavy furniture and can help with your moving needs.",
      availability: "Mar 31, 2025 2:00 pm",
      avatar: null,
    },
  ]);


  const renderRequest = ({ item }) => (
    <RequestCard
      data={item}
    />
  );

  return (
    <View style={styles.tabContainer}>      
      <FlatList
        data={requests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};


const RequestsVerifyTab = () => {
  const navigation = useNavigation();
  
  const [verificationData, setVerificationData] = useState([
    {
      id: "1",
      name: "Sarah Johnson",
      phone: "6275856300",
      status: "pending",
      code: "1234",
    },
    {
      id: "2",
      name: "James podaki",
      phone: "6275856300",
      status: "pending",
      code: "5678",
    },
    {
      id: "3",
      name: "john Johnson",
      phone: "6275856300",
      status: "pending",
      code: "9012",
    },
    {
      id: "4",
      name: "Jinson",
      phone: "6275856300",
      status: "pending",
      code: "3456",
    },
    {
      id: "5",
      name: "Michael Smith",
      phone: "6275856300",
      status: "pending",
      code: "7890",
    },
  ]);

  const [selectedPerson, setSelectedPerson] = useState(null);
  const [enteredCode, setEnteredCode] = useState("");
  const [showVerificationModal, setShowVerificationModal] = useState(false);

  const getVerifiedCount = () => {
    return verificationData.filter(item => item.status === "verified").length;
  };

  const getTotalCount = () => {
    return verificationData.length;
  };

  const handleSelectPerson = (person) => {
    if (person.status === "verified") return; // Don't allow selection of already verified persons
    
    setSelectedPerson(person);
    setShowVerificationModal(true);
    setEnteredCode("");
  };

  const handleVerifyCode = () => {
    if (!selectedPerson) return;
    
    if (enteredCode === selectedPerson.code) {
      // Update the status to verified
      setVerificationData(prevData =>
        prevData.map(item =>
          item.id === selectedPerson.id
            ? { ...item, status: "verified" }
            : item
        )
      );
      
      // Show success message or handle success
      console.log(`${selectedPerson.name} verified successfully!`);
      
      // Reset and close modal
      setShowVerificationModal(false);
      setSelectedPerson(null);
      setEnteredCode("");
    } else {
      // Handle invalid code
      console.log("Invalid verification code");
      // You can show an error message here
    }
  };

  const handleResendCode = () => {
    if (!selectedPerson) return;
    console.log(`Resend code for ${selectedPerson.name}`);
    // Add resend logic here
  };

  const renderVerificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.verificationCard,
        item.status === "verified" && styles.verifiedCard
      ]}
      onPress={() => handleSelectPerson(item)}
      disabled={item.status === "verified"}
    >
      <View style={styles.verificationHeader}>
        <View style={styles.verificationProfile}>
          <Image
            source={{ uri: 'https://via.placeholder.com/40' }}
            style={styles.verificationProfileImage}
          />
          <View>
            <Text style={styles.verificationName}>{item.name}</Text>
            <Text style={styles.verificationPhone}>📞 {item.phone}</Text>
          </View>
        </View>
        <View style={[
          styles.statusBadge,
          item.status === "verified" && styles.verifiedBadge
        ]}>
          <Text style={[
            styles.statusBadgeText,
            item.status === "verified" && styles.verifiedBadgeText
          ]}>
            {item.status}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.tabContainer}>
      <View style={styles.headerInfo}>
        <Text style={styles.requestCount}>
          {getVerifiedCount()} of {getTotalCount()} Verified
        </Text>
      </View>
      
      <FlatList
        data={verificationData}
        renderItem={renderVerificationItem}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
      
      {showVerificationModal && selectedPerson && (
        <View style={styles.verificationCodeSection}>
          <Text style={styles.enterCodeText}>Enter Code</Text>
          <TextInput
            style={styles.codeInput}
            placeholder="Enter Code"
            value={enteredCode}
            onChangeText={setEnteredCode}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode}>
            <Text style={styles.verifyButtonText}>Verify {selectedPerson.name}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.resendButton} onPress={handleResendCode}>
            <Text style={styles.resendButtonText}>Resend Code</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const RequestVerification = () => {
  const layout = useWindowDimensions();
  const [index, onIndexChange] = useState(0);
  const [routes] = useState([
    { key: "requests", title: "Requests" },
    { key: "requestsVerify", title: "Accepted" },
  ]);

  const renderScene = SceneMap({
    requests: RequestsTab,
    requestsVerify: RequestsVerifyTab,
  });

  const renderTabBar = (
    props: SceneRendererProps & { navigationState: State }
  ) => {
    const inputRange = props.navigationState.routes.map((_, i) => i);

    const translateX = props.position.interpolate({
      inputRange,
      outputRange: inputRange.map(
        (i) => i * (layout.width / props.navigationState.routes.length)
      ),
    });

    return (
      <View style={styles.tabbar}>
        {props.navigationState.routes.map((route, i) => (
          <TouchableOpacity
            key={route.key}
            onPress={() => props.jumpTo(route.key)}
            style={styles.tab}
          >
            <Text
              style={[
                styles.label,
                index === i ? styles.active : styles.inactive,
              ]}
            >
              {route.title}
            </Text>
          </TouchableOpacity>
        ))}
        <Animated.View
          style={[
            styles.underline,
            {
              width: layout.width / 2,
              transform: [{ translateX }],
            },
          ]}
        />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Header showBackButton={true}/>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        renderTabBar={renderTabBar}
        onIndexChange={onIndexChange}
        initialLayout={{ width: layout.width }}
      />
    </View>
  );
};

export default RequestVerification;