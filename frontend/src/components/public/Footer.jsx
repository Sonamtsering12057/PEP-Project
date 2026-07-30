import React from "react";
import { Link } from "react-router-dom";

const Footer = () => {
  const hours = [
    {
      id: 1,
      day: "Monday",
      time: "9:00 AM - 11:00 PM",
    },
    {
      id: 2,
      day: "Tuesday",
      time: "12:00 PM - 12:00 AM",
    },
    {
      id: 3,
      day: "Wednesday",
      time: "10:00 AM - 10:00 PM",
    },
    {
      id: 4,
      day: "Thursday",
      time: "9:00 AM - 9:00 PM",
    },
    {
      id: 5,
      day: "Monday",
      time: "3:00 PM - 9:00 PM",
    },
    {
      id: 6,
      day: "Saturday",
      time: "9:00 AM - 3:00 PM",
    },
  ];

  return (
    <footer className={"container py-5"}>
      <div className="content w-full flex justify-between">
        <div className="w-[15%]">
          <img src="/image.png" alt="logo" className="logo-img"/>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-2">Quick Links</h4>
          <ul className="space-y-1">
            <Link to={"/"} className="block hover:text-teal-600">Home</Link>
            <Link to={"/patient/dashboard"} className="block hover:text-teal-600">Appointment</Link>
            <Link to={"/"} className="block hover:text-teal-600">About</Link>
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-2">Hours</h4>
          <ul className="space-y-1 text-sm">
            {hours.map((element) => (
              <li key={element.id} className="flex justify-between gap-4 border-b border-gray-300 pb-1">
                <span>{element.day}</span>
                <span>{element.time}</span>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="font-bold text-lg mb-2">Contact</h4>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex items-center gap-2">
              <img src="/phone-call_597177.png" alt="phone" className="w-5" />
              <span>+91 7037585448</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/email.png" alt="email" className="w-5" />
              <span>aaragya@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <img src="/pin.png" alt="location" className="w-5" />
              <span>Phagwara, Punjab, India</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
