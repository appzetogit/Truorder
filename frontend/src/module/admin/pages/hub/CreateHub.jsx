import { useState, useEffect } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { getModuleToken } from "@/lib/utils/auth"
import { Building2, Loader2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"

function getAdminRole() {
  try {
    const token = getModuleToken("admin")
    if (!token) return null
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))
    return payload?.hubRole || payload?.adminRole || payload?.role
  } catch {
    return null
  }
}

export default function CreateHub() {
  const navigate = useNavigate()
  const { id } = useParams()
  const isEdit = Boolean(id)

  useEffect(() => {
    if (getAdminRole() === "hub_manager") {
      navigate("/admin", { replace: true })
    }
  }, [navigate])

  const [loading, setLoading] = useState(false)
  const [loadingZones, setLoadingZones] = useState(true)
  const [zones, setZones] = useState([])
  const [form, setForm] = useState({
    hubName: "",
    managerName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    zoneIds: [],
    status: "active",
  })
  const [errors, setErrors] = useState({})

  useEffect(() => {
    const loadZones = async () => {
      try {
        const res = await adminAPI.getZones({ limit: 500 })
        setZones(res.data?.data?.zones || res.data?.zones || [])
      } catch {
        setZones([])
      } finally {
        setLoadingZones(false)
      }
    }
    loadZones()
  }, [])

  useEffect(() => {
    if (!id) return
    const load = async () => {
      try {
        setLoading(true)
        const res = await adminAPI.getHubById(id)
        const hub = res.data?.data?.hub || res.data?.hub
        if (!hub) throw new Error("Hub not found")
        setForm({
          hubName: hub.hubName || "",
          managerName: hub.managerName || "",
          email: hub.email || "",
          phone: hub.phone || "",
          password: "",
          confirmPassword: "",
          zoneIds: hub.assignedZones?.map((z) => z._id) || [],
          status: hub.status || "active",
        })
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load hub")
        navigate("/admin/hubs")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, navigate])

  const validate = () => {
    const e = {}
    if (!form.hubName?.trim()) e.hubName = "Hub name is required"
    if (!form.managerName?.trim()) e.managerName = "Manager name is required"
    if (!form.email?.trim()) e.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Invalid email"
    if (!isEdit) {
      if (!form.password) e.password = "Password is required"
      else if (form.password.length < 6) e.password = "Password must be at least 6 characters"
      if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match"
    }
    if (!form.zoneIds?.length) e.zoneIds = "Select at least one zone"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validate()) return

    try {
      setLoading(true)
      if (isEdit) {
        await adminAPI.updateHub(id, {
          hubName: form.hubName.trim(),
          managerName: form.managerName.trim(),
          phone: form.phone?.trim() || "",
          status: form.status,
        })
        await adminAPI.updateHubZones(id, form.zoneIds)
        toast.success("Hub updated successfully")
      } else {
        await adminAPI.createHub({
          hubName: form.hubName.trim(),
          managerName: form.managerName.trim(),
          email: form.email.trim().toLowerCase(),
          phone: form.phone?.trim() || "",
          password: form.password,
          confirmPassword: form.confirmPassword,
          zoneIds: form.zoneIds,
          status: form.status,
        })
        toast.success("Hub created successfully")
      }
      navigate("/admin/hubs")
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to save hub")
    } finally {
      setLoading(false)
    }
  }

  const toggleZone = (zoneId) => {
    setForm((p) => ({
      ...p,
      zoneIds: p.zoneIds.includes(zoneId)
        ? p.zoneIds.filter((z) => z !== zoneId)
        : [...p.zoneIds, zoneId],
    }))
  }

  if (loading && isEdit) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
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
                  onChange={(e) => setForm((p) => ({ ...p, hubName: e.target.value }))}
                  placeholder="e.g. Vijay Nagar Hub"
                />
                {errors.hubName && <p className="text-red-500 text-sm mt-1">{errors.hubName}</p>}
              </div>
              <div>
                <Label>Manager Name *</Label>
                <Input
                  value={form.managerName}
                  onChange={(e) => setForm((p) => ({ ...p, managerName: e.target.value }))}
                  placeholder="e.g. John Doe"
                />
                {errors.managerName && <p className="text-red-500 text-sm mt-1">{errors.managerName}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  placeholder="manager@example.com"
                  disabled={isEdit}
                />
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
                {isEdit && <p className="text-slate-500 text-xs mt-1">Email cannot be changed</p>}
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  value={form.phone}
                  onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            {!isEdit && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label>Password *</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                    placeholder="Min 6 characters"
                  />
                  {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
                </div>
                <div>
                  <Label>Confirm Password *</Label>
                  <Input
                    type="password"
                    value={form.confirmPassword}
                    onChange={(e) => setForm((p) => ({ ...p, confirmPassword: e.target.value }))}
                    placeholder="Confirm password"
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>
                  )}
                </div>
              </div>
            )}

            <div>
              <Label>Assign Zone(s) *</Label>
              {loadingZones ? (
                <p className="text-slate-500 text-sm mt-2">Loading zones...</p>
              ) : (
                <div className="mt-2 space-y-2 max-h-[200px] overflow-y-auto border rounded-lg p-3">
                  {zones.map((z) => (
                    <label key={z._id} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.zoneIds.includes(z._id)}
                        onChange={() => toggleZone(z._id)}
                      />
                      <span>{z.name || z.zoneName || z.serviceLocation || z._id}</span>
                    </label>
                  ))}
                  {zones.length === 0 && (
                    <p className="text-slate-500 text-sm">No zones available. Create zones first.</p>
                  )}
                </div>
              )}
              {errors.zoneIds && <p className="text-red-500 text-sm mt-1">{errors.zoneIds}</p>}
            </div>

            <div>
              <Label>Status</Label>
              <select
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
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
                {loading && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {isEdit ? "Update Hub" : "Create Hub"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
