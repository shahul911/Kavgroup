// Mock data for K.A.V Auditorium website

export const amenities = [
  {
    id: 1,
    title: 'Seating Capacity',
    description: '550 comfortable seats',
    icon: 'Users'
  },
  {
    id: 2,
    title: 'Floating Capacity',
    description: 'Up to 1000 guests',
    icon: 'UserPlus'
  },
  {
    id: 3,
    title: 'Dining Hall',
    description: 'Same floor convenience',
    icon: 'Utensils'
  },
  {
    id: 4,
    title: 'Parking',
    description: 'Ample car parking space',
    icon: 'Car'
  },
  {
    id: 5,
    title: 'Water Purifier',
    description: 'Clean drinking water',
    icon: 'Droplets'
  },
  {
    id: 6,
    title: 'Generator Backup',
    description: 'Uninterrupted power supply',
    icon: 'Zap'
  }
];

export const contactInfo = {
  phone1: '8281142276',
  phone2: '9567941222',
  address: 'KAV Auditorium, near Telephone Exchange, Mundur, Mundur-I, Kerala 678592',
  mapLink: 'https://maps.app.goo.gl/DfmXKUcf4uo4hTATA',
  embedMap: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3918.5!2d76.5!3d10.7!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTDCsDQyJzAwLjAiTiA3NsKwMzAnMDAuMCJF!5e0!3m2!1sen!2sin!4v1234567890'
};

// Mock booked dates - in real app, this will come from backend
export const bookedDates = [
  new Date(2025, 7, 15), // August 15, 2025
  new Date(2025, 7, 20),
  new Date(2025, 7, 25),
  new Date(2025, 8, 5), // September 5, 2025
  new Date(2025, 8, 12),
  new Date(2025, 8, 18)
];

export const eventTypes = [
  'Wedding',
  'Reception',
  'Birthday Party',
  'Anniversary',
  'Cultural Program',
  'Convention',
  'Corporate Event',
  'Other'
];

// Mock function to check if date is available
export const isDateAvailable = (date) => {
  return !bookedDates.some(
    bookedDate =>
      bookedDate.getDate() === date.getDate() &&
      bookedDate.getMonth() === date.getMonth() &&
      bookedDate.getFullYear() === date.getFullYear()
  );
};

// Mock function to submit enquiry (will be replaced with API call)
export const submitEnquiry = async (formData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock enquiry submission:', formData);
      resolve({ success: true, message: 'Enquiry submitted successfully!' });
    }, 1000);
  });
};

// Mock function to submit booking (will be replaced with API call)
export const submitBooking = async (bookingData) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log('Mock booking submission:', bookingData);
      resolve({ success: true, message: 'Booking request submitted successfully!' });
    }, 1000);
  });
};