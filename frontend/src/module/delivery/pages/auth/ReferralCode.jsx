import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { ArrowLeft, Loader2, CheckCircle2 } from "lucide-react"
import AnimatedPage from "../../../user/components/AnimatedPage"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { deliveryAPI, referralAPI } from "@/lib/api"
import { setAuthData as storeAuthData } from "@/lib/utils/auth"

export default function DeliveryReferralCode() {
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
      navigate("/delivery/sign-in", { replace: true })
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
      const response = await referralAPI.verify(code, "delivery_partner")
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
      const response = await deliveryAPI.completeRegistrationWithReferral(
        tempToken,
        code
      )
      const data = response?.data?.data || {}

      const accessToken = data.accessToken
      const user = data.user

      if (!accessToken || !user) {
        throw new Error("Invalid response from server")
      }

      sessionStorage.removeItem("deliveryAuthData")

      storeAuthData("delivery", accessToken, user)
      localStorage.setItem("delivery_needsSignup", "true")
      window.dispatchEvent(new Event("deliveryAuthChanged"))

      navigate("/delivery/signup/details", { replace: true })
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
    <AnimatedPage className="min-h-screen bg-white flex flex-col">
      <div className="relative flex items-center justify-center py-4 px-4 border-b border-gray-200">
        <button
          onClick={() => navigate("/delivery/sign-in")}
          className="absolute left-4 top-1/2 -translate-y-1/2"
          aria-label="Go back"
        >
          <ArrowLeft className="h-5 w-5 text-black" />
        </button>
        <h1 className="text-lg font-bold text-black">Enter Referral Code</h1>
      </div>

      <div className="flex flex-col justify-center px-6 pt-8 pb-12">
        <div className="max-w-md mx-auto w-full space-y-6">
          <p className="text-base text-gray-700 text-center">
            A valid referral code is required to register as a Delivery Partner.
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
                className="w-full h-12 bg-[#00B761] hover:bg-[#00A055] text-white font-semibold"
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
                className="w-full h-12 bg-[#00B761] hover:bg-[#00A055] text-white font-semibold"
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

      <div className="pt-4 mt-auto px-6 text-center pb-8">
        <button
          type="button"
          onClick={() => navigate("/delivery/sign-in")}
          className="text-sm text-[#E23744] hover:underline"
        >
          Go back to sign in
        </button>
      </div>
    </AnimatedPage>
  )
}
