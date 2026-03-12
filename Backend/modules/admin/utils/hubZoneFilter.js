/**
 * Hub Zone Filter Utilities
 * Helpers to apply zone-based filtering for Hub Managers
 */

/**
 * Get order zone match for MongoDB query
 * Orders have assignmentInfo.zoneId (string)
 */
export function getOrderZoneFilter(assignedZoneIds) {
  if (!assignedZoneIds?.length) return {};
  return { 'assignmentInfo.zoneId': { $in: assignedZoneIds } };
}

/**
 * Get restaurant IDs that have orders in the given zones
 * Use when Restaurant doesn't have zoneId - fallback
 */
export async function getRestaurantIdsFromOrders(Order, assignedZoneIds) {
  if (!assignedZoneIds?.length) return [];
  return Order.distinct('restaurantId', {
    'assignmentInfo.zoneId': { $in: assignedZoneIds },
  });
}

/**
 * Delivery partners have availability.zones (array of ObjectIds)
 */
export function getDeliveryZoneFilter(assignedZoneIds) {
  if (!assignedZoneIds?.length) return {};
  return { 'availability.zones': { $in: assignedZoneIds } };
}
