import React from "react";
import "./App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
