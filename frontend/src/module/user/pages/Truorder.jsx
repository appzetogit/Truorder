import { ArrowRight, Sparkles, Truck, UtensilsCrossed } from "lucide-react"
import { Link } from "react-router-dom"

export default function Truorder() {
  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_#fff7ed,_#ffffff_42%,_#f8fafc_100%)] px-4 py-10 text-slate-900 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white/90 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur">
          <div className="grid gap-8 px-6 py-8 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-12 lg:py-14">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-semibold text-orange-700">
                <Sparkles className="h-4 w-4" />
                Truorder
              </div>

              <div className="space-y-4">
                <h1 className="max-w-2xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl">
                  Fast ordering, clean tracking, and a sharper Truorder entry point.
                </h1>
                <p className="max-w-xl text-base leading-7 text-slate-600 sm:text-lg">
                  This route is now live and ready for the next Truorder experience you want to build.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Explore Home
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  to="/orders"
                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                >
                  View Orders
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              <div className="rounded-[1.5rem] bg-slate-950 p-5 text-white">
                <Truck className="mb-4 h-8 w-8 text-orange-300" />
                <h2 className="text-lg font-bold">Quick dispatch</h2>
                <p className="mt-2 text-sm leading-6 text-slate-300">
                  Keep fulfillment focused with a route ready for order-centric flows.
                </p>
              </div>

              <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                <UtensilsCrossed className="mb-4 h-8 w-8 text-orange-600" />
                <h2 className="text-lg font-bold text-slate-900">Built for food ordering</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use this page as a landing route, marketing screen, or future product surface.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
