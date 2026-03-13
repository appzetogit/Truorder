import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { restaurantAPI, referralAPI } from "@/lib/api"
import { setAuthData as setRestaurantAuthData } from "@/lib/utils/auth"

export default function RestaurantReferralCode() {
  const navigate = useNavigate()
  const location = useLocation()
  const [referralCode, setReferralCode] = useState("")
  const [isVerifying, setIsVerifying] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [tempToken, setTempToken] = useState(null)
  const [sponsorName, setSponsorName] = useState(null)
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    const token = location.state?.tempToken
    if (!token) {
      navigate("/restaurant/login", { replace: true })
      return
    }
    setTempToken(token)
  }, [location.state, navigate])

  const handleVerify = async () => {
    const code = referralCode.trim()
    if (!code) {
      setError("Please enter your referral code")
      return
    }

    setIsVerifying(true)
    setError("")
    setSponsorName(null)
    setVerified(false)

    try {
      const response = await referralAPI.verify(code, "restaurant")
      const data = response?.data?.data || {}

      if (data.valid) {
        setSponsorName(data.sponsorName || "Verified Sponsor")
        setVerified(true)
      } else {
        setError(data.message || "Invalid Referral Code")
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to verify referral code. Please try again."
      setError(message)
    } finally {
      setIsVerifying(false)
    }
  }

  const handleSubmit = async (e) => {
    e?.preventDefault()
    if (!verified) {
      handleVerify()
      return
    }

    const code = referralCode.trim()
    if (!tempToken) {
      setError("Session expired. Please start again.")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const response = await restaurantAPI.completeRegistrationWithReferral(
        tempToken,
        code
      )
      const data = response?.data?.data || {}

      const accessToken = data.accessToken
      const restaurant = data.restaurant

      if (!accessToken || !restaurant) {
        throw new Error("Invalid response from server")
      }

      sessionStorage.removeItem("restaurantAuthData")

      setRestaurantAuthData("restaurant", accessToken, restaurant)
      window.dispatchEvent(new Event("restaurantAuthChanged"))

      navigate("/restaurant/onboarding", { replace: true })
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Invalid referral code. Please try again."
      setError(message)
      setVerified(false)
      setSponsorName(null)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isLoading = isVerifying || isSubmitting

  if (!tempToken) {
    return null
  }

  return (
    <div className="max-h-screen h-screen bg-white flex flex-col">
      <div className="relative flex items-center justify-center py-4 px-4">
        <button
          onClick={() => navigate("/restaurant/login")}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </button>
        <h2 className="text-lg font-bold text-black">Enter Referral Code</h2>
      </div>

      <div className="flex-1 flex flex-col px-6 overflow-y-auto">
        <div className="max-w-md mx-auto w-full space-y-6 py-8">
          <p className="text-base text-gray-700 text-center">
            A valid referral code is required to register as a Restaurant Partner.
            Please enter the code provided to you.
          </p>

          {error && (
            <p className="text-sm text-red-500 text-center">{error}</p>
          )}

          {verified && sponsorName && (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
              <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
              <div>
                <p className="text-xs text-green-600 font-medium">Sponsor Verified</p>
                <p className="text-base font-semibold text-green-900">{sponsorName}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Referral Code <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={referralCode}
                onChange={(e) => {
                  setReferralCode(e.target.value.toUpperCase())
                  setError("")
                  if (verified) {
                    setVerified(false)
                    setSponsorName(null)
                  }
                }}
                placeholder="Enter referral code"
                disabled={isLoading}
                className="w-full h-12 text-center font-mono text-lg uppercase tracking-wider"
                autoFocus
              />
            </div>

            {!verified ? (
              <Button
                type="button"
                onClick={handleVerify}
                disabled={isLoading || !referralCode.trim()}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isVerifying ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Verify Code"
                )}
              </Button>
            ) : (
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  "Continue Registration"
                )}
              </Button>
            )}
          </form>
        </div>
      </div>

      <div className="pt-4 px-6 text-center pb-8">
        <button
          type="button"
          onClick={() => navigate("/restaurant/login")}
          className="text-sm text-blue-600 hover:underline"
        >
          Go back to login
        </button>
      </div>
    </div>
  )
}
