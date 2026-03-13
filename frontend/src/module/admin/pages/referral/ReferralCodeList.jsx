import { useState, useEffect } from "react"
import {
  Plus,
  Search,
  Loader2,
  MoreVertical,
  Trash2,
  ToggleLeft,
  ToggleRight,
  Copy,
  Link,
  Truck,
  UtensilsCrossed,
  Hash,
  Calendar,
  Users,
  ShieldCheck,
  ShieldOff,
  Sparkles,
  Clock,
  Infinity,
  AlertCircle,
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
import { format, isPast } from "date-fns"

export default function ReferralCodeList() {
  const [codes, setCodes] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("")
  const [statusFilter, setStatusFilter] = useState("")
  const [createDialog, setCreateDialog] = useState({
    open: false,
    code: "",
    type: "delivery_partner",
    usageLimit: "",
    expiryDate: "",
    status: "active",
    loading: false,
  })

  const loadCodes = async () => {
    try {
      setLoading(true)
      const params = {}
      if (typeFilter) params.type = typeFilter
      if (statusFilter) params.status = statusFilter
      const res = await adminAPI.getReferralCodes(params)
      const data = res.data?.data?.codes || res.data?.codes || []
      setCodes(data)
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load referral codes")
      setCodes([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadCodes()
  }, [typeFilter, statusFilter])

  const filteredCodes = codes.filter(
    (c) =>
      !searchQuery.trim() ||
      c.code?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async () => {
    const { code, type, usageLimit, expiryDate, status } = createDialog
    if (!code?.trim()) {
      toast.error("Referral code is required")
      return
    }
    try {
      setCreateDialog((p) => ({ ...p, loading: true }))
      await adminAPI.createReferralCode({
        code: code.trim().toUpperCase(),
        type,
        usageLimit: usageLimit ? parseInt(usageLimit, 10) : null,
        expiryDate: expiryDate || null,
        status,
      })
      toast.success("Referral code created successfully")
      setCreateDialog({
        open: false,
        code: "",
        type: "delivery_partner",
        usageLimit: "",
        expiryDate: "",
        status: "active",
        loading: false,
      })
      loadCodes()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to create code")
    } finally {
      setCreateDialog((p) => ({ ...p, loading: false }))
    }
  }

  const handleToggleStatus = async (item) => {
    const nextStatus = item.status === "active" ? "inactive" : "active"
    try {
      await adminAPI.updateReferralCodeStatus(item._id, nextStatus)
      toast.success(`Code ${nextStatus === "active" ? "activated" : "deactivated"}`)
      loadCodes()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to update status")
    }
  }

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete referral code "${item.code}"? This action cannot be undone.`)) return
    try {
      await adminAPI.deleteReferralCode(item._id)
      toast.success("Referral code deleted")
      loadCodes()
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to delete")
    }
  }

  const copyCode = (code) => {
    navigator.clipboard.writeText(code)
    toast.success("Code copied to clipboard")
  }

  const typeLabel = (t) =>
    t === "delivery_partner" ? "Delivery Partner" : "Restaurant"

  const TypeIcon = ({ type }) =>
    type === "delivery_partner" ? (
      <Truck className="w-3.5 h-3.5" />
    ) : (
      <UtensilsCrossed className="w-3.5 h-3.5" />
    )

  const isExpired = (date) => date && isPast(new Date(date))

  const isLimitReached = (item) =>
    item.usageLimit != null && item.usedCount >= item.usageLimit

  const getEffectiveStatus = (item) => {
    if (item.status === "inactive") return "inactive"
    if (isExpired(item.expiryDate)) return "expired"
    if (isLimitReached(item)) return "limit_reached"
    return "active"
  }

  const statusConfig = {
    active: {
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      border: "border-emerald-200",
      dot: "bg-emerald-500",
      label: "Active",
    },
    inactive: {
      bg: "bg-slate-50",
      text: "text-slate-600",
      border: "border-slate-200",
      dot: "bg-slate-400",
      label: "Inactive",
    },
    expired: {
      bg: "bg-amber-50",
      text: "text-amber-700",
      border: "border-amber-200",
      dot: "bg-amber-500",
      label: "Expired",
    },
    limit_reached: {
      bg: "bg-red-50",
      text: "text-red-700",
      border: "border-red-200",
      dot: "bg-red-500",
      label: "Limit Reached",
    },
  }

  const stats = {
    total: codes.length,
    active: codes.filter((c) => getEffectiveStatus(c) === "active").length,
    delivery: codes.filter((c) => c.type === "delivery_partner").length,
    restaurant: codes.filter((c) => c.type === "restaurant").length,
    totalUsage: codes.reduce((sum, c) => sum + (c.usedCount || 0), 0),
  }

  return (
    <div className="p-4 sm:p-6 max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2.5">
            <div className="p-2 bg-indigo-100 rounded-xl">
              <Link className="w-5 h-5 text-indigo-600" />
            </div>
            Referral Codes
          </h1>
          <p className="text-sm text-gray-500 mt-1 ml-11">
            Manage referral codes for partner registrations
          </p>
        </div>
        <Button
          onClick={() => setCreateDialog((p) => ({ ...p, open: true }))}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Create Code
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Hash className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Total</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Active</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{stats.active}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Truck className="w-4 h-4 text-blue-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Delivery</span>
          </div>
          <p className="text-2xl font-bold text-blue-600">{stats.delivery}</p>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Registrations</span>
          </div>
          <p className="text-2xl font-bold text-purple-600">{stats.totalUsage}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-white border-gray-200 focus-visible:ring-indigo-500"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Types</option>
          <option value="delivery_partner">Delivery Partner</option>
          <option value="restaurant">Restaurant</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-200 rounded-lg bg-white text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400 mb-3" />
            <p className="text-sm text-gray-500">Loading referral codes...</p>
          </div>
        ) : filteredCodes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="p-3 bg-gray-100 rounded-full mb-3">
              <Link className="w-6 h-6 text-gray-400" />
            </div>
            <p className="text-gray-500 font-medium">No referral codes found</p>
            <p className="text-sm text-gray-400 mt-1">Create one to get started</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/80 border-b border-gray-200">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Expiry
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Usage
                  </th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="w-14" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCodes.map((item) => {
                  const effective = getEffectiveStatus(item)
                  const sc = statusConfig[effective]
                  const expired = isExpired(item.expiryDate)
                  const limitHit = isLimitReached(item)

                  return (
                    <tr
                      key={item._id}
                      className="hover:bg-gray-50/60 transition-colors"
                    >
                      {/* Code */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-gray-900 bg-gray-100 px-2.5 py-1 rounded-md">
                            {item.code}
                          </span>
                          <button
                            onClick={() => copyCode(item.code)}
                            className="p-1 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
                            title="Copy code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>

                      {/* Type */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                            item.type === "delivery_partner"
                              ? "bg-blue-50 text-blue-700 border border-blue-200"
                              : "bg-orange-50 text-orange-700 border border-orange-200"
                          }`}
                        >
                          <TypeIcon type={item.type} />
                          {typeLabel(item.type)}
                        </span>
                      </td>

                      {/* Created */}
                      <td className="px-5 py-4">
                        <span className="text-sm text-gray-600">
                          {item.createdAt
                            ? format(new Date(item.createdAt), "dd MMM yyyy")
                            : "-"}
                        </span>
                      </td>

                      {/* Expiry */}
                      <td className="px-5 py-4">
                        {item.expiryDate ? (
                          <span
                            className={`inline-flex items-center gap-1 text-sm ${
                              expired ? "text-amber-600 font-medium" : "text-gray-600"
                            }`}
                          >
                            {expired && <AlertCircle className="w-3.5 h-3.5" />}
                            {format(new Date(item.expiryDate), "dd MMM yyyy")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-sm text-gray-400">
                            <Infinity className="w-3.5 h-3.5" />
                            Never
                          </span>
                        )}
                      </td>

                      {/* Usage */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-medium ${limitHit ? "text-red-600" : "text-gray-900"}`}>
                            {item.usedCount}
                          </span>
                          {item.usageLimit != null ? (
                            <>
                              <span className="text-gray-300">/</span>
                              <span className="text-sm text-gray-500">{item.usageLimit}</span>
                              <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    limitHit ? "bg-red-500" : "bg-indigo-500"
                                  }`}
                                  style={{
                                    width: `${Math.min(
                                      (item.usedCount / item.usageLimit) * 100,
                                      100
                                    )}%`,
                                  }}
                                />
                              </div>
                            </>
                          ) : (
                            <span className="text-xs text-gray-400">no limit</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${sc.bg} ${sc.text} ${sc.border}`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dot}`} />
                          {sc.label}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-3 py-4">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-48">
                            <DropdownMenuItem onClick={() => copyCode(item.code)}>
                              <Copy className="w-4 h-4 mr-2" />
                              Copy Code
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleToggleStatus(item)}>
                              {item.status === "active" ? (
                                <>
                                  <ShieldOff className="w-4 h-4 mr-2" />
                                  Deactivate
                                </>
                              ) : (
                                <>
                                  <ShieldCheck className="w-4 h-4 mr-2" />
                                  Activate
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(item)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog
        open={createDialog.open}
        onOpenChange={(open) => setCreateDialog((p) => ({ ...p, open }))}
      >
        <DialogContent className="sm:max-w-[480px] p-0 overflow-hidden">
          {/* Dialog Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-5">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-white text-lg font-semibold">
                  Create Referral Code
                </DialogTitle>
                <DialogDescription className="text-indigo-200 text-sm mt-0.5">
                  Generate a new code for partner registration
                </DialogDescription>
              </div>
            </div>
          </div>

          {/* Dialog Body */}
          <div className="px-6 py-5 space-y-5">
            {/* Code Input */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Referral Code <span className="text-red-500">*</span>
              </Label>
              <div className="relative mt-1.5">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <Hash className="w-4 h-4" />
                </div>
                <Input
                  value={createDialog.code}
                  onChange={(e) =>
                    setCreateDialog((p) => ({
                      ...p,
                      code: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""),
                    }))
                  }
                  placeholder="e.g. PARTNER2024"
                  className="pl-9 font-mono text-sm uppercase tracking-wider h-11 border-gray-200 focus-visible:ring-indigo-500"
                  maxLength={30}
                />
              </div>
              <p className="text-xs text-gray-400 mt-1">Letters and numbers only, auto-uppercased</p>
            </div>

            {/* Type Selection */}
            <div>
              <Label className="text-sm font-medium text-gray-700">
                Type <span className="text-red-500">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setCreateDialog((p) => ({ ...p, type: "delivery_partner" }))}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                    createDialog.type === "delivery_partner"
                      ? "border-indigo-500 bg-indigo-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${
                    createDialog.type === "delivery_partner"
                      ? "bg-indigo-100"
                      : "bg-gray-100"
                  }`}>
                    <Truck className={`w-4 h-4 ${
                      createDialog.type === "delivery_partner"
                        ? "text-indigo-600"
                        : "text-gray-500"
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      createDialog.type === "delivery_partner"
                        ? "text-indigo-700"
                        : "text-gray-700"
                    }`}>
                      Delivery
                    </p>
                    <p className="text-xs text-gray-400">Partner</p>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setCreateDialog((p) => ({ ...p, type: "restaurant" }))}
                  className={`flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all text-left ${
                    createDialog.type === "restaurant"
                      ? "border-indigo-500 bg-indigo-50 shadow-sm"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${
                    createDialog.type === "restaurant"
                      ? "bg-indigo-100"
                      : "bg-gray-100"
                  }`}>
                    <UtensilsCrossed className={`w-4 h-4 ${
                      createDialog.type === "restaurant"
                        ? "text-indigo-600"
                        : "text-gray-500"
                    }`} />
                  </div>
                  <div>
                    <p className={`text-sm font-medium ${
                      createDialog.type === "restaurant"
                        ? "text-indigo-700"
                        : "text-gray-700"
                    }`}>
                      Restaurant
                    </p>
                    <p className="text-xs text-gray-400">Partner</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Usage Limit & Expiry in a row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-sm font-medium text-gray-700">Usage Limit</Label>
                <div className="relative mt-1.5">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Users className="w-4 h-4" />
                  </div>
                  <Input
                    type="number"
                    min={1}
                    value={createDialog.usageLimit}
                    onChange={(e) =>
                      setCreateDialog((p) => ({
                        ...p,
                        usageLimit: e.target.value,
                      }))
                    }
                    placeholder="Unlimited"
                    className="pl-9 h-11 border-gray-200 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium text-gray-700">Expiry Date</Label>
                <div className="relative mt-1.5">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <Input
                    type="date"
                    value={createDialog.expiryDate}
                    onChange={(e) =>
                      setCreateDialog((p) => ({
                        ...p,
                        expiryDate: e.target.value,
                      }))
                    }
                    min={new Date().toISOString().split("T")[0]}
                    className="pl-9 h-11 border-gray-200 focus-visible:ring-indigo-500"
                  />
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <Label className="text-sm font-medium text-gray-700">Status</Label>
              <div className="grid grid-cols-2 gap-3 mt-1.5">
                <button
                  type="button"
                  onClick={() => setCreateDialog((p) => ({ ...p, status: "active" }))}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    createDialog.status === "active"
                      ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Active
                </button>
                <button
                  type="button"
                  onClick={() => setCreateDialog((p) => ({ ...p, status: "inactive" }))}
                  className={`flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 text-sm font-medium transition-all ${
                    createDialog.status === "inactive"
                      ? "border-slate-500 bg-slate-50 text-slate-700"
                      : "border-gray-200 text-gray-500 hover:border-gray-300"
                  }`}
                >
                  <ShieldOff className="w-4 h-4" />
                  Inactive
                </button>
              </div>
            </div>
          </div>

          {/* Dialog Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end gap-3">
            <Button
              variant="outline"
              onClick={() => setCreateDialog((p) => ({ ...p, open: false }))}
              className="border-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={createDialog.loading || !createDialog.code?.trim()}
              className="bg-indigo-600 hover:bg-indigo-700 text-white min-w-[100px]"
            >
              {createDialog.loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-1.5" />
                  Create Code
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
