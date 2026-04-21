import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Store, ClipboardList } from 'lucide-react';

const TruorderPage = () => {
  return (
    <div className="relative">
      {/* Navbar */}
      <nav className="absolute top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="text-white font-bold text-2xl">
              Truorder
            </div>
            
            {/* Navigation Links */}
            <div className="flex items-center space-x-6">
              <a 
                href="https://truorder.in/resturant" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-500 font-medium transition-colors"
              >
                Restaurants
              </a>
              <a 
                href="https://truorder.in/delivery" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-500 font-medium transition-colors"
              >
                Delivery
              </a>
              <a 
                href="https://truorder.in/hub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-white hover:text-yellow-500 font-medium transition-colors"
              >
                Hub
              </a>
              <button className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-medium hover:bg-yellow-600 transition-colors">
                Sign In
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* First Div - Full Screen Top Section */}
      <div className="w-full h-screen relative">
        {/* Video Background */}
        <video 
          className="absolute inset-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/33256-396487978_medium.mp4" type="video/mp4" />
        </video>
        
        {/* Content for first div can go here */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
          <h1 className="text-6xl md:text-7xl font-bold text-white leading-tight mb-4 drop-shadow-lg">Truorder</h1>
          <p className="text-3xl md:text-4xl font-semibold text-white mb-6 drop-shadow-lg">India's #1 <span className="text-red-500">delivery app</span></p>
          <p className="text-lg md:text-xl text-white mb-8 max-w-2xl drop-shadow-lg">Experience fast & easy online ordering on the Truorder app</p>
          {/* App Store Buttons will go here */}
        </div>
      </div>

      {/* Second Div - Original Content */}
      <div className="min-h-screen bg-white relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0">
          {/* Wavy lines */}
          <svg className="absolute w-full h-full" viewBox="0 0 1440 800" fill="none">
            <path 
              d="M0,200 Q360,100 720,200 T1440,200" 
              stroke="#FFB6C1" 
              strokeWidth="3" 
              fill="none"
              opacity="0.3"
            />
            <path 
              d="M0,400 Q360,300 720,400 T1440,400" 
              stroke="#FFB6C1" 
              strokeWidth="2" 
              fill="none"
              opacity="0.2"
            />
            <path 
              d="M0,600 Q360,500 720,600 T1440,600" 
              stroke="#FFB6C1" 
              strokeWidth="3" 
              fill="none"
              opacity="0.3"
            />
          </svg>
          
          {/* Floating food items */}
          <motion.div
            className="absolute top-20 left-10 w-100 h-100"
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src="/Red and Green Illustrated Biryani Sale Instagram Post.png" 
              alt="Biryani" 
              className="w-full h-full object-cover rounded-lg"
            />
          </motion.div>
          
          <motion.div
            className="absolute top-40 right-20 w-100 h-100"
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          >
            <img 
              src="/burger.png" 
              alt="Burger" 
              className="w-full h-full object-cover rounded-lg"
            />
          </motion.div>
          
          <motion.div
            className="absolute top-60 left-1/3 text-4xl"
            animate={{ y: [0, -25, 0] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            <span></span>
          </motion.div>
          
          {/* Decorative leaves and tomatoes */}
          <motion.div
            className="absolute top-32 right-1/3 text-3xl text-green-500"
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          >
            <span></span>
          </motion.div>
          
          <motion.div
            className="absolute bottom-25 left-40 w-100 h-100"
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <img 
              src="/coffie.png" 
              alt="Coffee" 
              className="w-full h-full object-cover rounded-lg"
            />
          </motion.div>
        </div>

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4">
        {/* Main heading */}
        <motion.h1
          className="text-5xl md:text-7xl font-bold text-center mb-8"
          style={{ color: '#E91E63' }}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          Because Every Order Be Perfect
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="text-lg md:text-xl text-gray-600 text-center max-w-2xl mb-16"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          For over a decade, we've enabled our customers to discover new tastes, delivered right to your doorstep
        </motion.p>

        {/* Statistics cards */}
        <motion.div
          className="flex flex-col md:flex-row gap-8 items-center justify-center"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          {/* Restaurants card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg min-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Store className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">3,00,000+</div>
            <div className="text-gray-600">restaurants</div>
          </div>

          {/* Cities card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg min-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">200+</div>
            <div className="text-gray-600">cities</div>
          </div>

          {/* Orders card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg min-w-[200px]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <ClipboardList className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900">3 M+</div>
            <div className="text-gray-600">orders delivered</div>
          </div>
        </motion.div>
      </div>
      </div>

      {/* Third Div - Zomato Gold Style Section */}
      <motion.div 
        className="min-h-screen bg-white relative overflow-hidden"
        initial={{ scale: 0.5, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.3 }}
        transition={{ duration: 1, ease: "easeOut" }}
      >
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent"></div>
        
                
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-20">
          {/* Main Title */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center gap-2 mb-4">
              <span className="text-gray-800 text-5xl font-light lg:text-6xl">truorder</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <span className="text-8xl lg:text-[12rem] font-black text-yellow-500 uppercase font-sans tracking-wider">Delivery</span>
              <span className="text-6xl lg:text-7xl text-yellow-500"></span>
            </div>
            <p className="text-gray-700 text-3xl lg:text-4xl mt-6 max-w-2xl mx-auto">
              Your Ultimate Food Delivery Partner - Order Anything, Anytime, Anywhere
            </p>
          </div>
          
          {/* Gold Benefits Header */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <span className="text-yellow-500 text-2xl">✦</span>
            <span className="text-gray-800 text-lg lg:text-xl font-medium tracking-wider">GOLD BENEFITS</span>
            <span className="text-yellow-500 text-2xl">✦</span>
          </div>
          
                  </div>
      </motion.div>

      {/* Services Section - Hub, Restaurant, Delivery */}
      <div className="min-h-screen bg-white flex items-center justify-center px-4 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-6xl font-bold text-black mb-6">Our Platform</h2>
            <p className="text-xl lg:text-2xl text-gray-700 max-w-3xl mx-auto">
              Discover all the ways Truorder can serve you - from restaurants to delivery hubs
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Restaurants */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Store className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Restaurants</h3>
              <p className="text-gray-700 mb-6">Order from thousands of restaurants near you</p>
              <a 
                href="https://truorder.in/resturant" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Explore Restaurants
              </a>
            </motion.div>

            {/* Delivery */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <ClipboardList className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Delivery</h3>
              <p className="text-gray-700 mb-6">Fast and reliable delivery to your doorstep</p>
              <a 
                href="https://truorder.in/delivery" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Start Delivery
              </a>
            </motion.div>

            {/* Hub */}
            <motion.div 
              className="bg-white rounded-2xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3 }}
            >
              <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-10 h-10 text-yellow-500" />
              </div>
              <h3 className="text-2xl font-bold text-black mb-4">Hub</h3>
              <p className="text-gray-700 mb-6">Connect with local delivery hubs and partners</p>
              <a 
                href="https://truorder.in/hub" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block bg-yellow-500 text-black px-6 py-3 rounded-lg font-medium hover:bg-yellow-600 transition-colors"
              >
                Visit Hub
              </a>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Fourth Div - Download App Section */}
      <div className="h-screen bg-white flex items-center justify-center">
        <div className="relative bg-white rounded-3xl  p-24 lg:p-32 flex flex-col lg:flex-row items-center justify-center max-w-full mx-auto w-full">
            {/* Left Section - Text */}
            <div className="text-center lg:text-left mb-16 lg:mb-0 lg:mr-32">
              <h2 className="text-6xl lg:text-8xl font-bold text-black leading-tight mb-8">
                Download the app now!
              </h2>
              <p className="text-2xl lg:text-3xl text-gray-700 mb-12 max-w-lg">
                Experience seamless online ordering
                <br />
                only on the Truorder app
              </p>
              {/* Removed App Store and Google Play buttons */}
            </div>

            {/* Right Section - Mobile with QR Code */}
            <div className="relative flex items-center justify-center">
              {/* Mobile Phone Frame (Simplified) */}
              <div className="relative w-64 h-96 bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-6 bg-gray-900 rounded-t-2xl flex items-center justify-center">
                  <div className="w-16 h-2 bg-gray-700 rounded-full"></div>
                </div>
                <div className="absolute inset-x-0 top-6 bottom-0 bg-white flex flex-col items-center justify-center p-4">
                  <p className="text-gray-700 text-center mb-4">Scan the QR code to<br />download the app</p>
                  {/* QR Code Image */}
                  <img src="/image.png" alt="QR Code" className="w-40 h-40" />
                </div>
              </div>
            </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
            {/* Company Logo and Copyright */}
            <div className="col-span-1 lg:col-span-2">
              <div className="flex items-center mb-4">
                <span className="text-2xl font-bold text-black">Truorder</span>
              </div>
              <p className="text-gray-500 text-sm mb-4">© 2025 Truorder Limited</p>
              <div className="mb-4">
                <p className="text-black font-semibold mb-2">For better experience, download the Truorder app now</p>
                <div className="flex gap-2">
                  <img src="/path/to/app-store.png" alt="App Store" className="h-10 cursor-pointer" />
                  <img src="/path/to/google-play.png" alt="Google Play" className="h-10 cursor-pointer" />
                </div>
              </div>
            </div>

            {/* Services Links */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Our Platform</h3>
              <ul className="space-y-2">
                <li><a href="https://truorder.in/resturant" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-black flex items-center gap-2">
                  <Store className="w-4 h-4" />
                  Restaurants
                </a></li>
                <li><a href="https://truorder.in/delivery" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-black flex items-center gap-2">
                  <ClipboardList className="w-4 h-4" />
                  Delivery
                </a></li>
                <li><a href="https://truorder.in/hub" target="_blank" rel="noopener noreferrer" className="text-yellow-500 hover:text-black flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Hub
                </a></li>
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Company</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-yellow-500 hover:text-black">About Us</a></li>
                <li><a href="#" className="text-yellow-500 hover:text-black">Truorder Corporate</a></li>
                <li><a href="#" className="text-yellow-500 hover:text-black">Careers</a></li>
                <li><a href="#" className="text-yellow-500 hover:text-black">Team</a></li>
              </ul>
            </div>

            {/* Contact Links */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Contact Us</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-yellow-500 hover:text-black">Help & Support</a></li>
                <li><a href="#" className="text-yellow-500 hover:text-black">Partner With Us</a></li>
                <li><a href="#" className="text-yellow-500 hover:text-black">Ride With Us</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-yellow-500 hover:text-black">Terms & Conditions</a></li>
                <li><a href="#" className="text-yellow-500 hover:text-black">Cookie Policy</a></li>
                <li><a href="#" className="text-yellow-500 hover:text-black">Privacy Policy</a></li>
              </ul>
            </div>

            {/* Social Links */}
            <div>
              <h3 className="text-lg font-semibold text-black mb-4">Follow Us</h3>
              <div className="flex space-x-4">
                <a href="#" className="text-yellow-500 hover:text-black">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
                </a>
                <a href="#" className="text-yellow-500 hover:text-white">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM5.838 12a6.162 6.162 0 1112.324 0 6.162 6.162 0 01-12.324 0zM12 16a4 4 0 110-8 4 4 0 010 8zm4.965-10.405a1.44 1.44 0 112.881.001 1.44 1.44 0 01-2.881-.001z"/></svg>
                </a>
                <a href="#" className="text-yellow-500 hover:text-black">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/></svg>
                </a>
              </div>
            </div>
          </div>

          {/* Available in Cities Section */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-black mb-4">Available in Cities</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm">Bangalore</span>
              <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm">Gurgaon</span>
              <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm">Hyderabad</span>
              <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm">Delhi</span>
              <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm">Mumbai</span>
              <span className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm">Pune</span>
              <button className="px-3 py-1 bg-yellow-500 text-black rounded-full text-sm border border-yellow-600">685 cities</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TruorderPage;
