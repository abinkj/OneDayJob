import api from './api';
import { SavedAddress } from '../types';

/**
 * Get all saved addresses for the current user
 */
export const getSavedAddresses = async () => {
    return api.get('/saved-addresses');
};

/**
 * Add a new saved address
 */
export const addSavedAddress = async (address: Omit<SavedAddress, '_id' | 'createdAt'>) => {
    return api.post('/saved-addresses', address);
};

/**
 * Update an existing saved address
 */
export const updateSavedAddress = async (
    addressId: string,
    address: Partial<Omit<SavedAddress, '_id' | 'createdAt'>>
) => {
    return api.put(`/saved-addresses/${addressId}`, address);
};

/**
 * Delete a saved address
 */
export const deleteSavedAddress = async (addressId: string) => {
    return api.delete(`/saved-addresses/${addressId}`);
};

/**
 * Set an address as default
 */
export const setDefaultAddress = async (addressId: string) => {
    return api.patch(`/saved-addresses/${addressId}/default`);
};
