import React from "react";
import "./App.css";
import { Toaster } from './components/ui/sonner';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { About } from './components/About';
import { Amenities } from './components/Amenities';
import { BookingCalendar } from './components/BookingCalendar';
import { Location } from './components/Location';
import { Contact } from './components/Contact';
import { EnquiryForm } from './components/EnquiryForm';
import { Footer } from './components/Footer';

function App() {
  return (
    <div className="App">
      <Toaster position="top-right" richColors />
      <Header />
      <Hero />
      <About />
      <Amenities />
      <BookingCalendar />
      <Location />
      <Contact />
      <EnquiryForm />
      <Footer />
    </div>
  );
}

export default App;
