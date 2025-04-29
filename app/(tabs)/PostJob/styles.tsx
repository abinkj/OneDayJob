import { StyleSheet } from "react-native";
import { Colors } from "../../../constants/Colors";
import DeviceDimensions from "../../../constants/DeviceDimenions";

export const styles = StyleSheet.create({
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
  },
  selectedTimeOption: {
    borderColor: Colors.primary,
    backgroundColor: Colors.white,
  },
  timeOptionText: {
    fontSize: 14,
    fontFamily: 'regular',
    color: Colors.black,
  },
  timeSlotGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16 * DeviceDimensions.heightRatio,
  },
  timeSlot: {
    width: 168 * DeviceDimensions.widthRatio,
    height: 119 * DeviceDimensions.heightRatio,
    backgroundColor: Colors.white,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 16 * DeviceDimensions.widthRatio,
  },
  selectedTimeSlot: {
    borderColor: Colors.primary,
    borderWidth: 2,
  },
  timeSlotIcon: {
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  timeSlotName: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
    marginBottom: 4 * DeviceDimensions.heightRatio,
  },
  timeSlotTime: {
    fontSize: 12,
    fontFamily: 'regular',
    color: Colors.grey,
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16 * DeviceDimensions.heightRatio,
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
  },
  amPmButton: {
    padding: 8 * DeviceDimensions.widthRatio,
    borderRadius: 4,
    marginBottom: 8 * DeviceDimensions.heightRatio,
  },
  selectedAmPm: {
    backgroundColor: Colors.primary,
  },
  amPmText: {
    fontSize: 16,
    fontFamily: 'medium',
    color: Colors.black,
  },
  budgetContainer: {
    alignItems: 'center',
    marginVertical: 24 * DeviceDimensions.heightRatio,
  },
  currencySymbol: {
    fontSize: 36,
    fontFamily: 'bold',
    color: Colors.black,
    width: '100%',
    height: 100,
    textAlign: 'center'
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

}); 