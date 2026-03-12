import { useEffect, useState } from "react";
import { adminAPI } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function HubProfile() {
  const [loading, setLoading] = useState(true);
  const [hub, setHub] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getCurrentHubProfile();
        const hubData = res.data?.data?.hub || res.data?.hub;
        setHub(hubData);
      } catch (err) {
        toast.error(err?.response?.data?.message || "Failed to load hub profile");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
              <Input
                value={hub.managerName || ""}
                disabled
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input value={hub.email || ""} disabled />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Phone</Label>
              <Input
                value={hub.phone || ""}
                disabled
              />
            </div>
            <div>
              <Label>Assigned Zones</Label>
              <div className="mt-1 flex flex-wrap gap-1">
                {(hub.assignedZones || []).map((z) => (
                  <span
                    key={z._id}
                    className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-xs"
                  >
                    {z.name}
                  </span>
                ))}
                {(!hub.assignedZones || hub.assignedZones.length === 0) && (
                  <span className="text-xs text-slate-500">No zones assigned</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

