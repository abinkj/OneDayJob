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
  Keyboard,
  ScrollView,
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
import Toast from "../../components/toast";

type Route = {
  key: string;
  title: string;
};

type State = NavigationState<Route>;

const RequestCard = ({ data, isSelected, onSelect }) => {
  return (
    <TouchableOpacity 
      style={[
        styles.requestCard,
        isSelected && styles.selectedCard
      ]}
      onPress={() => onSelect(data.id)}
    >
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
      
      {/* Selection Checkbox */}
      {isSelected && (
        <View style={styles.checkboxContainer}>
          <View style={styles.checkbox}>
            <Text style={styles.checkboxText}>✓</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
};

const RequestsTab = () => {
  const navigation = useNavigation();
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedRequests, setSelectedRequests] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  
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
      category: "Highly rated"
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
      category: "Budget Friendly"
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
      category: "Highly rated"
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
      category: "Budget Friendly"
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
      category: "Highly rated"
    },
  ]);

  const filters = ['All', 'Highly rated', 'Budget Friendly'];

  const getFilteredRequests = () => {
    if (selectedFilter === 'All') {
      return requests;
    }
    return requests.filter(request => request.category === selectedFilter);
  };

  const handleSelectRequest = (requestId) => {
    setSelectedRequests(prev => {
      if (prev.includes(requestId)) {
        return prev.filter(id => id !== requestId);
      } else {
        return [...prev, requestId];
      }
    });
  };

  const handleSelectAll = () => {
    const filteredRequests = getFilteredRequests();
    setSelectedRequests(filteredRequests.map(req => req.id));
    setShowMenu(false);
  };

  const handleSelectFirst10 = () => {
    const filteredRequests = getFilteredRequests();
    const first10 = filteredRequests.slice(0, 10).map(req => req.id);
    setSelectedRequests(first10);
    setShowMenu(false);
  };

  const handleDeselectAll = () => {
    setSelectedRequests([]);
    setShowMenu(false);
  };

  const handleAcceptSelected = () => {
    console.log('Accept selected:', selectedRequests);
    // Handle accept logic here
    setSelectedRequests([]);
  };

  const handleRejectSelected = () => {
    console.log('Reject selected:', selectedRequests);
    // Handle reject logic here
    setSelectedRequests([]);
  };

  const renderRequest = ({ item }) => (
    <RequestCard
      data={item}
      isSelected={selectedRequests.includes(item.id)}
      onSelect={handleSelectRequest}
    />
  );

  const filteredRequests = getFilteredRequests();

  return (
    <View style={styles.tabContainer}>
            {/* Selection Count */}
      {selectedRequests.length > 0 && (
      <View style={styles.headerInfo}>
        <View style={styles.headerTitle}>
        <Text style={styles.requestCount}>
            {selectedRequests.length}/{filteredRequests.length} selected
          </Text>
        </View>
        </View>
      )}
      {/* Filter Section */}
      <View style={styles.filterSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.activeFilterButton
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <Text style={[
                styles.filterButtonText,
                selectedFilter === filter && styles.activeFilterButtonText
              ]}>
                {filter}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        
        {/* Menu Button */}
        <TouchableOpacity 
          style={styles.menuButton}
          onPress={() => setShowMenu(!showMenu)}
        >
          <Text style={styles.menuButtonText}>⋮</Text>
        </TouchableOpacity>
      </View>



      {/* Menu Options */}
      {showMenu && (
        <View style={styles.menuOptions}>
          <TouchableOpacity style={styles.menuOption} onPress={handleSelectAll}>
            <Text style={styles.menuOptionText}>Select All</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuOption} onPress={handleSelectFirst10}>
            <Text style={styles.menuOptionText}>Select First 10</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuOption} onPress={handleDeselectAll}>
            <Text style={styles.menuOptionText}>Deselect All</Text>
          </TouchableOpacity>
        </View>
      )}
      
      <FlatList
        data={filteredRequests}
        renderItem={renderRequest}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      {/* Bottom Action Buttons */}
      {selectedRequests.length > 0 && (
        <View style={styles.bottomActions}>
          <TouchableOpacity 
            style={styles.rejectButton}
            onPress={handleRejectSelected}
          >
            <Text style={styles.rejectButtonText}>Reject Selected</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.acceptButton}
            onPress={handleAcceptSelected}
          >
            <Text style={styles.acceptButtonText}>Accept Selected</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const RequestsVerifyTab = ({ onShowToast }) => {
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
      code: "1234",
    },
    {
      id: "3",
      name: "john Johnson",
      phone: "6275856300",
      status: "pending",
      code: "1234",
    },
    {
      id: "4",
      name: "Jinson",
      phone: "6275856300",
      status: "pending",
      code: "1234",
    },
    {
      id: "5",
      name: "Michael Smith",
      phone: "6275856300",
      status: "pending",
      code: "1234",
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
    if (person.status === "verified") return;
    
    setSelectedPerson(person);
    setShowVerificationModal(true);
    setEnteredCode("");
  };

  const handleVerifyCode = () => {
    Keyboard.dismiss();
    if (!selectedPerson) return; 
    setEnteredCode(null);   
    if (enteredCode === selectedPerson.code) {
      // Update the status to verified
      setVerificationData(prevData =>
        prevData.map(item =>
          item.id === selectedPerson.id
            ? { ...item, status: "verified" }
            : item
        )
      );
      
      // Show success toast
      onShowToast(`${selectedPerson.name} verified successfully!`, 'success');
      
      // Reset and close modal
      setShowVerificationModal(false);
      setSelectedPerson(null);
      setEnteredCode("");
    } else {
      // Show error toast
      onShowToast("Invalid verification code", 'error');
    }
  };

  const handleResendCode = () => {
    if (!selectedPerson) return;
    console.log(`Resend code for ${selectedPerson.name}`);
    // Show info toast for resend
    onShowToast(`Verification code resent to ${selectedPerson.name}`, 'success');
  };

  const renderVerificationItem = ({ item }) => (
    <TouchableOpacity 
      style={[
        styles.verificationCard,
        item.status === "verified" && styles.verifiedCard,
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
        <View style={styles.headerTitle}>
        <Text style={styles.requestCount}>
          {getVerifiedCount()} of {getTotalCount()} Verified
        </Text>
        </View>
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
          <TouchableOpacity style={styles.verifyButton} onPress={handleVerifyCode} >
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

  // Toast state
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    setToastVisible(false);
  };

  const renderScene = ({ route }) => {
    switch (route.key) {
      case 'requests':
        return <RequestsTab />;
      case 'requestsVerify':
        return <RequestsVerifyTab onShowToast={showToast} />;
      default:
        return null;
    }
  };

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
      
      {/* Toast Component */}
      <Toast
        visible={toastVisible}
        message={toastMessage}
        type={toastType}
        onHide={hideToast}
        duration={3000}
      />
    </View>
  );
};

export default RequestVerification;