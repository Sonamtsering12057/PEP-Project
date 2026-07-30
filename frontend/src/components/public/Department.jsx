import React from "react";

const Department = ({ data }) => {
  return (
    <div className="w-[18vw] rounded-2xl h-fit border-2 border-black flex flex-col justify-center items-center py-5 my-5 hover:bg-slate-300">
      <img className="w-1/2" src={`/${data.img}`} alt={data.dept} />
      <h1 className="text-xl font-bold">{data.dept}</h1>
    </div>
  );
};

export default Department;
