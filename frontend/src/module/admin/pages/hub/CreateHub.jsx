import { useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Building2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import { decodeToken, getModuleToken } from "@/lib/utils/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function getAdminRole() {
  const token = getModuleToken("admin");
  const decoded = decodeToken(token);
  return decoded?.adminRole || decoded?.role || null;
}

export default function CreateHub() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const adminRole = getAdminRole();
  const isSuperAdmin = adminRole === "super_admin";

  const [loading, setLoading] = useState(false);
  const [loadingZones, setLoadingZones] = useState(true);
  const [zones, setZones] = useState([]);
  const [form, setForm] = useState({
    hubName: "",
    managerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    zoneIds: [],
    status: "active",
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!isSuperAdmin) return;

    const loadZones = async () => {
      try {
        const response = await adminAPI.getZones({ limit: 500 });
        setZones(response?.data?.data?.zones || response?.data?.zones || []);
      } catch {
        setZones([]);
      } finally {
        setLoadingZones(false);
      }
    };

    loadZones();
  }, [isSuperAdmin]);

  useEffect(() => {
    if (!isSuperAdmin) return;
    if (!id) return;

    const loadHub = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getHubById(id);
        const hub = response?.data?.data?.hub || response?.data?.hub;

        if (!hub) throw new Error("Hub not found");

        setForm({
          hubName: hub.hubName || "",
          managerName: hub.managerName || "",
          email: hub.email || "",
          phone: hub.phone || "",
          password: "",
          confirmPassword: "",
          zoneIds: hub.assignedZones?.map((zone) => zone._id) || [],
          status: hub.status || "active",
        });
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load hub");
        navigate("/admin/hubs");
      } finally {
        setLoading(false);
      }
    };

    loadHub();
  }, [id, isSuperAdmin, navigate]);

  if (!isSuperAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const validate = () => {
    const nextErrors = {};

    if (!form.hubName.trim()) nextErrors.hubName = "Hub name is required";
    if (!form.managerName.trim()) nextErrors.managerName = "Manager name is required";
    if (!form.email.trim()) nextErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Invalid email";
    }

    if (!isEdit) {
      if (!form.password) nextErrors.password = "Password is required";
      else if (form.password.length < 6) {
        nextErrors.password = "Password must be at least 6 characters";
      }

      if (form.password !== form.confirmPassword) {
        nextErrors.confirmPassword = "Passwords do not match";
      }
    }

    if (!form.zoneIds.length) nextErrors.zoneIds = "Select at least one zone";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!validate()) return;

    try {
      setLoading(true);

      if (isEdit) {
        await adminAPI.updateHub(id, {
          hubName: form.hubName.trim(),
          managerName: form.managerName.trim(),
          phone: form.phone.trim(),
          status: form.status,
        });
        await adminAPI.updateHubZones(id, form.zoneIds);
        toast.success("Hub updated successfully");
      } else {
        await adminAPI.createHub({
          hubName: form.hubName.trim(),
          managerName: form.managerName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone.trim(),
          password: form.password,
          confirmPassword: form.confirmPassword,
          zoneIds: form.zoneIds,
          status: form.status,
        });
        toast.success("Hub created successfully");
      }

      navigate("/admin/hubs");
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save hub");
    } finally {
      setLoading(false);
    }
  };

  const toggleZone = (zoneId) => {
    setForm((prev) => ({
      ...prev,
      zoneIds: prev.zoneIds.includes(zoneId)
        ? prev.zoneIds.filter((id) => id !== zoneId)
        : [...prev.zoneIds, zoneId],
    }));
  };

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="icon" onClick={() => navigate("/admin/hubs")}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-slate-900">
              {isEdit ? "Edit Hub" : "Create Hub"}
            </h1>
          </div>

          <form onSubmit={handleSubmit} className="space-y-1">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Hub Name *</Label>
                <Input
                  value={form.hubName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, hubName: event.target.value }))
                  }
                  placeholder="e.g. Vijay Nagar Hub"
                />
                {errors.hubName ? (
                  <p className="text-red-500 text-sm mt-1">{errors.hubName}</p>
                ) : null}
              </div>
              <div>
                <Label>Manager Name *</Label>
                <Input
                  value={form.managerName}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, managerName: event.target.value }))
                  }
                  placeholder="e.g. John Doe"
                />
                {errors.managerName ? (
                  <p className="text-red-500 text-sm mt-1">{errors.managerName}</p>
                ) : null}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, email: event.target.value }))
                  }
                  placeholder="manager@example.com"
                  disabled={isEdit}
                />
                {errors.email ? (
                  <p className="text-red-500 text-sm mt-1">{errors.email}</p>
                ) : null}
                {isEdit ? (
                  <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>
                ) : null}
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(event) =>
                    setForm((prev) => ({ ...prev, phone: event.target.value }))
                  }
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {!isEdit ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, password: event.target.value }))
                    }
                    placeholder="Min 6 characters"
                  />
                  {errors.password ? (
                    <p className="text-red-500 text-sm mt-1">{errors.password}</p>
                  ) : null}
                </div>
                <div>
                  <Label>Confirm Password *</Label>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        confirmPassword: event.target.value,
                      }))
                    }
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword ? (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  ) : null}
                </div>
              </div>
            ) : null}

            <div>
              <Label>Assign Zone(s) *</Label>
              {loadingZones ? (
                <p className="text-slate-500 text-sm mt-2">Loading zones...</p>
              ) : (
                <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                  {zones.map((zone) => (
                    <label key={zone._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.zoneIds.includes(zone._id)}
                        onChange={() => toggleZone(zone._id)}
                      />
                      <span>{zone.name || zone.zoneName || zone.serviceLocation || zone._id}</span>
                    </label>
                  ))}
                  {zones.length === 0 ? (
                    <p className="text-slate-500 text-sm">No zones available. Create zones first.</p>
                  ) : null}
                </div>
              )}
              {errors.zoneIds ? (
                <p className="text-red-500 text-sm mt-1">{errors.zoneIds}</p>
              ) : null}
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, status: event.target.value }))
                }
                className="w-full mt-2 px-3 py-2 border rounded-lg"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <div className="flex gap-3 pt-6">
              <Button type="button" variant="outline" onClick={() => navigate("/admin/hubs")}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {isEdit ? "Update Hub" : "Create Hub"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
