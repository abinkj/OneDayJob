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
            <View style={styles.categoryContainer}>
                {categories.map((category) => (
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
                        <Text style={styles.categoryName}>{category.name}</Text>
                    </View>
                ))}
            </View>
        </View>
    );
};

export default CategorySelector;
