import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { getModuleToken } from "@/lib/utils/auth"
import {
  Building2,
  Search,
  Plus,
  Edit,
  Key,
  MapPin,
  MoreVertical,
  Loader2,
  UserX,
  UserCheck,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { adminAPI } from "@/lib/api"
import { toast } from "sonner"
import { format } from "date-fns"

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

export default function HubList() {
  const navigate = useNavigate()
  const [hubs, setHubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [resetPasswordDialog, setResetPasswordDialog] = useState({
    open: false,
    hub: null,
    password: "",
    confirmPassword: "",
    loading: false,
  })
  const [zonesDialog, setZonesDialog] = useState({
    open: false,
    hub: null,
    zoneIds: [],
    availableZones: [],
    loading: false,
  })

  useEffect(() => {
    if (getAdminRole() === "hub_manager") {
      navigate("/admin", { replace: true })
    }
  }, [navigate])

  const loadHubs = async () => {
    try {
      setLoading(true)
      const res = await adminAPI.getHubs()
      const data = res.data?.data?.hubs || res.data?.hubs || []
      setHubs(data)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load hubs")
      setHubs([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadHubs()
  }, [])

  const filteredHubs = hubs.filter(
    (h) =>
      !searchQuery.trim() ||
      h.hubName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.managerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.email?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleDisable = async (hub) => {
    if (!window.confirm(`Disable hub "${hub.hubName}"?`)) return
    try {
      await adminAPI.disableHub(hub._id)
      toast.success("Hub disabled")
      loadHubs()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to disable hub")
    }
  }

  const handleEnable = async (hub) => {
    try {
      await adminAPI.enableHub(hub._id)
      toast.success("Hub enabled")
      loadHubs()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to enable hub")
    }
  }

  const handleResetPassword = async () => {
    const { hub, password, confirmPassword } = resetPasswordDialog
    if (!hub || !password || !confirmPassword) {
      toast.error("Fill all fields")
      return
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match")
      return
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters")
      return
    }
    try {
      setResetPasswordDialog((p) => ({ ...p, loading: true }))
      await adminAPI.resetHubPassword(hub._id, password, confirmPassword)
      toast.success("Password reset successfully")
      setResetPasswordDialog({ open: false, hub: null, password: "", confirmPassword: "", loading: false })
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to reset password")
      setResetPasswordDialog((p) => ({ ...p, loading: false }))
    }
  }

  const openZonesDialog = async (hub) => {
    setZonesDialog({
      open: true,
      hub,
      zoneIds: hub.assignedZones?.map((z) => z._id) || [],
      availableZones: [],
      loading: false,
    })
    try {
      const res = await adminAPI.getZones({ limit: 500 })
      const zones = res.data?.data?.zones || res.data?.zones || []
      setZonesDialog((p) => ({ ...p, availableZones: zones }))
    } catch {
      setZonesDialog((p) => ({ ...p, availableZones: [] }))
    }
  }

  const handleUpdateZones = async () => {
    const { hub, zoneIds } = zonesDialog
    if (!hub || !zoneIds?.length) {
      toast.error("Select at least one zone")
      return
    }
    try {
      setZonesDialog((p) => ({ ...p, loading: true }))
      await adminAPI.updateHubZones(hub._id, zoneIds)
      toast.success("Zones updated")
      setZonesDialog({ open: false, hub: null, zoneIds: [], availableZones: [], loading: false })
      loadHubs()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update zones")
      setZonesDialog((p) => ({ ...p, loading: false }))
    }
  }

  return (
    <div className="p-4 lg:p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Hub Management</h1>
                <p className="text-slate-600 text-sm">Manage hub managers and their assigned zones</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/admin/hubs/create")}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Hub
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div className="relative flex-1 max-w-[280px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search by hub name, manager, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Hub Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Manager Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Email</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Phone</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Assigned Zones</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Created Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHubs.map((hub) => (
                    <tr key={hub._id} className="border-b border-slate-100 hover:bg-slate-50">
                      <td className="py-3 px-4 font-medium">{hub.hubName}</td>
                      <td className="py-3 px-4">{hub.managerName}</td>
                      <td className="py-3 px-4">{hub.email}</td>
                      <td className="py-3 px-4">{hub.phone || "-"}</td>
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1">
                          {(hub.assignedZones || []).map((z) => (
                            <span
                              key={z._id}
                              className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs"
                            >
                              {z.name}
                            </span>
                          ))}
                          {(!hub.assignedZones || hub.assignedZones.length === 0) && "-"}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            hub.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {hub.status === "active" ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-sm">
                        {hub.createdAt ? format(new Date(hub.createdAt), "dd MMM, yyyy") : "-"}
                      </td>
                      <td className="py-3 px-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => navigate(`/admin/hubs/edit/${hub._id}`)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Hub
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => openZonesDialog(hub)}>
                              <MapPin className="w-4 h-4 mr-2" />
                              Change Assigned Zones
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                setResetPasswordDialog({
                                  open: true,
                                  hub,
                                  password: "",
                                  confirmPassword: "",
                                  loading: false,
                                })
                              }
                            >
                              <Key className="w-4 h-4 mr-2" />
                              Reset Password
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            {hub.status === "active" ? (
                              <DropdownMenuItem
                                onClick={() => handleDisable(hub)}
                                className="text-amber-600"
                              >
                                <UserX className="w-4 h-4 mr-2" />
                                Disable Hub
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleEnable(hub)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Enable Hub
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredHubs.length === 0 && (
                <div className="py-12 text-center text-slate-500">
                  No hubs found. Create your first hub to get started.
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog.open} onOpenChange={(o) => setResetPasswordDialog((p) => ({ ...p, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
            <DialogDescription>
              Set a new password for {resetPasswordDialog.hub?.managerName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>New Password</Label>
              <Input
                type="password"
                value={resetPasswordDialog.password}
                onChange={(e) => setResetPasswordDialog((p) => ({ ...p, password: e.target.value }))}
                placeholder="Min 6 characters"
              />
            </div>
            <div>
              <Label>Confirm Password</Label>
              <Input
                type="password"
                value={resetPasswordDialog.confirmPassword}
                onChange={(e) => setResetPasswordDialog((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setResetPasswordDialog((p) => ({ ...p, open: false }))}>
              Cancel
            </Button>
            <Button onClick={handleResetPassword} disabled={resetPasswordDialog.loading}>
              {resetPasswordDialog.loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Reset Password
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Zones Dialog */}
      <Dialog open={zonesDialog.open} onOpenChange={(o) => setZonesDialog((p) => ({ ...p, open: o }))}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Assigned Zones</DialogTitle>
            <DialogDescription>
              Select zones for {zonesDialog.hub?.hubName}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[300px] overflow-y-auto space-y-2">
            {(zonesDialog.availableZones || []).map((z) => (
              <label key={z._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={zonesDialog.zoneIds?.includes(z._id)}
                  onChange={(e) => {
                    if (e.target.checked) {
                      setZonesDialog((p) => ({ ...p, zoneIds: [...(p.zoneIds || []), z._id] }))
                    } else {
                      setZonesDialog((p) => ({
                        ...p,
                        zoneIds: (p.zoneIds || []).filter((id) => id !== z._id),
                      }))
                    }
                  }}
                />
                <span>{z.name || z.zoneName || z.serviceLocation || z._id}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setZonesDialog((p) => ({ ...p, open: false }))}>
              Cancel
            </Button>
            <Button onClick={handleUpdateZones} disabled={zonesDialog.loading}>
              {zonesDialog.loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Update Zones
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
