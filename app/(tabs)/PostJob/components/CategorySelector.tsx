import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

interface Category {
    id: string;
    name: string;
    icon: any;
}

interface CategorySelectorProps {
    categories: Category[];
    selectedCategory: string | null;
    onSelect: (categoryId: string, categoryName: string) => void;
    styles: any;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
    categories,
    selectedCategory,
    onSelect,
    styles,
}) => {
    return (
        <View style={{ paddingBottom: 20 }}>
            <Text style={styles.sectionTitle}>Select Category</Text>

            {/* Standard Categories Grid */}
            <View style={styles.categoryContainer}>
                {categories
                    .filter(c => c.id !== 'custom')
                    .map((category) => (
                        <View style={styles.CategoryView} key={category.id}>
                            <TouchableOpacity
                                style={[
                                    styles.categoryItem,
                                    selectedCategory === category.id && styles.selectedCategory,
                                ]}
                                onPress={() => onSelect(category.id, category.name)}
                            >
                                <Image
                                    source={category.icon}
                                    style={styles.categoryIcon}
                                    resizeMode="contain"
                                />
                            </TouchableOpacity>
                            <Text style={styles.categoryName} numberOfLines={1}>{category.name}</Text>
                        </View>
                    ))}
            </View>

            {/* Custom Category Card */}
            {categories.find(c => c.id === 'custom') && (
                <View style={styles.customCategoryContainer}>
                    <TouchableOpacity
                        style={[
                            styles.customCategoryCard,
                            selectedCategory === 'custom' && styles.customCategoryCardSelected
                        ]}
                        onPress={() => onSelect('custom', 'Custom')}
                    >
                        <View style={styles.customCategoryIconContainer}>
                            <Image
                                source={categories.find(c => c.id === 'custom')?.icon}
                                style={styles.customCategoryIcon}
                                resizeMode="contain"
                            />
                        </View>
                        <View style={styles.customCategoryContent}>
                            <Text style={styles.customCategoryTitle}>
                                Other / Custom Job
                            </Text>
                            <Text style={styles.customCategorySubtitle}>
                                Don't see your category? Create a custom job posting.
                            </Text>
                        </View>
                        <View>
                            {/* Selected Indicator */}
                            {selectedCategory === 'custom' && (
                                <View style={{
                                    width: 20,
                                    height: 20,
                                    borderRadius: 10,
                                    backgroundColor: '#6366F1', // Using primary color directly or pass via props if needed
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    {/* Checkmark icon could go here */}
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

export default CategorySelector;
