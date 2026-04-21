import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { adminAPI } from "@/lib/api";
import { decodeToken, isModuleAuthenticated, setAuthData } from "@/lib/utils/auth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function HubLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isModuleAuthenticated("hub")) return;

    const token = localStorage.getItem("hub_accessToken");
    const decoded = decodeToken(token);
    if (decoded?.hubRole === "hub_manager") {
      navigate("/hub", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsLoading(true);

    if (!email.trim() || !password) {
      setError("Email and password are required");
      setIsLoading(false);
      return;
    }

    try {
      const response = await adminAPI.login(email, password);
      const data = response?.data?.data || response?.data;

      if (!data?.accessToken || !data?.admin) {
        throw new Error("Login failed. Please try again.");
      }

      const decoded = decodeToken(data.accessToken);
      if (decoded?.hubRole !== "hub_manager") {
        setError("This account is not a hub manager account.");
        setIsLoading(false);
        return;
      }

      setAuthData("hub", data.accessToken, data.admin);
      navigate("/hub", { replace: true });
    } catch (err) {
      setError(
        err?.response?.data?.message ||
          err?.response?.data?.error ||
          err?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-neutral-50 via-gray-100 to-white flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md bg-white/90 backdrop-blur border-neutral-200 shadow-2xl">
        <CardHeader className="pb-4">
          <CardTitle className="text-2xl leading-tight text-gray-900">
            Hub Login
          </CardTitle>
          <CardDescription className="text-sm text-gray-600">
            Sign in to access your hub panel.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-md bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">
                {error}
              </div>
            ) : null}

            <div className="space-y-2">
              <Label htmlFor="hub-email">Email</Label>
              <Input
                id="hub-email"
                type="email"
                autoComplete="email"
                placeholder="hub.manager@example.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="hub-password">Password</Label>
              <div className="relative">
                <Input
                  id="hub-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing in..." : "Sign in"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
