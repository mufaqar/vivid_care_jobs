import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaBars, FaPhone } from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import CircleRotating from "./circleRotating";

import Logo from "@/assets/logo.png";


const navMenu = [
  {
    name: "Supported Living",
    link: "https://vivid-care.vercel.app/supportedliving",
  },
  {
    name: "Domiciliary Care",
    link: "https://vivid-care.vercel.app/domcare",
  },
  {
    name: "Careers",
    link: "/",
  },
];

// ✅ Define menu item type
interface NavItem {
  name: string;
  link: string;
}

const Header: React.FC = () => {
  const [mblMenu, setMblMenu] = useState<boolean>(false);
  const [isScrolled, setIsScrolled] = useState<boolean>(false);
  const [isLogoHovered, setIsLogoHovered] = useState<boolean>(false);

  const location = useLocation();
  const pathname = location.pathname;

  // ✅ Handle scroll event
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 0);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const isHomePage = pathname === "/";

  return (
    <header
      className={`fixed w-full z-[999] transition-all duration-500 ease-in-out ${
        isScrolled ? "py-2 bg-col_blue" : "py-[18px]"
      } ${mblMenu ? "bg-col_blue" : ""}`}
    >
      <div className="mx-auto md:px-[2%] px-4 flex flex-row gap-6 items-center justify-between">
        {/* ✅ Logo */}
        <div>
          <a
            href="https://vivid-care.vercel.app/"
            className="inline-flex w-fit group"
            onMouseEnter={() => setIsLogoHovered(true)}
            onMouseLeave={() => setIsLogoHovered(false)}
          >
            <img
              src={
                isHomePage
                  ? isScrolled
                    ? Logo
                    : isLogoHovered
                    ? Logo
                    : Logo
                  : Logo
              }
              alt="Logo"
              width={230}
              height={55}
              className="inline-block transition-opacity duration-300"
            />
          </a>
        </div>

        {/* ✅ Navigation */}
        <nav className="flex items-center gap-2.5">
          <ul
            className={`${
              isScrolled ? "bg-transparent" : "bg-white shadow"
            } py-[18px] px-10 md:rounded-[107.06px] rounded-b-4xl md:flex md:flex-row flex-col gap-5 md:static justify-center ${
              mblMenu
                ? "absolute left-0 right-0 top-[65.3px] md:h-auto h-[350px] flex bg-white"
                : "hidden md:flex"
            }`}
          >
            {navMenu?.map((item: NavItem, idx: number) => (
              <li key={idx}>
                <Link
                  to={item.link}
                  className={`${
                    isScrolled
                      ? "md:text-white hover:text-[#ed1b7b]"
                      : "text-black hover:text-primary"
                  } text-base font-normal font-poppins`}
                >
                  {item.name}
                </Link>
              </li>
            ))}
          </ul>

          {/* ✅ Mobile Menu Toggle */}
          <button
            onClick={() => setMblMenu(!mblMenu)}
            className="md:hidden inline-flex bg-[#fef1f7] text-2xl md:w-[60px] md:h-[60px] w-[40px] h-[40px] rounded-full items-center justify-center text-[#ed1b7b] transition-all duration-300 relative z-50 border-2 border-[#ed1b7b] group"
            aria-label="Toggle menu"
          >
            <CircleRotating
              bgColor="#fef1f7"
              size="h-[calc(100%+5px)] w-[calc(100%+5px)]"
            />
            {mblMenu ? (
              <IoClose className="relative z-10" />
            ) : (
              <FaBars className="relative z-10" />
            )}
          </button>

          {/* ✅ Phone Button */}
          <a
            href="tel:+0000000000"
            className="inline-flex bg-[#fef1f7] text-2xl md:w-[60px] md:h-[60px] w-[40px] h-[40px] rounded-full items-center justify-center text-[#ed1b7b] transition-all duration-300 relative z-50 border-2 border-[#ed1b7b] group"
            aria-label="Call us"
          >
            <CircleRotating
              bgColor="#fef1f7"
              size="h-[calc(100%+5px)] w-[calc(100%+5px)]"
            />
            <FaPhone className="relative z-10" />
          </a>
        </nav>
      </div>
    </header>
  );
};

export default Header;
