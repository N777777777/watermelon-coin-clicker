/**
 * Truncates a wallet address for display purposes.
 * @param address The full wallet address string.
 * @param startLength The number of characters to show from the start.
 * @param endLength The number of characters to show from the end.
 * @returns A truncated address string like "0x1234...5678".
 */
export const truncateAddress = (
  address: string,
  startLength: number = 4,
  endLength: number = 4
): string => {
  if (!address) return '';
  if (address.length <= startLength + endLength) return address;
  return `${address.substring(0, startLength)}...${address.substring(address.length - endLength)}`;
};
