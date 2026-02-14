'use client'
import { useState } from "react";
import SaveData from "../components/SaveData";
import GetData from "../components/GetData";



export default function Home() {

  const [active, setActive] = useState(1)



  return (
    <main className="h-screen flex flex-col items-center justify-center ">
      <p className="text-4xl font-bold">Encrypto</p>

      <div className="max-w-135 px-6  w-full flex flex-col items-center gap-8 justify-center my-6">
        <div className="flex relative gap5  items-center bg-gray-200 border-2 border-gray-400 shadow-inner shadow-gray-400 rounded-lg w-fit justify-center">
          <div onClick={() => setActive(1)} className={` duration-300 cursor-pointer text-lg font-medium px-8 py-2 rounded-lg ${active == 1 && "bg-white"} text-gray-700`}>
            <p>Save Data</p>
          </div>
          <div onClick={() => setActive(2)} className={`duration-300 text-lg cursor-pointer font-medium px-8 py-2 ${active == 2 && "bg-white"} rounded-lg text-gray-700`}>
            <p>Get Data</p>
          </div>
        </div>


        <div className="min-h-[50vh] w-full">
          {active == 1 ?
            <SaveData /> : <GetData />
          }
        </div>
      </div>
    </main>
  );
}
