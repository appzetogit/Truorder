export function getOrderZoneFilter(assignedZoneIds) {
  if (!assignedZoneIds?.length) return {};
  return { "assignmentInfo.zoneId": { $in: assignedZoneIds } };
}

export async function getRestaurantIdsFromOrders(Order, assignedZoneIds) {
  if (!assignedZoneIds?.length) return [];

  return Order.distinct("restaurantId", {
    "assignmentInfo.zoneId": { $in: assignedZoneIds },
  });
}

export function getDeliveryZoneFilter(assignedZoneIds) {
  if (!assignedZoneIds?.length) return {};
  return { "availability.zones": { $in: assignedZoneIds } };
}
