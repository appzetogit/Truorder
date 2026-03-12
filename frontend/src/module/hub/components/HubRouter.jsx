import { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import HubLayout from "./HubLayout";
import Loader from "@/components/Loader";

const AdminHome = lazy(() => import("@/module/admin/pages/AdminHome"));
const OrdersPage = lazy(() => import("@/module/admin/pages/orders/OrdersPage"));
const RestaurantsList = lazy(() => import("@/module/admin/pages/restaurant/RestaurantsList"));
const DeliverymanList = lazy(() => import("@/module/admin/pages/delivery-partners/DeliverymanList"));
const RestaurantWithdraws = lazy(() => import("@/module/admin/pages/transactions/RestaurantWithdraws"));
const DeliveryWithdrawal = lazy(() => import("@/module/admin/pages/DeliveryWithdrawal"));
const EmployeeList = lazy(() => import("@/module/admin/pages/employees/EmployeeList"));
const RestaurantComplaints = lazy(() => import("@/module/admin/pages/restaurant/RestaurantComplaints"));
const HubProfile = lazy(() => import("../pages/HubProfile"));

export default function HubRouter() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route element={<HubLayout />}>
          <Route index element={<AdminHome />} />
          <Route path="orders" element={<OrdersPage statusKey="all" />} />
          <Route path="restaurants" element={<RestaurantsList />} />
          <Route path="delivery-partners" element={<DeliverymanList />} />
          <Route
            path="payouts"
            element={<RestaurantWithdraws />}
          />
          <Route
            path="payouts/delivery"
            element={<DeliveryWithdrawal />}
          />
          <Route path="employees" element={<EmployeeList />} />
          <Route path="complaints" element={<RestaurantComplaints />} />
          <Route path="profile" element={<HubProfile />} />
          {/* Fallback */}
          <Route path="*" element={<Navigate to="/hub" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}


