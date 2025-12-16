import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Amenities } from './components/Amenities';
import { Gallery } from './components/Gallery';
import { Testimonials } from './components/Testimonials';
import { BookingCalendar } from './components/BookingCalendar';
import { Location } from './components/Location';
import { Contact } from './components/Contact';
import { EnquiryForm } from './components/EnquiryForm';
import { Footer } from './components/Footer';
import { AdminLogin } from './admin/AdminLogin';
import { AdminDashboard } from './admin/AdminDashboard';
import { AdminBookings } from './admin/AdminBookings';
import { AdminEnquiries } from './admin/AdminEnquiries';
import { AdminDocuments } from './admin/AdminDocuments';
import { AdminReminders } from './admin/AdminReminders';
import { AdminUsers } from './admin/AdminUsers';
import { AdminGallery } from './admin/AdminGallery';
import { AdminTestimonials } from './admin/AdminTestimonials';

const HomePage = () => {
  return (
    <>
      <Header />
      <Hero />
      <About />
      <Amenities />
      <Gallery />
      <Testimonials />
      <BookingCalendar />
      <Location />
      <Contact />
      <EnquiryForm />
      <Footer />
    </>
  );
};

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Admin Routes - Hidden URL */}
          <Route path="/admin-kav-Catlife41056" element={<AdminLogin />} />
          <Route path="/admin-kav-Catlife41056/dashboard" element={<AdminDashboard currentPage="overview" />} />
          <Route path="/admin-kav-Catlife41056/bookings" element={<AdminBookings />} />
          <Route path="/admin-kav-Catlife41056/enquiries" element={<AdminEnquiries />} />
          <Route path="/admin-kav-Catlife41056/documents" element={<AdminDocuments />} />
          <Route path="/admin-kav-Catlife41056/reminders" element={<AdminReminders />} />
          <Route path="/admin-kav-Catlife41056/users" element={<AdminUsers />} />
          <Route path="/admin-kav-Catlife41056/gallery" element={<AdminGallery />} />
          <Route path="/admin-kav-Catlife41056/testimonials" element={<AdminTestimonials />} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
