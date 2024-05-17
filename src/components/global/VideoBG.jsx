import React, { useEffect, useState } from 'react'
import Bg from "../../assets/background/pearl.mp4";
import globe from "../../assets/logo/globe.gif"
import Bg2 from "../../assets/background/image.png"
import { NavLink, useLocation } from "react-router-dom";
import { MdArrowOutward } from "react-icons/md";
import globBar from "../../assets/background/video.webp"

function VideoBG() {
  const location = useLocation();

  const [isLandpage, setIsLandpage] = useState(false);

  useEffect(() => {
    if (location.pathname === "/") {
      setIsLandpage(true);
    } else {
      setIsLandpage(false);
    }
  }, [location.pathname])

  return (
    <div className='main-page'>
      <div className="video-docker  fixed left-0 top-0 h-full w-full overflow-hidden">
        <img src={Bg2} className='opacity-80 z-[1] absolute left-0 top-0 h-full w-full overflow-hidden' alt="bg-image" />
        <video
          className="absolute min-h-full min-w-full object-cover "
          src={Bg}
          type="video/webm"
          autoPlay
          muted
          loop
        ></video>
        {!isLandpage && <div className="absolute min-h-full min-w-full bg-[#00000030] backdrop-blur-md" />}
      </div>

      {isLandpage && <div className="fixed z-10 bottom-[6rem] max-sm:bottom-[4rem] right-[6rem] max-sm:right-[4rem] flex justify-end">
        <a href="https://docs.wandz.works"><p className="font-superLagendBoy bg-[#45291D50] backdrop-blur-xl text-[#DBFF00] flex gap-1 text-md items-center cursor-pointer max-sm:p-2 p-4 rounded-lg">Read the litepaper <span><MdArrowOutward size={22} /></span></p></a>
      </div>}

      <div className='nav-glob fixed z-10 bottom-10 max-sm:bottom-2 right-10 max-sm:right-2'>
        <NavLink to={"/orderbook"}>
          <a className=''>
            <img className='max-sm:w-20' width={70} src={globe} alt="" />
          </a>
          {location.pathname === `/orderbook` && (
            <img src={globBar} className="h-[4px] w-full object-cover"></img>
            // <video
            //   className="h-[4px] w-full object-cover"
            //   src={Bg}
            //   type="video/webm"
            //   autoPlay
            //   muted
            //   loop
            // />
          )}
        </NavLink>
      </div>
    </div>
  )
}

export default VideoBG