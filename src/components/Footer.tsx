import React from "react";
import {
  FaChevronRight,
  FaClock,
  FaFacebookF,
  FaInstagram,
  FaMapMarkerAlt,
  FaYoutube,
} from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { FiExternalLink } from "react-icons/fi";
import { RiContactsBook3Line } from "react-icons/ri";
import CircleRotating from "./circleRotating";
import White_logo from "@/assets/white_logo.png";

const Footer: React.FC = () => {
  return (
    <footer className="md:pt-[130px] pt-16 bg-[#151A4D] overflow-hidden">
      <div className="container mx-auto md:px-0 px-4 flex md:flex-row flex-col md:gap-8 gap-5 justify-between">
        {/* Logo + CQC */}
        <div className="bg-[#1E2461] py-7 px-5 rounded-lg md:w-[19%] w-full">
          <div>
            <img src={White_logo} alt="footer_logo" width={134} height={43} />
            <p className="text-[15px] font-normal text-white font-poppins mt-6">
              Vivid Care Services Ltd
            </p>
          </div>

          <div className="px-2.5">
            <div>
              <p className="text-[15px] font-bold text-white font-poppins mt-5">
                CQC overall rating
              </p>
              <p className="text-ld font-bold text-white font-poppins mt-5 flex items-center gap-2">
                Good{" "}
                <span className="w-3 h-3 rounded-full bg-green-800 inline-block"></span>
              </p>
              <p className="text-[15px] font-light text-white font-poppins mt-5">
                2 December 2024
              </p>
              <a
                href="#"
                className="text-[15px] font-bold text-[#6C276A] font-poppins mt-5 flex items-center gap-2 bg-white pl-2.5 pr-6 py-2 rounded-sm w-fit"
              >
                See the report <FaChevronRight />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="flex gap-2.5 items-start md:w-[27%] w-full">
          <div>
            <div className="md:text-2xl text-lg flex md:min-w-[40px] md:h-[40px] min-w-[28px] h-[28px] justify-center items-center text-[#ed1b7b] border-2 border-[#ed1b7b] rounded-full group relative">
              <CircleRotating
                bgColor="#151a4d"
                size="h-[calc(100%+5px)] w-[calc(100%+5px)]"
              />
              <RiContactsBook3Line className="relative z-10" />
            </div>
          </div>

          <div>
            <div>
              <h6 className="md:text-[26px] md:leading-none text-xl font-bold text-white font-playfair tracking-[-0.6] mb-3">
                Contact Us Now
              </h6>
              <ul className="flex flex-col gap-2">
                <li>
                  <a
                    href="tel:03333399946"
                    className="text-sm font-medium text-white font-poppins hover:text-[#ed1b7b]"
                  >
                    T: 0333 339 9946
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@vividcareservices.co.uk"
                    target="_blank"
                    className="text-sm font-medium text-white font-poppins hover:text-[#ed1b7b]"
                    rel="noreferrer"
                  >
                    E: info@vividcareservices.co.uk
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:recruitment@vividcareservices.co.uk"
                    target="_blank"
                    className="text-sm font-medium text-white font-poppins hover:text-[#ed1b7b] text-nowrap"
                    rel="noreferrer"
                  >
                    E: recruitment@vividcareservices.co.uk
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="flex gap-2.5 items-start md:w-[25%] w-full">
          <div>
            <div className="md:text-2xl text-lg flex md:min-w-[40px] md:h-[40px] min-w-[28px] h-[28px] justify-center items-center text-[#ed1b7b] border-2 border-[#ed1b7b] rounded-full group relative">
              <CircleRotating
                bgColor="#151a4d"
                size="h-[calc(100%+5px)] w-[calc(100%+5px)]"
              />
              <FaMapMarkerAlt className="relative z-10" />
            </div>
          </div>

          <div>
            <div>
              <h6 className="md:text-[26px] md:leading-none text-xl font-bold text-white font-playfair tracking-[-0.6] mb-3">
                Head Office Address
              </h6>
              <p className="text-sm font-medium text-white font-poppins">
                Warren Bruce Court 1st floor Warren Bruce Rd, Trafford Park,
                Stretford, Manchester M17 1LB
              </p>

              <div className="mt-12">
                <h6 className="md:text-xl text-lg font-bold text-white font-playfair flex items-center gap-2 mb-3">
                  Warrington Address{" "}
                  <FiExternalLink className="text-[#ed1b7b]" />
                </h6>
                <p className="text-sm font-medium text-white font-poppins">
                  The Heath Business Park Heath Rd S, Weston, Runcorn WA7 4QX
                </p>
              </div>

              <div className="mt-12">
                <h6 className="md:text-xl text-lg font-bold text-white font-playfair mb-3">
                  Warwickshire Address
                </h6>
                <p className="text-sm font-medium text-white font-poppins">
                  Forward house 17 High Street, Henley-In-Arden B95 5AA,
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div className="flex gap-2.5 items-start md:w-1/5 w-full">
          <div>
            <div className="md:text-2xl text-lg flex md:min-w-[40px] md:h-[40px] min-w-[28px] h-[28px] justify-center items-center text-[#ed1b7b] border-2 border-[#ed1b7b] rounded-full group relative">
              <CircleRotating
                bgColor="#151a4d"
                size="h-[calc(100%+5px)] w-[calc(100%+5px)]"
              />
              <FaClock className="relative z-10" />
            </div>
          </div>

          <div>
            <div>
              <h6 className="md:text-[26px] text-xl font-bold text-white font-playfair mb-3">
                Opening Hours
              </h6>
              <ul className="flex flex-col gap-2">
                <li>
                  <span className="text-sm font-medium text-white font-poppins">
                    Mon-Fri: 9:00am – 5:00pm
                  </span>
                </li>
                <li>
                  <span className="text-sm font-medium text-white font-poppins">
                    Saturday: Closed
                  </span>
                </li>
                <li>
                  <span className="text-sm font-medium text-white font-poppins">
                    Sunday: Closed
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Social Icons */}
      <div className="container mx-auto md:px-0 px-4 mt-20 pb-5">
        <div>
          <ul className="flex gap-3 items-center justify-center">
            {[FaFacebookF, FaXTwitter, FaInstagram, FaYoutube].map(
              (Icon, index) => (
                <li key={index}>
                  <a
                    href="#"
                    className="text-xl font-bold text-white hover:text-[#ed1b7b] w-10 h-10 bg-transparent hover:bg-white flex items-center justify-center rounded-md transition-all duration-500 ease-in-out"
                  >
                    <Icon />
                  </a>
                </li>
              )
            )}
          </ul>
        </div>
      </div>

      {/* Copyright */}
      <div className="py-7 border-y border-white/10">
        <div>
          <div className="container mx-auto md:px-0 px-4 text-center">
            <p className="md:text-base font-normal text-white font-poppins">
              Copyright 2022 © Vivid Care Services Ltd, Registered in England &
              Wales, Company Reg: 13759238
            </p>
            <p className="md:text-base font-normal text-white font-poppins">
              Website Designed by Advertmetrics Ltd{" "}
              <a href="/anti-slavery-policy" className="hover:text-[#ed1b7b]">
                Anti Slavery Policy
              </a>{" "}
              |{" "}
              <a href="/access-webmail" className="hover:text-[#ed1b7b]">
                Access Webmail
              </a>{" "}
              |{" "}
              <a href="/staff-login" className="hover:text-[#ed1b7b]">
                Staff Login
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Policies */}
      <div>
        <div className="container mx-auto md:px-0 px-4 pt-7 pb-16 text-center">
          <p className="md:text-base font-normal text-white font-poppins">
            <a href="/privacy-policy" className="hover:text-[#ed1b7b]">
              Privacy Policy
            </a>{" "}
            |{" "}
            <a href="/terms-and-conditions" className="hover:text-[#ed1b7b]">
              Terms and Conditions
            </a>{" "}
            |{" "}
            <a href="/carbon-footprint" className="hover:text-[#ed1b7b]">
              Carbon Footprint
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
