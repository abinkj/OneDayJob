import { StyleSheet } from "react-native";
import { ThemeColors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

export const createStyles = (colors: ThemeColors) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
    color: colors.black,
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
    backgroundColor: colors.primary,
  },
  progressStepCurrent: {
    backgroundColor: colors.primary,
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
    color: colors.black,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  sectionTitle2: {
    fontSize: 16,
    fontFamily: 'bold',
    color: colors.subGrey,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  vaccancyTitle: {
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.subGrey,
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
    backgroundColor: colors.categoryBox,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8
  },
  categoryItemHighlighted: {
    borderColor: colors.primary,
    borderWidth: 0,
  },
  selectedCategory: {
    backgroundColor: colors.selected,
  },
  categoryIcon: {
    width: 32 * DeviceDimensions.widthRatio,
    height: 32 * DeviceDimensions.heightRatio,
  },
  categoryIconSmall: {
    width: 20 * DeviceDimensions.widthRatio,
    height: 20 * DeviceDimensions.heightRatio,
  },
  // Step 2 Category List Styles
  categoryItemStep2: {
    alignItems: 'center',
    marginRight: 20 * DeviceDimensions.widthRatio,
    width: 80 * DeviceDimensions.widthRatio,
  },
  selectedCategoryStep2: {
    // optional: add background or scale if needed
  },
  categoryIconContainerStep2: {
    width: 60 * DeviceDimensions.widthRatio,
    height: 60 * DeviceDimensions.heightRatio,
    borderRadius: 30,
    backgroundColor: colors.categoryBox,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8 * DeviceDimensions.heightRatio,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  selectedCategoryIconContainerStep2: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  categoryIconStep2: {
    width: 30 * DeviceDimensions.widthRatio,
    height: 30 * DeviceDimensions.heightRatio,
  },
  categoryNameStep2: {
    fontSize: 12,
    fontFamily: 'medium',
    color: colors.grey,
    textAlign: 'center',
  },
  selectedCategoryNameStep2: {
    color: colors.primary,
    fontFamily: 'bold',
  },
  // Custom Category Styles
  customCategoryContainer: {
    paddingHorizontal: 20,
    marginTop: -20 * DeviceDimensions.heightRatio, // Pull up closer to grid
    marginBottom: 30 * DeviceDimensions.heightRatio,
  },
  customCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 16 * DeviceDimensions.widthRatio,
    borderWidth: 1,
    borderColor: colors.primary,
    borderStyle: 'dashed', // visual cue for "custom/fill in"
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  customCategoryCardSelected: {
    backgroundColor: colors.categoryBox1,
    borderStyle: 'solid',
    borderWidth: 2,
  },
  customCategoryIconContainer: {
    width: 56 * DeviceDimensions.widthRatio,
    height: 56 * DeviceDimensions.heightRatio,
    borderRadius: 12,
    backgroundColor: colors.categoryBox,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16 * DeviceDimensions.widthRatio,
  },
  customCategoryIcon: {
    width: 32 * DeviceDimensions.widthRatio,
    height: 32 * DeviceDimensions.heightRatio,
  },
  customCategoryContent: {
    flex: 1,
  },
  customCategoryTitle: {
    fontSize: 16,
    fontFamily: 'bold',
    color: colors.black,
    marginBottom: 4,
  },
  customCategorySubtitle: {
    fontSize: 12,
    fontFamily: 'regular',
    color: colors.subGrey,
    lineHeight: 16,
  },
  categoryText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: colors.black,
    marginBottom: 26,
  },
  categoryName: {
    fontSize: 14,
    fontFamily: 'regular',
    color: colors.black,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  input: {
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    paddingVertical: 12 * DeviceDimensions.heightRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.border,
  },
  textArea: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12 * DeviceDimensions.widthRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.black,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    height: 120 * DeviceDimensions.heightRatio,
    textAlignVertical: 'top',
  },
  inputHelper: {
    fontSize: 12,
    fontFamily: 'regular',
    color: colors.subGrey,
    marginTop: 4 * DeviceDimensions.heightRatio,
    textAlign: 'right',
  },
  optionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 16 * DeviceDimensions.widthRatio,
    //marginBottom: 16 * DeviceDimensions.heightRatio,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  optionText: {
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.black,
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
    color: colors.black,
    flex: 1,

  },
  vacancyContainer: {
    marginBottom: 24 * DeviceDimensions.heightRatio,
  },
  counterContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    backgroundColor: colors.white,
    borderRadius: 8,
    flex: 1,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    height: 50 * DeviceDimensions.heightRatio,

  },
  counterButton: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  counterButtonText: {
    fontSize: 24,
    fontFamily: 'bold',
    color: colors.black,
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
    color: colors.black,
    marginLeft: 12 * DeviceDimensions.widthRatio,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.addressGrey,
    borderRadius: 8,
    padding: 12 * DeviceDimensions.widthRatio,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  addressInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.black,
    marginLeft: 8 * DeviceDimensions.widthRatio,
  },
  addressHelperText: {
    fontSize: 12,
    fontFamily: 'regular',
    color: colors.grey,
  },
  dateText: {
    fontSize: 14,
    fontFamily: 'medium',
    color: colors.black,
    marginBottom: 8,
  },
  selectedDateContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: colors.primary || '#000',
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
    borderColor: colors.grey,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8 * DeviceDimensions.widthRatio,
    flexDirection: 'row',
  },
  selectedTimeOption: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  timeOptionText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: colors.black,
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
    backgroundColor: colors.white,

    // Shadow for iOS
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,

    // Shadow for Android
    elevation: 4,
  },

  selectedTimeSlot: {
    backgroundColor: colors.primary,
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
    backgroundColor: colors.white,
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
    color: colors.black,
    marginVertical: 8 * DeviceDimensions.heightRatio,
  },
  timePickerSeparator: {
    fontSize: 24,
    fontFamily: 'bold',
    color: colors.black,
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
    backgroundColor: colors.primary,
  },
  amPmText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: colors.black,
  },
  amPmText2: {
    fontSize: 16,
    fontFamily: 'medium',
    color: colors.white,
  },
  budgetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 24 * DeviceDimensions.heightRatio,
    flexDirection: 'row',
    backgroundColor: colors.switchGrey,
    padding: 20,
    borderRadius: 12,
  },
  currencySymbol: {
    fontSize: 36,
    fontFamily: 'bold',
    color: colors.black,
  },
  currencyText: {
    fontSize: 36,
    fontFamily: 'bold',
    color: colors.black,
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
    backgroundColor: colors.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  numpadButtonText: {
    fontSize: 24,
    fontFamily: 'bold',
    color: colors.black,
  },
  nextButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    padding: 16 * DeviceDimensions.widthRatio,
    alignItems: 'center',
    marginTop: 16 * DeviceDimensions.heightRatio,
  },
  nextButtonText: {
    fontSize: 16,
    fontFamily: 'bold',
    color: colors.white,
  },
  dropContainer: {
    backgroundColor: colors.white,
    borderRadius: 8,
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.black,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden', // Important for picker border radius
    marginBottom: 19 * DeviceDimensions.heightRatio,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,

  },
  picker: {
    width: '100%',
    color: colors.black,
    backgroundColor: colors.white,
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
    backgroundColor: colors.white,
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
    color: colors.black,
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
    backgroundColor: colors.white,
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
    color: colors.black,
  },
  modalInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  modalInput: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 8,
    paddingHorizontal: 12 * DeviceDimensions.widthRatio,
    paddingVertical: 12 * DeviceDimensions.heightRatio,
    fontSize: 16,
    fontFamily: 'regular',
    color: colors.black,
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
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 10,
  },
  address2: {
    width: '100%',
    backgroundColor: colors.address2,
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
    color: colors.black,
  },
  previewActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.green,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    marginRight: 10,
  },
  statusText: {
    color: colors.darkGreen,
    fontSize: 14,
    fontWeight: '500',
    marginRight: 4,
  },
  menuContainer: {
    position: 'absolute',
    right: 0,
    top: 40,
    backgroundColor: colors.white,
    borderRadius: 8,
    padding: 8,
    shadowColor: colors.black,
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
    color: colors.black,
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
    backgroundColor: colors.categoryBox
  },
  avatarText: {
    color: colors.white,
    fontWeight: '600',
    fontSize: 14,
  },
  userName: {
    fontSize: 16,
    color: colors.black,
    fontWeight: '500',
  },
  jobTitlePreview: {
    fontSize: 26,
    fontWeight: 'bold',
    color: colors.black,
    marginTop: 12 * DeviceDimensions.heightRatio,
    marginBottom: 4 * DeviceDimensions.heightRatio,
    lineHeight: 32,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.categoryBox,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    marginTop: 12 * DeviceDimensions.heightRatio,
  },

  categoryBadgeText: {
    color: colors.black,
    marginLeft: 6,
    fontSize: 12,
    fontFamily: 'medium',
  },
  separator: {
    height: 1,
    backgroundColor: colors.grey,
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
    color: colors.grey,
    fontWeight: 'medium',
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    color: colors.black,
    fontWeight: 'bold'
  },
  budget: {
    fontSize: 24,
    color: colors.black,
    fontWeight: 'bold'
  },
  descriptionValue: {
    fontSize: 16,
    color: colors.black,
    fontWeight: 'bold',
    marginBottom: 20 * DeviceDimensions.heightRatio
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
    backgroundColor: colors.grey,
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
    color: colors.black,
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    paddingHorizontal: 20,
    marginBottom: 30 * DeviceDimensions.heightRatio,
  },
  editButton123: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.grey,
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
    width: 111 * DeviceDimensions.widthRatio,
    height: 163 * DeviceDimensions.heightRatio,
    resizeMode: 'contain',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  nameContainer2: {
    flex: 1,
    backgroundColor: colors.subGrey,
    borderTopLeftRadius: 20,
    borderBottomLeftRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  nameContainer1: {
    flex: 1,
    justifyContent: 'space-between'
  },
  previewCard: {
    flexDirection: 'row',
    backgroundColor: colors.white,
    borderRadius: 24,
    padding: 24 * DeviceDimensions.widthRatio,
    marginBottom: 24 * DeviceDimensions.heightRatio,
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 24,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  previewLeftSection: {
    flex: 1.5,
    paddingRight: 16 * DeviceDimensions.widthRatio,
    justifyContent: 'space-between',
  },
  previewRightSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  categoryIconContainer: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  categoryIconLarge: {
    width: '80%',
    height: '80%',
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
    color: colors.black,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },

  // Premium Category Card
  selectedCategoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    padding: 16 * DeviceDimensions.widthRatio,
    borderRadius: 16,
    // Premium Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 24 * DeviceDimensions.heightRatio,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
  },
  premiumCategoryIconContainer: {
    width: 48 * DeviceDimensions.widthRatio,
    height: 48 * DeviceDimensions.heightRatio,
    borderRadius: 12,
    backgroundColor: colors.categoryBox,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16 * DeviceDimensions.widthRatio,
  },
  categoryTextContainer: {
    flex: 1,
  },
  categoryLabel: {
    fontSize: 12,
    color: colors.grey,
    fontFamily: 'medium',
    marginBottom: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  categoryValue: {
    fontSize: 16,
    color: colors.black,
    fontFamily: 'bold',
  },
  editIconContainer: {
    padding: 8,
    backgroundColor: colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Premium Input Fields
  inputLabel: {
    fontSize: 14,
    color: colors.black,
    fontFamily: 'bold',
    marginBottom: 8 * DeviceDimensions.heightRatio,
    marginTop: 8 * DeviceDimensions.heightRatio,
  },
  premiumInputContainer: {
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8E8E8',
    marginBottom: 8 * DeviceDimensions.heightRatio,
    marginTop: 4 * DeviceDimensions.heightRatio,
    // Focus state logic will be handled inline or via state
  },
  premiumInput: {
    paddingHorizontal: 16 * DeviceDimensions.widthRatio,
    paddingVertical: 16 * DeviceDimensions.heightRatio,
    fontSize: 16,
    color: colors.black,
    fontFamily: 'regular',
  },
  premiumTextArea: {
    paddingHorizontal: 16 * DeviceDimensions.widthRatio,
    paddingVertical: 16 * DeviceDimensions.heightRatio,
    fontSize: 16,
    color: colors.black,
    fontFamily: 'regular',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  // Premium Budget Styles
  premiumBudgetContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40 * DeviceDimensions.heightRatio,
    marginBottom: 40 * DeviceDimensions.heightRatio,
  },
  budgetWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 2,
    borderBottomColor: colors.primary,
    paddingBottom: 8,
    marginBottom: 16,
  },
  currencyPrefix: {
    fontSize: 40,
    fontWeight: 'bold',
    color: colors.black,
    marginRight: 8,
  },
  budgetInput: {
    fontSize: 48,
    fontWeight: 'bold',
    color: colors.black,
    minWidth: 100,
    textAlign: 'center',
  },
  budgetHelperText: {
    fontSize: 14,
    color: colors.grey,
    fontFamily: 'regular',
  },
});

export default () => null;
