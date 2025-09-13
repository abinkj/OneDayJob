import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    padding: 16 * DeviceDimensions.widthRatio,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'bold',
    color: Colors.black,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  progressStep: {
    flex: 1,
    height: 4 * DeviceDimensions.heightRatio,
    backgroundColor: '#E8E8E8',
    marginHorizontal: 2 * DeviceDimensions.widthRatio,
    borderRadius: 2,
  },
  progressStepCompleted: {
    backgroundColor: Colors.primary,
  },
  progressStepCurrent: {
    backgroundColor: Colors.primary,
  },
  scrollContainer: {
    flex: 1,
  },
  stepContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'bold',
    color: Colors.black,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  sectionTitle2: {
    fontSize: 16,
    fontFamily: 'bold',
    color: Colors.subGrey,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  vaccancyTitle: {
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.subGrey,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  categoryGrid: {

    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30 * DeviceDimensions.heightRatio,
    paddingHorizontal: 20
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap', // Allows items to wrap into new rows automatically
    justifyContent: 'space-between',
    paddingHorizontal: 20,
  },
  CategoryView: {

    height: 96 * DeviceDimensions.heightRatio,
    marginBottom: 40 * DeviceDimensions.heightRatio,
    width: `30%`,
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  categoryItem: {
    width: 71 * DeviceDimensions.widthRatio,
    height: 71 * DeviceDimensions.heightRatio,
    backgroundColor: Colors.categoryBox,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryItemHighlighted: {
    borderColor: Colors.primary,
    borderWidth: 0,
  },
  selectedCategory: {
    backgroundColor: Colors.selected,
  },
  categoryIcon: {
    width: 32 * DeviceDimensions.widthRatio,
    height: 32 * DeviceDimensions.heightRatio,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
    marginBottom: 26,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'regular',
    color: Colors.black,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    paddingVertical: 12 * DeviceDimensions.heightRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12 * DeviceDimensions.widthRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 120 * DeviceDimensions.heightRatio,
    textAlignVertical: 'top',
  },
  inputHelper: {
    fontSize: 12,
    fontFamily: 'regular',
    color: Colors.subGrey,
    marginTop: 4 * DeviceDimensions.heightRatio,
    textAlign: 'right',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 16 * DeviceDimensions.widthRatio,
    //marginBottom: 16 * DeviceDimensions.heightRatio,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    marginLeft: 8 * DeviceDimensions.widthRatio,
    flex: 1,
  },
  infoIcon: {
    marginLeft: 8 * DeviceDimensions.widthRatio,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20 * DeviceDimensions.heightRatio,
    marginTop: 20 * DeviceDimensions.heightRatio,
  },
  switchLabel: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
    flex: 1,

  },
  vacancyContainer: {
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    backgroundColor: Colors.white,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    height: 50 * DeviceDimensions.heightRatio,

  },
  counterButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    fontFamily: 'bold',
    color: Colors.black,
    marginLeft: 30 * DeviceDimensions.widthRatio,
  },
  counterValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  counterValue: {
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    marginLeft: 12 * DeviceDimensions.widthRatio,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.addressGrey,
    borderRadius: 8,
    padding: 12 * DeviceDimensions.widthRatio,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    marginLeft: 8 * DeviceDimensions.widthRatio,
  },
  addressHelperText: {
    fontSize: 12,
    fontFamily: 'regular',
    color: Colors.grey,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: Colors.black,
    marginBottom: 8,
  },
  selectedDateContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: Colors.primary || '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeOptionContainer: {
    flexDirection: 'row',
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  timeOption: {
    flex: 1,
    padding: 12 * DeviceDimensions.widthRatio,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8 * DeviceDimensions.widthRatio,
    flexDirection: 'row',
  },
  selectedTimeOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  timeOptionText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: Colors.black,
    flex: 1,
    textAlign: 'center',
  },
  timeSlotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  timeSlot: {
    width: 168 * DeviceDimensions.widthRatio,
    height: 119 * DeviceDimensions.heightRatio,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16 * DeviceDimensions.widthRatio,
    backgroundColor: Colors.white,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    // Shadow for Android
    elevation: 4,
  },

  selectedTimeSlot: {
    backgroundColor: Colors.timeSelected,
  },
  timeSlotIcon: {
    width: 50 * DeviceDimensions.widthRatio,
    height: 50 * DeviceDimensions.heightRatio,

  },
  timeSlotName: {
    fontSize: 16,
    fontFamily: 'medium',
    marginBottom: 4 * DeviceDimensions.heightRatio,
  },
  timeSlotTime: {
    fontSize: 14,
    fontFamily: 'regular',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    // Shadow for Android
    elevation: 4,
    marginBottom: 40 * DeviceDimensions.heightRatio,
  },
  timePickerColumn: {
    alignItems: 'center',
  },
  timePickerArrow: {
    padding: 8 * DeviceDimensions.widthRatio,
  },
  timePickerValue: {
    fontSize: 24,
    fontFamily: 'bold',
    color: Colors.black,
    marginVertical: 8 * DeviceDimensions.heightRatio,
  },
  timePickerSeparator: {
    fontSize: 24,
    fontFamily: 'bold',
    color: Colors.black,
    marginHorizontal: 16 * DeviceDimensions.widthRatio,
  },
  amPmContainer: {
    marginLeft: 24 * DeviceDimensions.widthRatio,
    flexDirection: 'row'
  },
  amPmButton: {
    padding: 8 * DeviceDimensions.widthRatio,
    borderRadius: 4,
    marginBottom: 8 * DeviceDimensions.heightRatio,
    marginLeft: 30 * DeviceDimensions.widthRatio,
  },
  selectedAmPm: {
    backgroundColor: Colors.primary,
  },
  amPmText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
  },
  amPmText2: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.white,
  },
  budgetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24 * DeviceDimensions.heightRatio,
    flexDirection: 'row',
    backgroundColor: Colors.switchGrey,
    padding: 20,
    borderRadius: 12,
  },
  currencySymbol: {
    fontSize: 36,
    fontFamily: 'bold',
    color: Colors.black,
  },
  currencyText: {
    fontSize: 36,
    fontFamily: 'bold',
    color: Colors.black,
  },
  numpadContainer: {
    marginTop: 16 * DeviceDimensions.heightRatio,
  },
  numpadRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  numpadButton: {
    width: 80 * DeviceDimensions.widthRatio,
    height: 80 * DeviceDimensions.heightRatio,
    borderRadius: 40,
    backgroundColor: Colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  numpadButtonText: {
    fontSize: 24,
    fontFamily: 'bold',
    color: Colors.black,
  },
  nextButton: {
    backgroundColor: Colors.primary,
    borderRadius: 8,
    padding: 16 * DeviceDimensions.widthRatio,
    alignItems: 'center',
    marginTop: 16 * DeviceDimensions.heightRatio,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'bold',
    color: Colors.white,
  },
  dropContainer: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden', // Important for picker border radius
    marginBottom: 19 * DeviceDimensions.heightRatio,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,

  },
  picker: {
    width: '100%',
    color: Colors.black,
    backgroundColor: 'white',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  photoThumbnail: {
    width: 70,
    height: 70,
    borderRadius: 8,
    marginRight: 8,
  },
  expandedSection: {
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 12 * DeviceDimensions.widthRatio,
    marginBottom: 12 * DeviceDimensions.heightRatio,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  requirementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8 * DeviceDimensions.heightRatio,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  requirementText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: Colors.black,
    marginLeft: 8 * DeviceDimensions.widthRatio,
    flex: 1,
  },
  editButton: {
    alignSelf: 'flex-end',
    padding: 8 * DeviceDimensions.widthRatio,
  },
  photoContainer: {
    marginRight: 8 * DeviceDimensions.widthRatio,
  },

  buttonContainer: {
    marginTop: 24 * DeviceDimensions.heightRatio,
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalContent: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16 * DeviceDimensions.widthRatio,
    paddingBottom: 32 * DeviceDimensions.heightRatio,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'medium',
    color: Colors.black,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  modalInput: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 8,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    paddingVertical: 12 * DeviceDimensions.heightRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: Colors.black,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addButton: {
    marginLeft: 8 * DeviceDimensions.widthRatio,
  },
  modalScrollContent: {
    maxHeight: 300 * DeviceDimensions.heightRatio,
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  editRequirementItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12 * DeviceDimensions.heightRatio,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  selectedTimeText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  address2: {
    width: '100%',
    backgroundColor: Colors.address2,
    borderRadius: 12,
    padding: 10,
    marginBottom: 30 * DeviceDimensions.heightRatio,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  calendarModal: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    width: '90%',
    elevation: 5,
  },
  previewContainer: {
    flex: 1,
    paddingBottom: 20,
  },
  previewHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 15,
  },
  previewTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.black,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 10,
  },
  statusText: {
    color: Colors.darkGreen,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: Colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 100,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  menuText: {
    marginLeft: 12,
    fontSize: 16,
    color: Colors.black,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  avatarContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    resizeMode: 'contain',
    backgroundColor: Colors.categoryBox
  },
  avatarText: {
    color: Colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: '500',
  },
  jobTitlePreview: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.grey,
    marginTop: 20 * DeviceDimensions.heightRatio,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginTop: 10 * DeviceDimensions.heightRatio
  },

  categoryBadgeText: {
    color: Colors.primary,
    marginLeft: 4,
    fontSize: 14,
    fontFamily: 'medium'
  },
  separator: {
    height: 1,
    backgroundColor: Colors.grey,
    justifyContent: 'flex-end'


  },
  detailsSection: {
    marginTop: 20 * DeviceDimensions.heightRatio,
  },
  detailRow: {
    marginTop: 20 * DeviceDimensions.heightRatio,
  },
  detailLabel: {
    fontSize: 14,
    color: Colors.grey,
    fontWeight: 'medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: Colors.black,
    fontWeight: 'bold'
  },
  budget: {
    fontSize: 24,
    color: Colors.black,
    fontWeight: 'bold'
  },
  descriptionValue: {
    fontSize: 16,
    color: Colors.black,
    fontWeight: 'bold',
    marginBottom:20 * DeviceDimensions.heightRatio
  },
  photosScrollView: {
    marginBottom: 15,
  },
  previewPhoto: {
    width: 150,
    height: 150,
    borderRadius: 8,
    marginRight: 10,
  },
  placeholderPhoto: {
    width: 150,
    height: 150,
    borderRadius: 8,
    backgroundColor: Colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  requirementsContainer: {
    marginBottom: 15,
  },
  requirementItemPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  requirementTextPreview: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.black,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom:30 * DeviceDimensions.heightRatio,
  },
  editButton123: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: Colors.grey,
    fontWeight: '500',
  },
  removeButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  removeButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: 'red',
    fontWeight: '500',
  },
  nameContainer: {
    flexDirection: 'row',
    height: 245 * DeviceDimensions.heightRatio,
  },
  userImage: {
    width: 141 * DeviceDimensions.widthRatio,
    height: 193 * DeviceDimensions.heightRatio,
    resizeMode: 'stretch',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  nameContainer2: {
    flex: 1,
    backgroundColor: Colors.subGrey,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  nameContainer1: {
    flex: 1,
    justifyContent: 'space-between'
  },
  timeRangeContainer: {
    marginTop: 20 * DeviceDimensions.heightRatio,
    marginBottom: 20 * DeviceDimensions.heightRatio,
  },
  timeRangeSection: {
    marginBottom: 20 * DeviceDimensions.heightRatio,
  },
  timeRangeLabel: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },

}); 
export default styles;
