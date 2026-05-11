import PropTypes from "prop-types";
import React, { useEffect, useState } from "react";
import Swiper from "react-id-swiper";
import "swiper/css/swiper.css"; // Import Swiper styles
import axiosInstance from "../../api/api.js";

const HeroSliderFive = ({ spaceLeftClass, spaceRightClass }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  const useMediaQuery = (query) => {
    const [matches, setMatches] = useState(null); // Start with null to avoid premature API calls

    useEffect(() => {
      const media = window.matchMedia(query);
      setMatches(media.matches);

      const listener = () => setMatches(media.matches);
      media.addEventListener("change", listener);

      return () => media.removeEventListener("change", listener);
    }, [query]);

    return matches;
  };

  const isMobileOrTablet = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    if (isMobileOrTablet === null) {
      // Don't fetch data until the media query is evaluated
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get(
          isMobileOrTablet ? "/sliders-phone" : "/sliders-web"
        );
        setData(response.data || []); // Ensure response structure is correct
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isMobileOrTablet]);

  const params = {
    effect: "fade",
    loop: true, // Enable looping
    speed: 1000,
    autoplay: {
      delay: 3500,
      disableOnInteraction: false,
    },
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },
  };

  return (
    <div
      className={`slider-area ${spaceLeftClass || ""} ${spaceRightClass || ""}`}
    >
      <div className="slider-active nav-style-1">
        {loading || data.length === 0 ? (
          <div className="loading-spinner"></div>
        ) : (
          <Swiper {...params}>
            {data.map((single, key) => (
              <div
                key={key}
                className="single-slider-2 slider-height-1 slider-height-res15 d-flex align-items-center slider-height-res bg-img"
                style={{
                  backgroundImage: `url(https://admin.omdacoffee.com/images/${single.image})`,
                  minHeight: "calc(100dvh - 140px)",
                  backgroundPosition: "center",
                  backgroundSize: "cover",
                  backgroundRepeat: "no-repeat",
                }}
              />
            ))}
          </Swiper>
        )}
      </div>
    </div>
  );
};

HeroSliderFive.propTypes = {
  spaceLeftClass: PropTypes.string,
  spaceRightClass: PropTypes.string,
};

export default HeroSliderFive;
