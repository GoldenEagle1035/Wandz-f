import {React,useState} from 'react'
import { NavLink } from 'react-router-dom'
import Button from './Button'

function MobileNav({showMenu}) {
    
  return (
    <div>
        <div
        className={
          showMenu
            ? "fixed left-0 top-0 z-40 flex h-screen w-[80%] text-black backdrop-blur-lg duration-300 ease-in lg:hidden"
            : "fixed left-[-100%] top-0 z-40 h-screen w-[80%] backdrop-blur-2xl duration-1000 ease-in"
        }
      >
        <ul className="mt-20 mx-auto"> 
        <div className="">
            <div className="nav-items items-center flex flex-col gap-8 font-superLagendBoy text-[#FFFFFF]">
            <NavLink to={"/lend"}>
                <h1 className="text-lg">LEND</h1>
              </NavLink>
              <NavLink to={"/offers"}>
                <h1 className="text-lg">OFFERS</h1>
              </NavLink>
              <NavLink to={"/borrow"}>
                <h1 className="text-lg">BORROW</h1>
              </NavLink>
              <NavLink to={"/orderBook"}>
                <h1 className="text-lg">LOANS</h1>
              </NavLink>
              <Button btnText={"Select Profile"} />
            </div>
          </div>
          
        </ul>
      </div>
    </div>
  )
}

export default MobileNav