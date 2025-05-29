/**
 * Storage service for persisting data in the browser
 * Provides methods for saving and retrieving data from localStorage
 */

/**
 * Save data to localStorage with the given key
 * @param key The key to store the data under
 * @param data The data to store
 */
export function saveToLocalStorage<T>(key: string, data: T): void {
  try {
    const serializedData = JSON.stringify(data);
    localStorage.setItem(key, serializedData);
  } catch (error) {
    console.error(`Error saving data to localStorage with key ${key}:`, error);
  }
}

/**
 * Retrieve data from localStorage with the given key
 * @param key The key to retrieve data from
 * @param defaultValue The default value to return if no data is found
 * @returns The retrieved data or the default value
 */
export function getFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const serializedData = localStorage.getItem(key);
    if (serializedData === null) {
      return defaultValue;
    }
    return JSON.parse(serializedData) as T;
  } catch (error) {
    console.error(`Error retrieving data from localStorage with key ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Remove data from localStorage with the given key
 * @param key The key to remove
 */
export function removeFromLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data from localStorage with key ${key}:`, error);
  }
}

/**
 * Check if data exists in localStorage with the given key
 * @param key The key to check
 * @returns True if data exists, false otherwise
 */
export function existsInLocalStorage(key: string): boolean {
  return localStorage.getItem(key) !== null;
}

/**
 * Append data to an array stored in localStorage
 * @param key The key where the array is stored
 * @param item The item to append
 */
export function appendToLocalStorageArray<T>(key: string, item: T): void {
  try {
    const existingData = getFromLocalStorage<T[]>(key, []);
    existingData.push(item);
    saveToLocalStorage(key, existingData);
  } catch (error) {
    console.error(`Error appending to localStorage array with key ${key}:`, error);
  }
}

/**
 * Update an item in an array stored in localStorage
 * @param key The key where the array is stored
 * @param predicate A function that returns true for the item to update
 * @param updateFn A function that returns the updated item
 */
export function updateInLocalStorageArray<T>(
  key: string, 
  predicate: (item: T) => boolean, 
  updateFn: (item: T) => T
): void {
  try {
    const existingData = getFromLocalStorage<T[]>(key, []);
    const updatedData = existingData.map(item => 
      predicate(item) ? updateFn(item) : item
    );
    saveToLocalStorage(key, updatedData);
  } catch (error) {
    console.error(`Error updating item in localStorage array with key ${key}:`, error);
  }
}

/**
 * Remove an item from an array stored in localStorage
 * @param key The key where the array is stored
 * @param predicate A function that returns true for the item to remove
 */
export function removeFromLocalStorageArray<T>(
  key: string, 
  predicate: (item: T) => boolean
): void {
  try {
    const existingData = getFromLocalStorage<T[]>(key, []);
    const filteredData = existingData.filter(item => !predicate(item));
    saveToLocalStorage(key, filteredData);
  } catch (error) {
    console.error(`Error removing item from localStorage array with key ${key}:`, error);
  }
}

/**
 * Clear all data from localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.clear();
  } catch (error) {
    console.error('Error clearing localStorage:', error);
  }
}