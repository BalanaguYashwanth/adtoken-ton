export function generateUniqueNumericId() {
    const timestamp = Date.now() % 100000; // Use last 5 digits of timestamp
    const randomNum = Math.floor(Math.random() * 100000); // Random number between 0 and 99999
    const uniqueId = (timestamp * 100000 + randomNum) % 2147483647; // Ensure it fits 32-bit range
    return uniqueId;
}