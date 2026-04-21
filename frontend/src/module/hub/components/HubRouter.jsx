import { Suspense, lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import Loader from "@/components/Loader";
import HubLayout from "./HubLayout";

const AdminHome = lazy(() => import("@/module/admin/pages/AdminHome"));
const OrdersPage = lazy(() => import("@/module/admin/pages/orders/OrdersPage"));
const RestaurantsList = lazy(() => import("@/module/admin/pages/restaurant/RestaurantsList"));
const DeliverymanList = lazy(() => import("@/module/admin/pages/delivery-partners/DeliverymanList"));
const RestaurantComplaints = lazy(() => import("@/module/admin/pages/restaurant/RestaurantComplaints"));
const AddRestaurant = lazy(() => import("@/module/admin/pages/restaurant/AddRestaurant"));
const AddDeliveryman = lazy(() => import("@/module/admin/pages/delivery-partners/AddDeliveryman"));
const Customers = lazy(() => import("@/module/admin/pages/Customers"));
const HubProfile = lazy(() => import("../pages/HubProfile"));

export default function HubRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<HubLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="orders" element={<OrdersPage statusKey="all" isHub />} />
          <Route path="restaurants" element={<RestaurantsList isHub />} />
          <Route path="restaurants/add" element={<AddRestaurant />} />
          <Route path="delivery-partners" element={<DeliverymanList isHub />} />
          <Route path="delivery-partners/add" element={<AddDeliveryman />} />
          <Route path="customers" element={<Customers isHub />} />
          <Route path="complaints" element={<RestaurantComplaints isHub />} />
          <Route path="profile" element={<HubProfile />} />
          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
