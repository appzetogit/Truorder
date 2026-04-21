import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, LogOut } from "lucide-react";
import { toast } from "sonner";
import { adminAPI } from "@/lib/api";
import { clearModuleAuth } from "@/lib/utils/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HubProfile() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [hub, setHub] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getCurrentHubProfile();
        setHub(response?.data?.data?.hub || response?.data?.hub || null);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load hub profile");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleLogout = async () => {
    try {
      await adminAPI.logout();
    } catch {
      // ignore logout API errors and clear local state anyway
    }

    clearModuleAuth("hub");
    navigate("/hub/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!hub) {
    return (
      <div className="p-4 lg:p-6">
        <p className="text-sm text-slate-600">Hub profile not found.</p>
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-4 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Hub Profile</CardTitle>
          <CardDescription>View your hub details and assigned zones.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Hub Name</Label>
              <Input value={hub.hubName || ""} disabled />
            </div>
            <div>
              <Label>Status</Label>
              <Input value={hub.status === "inactive" ? "Inactive" : "Active"} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Manager Name</Label>
              <Input value={hub.managerName || ""} disabled />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={hub.email || ""} disabled />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input value={hub.phone || ""} disabled />
            </div>
            <div>
              <Label>Assigned Zones</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {(hub.assignedZones || []).map((zone) => (
                  <span
                    key={zone._id}
                    className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs"
                  >
                    {zone.name}
                  </span>
                ))}
                {(!hub.assignedZones || hub.assignedZones.length === 0) ? (
                  <span className="text-xs text-slate-500">No zones assigned</span>
                ) : null}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          variant="destructive"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}
