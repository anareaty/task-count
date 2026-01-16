/**
 * Gets a nested property from an object using dot notation.
 * @param obj The object to get the property from.
 * @param path The path to the property using dot notation (e.g., 'obsidian.icon').
 * @returns The value at the specified path, or undefined if not found.
 */


export const getNestedProperty = (obj: unknown, path: string) => {
    if (!obj || !path) {
        return undefined;
    }
    // Split the path by dots and traverse the object
    const keys = path.split('.');
    let result = obj;
    for (const key of keys) {
        if (result === null || result === undefined) {
            return undefined;
        }
        if (typeof result == "object" && key in result) {
            result = result[key as keyof typeof result];
        }
    }
    return result;
};





/**
 * Sets a nested property in an object using dot notation.
 * @param obj The object to set the property in.
 * @param path The path to the property using dot notation (e.g., 'obsidian.icon').
 * @param value The value to set.
 */

export const setNestedProperty = (obj: unknown, path: string, value: unknown): void => {
    if (!obj || !path) {
        return;
    }
    const keys = path.split('.');
    let current: unknown = obj;
    
    // Navigate to the parent of the target property
    for (let i = 0; i < keys.length - 1; i++) {
        const key = keys[i];
        // Create intermediate objects if they don't exist
        if (key && current && typeof current == "object") {
            let currentObj = current as Record<string, unknown>
            if (currentObj[key] === null || currentObj[key] === undefined || typeof currentObj[key] !== 'object') {
                currentObj[key] = {};
            } 
            current = currentObj[key];
        }
    }
    
    // Set the final property
    let finalKey = keys[keys.length - 1]
    if (finalKey && current && typeof current == "object") {
        let currentObj = current as Record<string, unknown>
        currentObj[finalKey] = value;
        current = currentObj
    }
    
};







