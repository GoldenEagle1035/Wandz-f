import React from 'react'
import Bg from "../../assets/background/pearl.mp4";
import globe from "../../assets/logo/globe.gif"
import Bg2 from "../../assets/background/image.png"
import { NavLink, useLocation } from "react-router-dom";
import globBar from "../../assets/background/video.webp"

function VideoBG() {
  const location = useLocation();

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
          
        </div>
        <div className='nav-glob fixed z-10 bottom-10 max-sm:bottom-2 right-10 max-sm:right-2'>
            <NavLink to={"/orderbook"}>
              <a className=''>
                <img className='max-sm:w-20' width={100} src={globe} alt="" />
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